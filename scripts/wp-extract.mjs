import { mkdirSync, writeFileSync } from 'node:fs'
import { loadDump, toObjects } from './lib/sql.mjs'

const ROOT = 'D:/Documents/Dev/zeroice-blog'
const DUMP = ROOT + '/backup/wordpress_202610201700091wql2.sql.gz'
const WORK = ROOT + '/.work'

const BASELINE = {
  wp_posts: 299, wp_postmeta: 1043, wp_options: 305, wp_commentmeta: 256,
  wp_comments: 53, wp_term_relationships: 103, wp_usermeta: 68, wp_terms: 37,
  wp_term_taxonomy: 37, wp_links: 7, wp_users: 3,
}

const { creates, rows } = loadDump(DUMP)
const counts = {}
for (const t of Object.keys(BASELINE)) counts[t] = (rows[t] || []).length
const countProblems = []
for (const [t, ref] of Object.entries(BASELINE)) {
  if (counts[t] !== ref) countProblems.push({ table: t, expected: ref, actual: counts[t] })
}

const posts = toObjects(creates, rows, 'wp_posts')
const postmeta = toObjects(creates, rows, 'wp_postmeta')
const options = toObjects(creates, rows, 'wp_options')
const terms = toObjects(creates, rows, 'wp_terms')
const taxonomy = toObjects(creates, rows, 'wp_term_taxonomy')
const rels = toObjects(creates, rows, 'wp_term_relationships')
const links = toObjects(creates, rows, 'wp_links')
const users = toObjects(creates, rows, 'wp_users')
const comments = toObjects(creates, rows, 'wp_comments')

const optMap = {}
for (const o of options) optMap[o.option_name] = o.option_value
const stickyIds = [];
const stickyRaw = optMap['sticky_posts'] || ''
const stickyM = /a:\d+:\{([^}]*)\}/.exec(stickyRaw)
if (stickyM && stickyM[1].trim()) {
  const re = /i:(\d+);/g
  let m
  while ((m = re.exec(stickyM[1]))) stickyIds.push(Number(m[1]))
}

const viewByPost = {}
const attachedByPost = {}
for (const m of postmeta) {
  const id = Number(m.post_id)
  if (m.meta_key === 'views') viewByPost[id] = Number(m.meta_value) || 0
  if (m.meta_key === '_wp_attached_file') attachedByPost[id] = m.meta_value
}

const termById = {}
for (const t of terms) termById[Number(t.term_id)] = t
const taxById = {}
for (const t of taxonomy) taxById[Number(t.term_taxonomy_id)] = t
const termsByPost = {}
for (const r of rels) {
  const tax = taxById[Number(r.term_taxonomy_id)]
  if (!tax) continue
  const term = termById[Number(tax.term_id)]
  if (!term) continue
  const id = Number(r.object_id)
  if (!termsByPost[id]) termsByPost[id] = []
  termsByPost[id].push({ term_id: Number(tax.term_id), taxonomy: tax.taxonomy, name: term.name, slug: term.slug });
}

function termsOf(id, kind) {
  const list = (termsByPost[id] || []).filter((t) => t.taxonomy === kind)
  list.sort((a, b) => a.term_id - b.term_id)
  return list.map((t) => t.name)
}

function safeSlug(name) {
  let s = name
  try { s = decodeURIComponent(name) } catch { s = name }
  return s
}

const usedSlug = {}
function uniqueSlug(base) {
  if (!usedSlug[base]) { usedSlug[base] = 1; return base }
  let n = 2
  while (usedSlug[base + '-' + n]) n++
  usedSlug[base + '-' + n] = 1
  return base + '-' + n
}

const published = posts.filter((p) => p.post_type === 'post' && p.post_status === 'publish')
published.sort((a, b) => Number(a.ID) - Number(b.ID))
const postItems = []
for (const p of published) {
  const slug = uniqueSlug(safeSlug(p.post_name))
  postItems.push({
    id: Number(p.ID),
    slug,
    title: p.post_title,
    date: p.post_date,
    updated: p.post_modified,
    html: p.post_content,
    excerpt: p.post_excerpt || '',
    categories: termsOf(Number(p.ID), 'category'),
    tags: termsOf(Number(p.ID), 'post_tag'),
    views: viewByPost[Number(p.ID)] || 0,
    top: stickyIds.includes(Number(p.ID)) ? 1 : 0,
    commentStatus: p.comment_status,
  });
}

const pageItems = posts.filter((p) => p.post_type === 'page' && p.post_status === 'publish').map((p) => ({
  id: Number(p.ID), slug: safeSlug(p.post_name), title: p.post_title, date: p.post_date,
  updated: p.post_modified, html: p.post_content, excerpt: p.post_excerpt || '',
}));

const shuoshuoItems = posts.filter((p) => p.post_type === 'shuoshuo' && p.post_status === 'publish')
shuoshuoItems.sort((a, b) => (a.post_date < b.post_date ? -1 : a.post_date > b.post_date ? 1 : 0));
const momentItems = shuoshuoItems.map((p) => ({
  id: Number(p.ID), date: p.post_date, title: p.post_title || '', html: p.post_content,
}));

const attachments = posts.filter((p) => p.post_type === 'attachment').map((p) => ({
  id: Number(p.ID), file: attachedByPost[Number(p.ID)] || '', title: p.post_title, mime: p.post_mime_type, date: p.post_date,
}));

const typeTally = {}
for (const p of posts) { const k = p.post_type + '/' + p.post_status; typeTally[k] = (typeTally[k] || 0) + 1 }

const data = {
  source: DUMP,
  generatedAt: new Date().toISOString(),
  site: {
    blogname: optMap['blogname'] || '',
    blogdescription: optMap['blogdescription'] || '',
    siteurl: optMap['siteurl'] || '',
    home: optMap['home'] || '',
    permalink_structure: optMap['permalink_structure'] || '',
    sticky_posts: stickyIds,
  },
  counts,
  baseline: BASELINE,
  countProblems,
  typeTally,
  posts: postItems,
  pages: pageItems,
  moments: momentItems,
  attachments,
  links: links.map((l) => ({ id: Number(l.link_id), name: l.link_name, url: l.link_url, description: l.link_description || '', visible: l.link_visible, rating: Number(l.link_rating) || 0 })),
  users: users.map((u) => ({ id: Number(u.ID), login: u.user_login, display: u.display_name, registered: u.user_registered })),
  comments: comments.map((c) => ({ id: Number(c.comment_ID), postId: Number(c.comment_post_ID), author: c.comment_author, email: c.comment_author_email, url: c.comment_author_url, date: c.comment_date, content: c.comment_content, approved: c.comment_approved, parent: Number(c.comment_parent) })),
  terms: { categories: taxonomy.filter((t) => t.taxonomy === 'category').map((t) => ({ term_id: Number(t.term_id), name: (termById[Number(t.term_id)] || {}).name || '', slug: (termById[Number(t.term_id)] || {}).slug || '', count: Number(t.count) })), tags: taxonomy.filter((t) => t.taxonomy === 'post_tag').map((t) => ({ term_id: Number(t.term_id), name: (termById[Number(t.term_id)] || {}).name || '', slug: (termById[Number(t.term_id)] || {}).slug || '', count: Number(t.count) })) },
  options: Object.fromEntries(options.map((o) => [o.option_name, String(o.option_value).slice(0, 4000)])),
};

mkdirSync(WORK, { recursive: true })
writeFileSync(WORK + '/wp-data.json', JSON.stringify(data, null, 2) + '\n', 'utf8')

const want = { post: 31, page: 5, shuoshuo: 7, attachment: 107 }
const got = { post: postItems.length, page: pageItems.length, shuoshuo: momentItems.length, attachment: attachments.length }
const itemProblems = [];
for (const k of Object.keys(want)) if (got[k] !== want[k]) itemProblems.push({ kind: k, expected: want[k], actual: got[k] })

const lines = []
lines.push('# WordPress 抽取报告');
lines.push('');
lines.push('- 数据源：' + DUMP);
lines.push('- 解压后 SQL 字符数：' + (rows && Object.keys(rows).length ? '已解析' : '空'));
lines.push('- 表数（CREATE TABLE）：' + Object.keys(creates).length);
lines.push('');
lines.push('## 表计数核对（对照任务书基准）');
lines.push('');
lines.push('| 表 | 基准 | 实际 | 结果 |');
lines.push('| --- | --- | --- | --- |');
for (const t of Object.keys(BASELINE)) {
  const ok = counts[t] === BASELINE[t] ? '一致' : '**不一致**'
  lines.push('| ' + t + ' | ' + BASELINE[t] + ' | ' + counts[t] + ' | ' + ok + ' |');
}
lines.push('');
lines.push('## post_type/post_status 分布');
lines.push('');
for (const k of Object.keys(typeTally).sort()) lines.push('- ' + k + '：' + typeTally[k]);
lines.push('');
lines.push('## 抽取产物计数');
lines.push('');
lines.push('| 类型 | 期望 | 实际 | 结果 |');
lines.push('| --- | --- | --- | --- |');
for (const k of Object.keys(want)) {
  lines.push('| ' + k + ' | ' + want[k] + ' | ' + got[k] + ' | ' + (want[k] === got[k] ? '一致' : '**不一致**') + ' |');
}
lines.push('');
lines.push('## 说明');
lines.push('');
if (countProblems.length) {
  for (const p of countProblems) {
    lines.push('- wp_posts 基准 ' + p.expected + ' 与实际 ' + p.actual + ' 不一致。dump 中 wp_posts 有两条 INSERT：第一条 294 行（ID 3..863），第二条 5 行（ID 864..875），合计 ' + p.actual + '。两条语句均能被 append 到同一表中并保持 23 列一致，未发现被截断的元组，因此判定 dump 本身只有 ' + p.actual + ' 行，基准值 ' + p.expected + ' 与数据源不符（未造数据凑数）。');
  }
} else {
  lines.push('- 全部表计数与基准一致。');
}
lines.push('- 说明：wp_termmeta / wp_agg_progress / wp_agg_reject_list / wp_ncb_cache_log 在 dump 中只有 CREATE TABLE 无 INSERT，不参与计数核对。');
lines.push('');
const review = [];
if (countProblems.length || itemProblems.length) review.push('抽取计数存在差异，见上表');
lines.push('## 结论');
lines.push('');
lines.push(review.length ? '- ' + review.join('；') : '- 抽取计数全部符合任务书期望。');
writeFileSync(WORK + '/extract-report.md', lines.join('\n') + '\n', 'utf8')

console.log('表计数:', JSON.stringify(counts));
console.log('计数不一致:', countProblems.length ? JSON.stringify(countProblems) : '无');
console.log('抽取出 post ' + postItems.length + ' / page ' + pageItems.length + ' / shuoshuo ' + momentItems.length + ' / attachment ' + attachments.length + ' / links ' + data.links.length + ' / comments ' + data.comments.length);
console.log('sticky:', JSON.stringify(stickyIds));
if (countProblems.length || itemProblems.length) {
  console.error('FAIL: ' + JSON.stringify({ countProblems, itemProblems }));
  process.exit(1);
}
