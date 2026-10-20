#!/usr/bin/env node
// WordPress -> Valaxy 内容转换器（调度者按 R8 兜底接手，W1a 未完成部分）
// 输入: .work/wp-data.json (由 scripts/wp-extract.mjs 生成)
// 输出: pages/posts/<slug>.md, pages/moments/<YYYY-MM-DD>-<title>.md, .work/needs-review.md
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { convertHtml } from './lib/convert-core.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, '.work', 'wp-data.json')
const POSTS_DIR = path.join(ROOT, 'pages', 'posts')
const MOMENTS_DIR = path.join(ROOT, 'pages', 'moments')
const PUBLIC_DIR = path.join(ROOT, 'public')
const REPORT = path.join(ROOT, '.work', 'needs-review.md')

const mediaFixes = []
const mediaMissing = []
const droppedMedia = []

// 旧站正文引用的缩略图在备份中的实际文件名可能带 -scaled-1、或缺少 -1 后缀。
// 只在「同尺寸且唯一」时修正引用，找不到就原样保留并在报告中列为缺失。
function resolveMediaPath(url, source) {
  if (!url.startsWith('/images/')) return url
  if (existsSync(path.join(PUBLIC_DIR, url.slice(1)))) return url
  const dir = path.posix.dirname(url)
  const file = path.posix.basename(url)
  const m = /^(.*?)(-(\d+)x(\d+))?\.([A-Za-z0-9]+)$/.exec(file)
  const candidates = []
  if (m) {
    const base = m[1]
    const size = m[2] || ''
    const ext = m[5]
    if (size) {
      candidates.push(base + '-scaled-1' + size + '.' + ext)
      if (/-1$/.test(base)) candidates.push(base.replace(/-1$/, '') + size + '.' + ext)
      candidates.push(base + '.' + ext)
      candidates.push(base + '-scaled-1.' + ext)
    }
    else {
      candidates.push(base + '-scaled-1.' + ext)
    }
  }
  for (const candidate of candidates) {
    const target = dir + '/' + candidate
    if (existsSync(path.join(PUBLIC_DIR, target.slice(1)))) {
      mediaFixes.push({ source, from: url, to: target })
      return target
    }
  }
  if (m && m[2]) {
    const stem = m[1].replace(/-1$/, '')
    const dirAbs = path.join(PUBLIC_DIR, dir.slice(1))
    if (existsSync(dirAbs)) {
      const hits = readdirSync(dirAbs).filter((name) => name.startsWith(stem) && name.endsWith(m[2] + '.' + m[5]))
      if (hits.length === 1) {
        const target = dir + '/' + hits[0]
        mediaFixes.push({ source, from: url, to: target })
        return target
      }
    }
  }
  mediaMissing.push({ source, url })
  return url
}

function normalizeMedia(markdown, source) {
  const replaced = markdown.replace(/(!\[([^\]]*)\])?\((?!\))([^)\s]+)\)/g, (all, label, alt, url) => {
    if (!label || !url.startsWith('/images/')) return all
    const fixed = resolveMediaPath(url, source)
    if (existsSync(path.join(PUBLIC_DIR, fixed.slice(1)))) return label + '(' + fixed + ')'
    droppedMedia.push({ source, url: fixed })
    return ''
  })
  return replaced.replace(/^[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n')
}

const YAML_SPECIAL = /[:#[\]{},"'&*!|>%@\x60]/

function yamlStr(value) {
  const s = String(value == null ? '' : value)
  if (s === '') return "''"
  if (YAML_SPECIAL.test(s) || /^\s|\s$/.test(s) || /^[-?]/.test(s)) return "'" + s.replace(/'/g, "''") + "'"
  return s
}

function frontmatter(fields) {
  const lines = ['---']
  for (const [key, value] of fields) {
    if (value == null) continue
    if (Array.isArray(value)) {
      if (!value.length) continue
      lines.push(key + ':')
      for (const item of value) lines.push('  - ' + yamlStr(item))
    } else {
      lines.push(key + ': ' + yamlStr(value))
    }
  }
  lines.push('---')
  return lines.join('\n') + '\n'
}

function sanitizeFileName(name) {
  const cleaned = String(name).replace(/[\u0000-\u001f<>:"/\\|?*]/g, '').replace(/\.+$/, '').trim()
  return cleaned
}

function uniquePath(dir, baseName) {
  let counter = 0
  for (;;) {
    const suffix = counter ? '-' + counter : ''
    const target = path.join(dir, baseName + suffix + '.md')
    if (!existsSync(target)) return target
    counter++
  }
}

function postFrontmatter(post, categoryOrder) {
  const cats = (post.categories || []).slice().sort((a, b) => (categoryOrder.get(a) || 999) - (categoryOrder.get(b) || 999))
  const tags = (post.tags || []).slice()
  return frontmatter([
    ['title', post.title],
    ['date', post.date],
    ['updated', post.updated && post.updated !== post.date ? post.updated : null],
    ['categories', cats.length === 1 ? cats[0] : cats],
    ['tags', tags.length ? tags : null],
    ['top', post.top ? Number(post.top) : null],
  ])
}

function momentImages(markdown) {
  const images = []
  for (const m of markdown.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)) images.push({ alt: m[1], src: m[2] })
  return images
}

function stripImages(markdown) {
  return markdown
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)\s*/g, '')
    .replace(/^\s*\*[^*]+\*\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function linkAudit(markdown, allowed) {
  const bad = []
  for (const m of markdown.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1]
    if (/^(https?:|mailto:|#)/.test(target)) continue
    const clean = target.split('#')[0].split('?')[0]
    if (!clean) continue
    if (allowed.has(clean) || allowed.has(clean.replace(/\/$/, '')) || allowed.has(clean + '/')) continue
    if (clean.startsWith('/images/') && existsSync(path.join(PUBLIC_DIR, clean.slice(1)))) continue
    if (existsSync(path.join(PUBLIC_DIR, clean.slice(1)))) continue
    bad.push(target)
  }
  return [...new Set(bad)]
}

// ---- 载入数据 ----
const data = JSON.parse(readFileSync(DATA, 'utf8'))
const posts = data.posts || []
const moments = data.moments || []
const categoryOrder = new Map((data.terms?.categories || []).map((t) => [t.name, t.term_id]))

const allowedRoutes = new Set([
  '/', '/archives', '/categories', '/tags', '/links', '/comment', '/services',
  '/subscribe', '/moments', '/about', '/about/site', '/404',
])
for (const p of posts) allowedRoutes.add('/posts/' + p.slug)
for (const pg of data.pages || []) if (pg.slug) allowedRoutes.add('/' + pg.slug)

mkdirSync(POSTS_DIR, { recursive: true })
mkdirSync(MOMENTS_DIR, { recursive: true })

// 清掉上次生成的文章与说说，保证幂等
for (const dir of [POSTS_DIR, MOMENTS_DIR]) {
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith('.md') || entry.endsWith('.md.orig')) rmSync(path.join(dir, entry))
  }
}

const issues = []
const mediaLocal = new Set()
const report = { posts: 0, moments: 0, issues: 0 }

for (const post of posts) {
  const res = convertHtml(post.html, { source: 'post:' + post.slug, context: { posts } })
  for (const issue of res.issues) issues.push({ ...issue, source: issue.source || 'post:' + post.slug })
  const markdown = normalizeMedia(res.markdown, 'post:' + post.slug)
  for (const x of markdown.matchAll(/\/images\/[^)\s"']+/g)) mediaLocal.add(x[0])
  for (const bad of linkAudit(markdown, allowedRoutes)) {
    issues.push({ kind: 'internal-link-unknown-route', source: 'post:' + post.slug, detail: bad })
  }
  writeFileSync(path.join(POSTS_DIR, post.slug + '.md'), postFrontmatter(post, categoryOrder) + '\n' + markdown, 'utf8')
  report.posts++
}

const usedMomentNames = new Set()
for (const moment of moments) {
  const res = convertHtml(moment.html, { source: 'moment:' + moment.id, context: { posts } })
  for (const issue of res.issues) issues.push({ ...issue, source: issue.source || 'moment:' + moment.id })
  const markdown = normalizeMedia(res.markdown, 'moment:' + moment.id)
  for (const x of markdown.matchAll(/\/images\/[^)\s"']+/g)) mediaLocal.add(x[0])
  const images = momentImages(markdown)
  for (const img of images) mediaLocal.add(img.src)
  for (const bad of linkAudit(markdown, allowedRoutes)) {
    issues.push({ kind: 'internal-link-unknown-route', source: 'moment:' + moment.id, detail: bad })
  }
  const body = stripImages(markdown)
  const day = String(moment.date || '').slice(0, 10)
  const title = sanitizeFileName(moment.title || '')
  let baseName = title ? day + '-' + title : day
  while (usedMomentNames.has(baseName)) baseName = baseName + '-1'
  usedMomentNames.add(baseName)
  const target = uniquePath(MOMENTS_DIR, baseName)
  writeFileSync(target, frontmatter([
    ['date', moment.date],
    ['title', moment.title || null],
    ['images', images.length ? images.map((i) => i.src) : null],
  ]) + (body ? '\n' + body + '\n' : ''), 'utf8')
  report.moments++
}

// ---- 媒体引用核对 ----
const missingMedia = []
for (const local of [...mediaLocal].sort()) {
  if (!local.startsWith('/images/')) continue
  if (!existsSync(path.join(PUBLIC_DIR, local.slice(1)))) missingMedia.push(local)
}

// ---- 报告 ----
const byKind = new Map()
for (const issue of issues) {
  if (!byKind.has(issue.kind)) byKind.set(issue.kind, [])
  byKind.get(issue.kind).push(issue)
}
report.issues = issues.length
report.issueKinds = Object.fromEntries([...byKind.entries()].map(([k, v]) => [k, v.length]))
report.missingMedia = missingMedia.length
report.mediaFixes = mediaFixes.length
report.mediaMissing = mediaMissing.length
report.droppedMedia = droppedMedia.length

const out = []
out.push('# 需要人工复核的转换结果')
out.push('')
out.push('- 生成时间: ' + new Date().toISOString())
out.push('- 输入: .work/wp-data.json (' + statSync(DATA).size + ' B)')
out.push('- 输出: pages/posts/' + report.posts + ' 篇、pages/moments/' + report.moments + ' 条')
out.push('- 记录问题 ' + issues.length + ' 条，媒体引用缺失 ' + missingMedia.length + ' 个')
out.push('')
out.push('## 问题类型统计')
out.push('')
if (!issues.length) out.push('（无）')
for (const [kind, list] of [...byKind.entries()].sort((a, b) => b[1].length - a[1].length)) {
  out.push('- ' + kind + ': ' + list.length)
}
out.push('')
out.push('## 逐条明细')
for (const [kind, list] of [...byKind.entries()].sort((a, b) => b[1].length - a[1].length)) {
  out.push('')
  out.push('### ' + kind + ' (' + list.length + ')')
  out.push('')
  const seen = new Set()
  for (const issue of list) {
    const key = issue.source + '|' + issue.detail
    if (seen.has(key)) continue
    seen.add(key)
    out.push('- ' + issue.source + ' :: ' + issue.detail)
  }
}
out.push('')
out.push('## 媒体引用核对')
out.push('')
out.push('- 正文与 frontmatter 共引用本地媒体 ' + mediaLocal.size + ' 个')
if (missingMedia.length) {
  out.push('- 转换后仍缺失（public 下不存在）:')
  for (const m of missingMedia) out.push('  - ' + m)
} else {
  out.push('- 全部命中 public/images，无缺失')
}
out.push('')
out.push('## 媒体路径修正 (' + mediaFixes.length + ')')
out.push('')
if (!mediaFixes.length) out.push('（无）')
for (const fix of mediaFixes) out.push('- ' + fix.source + ' :: ' + fix.from + ' -> ' + fix.to)
out.push('')
out.push('## 源站即缺失的媒体引用 (' + mediaMissing.length + ')')
out.push('')
if (!mediaMissing.length) out.push('（无）')
for (const miss of mediaMissing) out.push('- ' + miss.source + ' :: ' + miss.url + '（备份包内不存在该文件）')
out.push('')
out.push('## 因源站缺失而移除的内联图 (' + droppedMedia.length + ')')
out.push('')
if (!droppedMedia.length) out.push('（无）')
for (const drop of droppedMedia) out.push('- ' + drop.source + ' :: ' + drop.url + '（Vite 会把根路径图片当模块解析，缺失文件会直接中断构建，故移除该图）')
out.push('')
out.push('## 已知降级与不迁移项')
out.push('')
out.push('- 不写 excerpt：WP 摘要在正文里表现为 wp:more 注释，Valaxy 摘要截断符默认 more 注释，正文中未保留截断符，首页按默认长度截断。')
out.push('- 不迁移浏览量 views（原始值仍在 .work/wp-data.json；Waline 侧由 waline-counters.sql 提供，默认不导入）。')
out.push('- 说说中的 Argon 短代码（如 progressbar）无法在静态站执行，按原文保留。')
out.push('- 脚注角标降级为行内 [注N] 标记，因 dump 中不含脚注正文。')
writeFileSync(REPORT, out.join('\n') + '\n', 'utf8')

console.log(JSON.stringify(report, null, 2))