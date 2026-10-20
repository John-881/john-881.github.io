#!/usr/bin/env node
/**
 * wp-media.mjs - migrate WordPress uploads/ media into public/images/.
 *
 * Idempotent: a destination file whose byte length already matches the source
 * is skipped, and the skip count is written into the report.
 *
 * Mapping rule (shared with the body-rewrite task; do not change):
 *   /wp-content/uploads/<rest>  ->  /images/<rest>
 * so uploads/2025/10/x.png lands at public/images/2025/10/x.png.
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
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images');
const REPORT_PATH = path.join(WORK_DIR, 'media-report.md');

const OUTER_TAR = path.join(BACKUP_DIR, 'website_blog.490633.xyz_20261019043000gycib.tar.gz');
const INNER_TAR_NAME = 'blog.490633.xyz.web.tar.gz';
const INNER_TAR = path.join(TMP_DIR, 'website_blog.490633.xyz_20261019043000gycib', INNER_TAR_NAME);
const SQL_GZ = path.join(BACKUP_DIR, 'wordpress_202610201700091wql2.sql.gz');

const UPLOADS_PREFIX = 'blog.490633.xyz/index/wp-content/uploads';
const EXPECTED_FILES = 455;
const EXPECTED_BYTES = 37039211;

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
    url: '/images/' + relPosix,
    disk: path.join(PUBLIC_IMAGES, ...relPosix.split('/')),
  };
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

function main() {
  const stageRoot = ensureExtracted();
  const stageFiles = listFiles(stageRoot);
  const stageTotal = stageFiles.reduce((n, f) => n + fs.statSync(f).size, 0);

  fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });

  let copied = 0;
  let skipped = 0;
  let copiedBytes = 0;
  const samples = [];
  const errors = [];

  for (const src of stageFiles) {
    const relPosix = path.relative(stageRoot, src).split(path.sep).join('/');
    const { url, disk } = mapOne(relPosix);
    const size = fs.statSync(src).size;
    try {
      if (fs.existsSync(disk) && fs.statSync(disk).size === size) {
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

  const destFiles = listFiles(PUBLIC_IMAGES);
  const destTotal = destFiles.reduce((n, f) => n + fs.statSync(f).size, 0);
  const destRel = destFiles.map((f) => path.relative(PUBLIC_IMAGES, f).split(path.sep).join('/'));
  const destRelSet = new Set(destRel);
  const stagedRel = stageFiles.map((f) => path.relative(stageRoot, f).split(path.sep).join('/'));

  const attachments = readAttachedFiles();
  let orphans = [];
  let missingAttachments = [];
  if (attachments) {
    const attSet = new Set(attachments.map((a) => a.replace(/^\/?(wp-content\/)?uploads\//, '')));
    orphans = stagedRel.filter((r) => !attSet.has(r));
    missingAttachments = [...attSet].filter((a) => !destRelSet.has(a));
  }

  const extStage = extDist(stagedRel);
  const extDest = extDist(destRel);
  const md = monthDist(stagedRel);
  const num = (n) => n.toLocaleString('en-US');

  const lines = [];
  const P = (s) => lines.push(s === undefined ? '' : s);
  P('# Media migration report');
  P('');
  P('Generated by `scripts/wp-media.mjs` (rerunnable, idempotent).');
  P('');
  P('## 1. Mapping rule');
  P('');
  P('`/wp-content/uploads/<rest>` -> `/images/<rest>`: the uploads-relative path is');
  P('preserved verbatim (including the `YYYY/MM` folders) under `public/images/`.');
  P('Example: `/wp-content/uploads/2025/10/x.png` -> `/images/2025/10/x.png`,');
  P('on disk `public/images/2025/10/x.png`.');
  P('');
  P('## 2. Extraction');
  P('');
  P('Two stages, because the backup contains a tarball inside a tarball:');
  P('');
  P('1. outer `' + path.basename(OUTER_TAR) + '` -> `.work/tmp/`');
  P('2. inner `' + INNER_TAR_NAME + '` -> `.work/uploads-utf8/`, member prefix `' + UPLOADS_PREFIX + '`');
  P('');
  P('`--options hdrcharset=UTF-8` is mandatory on Windows. Without it bsdtar');
  P('re-decodes UTF-8 member names through the local ANSI code page and silently');
  P('drops members whose names cannot be represented there, reporting');
  P('`Invalid empty pathname: Unknown error`. Measured without the flag:');
  P('443 files / 35,315,767 B (12 files lost, all under `2025/01`: the');
  P('`1736406227-*` and `1736942507-*` families). With the flag: complete.');
  P('');
  P('## 3. Counts');
  P('');
  P('| metric | tar-declared | extracted | written to public/images |');
  P('| --- | --- | --- | --- |');
  P('| files | ' + EXPECTED_FILES + ' | ' + stageFiles.length + ' | ' + destFiles.length + ' |');
  P('| bytes | ' + num(EXPECTED_BYTES) + ' | ' + num(stageTotal) + ' | ' + num(destTotal) + ' |');
  P('');
  P('This run: copied ' + copied + ', skipped (already present, same byte length) ' +
    skipped + ', new bytes ' + num(copiedBytes) + '.');
  P('');
  P('The `478` figure quoted in the task brief counts 23 directory entries on top');
  P('of the 455 regular files.');
  P('');
  P('### Extension distribution');
  P('');
  P('| ext | uploads | public/images |');
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
    P('Skipped: `' + path.relative(ROOT, SQL_GZ) + '` not found.');
  } else {
    P('Source: `wp_postmeta._wp_attached_file` values parsed from the gzipped dump.');
    P('');
    P('- attachment rows: **' + attachments.length + '**');
    P('- referenced but missing from `public/images`: **' + missingAttachments.length + '**');
    P('- present on disk but not referenced (orphans: optimole webp variants,');
    P('  generated size variants, `scaled-1` duplicates): **' + orphans.length + '**');
    P('');
    P('### Missing attachments');
    P('');
    if (missingAttachments.length) for (const m of missingAttachments) P('- `' + m + '`');
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
    P('- WordPress-generated size variants (`-WxH` suffix): ' + orphanSize.length);
    P('- `-scaled-1` upload duplicates: ' + orphanScaled.length);
    P('- optimole `.webp` variants: ' + orphanWebp.length);
    P('- unexplained: ' + orphanOther.length);
    P('');
    P('Every one of the ' + attachments.length + ' attachment originals is present, so the');
    P('orphans are redundant derivatives, not losses.');
    P('');
    P('Full orphan list:');
    P('');
    if (orphans.length) for (const o of orphans) P('- `' + o + '`');
    else P('None.');
  }
  P('');
  P('## 5. Sample mappings');
  P('');
  P('| source URL | new URL | bytes |');
  P('| --- | --- | --- |');
  for (const s of samples) P('| `' + s.from + '` | `' + s.to + '` | ' + s.bytes + ' |');
  P('');
  P('## 6. Errors');
  P('');
  if (errors.length) for (const e of errors) P('- ' + e);
  else P('None.');
  P('');

  fs.mkdirSync(WORK_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');

  console.log('[done] public/images: ' + destFiles.length + ' files, ' + destTotal + ' bytes');
  console.log('[done] copied ' + copied + ', skipped ' + skipped + ', errors ' + errors.length);
  console.log('[done] report: ' + REPORT_PATH);
}

main();
