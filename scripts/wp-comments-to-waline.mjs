#!/usr/bin/env node
/**
 * W4: WordPress wp_comments -> Waline (PostgreSQL) import artifacts.
 *
 * Usage:
 *   node scripts/wp-comments-to-waline.mjs [--with-view-counts] [--slug-source <path>]
 *
 * Outputs (repo root):
 *   waline-import/waline-comments.sql   INSERT INTO wl_Comment ... (53 rows)
 *   waline-import/comments.csv          same rows, in github-storage CSV_HEADERS order
 *   (+ waline-import/waline-counters.sql when --with-view-counts)
 *
 * No external deps: the MySQL dump is parsed by a minimal literal-aware parser.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DUMP = path.join(ROOT, 'backup', 'wordpress_202610201700091wql2.sql.gz');
const OUT_DIR = path.join(ROOT, 'waline-import');
const WP_DATA = path.join(ROOT, '.work', 'wp-data.json');

const EXPECTED_COMMENTS = 53;
const TABLE = 'wl_comment';
const COUNTER_TABLE = 'wl_counter';
// Order from @waline/vercel@1.43.4 src/service/storage/github.js CSV_HEADERS.Comment
const CSV_HEADERS = [
  'objectId', 'user_id', 'comment', 'insertedAt', 'ip', 'link', 'mail', 'nick',
  'pid', 'rid', 'status', 'ua', 'url', 'createdAt', 'updatedAt',
];
// mysql.js:6  return field === 'objectId' ? 'id' : field;  -> pk column is id
//
// These are *database* column names, and on PostgreSQL they are lowercase.
// The official assets/waline.pgsql declares the three time columns UNQUOTED
// (`insertedAt timestamp(0) ...`), so PostgreSQL stores them as `insertedat`
// / `createdat` / `updatedat`. Waline's runtime agrees: postgresql.js
// lowercases the field list, the where keys and the three time keys before
// querying, and mapKeys() destructures `{ insertedat, createdat, updatedat }`
// on the way back. Quoting them as "insertedAt" in an INSERT asks for a
// camelCase column that does not exist -> SQLSTATE 42703.
const PG_COLUMNS = ['id', 'user_id', 'comment', 'insertedat', 'ip', 'link', 'mail', 'nick',
  'pid', 'rid', 'status', 'ua', 'url', 'createdat', 'updatedat'];
const COUNTER_COLUMNS = ['id', 'time', 'url', 'createdat', 'updatedat'];

// 留言板评论落库的 url。必须与 Waline 前端实际发出的查询 path 一致，否则一条都匹配不上：
// 浏览器停在 /comment/，但 @waline/client 请求的是 ?path=%2Fcomment（尾斜杠被剥掉，实测抓到的请求）。
// 文章路由 /posts/<slug> 本来就没有尾斜杠，不受影响。
const PAGE_ROUTE = '/comment';
const POSTS_PREFIX = '/posts/';
const MESSAGE_BOARD_TITLE = '留言板';

const argv = process.argv.slice(2);
const WITH_VIEWS = argv.includes('--with-view-counts');
const slugArgIdx = argv.indexOf('--slug-source');
const SLUG_SOURCE_ARG = slugArgIdx >= 0 ? argv[slugArgIdx + 1] : null;
// ---------------------------------------------------------------- dump parsing
function splitTuples(body) {
  const out = [];
  let i = 0, depth = 0, start = -1, inStr = false;
  while (i < body.length) {
    const c = body[i];
    if (inStr) {
      if (c === '\\') { i += 2; continue; }
      if (c === "'") inStr = false;
      i++; continue;
    }
    if (c === "'") { inStr = true; i++; continue; }
    if (c === '(') { if (depth === 0) start = i + 1; depth++; i++; continue; }
    if (c === ')') { depth--; if (depth === 0) out.push(body.slice(start, i)); i++; continue; }
    i++;
  }
  return out;
}

function splitFields(t) {
  const f = [];
  let i = 0, cur = '', inStr = false;
  while (i < t.length) {
    const c = t[i];
    if (inStr) {
      if (c === '\\') { cur += t[i] + t[i + 1]; i += 2; continue; }
      if (c === "'") { inStr = false; cur += c; i++; continue; }
      cur += c; i++; continue;
    }
    if (c === "'") { inStr = true; cur += c; i++; continue; }
    if (c === ',') { f.push(cur.trim()); cur = ''; i++; continue; }
    cur += c; i++;
  }
  f.push(cur.trim());
  return f;
}

const BACKSLASH = { n: '\n', r: '\r', t: '\t', '0': '\0', "'": "'", '"': '"', '\\': '\\', Z: '\x1a', b: '\b' };

function unlit(s) {
  if (s === null || s === undefined) return null;
  if (s.toUpperCase() === 'NULL') return null;
  if (s.startsWith("'") && s.endsWith("'")) {
    const inner = s.slice(1, -1);
    let r = '';
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '\\') {
        const nm = inner[i + 1];
        if (nm in BACKSLASH) { r += BACKSLASH[nm]; i++; continue; }
        r += nm; i++; continue;
      }
      r += inner[i];
    }
    return r;
  }
  return s;
}
function extractInserts(sql, table) {
  const marker = 'INSERT INTO `' + table + '` VALUES ';
  const rows = [];
  let pos = 0;
  for (;;) {
    const s = sql.indexOf(marker, pos);
    if (s < 0) break;
    let i = s + marker.length, depth = 0, inStr = false, end = -1;
    while (i < sql.length) {
      const c = sql[i];
      if (inStr) {
        if (c === '\\') { i += 2; continue; }
        if (c === "'") inStr = false;
        i++; continue;
      }
      if (c === "'") { inStr = true; i++; continue; }
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ';' && depth === 0) { end = i; break; }
      i++;
    }
    if (end < 0) throw new Error('unterminated INSERT for ' + table);
    for (const t of splitTuples(sql.slice(s + marker.length, end))) rows.push(splitFields(t));
    pos = end + 1;
  }
  return rows;
}

function columnsOf(sql, table) {
  const head = 'CREATE TABLE `' + table + '`';
  const i = sql.indexOf(head);
  if (i < 0) throw new Error('table not found in dump: ' + table);
  const pk = sql.indexOf('PRIMARY KEY', i);
  const eng = sql.indexOf(') ENGINE', i);
  let stop = pk;
  if (stop < 0 || (eng >= 0 && eng < stop)) stop = eng;
  const body = stop < 0 ? sql.slice(i, i + 4000) : sql.slice(i, stop);
  const re = /^\s+`([a-zA-Z_]+)`/gm;
  const cols = [];
  let m;
  while ((m = re.exec(body)) !== null) cols.push(m[1]);
  return cols;
}

function loadTable(sql, table) {
  const cols = columnsOf(sql, table);
  return extractInserts(sql, table).map((r) => {
    const o = {};
    cols.forEach((c, i) => { o[c] = unlit(r[i]); });
    return o;
  });
}
// ---------------------------------------------------------------- route + slug mapping
function decodeSlug(name) {
  if (!name) return '';
  try { return decodeURIComponent(name); } catch { return name; }
}

// post (publish) -> /posts/<slug>; the message-board page -> /comment/; everything else -> null
function buildRoutes(posts) {
  const routes = new Map();
  for (const p of posts) {
    if (p.post_type !== 'post' && p.post_type !== 'page') continue;
    if (p.post_status !== 'publish') continue;
    const title = (p.post_title || '').trim();
    if (p.post_type === 'page') {
      routes.set(p.ID, title === MESSAGE_BOARD_TITLE ? PAGE_ROUTE : null);
      continue;
    }
    const slug = decodeSlug(p.post_name || '');
    routes.set(p.ID, slug ? POSTS_PREFIX + slug : null);
  }
  return routes;
}

function readSlugSource() {
  const p = SLUG_SOURCE_ARG ? path.resolve(ROOT, SLUG_SOURCE_ARG) : WP_DATA;
  if (!fs.existsSync(p)) return { path: p, map: null };
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.posts || raw.items || []);
    const map = new Map();
    for (const it of list) {
      const id = String(it.id === undefined ? (it.ID === undefined ? (it.postId === undefined ? '' : it.postId) : it.ID) : it.id);
      const slug = it.slug === undefined ? (it.post_name === undefined ? '' : it.post_name) : it.slug;
      if (id && slug) map.set(id, String(slug));
    }
    return { path: p, map: map.size ? map : null };
  } catch (e) {
    return { path: p, map: null, error: e.message };
  }
}

// ---------------------------------------------------------------- argon emoji shortcodes
// Argon (the WordPress theme this blog used) renders {{name}} as an emoji image.
// Pack membership and file naming come from @waline/emojis@1.1.0/<pack>/info.json:
//   bilibili prefix "bb_" png | alus "alus_" png | tieba "tieba_" png | weibo "weibo_" png
//
// Waline does not expand ":name:" when it renders a stored comment. The client expands the
// shortcode into an <img> while you type and the server just stores/returns that HTML, so the
// import has to write the same markup. Proof, from the Vercel SQL log of a comment whose emoji
// was picked through the UI:
//   INSERT INTO wl_comment ("comment",insertedat,...,url) VALUES (E'<img class="wl-emoji"
//     src="https://unpkg.com/@waline/emojis@1.1.0/bilibili/bb_doge.png" alt="bb_doge">',...
// Leaving ":doge:" in the text instead shows as literal ":doge:".
const EMOJI_TARGET = { doge: 'doge', liulei: 'sob', dianzan: 'thumbsup' };
const EMOJI_CDN = 'https://unpkg.com/@waline/emojis@1.1.0';
const EMOJI_PACK_META = {
  bilibili: { prefix: 'bb_', type: 'png' },
  alus: { prefix: 'alus_', type: 'png' },
  tieba: { prefix: 'tieba_', type: 'png' },
  weibo: { prefix: 'weibo_', type: 'png' },
};
const EMOJI_PACKS = {
  bilibili: ['doge', 'sob', 'thumbsup', 'grievance', 'heart_eyes', 'cry'],
  alus: ['sob', 'thumbsup'],
  tieba: ['sob', 'thumbsup', 'grievance', 'heart_eyes', 'cry', 'joy'],
  weibo: ['doge', 'sob', 'grievance', 'heart_eyes', 'joy'],
};

function resolveEmoji(name) {
  const target = EMOJI_TARGET[name];
  if (!target) return null;
  for (const pack of Object.keys(EMOJI_PACKS)) {
    if (EMOJI_PACKS[pack].includes(target)) return { pack, name: target };
  }
  return null;
}

function convertEmoji(text) {
  const seen = [];
  const out = String(text === null || text === undefined ? '' : text).replace(/\{\{([^{}]+)\}\}/g, (whole, name) => {
    const hit = resolveEmoji(name);
    if (!hit) { seen.push({ code: name, mapped: null }); return whole; }
    const meta = EMOJI_PACK_META[hit.pack];
    const file = meta.prefix + hit.name;
    seen.push({ code: name, mapped: hit.pack + '/' + file + '.' + meta.type });
    return `<img class="wl-emoji" src="${EMOJI_CDN}/${hit.pack}/${file}.${meta.type}" alt="${file}">`;
  });
  return { text: out, seen };
}

// ---------------------------------------------------------------- sql literal helpers
function q(v) {
  if (v === null || v === undefined) return 'NULL';
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function qn(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error('not a number: ' + v);
  return String(Math.trunc(n));
}
// 顶层评论的 pid / rid 必须落 NULL，不能落 0。
// 依据是 Vercel 函数日志里列表接口的实际 SQL：
//   SELECT * FROM wl_comment WHERE ( url = E'/...' ) AND ( status NOT IN (E'waiting',E'spam') )
//     AND ( rid IS NULL ) ORDER BY sticky DESC NULLS LAST,insertedat DESC,id DESC LIMIT 10
// 判别顶层用的是 `rid IS NULL`，写成 0 的行既进不了列表、又不影响 COUNT(*)（那条不带 rid 条件），
// 表现就是「评论数正常、评论区恒空」。JS 侧 0 与 null 都是 falsy，前端渲染不受影响。
function qnNullable(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error('not a number: ' + v);
  return n === 0 ? 'NULL' : String(Math.trunc(n));
}
// ---------------------------------------------------------------- main
function buildRows(comments, posts) {
  const routes = buildRoutes(posts);
  const postById = new Map(posts.map((p) => [p.ID, p]));
  const raw = comments.map((c) => {
    const postId = String(c.comment_post_ID);
    const post = postById.get(postId);
    return {
      id: Number(c.comment_ID),
      postId,
      route: routes.has(postId) ? routes.get(postId) : null,
      nick: c.comment_author || '',
      mail: c.comment_author_email || '',
      link: c.comment_author_url || '',
      ip: c.comment_author_IP || '',
      ua: c.comment_agent || '',
      dateGmt: c.comment_date_gmt || c.comment_date || '',
      date: c.comment_date || c.comment_date_gmt || '',
      content: c.comment_content || '',
      parent: Number(c.comment_parent) || 0,
      approved: c.comment_approved,
      postType: post ? post.post_type : null,
    };
  });

  const byId = new Map(raw.map((r) => [r.id, r]));
  const rootOf = (id) => {
    let cur = id, guard = 0;
    for (;;) {
      const r = byId.get(cur);
      if (!r) return null;
      if (!r.parent) return cur;
      if (guard++ > 200) return null;
      cur = r.parent;
    }
  };

  const emojiLog = [];
  const rows = raw.map((r) => {
    if (!(r.approved in STATUS)) {
      throw new Error('unknown comment_approved=' + JSON.stringify(r.approved) + ' for comment ' + r.id);
    }
    const conv = convertEmoji(r.content);
    for (const s of conv.seen) emojiLog.push({ id: r.id, code: s.code, mapped: s.mapped });
    const url = r.route === null || r.route === undefined ? PAGE_ROUTE : r.route;
    const pid = r.parent || 0;
    const rid = pid ? rootOf(r.id) : 0;
    return {
      id: r.id,
      user_id: null,
      comment: conv.text,
      insertedAt: r.dateGmt,
      ip: r.ip || null,
      link: r.link || null,
      mail: r.mail || null,
      nick: r.nick,
      pid,
      rid,
      status: STATUS[r.approved],
      ua: r.ua || null,
      url,
      createdAt: r.date,
      updatedAt: r.date,
    };
  }).sort((a, b) => a.id - b.id);
  return { rows, emojiLog, routes };
}

function selfCheck(rows, routes) {
  const errors = [];
  if (rows.length !== EXPECTED_COMMENTS) errors.push('row count ' + rows.length + ' != ' + EXPECTED_COMMENTS);
  const ids = new Set(rows.map((r) => r.id));
  for (const r of rows) {
    if (r.pid && !ids.has(r.pid)) errors.push('comment ' + r.id + ' pid=' + r.pid + ' not in batch');
    if (r.rid && !ids.has(r.rid)) errors.push('comment ' + r.id + ' rid=' + r.rid + ' not in batch');
    if (!r.pid && r.rid !== 0) errors.push('comment ' + r.id + ' has pid=0 but rid=' + r.rid);
    if (!r.url) errors.push('comment ' + r.id + ' has empty url');
    if (!r.insertedAt) errors.push('comment ' + r.id + ' has empty insertedAt');
  }
  const postRoutes = new Set();
  for (const v of routes.values()) if (v && v.startsWith(POSTS_PREFIX)) postRoutes.add(v);
  for (const r of rows) {
    if (!(postRoutes.has(r.url) || r.url === PAGE_ROUTE)) {
      errors.push('comment ' + r.id + ' url ' + r.url + ' outside generated route set');
    }
  }
  const rowById = new Map(rows.map((r) => [r.id, r]));
  for (const r of rows) {
    if (!r.pid) continue;
    let cur = r.pid, guard = 0, top = r.pid;
    while (cur && guard++ < 200) {
      const p = rowById.get(cur);
      if (!p) break;
      top = cur;
      cur = p.pid;
    }
    if (top !== r.rid) errors.push('comment ' + r.id + ' rid=' + r.rid + ' but top ancestor is ' + top);
  }
  return errors;
}
// wl_Comment.status values, verified in @waline/vercel@1.43.4 (node_modules/@waline/core/dist/index.js):
//   data.status = config.audit ? "waiting" : "approved";
//   if (data.status === "approved" && services.spam && await services.spam.check(data, ctx)) data.status = "spam";
//   dashboard filter: input.status === "approved" ? ["NOT IN", ["waiting", "spam"]] : input.status
const STATUS = { '1': 'approved', '0': 'waiting', spam: 'spam', 'post-trashed': 'approved' };

function renderSql(rows) {
  let maxId = 0;
  for (const r of rows) if (r.id > maxId) maxId = r.id;
  const lines = [];
  lines.push('-- Generated by scripts/wp-comments-to-waline.mjs -- do not edit by hand.');
  lines.push('-- Source: backup/wordpress_202610201700091wql2.sql.gz (wp_comments).');
  lines.push('-- Target: @waline/vercel PostgreSQL storage (PG_PREFIX default wl_), official assets/waline.pgsql schema.');
  lines.push('-- Column order follows @waline/vercel@1.43.4 src/service/storage/github.js CSV_HEADERS.Comment;');
  lines.push('-- objectId maps to the primary key column id (src/service/storage/mysql.js:6).');
  lines.push('-- Column NAMES are the PostgreSQL ones: the three time columns are unquoted in the');
  lines.push('-- official waline.pgsql, so PostgreSQL folds them to insertedat/createdat/updatedat.');
  lines.push('-- Never quote them as "insertedAt" here -> column "insertedAt" does not exist (42703).');
  lines.push('-- Top-level pid/rid are NULL, not 0: the list API filters `rid IS NULL`, so 0 rows would');
  lines.push('-- show a correct comment count with a permanently empty comment list.');
  lines.push('-- Run AFTER the waline.pgsql schema import.');
  lines.push('-- Safe to re-run: every INSERT carries ON CONFLICT (id) DO NOTHING.');
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');
  for (const r of rows) {
    const vals = [qn(r.id), 'NULL', q(r.comment), q(r.insertedAt), q(r.ip), q(r.link), q(r.mail), q(r.nick),
      qnNullable(r.pid), qnNullable(r.rid), q(r.status), q(r.ua), q(r.url), q(r.createdAt), q(r.updatedAt)];
    lines.push('INSERT INTO ' + TABLE + ' (' + PG_COLUMNS.join(', ') + ') VALUES (' + vals.join(', ') + ')');
    lines.push('  ON CONFLICT (id) DO NOTHING;');
  }
  lines.push('');
  lines.push('-- keep the BIGSERIAL in sync with the explicit ids above');
  // official schema uses a SEQUENCE per table (waline.pgsql: CREATE SEQUENCE wl_comment_seq),
  // and the driver itself advances it with ALTER SEQUENCE <table>_seq RESTART WITH <id>
  // (src/service/storage/postgresql.js:setSeqId). Mirror that here.
  lines.push('ALTER SEQUENCE ' + TABLE + '_seq RESTART WITH ' + String(maxId + 1) + ';');
  lines.push('');
  lines.push('COMMIT;');
  lines.push('');
  return lines.join('\n');
}

function renderCsv(rows) {
  const cell = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const out = [CSV_HEADERS.join(',')];
  for (const r of rows) {
    out.push([r.id, '', r.comment, r.insertedAt, r.ip || '', r.link || '', r.mail || '', r.nick,
      r.pid, r.rid, r.status, r.ua || '', r.url, r.createdAt, r.updatedAt].map(cell).join(','));
  }
  return out.join('\n') + '\n';
}
function renderCounters(posts, routes) {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const counters = [];
  for (const p of posts) {
    if (p.post_type !== 'post' || p.post_status !== 'publish') continue;
    const route = routes.get(p.ID);
    if (!route) continue;
    counters.push({ wpId: Number(p.ID), url: route, views: 0 });
  }
  return counters.sort((a, b) => a.wpId - b.wpId).map((c, i) => ({
    id: i + 1,
    time: c.views,
    url: c.url,
    createdAt: now,
    updatedAt: now,
    wpId: c.wpId,
  }));
}

function main() {
  if (!fs.existsSync(DUMP)) throw new Error('dump not found: ' + DUMP);
  const sqlText = zlib.gunzipSync(fs.readFileSync(DUMP)).toString('utf8');

  const comments = loadTable(sqlText, 'wp_comments');
  const posts = loadTable(sqlText, 'wp_posts');
  const slugSrc = readSlugSource();
  const { rows, emojiLog, routes } = buildRows(comments, posts);

  const errors = selfCheck(rows, routes);
  if (errors.length) {
    console.error('[FAIL] ' + errors.length + ' self-check error(s):');
    for (const e of errors.slice(0, 20)) console.error('  - ' + e);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const sqlOut = renderSql(rows);
  fs.writeFileSync(path.join(OUT_DIR, 'waline-comments.sql'), sqlOut, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'comments.csv'), renderCsv(rows), 'utf8');

  let counters = null;
  if (WITH_VIEWS) {
    // time = legacy wp_postmeta.views (deduped: the dump repeats meta rows)
    const meta = loadTable(sqlText, 'wp_postmeta').filter((m) => m.meta_key === 'views');
    const views = new Map();
    for (const m of meta) {
      const id = String(m.post_id);
      if (views.has(id)) continue;
      const n = Number(m.meta_value || 0);
      if (Number.isFinite(n)) views.set(id, n);
    }
    counters = renderCounters(posts, routes).map((c) => Object.assign(c, { time: views.get(String(c.wpId)) || 0 }));
    const lines = [];
    lines.push('-- Generated by scripts/wp-comments-to-waline.mjs --with-view-counts -- do not edit by hand.');
    lines.push('-- wl_Counter rows: one per published post, time = legacy wp_postmeta.views.');
    lines.push('-- Column names are the PostgreSQL ones (lowercase); safe to re-run: ON CONFLICT (id) DO NOTHING.');
    lines.push(''); lines.push('BEGIN;'); lines.push('');
    for (const c of counters) {
      lines.push('INSERT INTO ' + COUNTER_TABLE + ' (' + COUNTER_COLUMNS.join(', ') + ') VALUES (' +
        [qn(c.id), qn(c.time), q(c.url), q(c.createdAt), q(c.updatedAt)].join(', ') + ')');
      lines.push('  ON CONFLICT (id) DO NOTHING;');
    }
    lines.push(''); lines.push('COMMIT;'); lines.push('');
    fs.writeFileSync(path.join(OUT_DIR, 'waline-counters.sql'), lines.join('\n'), 'utf8');
  }

  const statusCounts = {};
  for (const r of rows) statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  const urlCounts = {};
  for (const r of rows) urlCounts[r.url] = (urlCounts[r.url] || 0) + 1;
  const allRoutes = [...routes.values()].filter(Boolean);
  const report = {
    dump: path.relative(ROOT, DUMP),
    slugSource: slugSrc.map
      ? path.relative(ROOT, slugSrc.path) + ' (' + slugSrc.map.size + ' slugs, informational)'
      : (slugSrc.error ? 'present but unreadable: ' + slugSrc.error : 'none (routes derived from dump)'),
    rows: rows.length,
    insertStatements: (sqlOut.match(/^INSERT INTO /gm) || []).length,
    csvDataLines: rows.length,
    statusCounts,
    urlCounts,
    routeCount: allRoutes.length,
    threadedReplies: rows.filter((r) => r.pid).length,
    emoji: emojiLog,
    counters: counters ? counters.length : 0,
    outputs: ['waline-import/waline-comments.sql', 'waline-import/comments.csv'].concat(
      counters ? ['waline-import/waline-counters.sql'] : []),
  };
  console.log(JSON.stringify(report, null, 2));
  console.log('[OK] self-checks passed');
}

try {
  main();
} catch (e) {
  console.error('[FAIL] ' + (e && e.stack ? e.stack : e));
  process.exit(1);
}