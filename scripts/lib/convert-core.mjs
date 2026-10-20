import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { preprocessGutenberg, rewriteUploads } from './gutenberg.mjs'

const X = String.fromCharCode(64) + String.fromCharCode(64)
const TOKEN_SRC = X + 'WP(IMAGE|GALLERY|CODE|INLINEIMG)' + X + '([\\s\\S]*?)' + X

const SHORTCODE_RE = /\[\/?([a-zA-Z][a-zA-Z0-9_-]*)(?:\s[^\]]*)?\]/g
const PROTECTED_SHORTCODES = new Set(['caption', 'gallery', 'embed', 'audio', 'video', 'playlist', 'hide', 'reply', 'progressbar', 'github', 'collapse', 'toggle', 'alert'])

function makeService() {
  const svc = new TurndownService({
    headingStyle: 'atx', hr: '---', bulletListMarker: '-',
    codeBlockStyle: 'fenced', fence: '```', emDelimiter: '*',
    strongDelimiter: '**', linkStyle: 'inlined', br: '  ',
  })
  svc.use(gfm)
  svc.keep(['details', 'summary', 'iframe', 'video', 'audio'])
  svc.addRule('wpEmbed', {
    filter: (node) => node.nodeName === 'DIV' && node.getAttribute && /wp-block-embed/.test(node.getAttribute('class') || ''),
    replacement: (content, node) => '\n\n' + node.outerHTML + '\n\n',
  })
  return svc
}

function stripFootnoteSup(html, issues, source) {
  const seen = []
  const out = html.replace(/<sup[^>]*class="fn"[^>]*>([\s\S]*?)<\/sup>/g, (m, inner) => {
    const n = inner.replace(/<[^>]+>/g, '').trim()
    seen.push(n)
    return '[注' + n + ']'
  })
  if (seen.length) {
    const tail = /<!--\s*wp:footnotes\s*\/-->/.test(html)
    issues.push({
      kind: 'footnote-marker',
      source,
      detail: '脚注 ' + seen.join(',') + '：正文只有角标引用，' + (tail ? 'wp:footnotes 块内容为空（<-- wp:footnotes /--> 自闭合）' : '未找到脚注块') + '，脚注正文在 dump 中不存在，已降级为行内 [注N] 标记',
    })
  }
  return out
}

function protectShortcodes(html, issues, source) {
  const hits = {}
  const out = html.replace(SHORTCODE_RE, (m, name) => {
    if (!PROTECTED_SHORTCODES.has(name)) return m
    hits[name] = (hits[name] || 0) + 1
    return '\u0001' + m + '\u0001'
  })
  for (const name of Object.keys(hits)) {
    issues.push({ kind: 'shortcode', source, detail: '短代码 [' + name + '] x' + hits[name] + '：保留原文（无法在静态站执行）' })
  }
  return out
}

function rewriteInternalLinks(html, issues, source, context) {
  if (!context || !context.posts || !context.posts.length) return html
  const byPath = new Map()
  for (const p of context.posts) {
    const s = p.slug
    byPath.set(s, s)
    byPath.set(s.normalize('NFC'), s)
  }
  const unresolved = []
  const out = html.replace(/https?:\/\/blog\.490633\.xyz\/(\d{4})\/(\d{1,2})\/([^\s"'<>)\/]+)\/?/g, (m, y, mo, raw) => {
    let name = raw
    try { name = decodeURIComponent(raw) } catch (e) { name = raw }
    const norm = name.normalize('NFC')
    if (byPath.has(norm)) return '/posts/' + encodeURI(byPath.get(norm))
    unresolved.push(m)
    return m
  })
  if (unresolved.length) issues.push({ kind: 'internal-link-unresolved', source, detail: unresolved.length + ' 个站内旧链接无法映射到 /posts/<slug>: ' + [...new Set(unresolved)].slice(0, 6).join(' , ') })
  return out
}

export function decodeEntities(s) {
  return String(s)
    .replace(/&#0*(\d+);/g, (m, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
}

function restoreShortcodes(md) {
  return md.replace(/\u0001/g, '')
}

export function convertHtml(html, opts) {
  const options = opts || {}
  const source = options.source || 'unknown'
  const issues = []
  let src = String(html || '')
  src = rewriteInternalLinks(src, issues, source, options.context)
  src = stripFootnoteSup(src, issues, source)
  src = protectShortcodes(src, issues, source)
  const pre = preprocessGutenberg(src, { source })
  for (const i of pre.issues) issues.push(i)
  const svc = makeService()
  const mediaRefs = []
  let out = ''
  let last = 0
  const re = new RegExp(TOKEN_SRC, 'g')
  const pushText = (text) => {
    if (!text.trim()) return
    const md = svc.turndown(text).trim()
    if (!md) return
    out += md + '\n\n'
  }
  let m
  while ((m = re.exec(pre.html))) {
    pushText(pre.html.slice(last, m.index))
    last = re.lastIndex
    const kind = m[1]
    const data = kind === 'CODE' ? Buffer.from(m[2], 'base64').toString('utf8') : ['IMAGE', 'GALLERY'].includes(kind) ? JSON.parse(Buffer.from(m[2], 'base64').toString('utf8')) : JSON.parse(Buffer.from(m[2], 'base64').toString('utf8'))
    if (kind === 'IMAGE') {
      if (data.count > 1 && data.multi) {
        for (const img of data.multi) out += '![' + (img.alt || '') + '](' + img.url + ')\n\n'
        if (data.caption && data.caption.trim()) out += '*' + data.caption + '*\n\n'
        continue
      }
      out += '![' + (data.alt || '') + '](' + data.url + ')'
      if (data.original) mediaRefs.push({ original: data.original, local: data.url })
      if (data.caption && data.caption.trim()) out += '\n\n*' + data.caption + '*'
      out += '\n\n'
    } else if (kind === 'GALLERY' || kind === 'INLINEIMG') {
      const list = kind === 'GALLERY' ? data : data.list || [data]
      for (const img of list) out += '![' + (img.alt || '') + '](' + img.url + ')\n\n'
    } else if (kind === 'CODE') {
      const info = JSON.parse(data)
      const code = decodeEntities(info.code).replace(/\n+$/, '')
      out += '```' + (info.lang || '') + '\n' + code + '\n```\n\n'
    }
  }
  pushText(pre.html.slice(last))
  let md = restoreShortcodes(out.trim())
  md = md.replace(/\n{3,}/g, '\n\n')
  if (/<!--\s*wp:/.test(md)) issues.push({ kind: 'leftover-block-comment', source, detail: '转换后仍残留 Gutenberg 注释' })
  for (const m of md.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const local = m[1]
    if (local.indexOf('/images/') === 0 && !mediaRefs.some((x) => x.local === local)) mediaRefs.push({ original: 'https://blog.490633.xyz/wp-content/uploads/' + local.slice('/images/'.length), local })
  }
  for (const u of new Set([...md.matchAll(/\/images\/[^)\s"']+/g)].map((m) => m[0]))) {
    if (!mediaRefs.some((x) => x.local === u)) mediaRefs.push({ original: 'https://blog.490633.xyz/wp-content/uploads/' + u.slice('/images/'.length), local: u })
  }
  return { markdown: md + '\n', issues, mediaRefs }
}

export { rewriteUploads, preprocessGutenberg }
