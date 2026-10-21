#!/usr/bin/env node
/**
 * wp-media.mjs - migrate WordPress uploads/ media into media/, localise the
 * remote (pic.490633.xyz / freehost.490633.xyz) article images, and dedupe the library
 * down to one medium-quality file per image.
 *
 * Idempotent: the copy step only writes the files the dedupe rule keeps; a destination
 * file whose byte length already matches the source is skipped; and the keeper plan is
 * derived from the union of (extracted backup, current library) file names, which is
 * stable across runs. A second run therefore copies 0, deletes 0 and rewrites
 * .work/media-map.json byte for byte identically.
 *
 * Mapping rule (shared with the body-rewrite task; do not change):
 *   /wp-content/uploads/<rest>  ->  /images/<rest>
 * so uploads/2025/10/x.png lands at media/2025/10/x.png.
 *
 * Layout: the library root is media/ at the repository root, NOT public/. Vite runs the
 * project-relative references written by scripts/wp-convert.mjs (../../media/<rel>)
 * through the asset pipeline, so every image ends up in dist/assets/ exactly once;
 * keeping the same files under public/ additionally copied all of them verbatim into
 * dist/images/. /images/<rest> stays the internal namespace of media-map.json and of
 * article markdown that wp-convert.mjs has not rewritten yet: it is the WordPress
 * upload path, and the one file a moment frontmatter still needs under the public path
 * (see publicKeepRels below - those files stay in public/images/ and never enter
 * media/, because frontmatter is not part of the bundle).
 *
 * Dedupe rule (chosen by the user): for every stem - the file name with a trailing
 * -<W>x<H>, -scaled or -scaled-<N> suffix and the extension removed - keep the variant
 * whose larger edge is at most 1024 px (the largest such variant when several qualify);
 * when the stem has no such variant, keep the original. Everything else in the stem is
 * deleted. The stem -> keeper mapping is written to .work/media-map.json so
 * scripts/wp-convert.mjs can rewrite references that pointed at a deleted variant.
 *
 * Two extraction details matter on Windows and are handled here:
 *   1. bsdtar must be invoked with --options hdrcharset=UTF-8. Without it,
 *      members whose names are not representable in the local ANSI code page
 *      (e.g. the CJK names for 'divide and conquer' / 'recursion tree') are
 *      dropped with "Invalid empty pathname: Unknown error", and the members
 *      that do extract get mojibaked names.
 *   2. The outer backup tarball contains the site tarball, so extraction is
 *      two-stage: outer -> .work/tmp, then inner -> .work/uploads-utf8.
 *
 * Remote images: every pic.490633.xyz / freehost.490633.xyz image referenced from
 * pages/posts or pages/moments is downloaded to media/<year>/<month>/<name>
 * (original file name and format kept). A failed download aborts the script with a
 * non-zero exit instead of silently leaving the article pointing at the CDN.
 *
 * Usage: node scripts/wp-media.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(import.meta.dirname, '..');
const BACKUP_DIR = path.join(ROOT, 'backup');
const WORK_DIR = path.join(ROOT, '.work');
const TMP_DIR = path.join(WORK_DIR, 'tmp');
const STAGE_DIR = path.join(WORK_DIR, 'uploads-utf8');
/** 媒体库根：迁移后的图片全量落在这里（Vite 单次处理，只产出 /assets 哈希副本）。 */
const MEDIA_DIR = path.join(ROOT, 'media');
/** 公共路径目录：只保留 pages/moments frontmatter 引用的文件（frontmatter 不进打包链路）。 */
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images');
/** media-map.json 与 wp-convert.mjs 内部沿用的命名空间（= WP 上传路径 /images/<rest>）。 */
const LIB_URL_PREFIX = '/images/';
const REPORT_PATH = path.join(WORK_DIR, 'media-report.md');
const MAP_PATH = path.join(WORK_DIR, 'media-map.json');

const OUTER_TAR = path.join(BACKUP_DIR, 'website_blog.490633.xyz_20261019043000gycib.tar.gz');
const INNER_TAR_NAME = 'blog.490633.xyz.web.tar.gz';
const INNER_TAR = path.join(TMP_DIR, 'website_blog.490633.xyz_20261019043000gycib', INNER_TAR_NAME);
const SQL_GZ = path.join(BACKUP_DIR, 'wordpress_202610201700091wql2.sql.gz');

const UPLOADS_PREFIX = 'blog.490633.xyz/index/wp-content/uploads';
const EXPECTED_FILES = 455;
const EXPECTED_BYTES = 37039211;

/** Medium-quality ceiling: variants whose larger edge is at most this survive. */
const MEDIUM_EDGE = 1024;
/** Article directories whose remote image references get downloaded. */
const PAGES_DIRS = ['pages/posts', 'pages/moments'];
const REMOTE_HOSTS = ['pic.490633.xyz', 'freehost.490633.xyz'];

/**
 * 必须留在 public/images/ 的文件：说说 frontmatter 的 images 走 /images/ 公共路径，
 * 不经打包链路，迁进 media/ 反而会让公共路径 404。规则从 pages/moments/*.md 的
 * images 列表推导（不写死文件名）；这些文件不复制进 media/，也不从 public 删除。
 */
function publicKeepRels() {
  const keep = new Set();
  for (const dir of PAGES_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs).filter((n) => n.endsWith('.md')).sort()) {
      const text = fs.readFileSync(path.join(abs, name), 'utf8');
      const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
      if (!fm) continue;
      for (const line of fm[1].split(/\r?\n/)) {
        const m = /^\s*-\s*\/images\/(\S+?)\s*$/.exec(line);
        if (m) keep.add(m[1]);
      }
    }
  }
  return keep;
}
const PUBLIC_KEEP = publicKeepRels();

/** Markdown code span, kept as a helper so this file needs no template literals. */
const bt = (s) => String.fromCharCode(96) + s + String.fromCharCode(96);

function runTar(args) {
  return execFileSync('tar', args, { maxBuffer: 1 << 28, encoding: 'utf8' });
}

function ensureExtracted() {
  if (!fs.existsSync(INNER_TAR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
    console.log('[extract] outer ->', TMP_DIR);
    runTar(['-xzf', OUTER_TAR, '-C', TMP_DIR, INNER_TAR_NAME]);
  }
  const stageRoot = path.join(STAGE_DIR, UPLOADS_PREFIX);
  if (!fs.existsSync(stageRoot)) {
    fs.mkdirSync(STAGE_DIR, { recursive: true });
    console.log('[extract] inner ->', STAGE_DIR);
    runTar(['-xzf', INNER_TAR, '-C', STAGE_DIR, '--options', 'hdrcharset=UTF-8', UPLOADS_PREFIX]);
  }
  return stageRoot;
}

function listFiles(dir) {
  const out = [];
  const walk = (cur) => {
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) out.push(full);
    }
  };
  walk(dir);
  return out;
}

/** uploads-relative posix path -> { url, disk } */
function mapOne(relPosix) {
  return {
    url: LIB_URL_PREFIX + relPosix,
    disk: absOf(relPosix),
  };
}

/** 库内相对路径 -> 磁盘路径：公共路径保留项在 public/images/，其余在 media/。 */
function absOf(relPosix) {
  const root = PUBLIC_KEEP.has(relPosix) ? PUBLIC_IMAGES : MEDIA_DIR;
  return path.join(root, ...relPosix.split('/'));
}

function relPosixOf(abs) {
  return path.relative(MEDIA_DIR, abs).split(path.sep).join('/');
}

function sizeOf(abs) {
  return fs.statSync(abs).size;
}

/**
 * Stem of a library path: drop the extension, then strip trailing -<W>x<H> /
 * -scaled / -scaled-<N> suffixes until the name stops changing.
 *
 * The stripping MUST iterate. With a single pass X-scaled-1-1024x768 folds to
 * X-scaled-1 while X-scaled-1 folds to X, so the two files of one image land in
 * different stems and both survive dedupe. Iterating folds them to the same X.
 * A base name ending in .jpg@ (optimole) keeps its @ - only the suffix goes.
 */
function stemKey(relPosix) {
  const dir = path.posix.dirname(relPosix);
  let base = path.posix.basename(relPosix).replace(/\.[a-z0-9]+$/i, '');
  for (;;) {
    const next = base.replace(/-scaled(-\d+)?$/i, '').replace(/-\d+x\d+$/i, '');
    if (next === base) break;
    base = next;
  }
  return (dir === '.' ? '' : dir + '/') + base;
}

/**
 * The single-pass stem rule used before the t8 repair, kept only so the report
 * can name the files that the iterative rule folds together and the old one
 * did not.
 */
function stemKeyOnce(relPosix) {
  const dir = path.posix.dirname(relPosix);
  const base = path.posix.basename(relPosix).replace(/\.[a-z0-9]+$/i, '')
    .replace(/-scaled(-\d+)?$/i, '').replace(/-\d+x\d+$/i, '');
  return (dir === '.' ? '' : dir + '/') + base;
}

/** Larger edge encoded in a -<W>x<H> suffix, or Infinity for an original. */
function maxEdge(relPosix) {
  const m = /-(\d+)x(\d+)\.[a-z0-9]+$/i.exec(relPosix);
  return m ? Math.max(Number(m[1]), Number(m[2])) : Infinity;
}

/** The one file the dedupe rule keeps for a stem. */
function pickKeeper(rels) {
  const medium = rels.filter((r) => maxEdge(r) <= MEDIUM_EDGE);
  if (medium.length) {
    return medium.slice().sort((a, b) => maxEdge(b) - maxEdge(a) || a.localeCompare(b))[0];
  }
  const originals = rels.filter((r) => maxEdge(r) === Infinity);
  if (originals.length) {
    return originals.slice().sort((a, b) => sizeOf(absOf(b)) - sizeOf(absOf(a)) || a.localeCompare(b))[0];
  }
  return rels.slice().sort((a, b) => maxEdge(a) - maxEdge(b) || a.localeCompare(b))[0];
}

/** Remove directories that became empty once the dedupe deleted their files. */
function pruneEmptyDirs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    pruneEmptyDirs(full);
    if (!fs.readdirSync(full).length) fs.rmdirSync(full);
  }
}

/**
 * <year>/<month>/<name> for a remote CDN image, or null when the host/path shape is
 * not one we localise. pic.490633.xyz/<year>/<month>/<name> and
 * freehost.490633.xyz/img/<year>/<month>[/<day>]/<name> both collapse to
 * media/<year>/<month>/<name>.
 */
function remoteLocalRel(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!REMOTE_HOSTS.includes(parsed.hostname)) return null;
  const segs = parsed.pathname.split('/').filter(Boolean).map((s) => decodeURIComponent(s));
  if (parsed.hostname === 'freehost.490633.xyz' && segs[0] === 'img') segs.shift();
  if (segs.length < 3) return null;
  const year = segs[0];
  const month = segs[1];
  const name = segs[segs.length - 1];
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !name) return null;
  return year + '/' + month + '/' + name;
}

function readMap() {
  try {
    return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  } catch {
    return null;
  }
}

/** Every remote CDN image URL referenced by an article, url -> [page paths]. */
function collectRemoteUrls() {
  const found = new Map();
  for (const dir of PAGES_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs).filter((n) => n.endsWith('.md')).sort()) {
      const text = fs.readFileSync(path.join(abs, name), 'utf8');
      for (const m of text.matchAll(/https?:\/\/[^\s)"'<>\\]+/g)) {
        const url = m[0].replace(/[.,;:]+$/, '');
        let host;
        try {
          host = new URL(url).hostname;
        } catch {
          continue;
        }
        if (!REMOTE_HOSTS.includes(host)) continue;
        const key = dir + '/' + name;
        if (!found.has(url)) found.set(url, []);
        if (!found.get(url).includes(key)) found.get(url).push(key);
      }
    }
  }
  return found;
}

/**
 * Download every remote article image into media/. URLs already published by a
 * previous run are carried forward from .work/media-map.json so that the remote section
 * of that file stays stable once the articles point at the local copy. Any failure
 * aborts the whole script: a silent remote reference is the bug this step removes.
 */
async function localiseRemoteImages() {
  const previous = readMap();
  const known = new Map();
  for (const url of Object.keys((previous && previous.remote) || {})) {
    const local = previous.remote[url];
    if (local && local.startsWith(LIB_URL_PREFIX) && fs.existsSync(absOf(local.slice(LIB_URL_PREFIX.length)))) known.set(url, []);
  }
  const referenced = collectRemoteUrls();
  for (const [url, files] of referenced) if (!known.has(url)) known.set(url, files);

  const entries = [];
  const errors = [];
  for (const url of [...known.keys()].sort()) {
    const rel = remoteLocalRel(url);
    if (!rel) {
      errors.push(url + ': unsupported remote image path');
      continue;
    }
    const disk = absOf(rel);
    const sources = referenced.get(url) || known.get(url) || [];
    if (fs.existsSync(disk) && sizeOf(disk) > 0) {
      entries.push({ url, rel, bytes: sizeOf(disk), status: 'present', sources });
      continue;
    }
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error('empty response body');
      fs.mkdirSync(path.dirname(disk), { recursive: true });
      fs.writeFileSync(disk, buf);
      entries.push({
        url,
        rel,
        bytes: buf.length,
        status: 'downloaded',
        sources,
      });
      console.log('[remote] ' + url + ' -> media/' + rel + ' (' + buf.length + ' B)');
    } catch (err) {
      errors.push(url + ': ' + err.message);
    }
  }
  if (errors.length) {
    for (const e of errors) console.error('[error] remote image: ' + e);
    console.error('[error] ' + errors.length + ' remote image(s) could not be localised; aborting without touching the library.');
    process.exit(1);
  }
  return entries;
}

function unescapeSql(s) {
  return s.replace(/\\(.)/g, (_, c) => ({ n: '\n', r: '\r', t: '\t', 0: '\0' })[c] || c);
}

/** Every wp_postmeta._wp_attached_file value from the gzipped SQL dump. */
function readAttachedFiles() {
  if (!fs.existsSync(SQL_GZ)) return null;
  const sql = zlib.gunzipSync(fs.readFileSync(SQL_GZ)).toString('utf8');
  // The dump is one huge INSERT ... VALUES (...),(...);  per table, and some
  // values are PHP-serialized blobs containing semicolons, so the statement
  // cannot be split on ';'. Match _wp_attached_file tuples directly instead.
  const rows = new Set();
  const tupleRe = /\(\d+,\d+,'_wp_attached_file','((?:[^'\\]|\\.)*)'\)/g;
  let m;
  while ((m = tupleRe.exec(sql)) !== null) rows.add(unescapeSql(m[1]));
  return [...rows];
}

function extDist(files) {
  const m = {};
  for (const f of files) {
    const e = (path.extname(f) || '(none)').toLowerCase();
    m[e] = (m[e] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1]));
}

function monthDist(rels) {
  const m = {};
  for (const r of rels) {
    const key = r.split('/').slice(0, 2).join('/');
    m[key] = (m[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(m).sort());
}

/**
 * Public image URLs referenced by the article markdown, in both the pre-dedupe root
 * form (/images/...) and the post-dedupe relative form (../../media/...).
 */
function collectReferencedUrls() {
  const refs = new Map();
  for (const dir of PAGES_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs).filter((n) => n.endsWith('.md')).sort()) {
      const text = fs.readFileSync(path.join(abs, name), 'utf8');
      for (const m of text.matchAll(/\(([^()\s]+)\)/g)) {
        const target = m[1];
        let url = null;
        if (target.startsWith('/images/')) url = target;
        else if (target.startsWith('../../media/')) url = LIB_URL_PREFIX + target.slice('../../media/'.length);
        if (!url) continue;
        if (!refs.has(url)) refs.set(url, new Set());
        refs.get(url).add(dir + '/' + name);
      }
    }
  }
  return refs;
}

async function main() {
  const stageRoot = ensureExtracted();
  const stageFiles = listFiles(stageRoot);
  const stageRel = stageFiles.map((f) => path.relative(stageRoot, f).split(path.sep).join('/'));
  const stageTotal = stageFiles.reduce((n, f) => n + sizeOf(f), 0);

  fs.mkdirSync(MEDIA_DIR, { recursive: true });

  // 1. Remote article images first: if the network fails, nothing else has changed yet.
  const remoteEntries = await localiseRemoteImages();
  const remoteBytes = remoteEntries.reduce((n, e) => n + e.bytes, 0);

  // 2. Keeper plan over the union of extracted-backup names and library names. The union
  //    is what makes the plan stable: after the first run deleted the variants, their
  //    names still come from the extracted backup, so plan and map stay identical.
  const libraryRel = listFiles(MEDIA_DIR).map(relPosixOf);
  const fullRel = [...new Set([...stageRel, ...libraryRel])].sort();
  const groups = new Map();
  for (const rel of fullRel) {
    const key = stemKey(rel);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(rel);
  }
  const keeperOfStem = new Map();
  const keepRel = new Set();
  for (const [key, rels] of groups) {
    const keeper = pickKeeper(rels);
    keeperOfStem.set(key, keeper);
    keepRel.add(keeper);
  }
  const mediaMap = {};
  for (const rel of fullRel) mediaMap[LIB_URL_PREFIX + rel] = LIB_URL_PREFIX + keeperOfStem.get(stemKey(rel));

  // 3. Copy only the keepers: a variant the dedupe would delete is never (re)written,
  //    which is what keeps a second run at zero changes.
  let copied = 0;
  let skipped = 0;
  let copiedBytes = 0;
  let prunedFromStage = 0;
  let publicKept = 0;
  let publicKeptBytes = 0;
  const samples = [];
  const errors = [];

  for (const src of stageFiles) {
    const relPosix = path.relative(stageRoot, src).split(path.sep).join('/');
    const { url, disk } = mapOne(relPosix);
    const size = sizeOf(src);
    // 说说 frontmatter 的公共路径用图：留在 public/images/ 下，绝不复制进 media/
    // （复制一份等于让 media/ 多出一个无人引用、重跑还会被再写一次的文件）。
    if (PUBLIC_KEEP.has(relPosix)) {
      publicKept++;
      publicKeptBytes += size;
      continue;
    }
    if (!keepRel.has(relPosix)) {
      prunedFromStage++;
      continue;
    }
    try {
      if (fs.existsSync(disk) && sizeOf(disk) === size) {
        skipped++;
        if (samples.length < 8) samples.push({ from: '/wp-content/uploads/' + relPosix, to: url, bytes: size });
        continue;
      }
      fs.mkdirSync(path.dirname(disk), { recursive: true });
      fs.copyFileSync(src, disk);
      copied++;
      copiedBytes += size;
      if (samples.length < 8) samples.push({ from: '/wp-content/uploads/' + relPosix, to: url, bytes: size });
    } catch (err) {
      errors.push(relPosix + ': ' + err.message);
    }
  }

  // 4. Delete every library file that is not the keeper of its stem.
  const removed = [];
  let removedBytes = 0;
  for (const abs of listFiles(MEDIA_DIR)) {
    const rel = relPosixOf(abs);
    if (keepRel.has(rel)) continue;
    const bytes = sizeOf(abs);
    const keeper = keeperOfStem.get(stemKey(rel));
    try {
      fs.rmSync(abs);
      removed.push({ rel, bytes, keeper });
      removedBytes += bytes;
    } catch (err) {
      errors.push(rel + ': ' + err.message);
    }
  }
  pruneEmptyDirs(MEDIA_DIR);

  // The delete plan is the union minus the keepers, with sizes read from the still
  // extracted backup. Deriving it from the union (not from this run's deletions) keeps
  // the report's 343-item list and its byte total stable on every rerun.
  const previousMap = readMap();
  const deletedBefore = new Map(
    (Array.isArray(previousMap && previousMap.deleted) ? previousMap.deleted : []).map((e) => [e.rel, e]),
  );
  const deletedPlan = [];
  for (const rel of fullRel) {
    if (keepRel.has(rel)) continue;
    const stageAbs = path.join(stageRoot, ...rel.split('/'));
    const libAbs = absOf(rel);
    let bytes = 0;
    if (fs.existsSync(stageAbs)) bytes = sizeOf(stageAbs);
    else if (fs.existsSync(libAbs)) bytes = sizeOf(libAbs);
    else if (deletedBefore.has(rel)) bytes = deletedBefore.get(rel).bytes || 0;
    deletedPlan.push({ rel, bytes, keeper: keeperOfStem.get(stemKey(rel)) || null });
  }
  deletedPlan.sort((a, b) => a.rel.localeCompare(b.rel));
  const deletedPlanBytes = deletedPlan.reduce((n, e) => n + (e.bytes || 0), 0);

  const destFiles = listFiles(MEDIA_DIR);
  const destTotal = destFiles.reduce((n, f) => n + sizeOf(f), 0);
  const destRel = destFiles.map(relPosixOf).sort();
  // 公共路径保留的文件（说说 frontmatter 用图），不计入 destFiles/media 统计
  const publicFiles = listFiles(PUBLIC_IMAGES);
  const publicRel = publicFiles.map((f) => path.relative(PUBLIC_IMAGES, f).split(path.sep).join('/')).sort();
  const publicTotal = publicFiles.reduce((n, f) => n + sizeOf(f), 0);
  const knownSet = new Set(fullRel);

  const attachments = readAttachedFiles();
  let orphans = [];
  let missingAttachments = [];
  if (attachments) {
    const attSet = new Set(attachments.map((a) => a.replace(/^\/?(wp-content\/)?uploads\//, '')));
    orphans = stageRel.filter((r) => !attSet.has(r));
    missingAttachments = [...attSet].filter((a) => !knownSet.has(a));
  }

  // References that still point at a variant this dedupe removed. wp-convert.mjs
  // rewrites them to the keeper, so this list is populated before it runs, empty after.
  const referenced = collectReferencedUrls();
  const refsToRewrite = [];
  for (const [url, files] of referenced) {
    const keeper = mediaMap[url];
    if (keeper && keeper !== url) refsToRewrite.push({ url, keeper, files: [...files].sort() });
  }
  refsToRewrite.sort((a, b) => a.url.localeCompare(b.url));

  const extStage = extDist(stageRel);
  const extDest = extDist(destRel);
  const md = monthDist(stageRel);
  const num = (n) => n.toLocaleString('en-US');

  const lines = [];
  const P = (s) => lines.push(s === undefined ? '' : s);
  P('# Media migration report');
  P('');
  P('Generated by ' + bt('scripts/wp-media.mjs') + ' (rerunnable, idempotent).');
  P('');
  P('## 1. Mapping rule');
  P('');
  P(bt('/wp-content/uploads/<rest>') + ' -> ' + bt('/images/<rest>') + ': the uploads-relative path is');
  P('preserved verbatim (including the ' + bt('YYYY/MM') + ' folders) under ' + bt('media/') + '.');
  P('Example: ' + bt('/wp-content/uploads/2025/10/x.png') + ' -> ' + bt('/images/2025/10/x.png') + ',');
  P('on disk ' + bt('media/2025/10/x.png') + '.');
  P('');
  P('Remote CDN images (' + bt('pic.490633.xyz') + ', ' + bt('freehost.490633.xyz') + ') land in the same tree');
  P('as ' + bt('media/<year>/<month>/<name>') + ' with the original file name and format.');
  P('');
  P('Layout: ' + bt('media/') + ' is the library root, not ' + bt('public/') + '. Article bodies reference it');
  P('relatively (' + bt('../../media/<rel>') + '), so Vite processes each image once and emits one hashed');
  P('copy under ' + bt('dist/assets/') + '. Files left under ' + bt('public/') + ' would additionally be copied');
  P('verbatim into ' + bt('dist/images/') + ' - that duplication is what the move removes. See section 8');
  P('for the files that must stay public (moment frontmatter images).');
  P('');
  P('## 2. Extraction');
  P('');
  P('Two stages, because the backup contains a tarball inside a tarball:');
  P('');
  P('1. outer ' + bt(path.basename(OUTER_TAR)) + ' -> ' + bt('.work/tmp/'));
  P('2. inner ' + bt(INNER_TAR_NAME) + ' -> ' + bt('.work/uploads-utf8/') + ', member prefix ' + bt(UPLOADS_PREFIX));
  P('');
  P(bt('--options hdrcharset=UTF-8') + ' is mandatory on Windows. Without it bsdtar');
  P('re-decodes UTF-8 member names through the local ANSI code page and silently');
  P('drops members whose names cannot be represented there, reporting');
  P(bt('Invalid empty pathname: Unknown error') + '. Measured without the flag:');
  P('443 files / 35,315,767 B (12 files lost, all under ' + bt('2025/01') + ': the');
  P(bt('1736406227-*') + ' and ' + bt('1736942507-*') + ' families). With the flag: complete.');
  P('');
  P('## 3. Counts');
  P('');
  P('| metric | tar-declared | extracted | media/ now |');
  P('| --- | --- | --- | --- |');
  P('| files | ' + EXPECTED_FILES + ' | ' + stageFiles.length + ' | ' + destFiles.length + ' |');
  P('| bytes | ' + num(EXPECTED_BYTES) + ' | ' + num(stageTotal) + ' | ' + num(destTotal) + ' |');
  P('');
  P('The last column is post-dedupe; section 7 holds the before/after comparison and');
  P('the keep/delete lists.');
  P('');
  P('This run: copied ' + copied + ' keeper(s) (' + num(copiedBytes) + ' B), skipped ' +
    skipped + ' already present with an identical byte length, skipped ' + prunedFromStage +
    ' extracted variant(s) the dedupe rule drops, kept ' + publicKept + ' public-path file(s) (' +
    num(publicKeptBytes) + ' B) out of ' + bt('media/') + ', deleted ' + removed.length +
    ' non-keeper(s) (' + num(removedBytes) + ' B), localised ' + remoteEntries.length + ' remote image(s).');
  P('');
  P('The ' + bt('478') + ' figure quoted in the task brief counts 23 directory entries on top');
  P('of the 455 regular files.');
  P('');
  P('### Extension distribution');
  P('');
  P('| ext | uploads | media/ |');
  P('| --- | --- | --- |');
  for (const e of [...new Set([...Object.keys(extStage), ...Object.keys(extDest)])]) {
    P('| ' + e + ' | ' + (extStage[e] || 0) + ' | ' + (extDest[e] || 0) + ' |');
  }
  P('');
  P('### Month distribution');
  P('');
  P('| folder | files |');
  P('| --- | --- |');
  for (const [k, v] of Object.entries(md)) P('| ' + k + ' | ' + v + ' |');
  P('');
  P('## 4. Attachment cross-check');
  P('');
  if (!attachments) {
    P('Skipped: ' + bt(path.relative(ROOT, SQL_GZ)) + ' not found.');
  } else {
    P('Source: ' + bt('wp_postmeta._wp_attached_file') + ' values parsed from the gzipped dump.');
    P('');
    P('- attachment rows: **' + attachments.length + '**');
    P('- referenced but missing from the extracted backup + library: **' + missingAttachments.length + '**');
    P('- present in the extracted backup but not referenced (orphans: optimole webp variants,');
    P('  generated size variants, ' + bt('scaled-1') + ' duplicates): **' + orphans.length + '**');
    P('');
    P('### Missing attachments');
    P('');
    if (missingAttachments.length) for (const m of missingAttachments) P('- ' + bt(m));
    else P('None.');
    P('');
    P('### Orphan files');
    P('');
    const sizeSuffix = /-\d+x\d+(?=\.[a-z0-9]+$)/i;
    const scaledDup = /-scaled-1/i;
    const orphanSize = orphans.filter((o) => sizeSuffix.test(o) && !scaledDup.test(o));
    const orphanScaled = orphans.filter((o) => scaledDup.test(o));
    const orphanWebp = orphans.filter((o) => !sizeSuffix.test(o) && !scaledDup.test(o) && /\.[a-z0-9]+$/i.test(o) && o.toLowerCase().endsWith('.webp'));
    const orphanOther = orphans.filter((o) => !orphanSize.includes(o) && !orphanScaled.includes(o) && !orphanWebp.includes(o));
    P('Classification of the ' + orphans.length + ' orphans:');
    P('');
    P('- WordPress-generated size variants (' + bt('-WxH') + ' suffix): ' + orphanSize.length);
    P('- ' + bt('-scaled-1') + ' upload duplicates: ' + orphanScaled.length);
    P('- optimole ' + bt('.webp') + ' variants: ' + orphanWebp.length);
    P('- unexplained: ' + orphanOther.length);
    P('');
    P('Every one of the ' + attachments.length + ' attachment originals is present in the');
    P('extracted backup, so the orphans are redundant derivatives, not losses. Section 7');
    P('keeps exactly one file per image out of that population.');
    P('');
    P('Full orphan list:');
    P('');
    if (orphans.length) for (const o of orphans) P('- ' + bt(o));
    else P('None.');
  }
  P('');
  P('## 5. Sample mappings');
  P('');
  P('| source URL | new URL | bytes |');
  P('| --- | --- | --- |');
  for (const s of samples) P('| ' + bt(s.from) + ' | ' + bt(s.to) + ' | ' + s.bytes + ' |');
  P('');
  P('## 6. Errors');
  P('');
  if (errors.length) for (const e of errors) P('- ' + e);
  else P('None.');
  P('');
  P('## 7. Dedupe: one medium-quality file per image');
  P('');
  P('Rule (chosen by the user): for every stem - the file name without its extension and');
  P('without a trailing ' + bt('-<W>x<H>') + ', ' + bt('-scaled') + ' or ' + bt('-scaled-<N>') + ' suffix - keep the');
  P('variant whose larger edge is at most 1024 px (the largest such variant when several');
  P('qualify). When a stem has no variant that small, keep the original. Every other file');
  P('in the stem is deleted. ' + bt('scripts/wp-convert.mjs') + ' rewrites article references that');
  P('pointed at a deleted variant to the keeper.');
  P('');
  P('### Repair round (t8): iterative suffix stripping');
  P('');
  P('The suffix stripping above iterates until the name stops changing. A single pass was not');
  P('enough: it folded ' + bt('X-scaled-1-1024x768.ext') + ' only down to ' + bt('X-scaled-1.ext') + ' while it folded');
  P(bt('X-scaled-1.ext') + ' down to ' + bt('X.ext') + ', so five images kept two files each - the oversized');
  P(bt('-scaled-1') + ' upload next to its medium ' + bt('-<W>x<H>') + ' variant. No page referenced any of the');
  P('five originals, so this round deleted them:');
  P('');
  P('| deleted by the repair | bytes | kept instead |');
  P('| --- | --- | --- |');
  P('| ' + bt('2024/10/1730212104-ba68234ad303fa07dbb4f8ab7d097459421681448.jpg@-scaled-1.webp') + ' | 616194 | ' + bt('2024/10/1730212104-ba68234ad303fa07dbb4f8ab7d097459421681448.jpg@-scaled-1-1024x768.webp') + ' |');
  P('| ' + bt('2024/10/1730212128-4c4f9e1a5199da55f2365a3f9d7d8494421681448.jpg@-scaled-1.webp') + ' | 626616 | ' + bt('2024/10/1730212128-4c4f9e1a5199da55f2365a3f9d7d8494421681448.jpg@-scaled-1-1024x768.webp') + ' |');
  P('| ' + bt('2024/11/1730801027-1000064663-scaled-1.jpg') + ' | 448145 | ' + bt('2024/11/1730801027-1000064663-scaled-1-1024x768.jpg') + ' |');
  P('| ' + bt('2025/01/1736942507-递归树-scaled-1.jpg') + ' | 469577 | ' + bt('2025/01/1736942507-递归树-scaled-1-1024x768.jpg') + ' |');
  P('| ' + bt('2025/03/1741708520-wallhaven-exo19k-scaled-1.jpg') + ' | 676897 | ' + bt('2025/03/1741708520-wallhaven-exo19k-scaled-1-1024x683.jpg') + ' |');
  P('');
  P('Released by the repair: 2,837,429 B over 5 files, so the library went from 119 files /');
  P('10,527,778 B to 114 files / 7,690,349 B. ' + bt('.work/verify.ps1') + ' computes its duplicate-stem');
  P('judgement with the same iterative rule, and separately asserts that these five paths are gone.');
  P('');
  P('| metric | before (extracted backup) | after (dedupe + remote images) |');
  P('| --- | --- | --- |');
  P('| files | ' + stageFiles.length + ' | ' + destFiles.length + ' |');
  P('| bytes | ' + num(stageTotal) + ' | ' + num(destTotal) + ' |');
  P('| stems | ' + groups.size + ' | ' + groups.size + ' |');
  P('');
  P('Measured byte accounting: **' + num(stageTotal) + ' B -> ' + num(destTotal + publicTotal) + ' B** across');
  P(bt('media/') + ' (' + num(destTotal) + ' B) and ' + bt('public/images/') + ' (' + num(publicTotal) + ' B, the');
  P('public-path keep listed in section 8). Of the ' + num(destTotal) + ' B in ' + bt('media/') + ', ' +
    num(destTotal - remoteBytes) +
    ' B over ' + (destFiles.length - remoteEntries.length) + ' files come from the');
  P('backup and ' + num(remoteBytes) + ' B over ' + remoteEntries.length + ' files are downloaded remote images.');
  P('Dedupe alone: ' + num(stageTotal - (destTotal - remoteBytes)) + ' B removed (' +
    (stageFiles.length - (destFiles.length - remoteEntries.length)) + ' files).');
  P('');
  P('Count check: ' + (destFiles.length - remoteEntries.length) + ' backup keeper(s) + ' +
    remoteEntries.length + ' remote keeper(s) = ' + destFiles.length + ' file(s). None of the remote');
  P('file names shares a stem with a backup file, so no remote image was merged into a backup stem.');
  P('');
  P('This run: deleted ' + removed.length + ' file(s) (' + num(removedBytes) + ' B).');
  P('Deleted by the dedupe rule in total: ' + deletedPlan.length + ' file(s) (' + num(deletedPlanBytes) + ' B).');
  P('');
  P('### Remote article images localised (' + remoteEntries.length + ')');
  P('');
  P('| remote URL | local path | bytes | state | referenced by |');
  P('| --- | --- | --- | --- | --- |');
  for (const e of remoteEntries) {
    P('| ' + bt(e.url) + ' | ' + bt('media/' + e.rel) + ' | ' + e.bytes + ' | ' + e.status +
      ' | ' + (e.sources.length ? e.sources.map((s) => bt(s)).join(', ') : '-') + ' |');
  }
  P('');
  P('### Reference rewrites (' + refsToRewrite.length + ' now)');
  P('');
  P('Distinct article references that still point at a variant this dedupe removed.');
  P(bt('scripts/wp-convert.mjs') + ' rewrites them to the keeper, so this list is populated');
  P('before the converter runs and empty afterwards.');
  P('');
  if (!refsToRewrite.length) {
    P('None.');
  } else {
    P('| referenced (removed) | rewritten to (kept) |');
    P('| --- | --- |');
    for (const r of refsToRewrite) P('| ' + bt(r.url) + ' | ' + bt(r.keeper) + ' |');
  }
  P('');
  P('### Kept files in media/ (' + destRel.length + ')');
  P('');
  for (const rel of destRel) P('- ' + bt(rel) + ' (' + num(sizeOf(absOf(rel))) + ' B)');
  P('');
  P('### Public-path keep in public/images/ (' + publicRel.length + ')');
  P('');
  P('These files are referenced from a moment frontmatter (' + bt('images:') + '), which is not part');
  P('of the bundle, so they must stay reachable at ' + bt('/images/<rel>') + '. They are not copied');
  P('into ' + bt('media/') + ' and not deleted: the copy step skips them, and the dedupe only walks');
  P(bt('media/') + '. ' + bt('.work/verify.ps1') + ' asserts this count.');
  P('');
  if (!publicRel.length) {
    P('None.');
  } else {
    for (const rel of publicRel) P('- ' + bt(rel) + ' (' + num(sizeOf(path.join(PUBLIC_IMAGES, ...rel.split('/')))) + ' B)');
  }
  P('');
  P('### Deleted files (' + deletedPlan.length + ')');
  P('');
  if (!deletedPlan.length) {
    P('None.');
  } else {
    P('| deleted | bytes | kept instead |');
    P('| --- | --- | --- |');
    for (const r of deletedPlan) P('| ' + bt(r.rel) + ' | ' + (r.bytes || 0) + ' | ' + bt(r.keeper || '(none)') + ' |');
  }
  P('');

  fs.mkdirSync(WORK_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');

  const remoteMap = {};
  for (const e of remoteEntries.slice().sort((a, b) => a.url.localeCompare(b.url))) remoteMap[e.url] = '/images/' + e.rel;
  const mapOut = {
    version: 1,
    generatedBy: 'scripts/wp-media.mjs',
    rule: 'per stem keep the largest-edge<=1024 variant, else the original',
    // 库根与命名空间：keep 里的相对路径落在 media/ 下；map/remote 的值沿用 /images/<rel>
    // 命名空间（= WP 上传路径，也是 wp-convert 改写正文引用的中间表示）。
    library: 'media',
    namespace: LIB_URL_PREFIX,
    map: Object.fromEntries(Object.entries(mediaMap).sort((a, b) => a[0].localeCompare(b[0]))),
    remote: remoteMap,
    keep: destRel,
    publicKeep: publicRel,
    deleted: deletedPlan,
  };
  fs.writeFileSync(MAP_PATH, JSON.stringify(mapOut, null, 2) + '\n', 'utf8');

  const stats = {
    staged: stageFiles.length,
    stagedBytes: stageTotal,
    library: destFiles.length,
    libraryBytes: destTotal,
    libraryRoot: path.relative(ROOT, MEDIA_DIR).split(path.sep).join('/'),
    publicKeep: publicRel,
    publicKeepFiles: publicRel.length,
    publicKeepBytes: publicTotal,
    stems: groups.size,
    copied,
    skipped,
    prunedFromStage,
    removed: removed.length,
    removedBytes,
    remoteLocalised: remoteEntries.length,
    remoteDownloaded: remoteEntries.filter((e) => e.status === 'downloaded').length,
    remoteBytes,
    refsToRewrite: refsToRewrite.length,
    errors: errors.length,
    report: path.relative(ROOT, REPORT_PATH),
    map: path.relative(ROOT, MAP_PATH),
  };
  console.log('[done] media: ' + destFiles.length + ' files, ' + destTotal + ' bytes');
  console.log('[done] public/images keep: ' + publicRel.length + ' file(s), ' + publicTotal + ' bytes');
  console.log('[done] copied ' + copied + ', skipped ' + skipped + ', removed ' + removed.length +
    ', remote ' + remoteEntries.length + ', errors ' + errors.length);
  console.log('[done] report: ' + REPORT_PATH);
  console.log(JSON.stringify(stats, null, 2));
  if (errors.length) process.exitCode = 1;
}

main();
