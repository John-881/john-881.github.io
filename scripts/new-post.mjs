#!/usr/bin/env node
/**
 * Usage:
 *   Create: node scripts/new-post.mjs <title> [slug]
 *   Rename: node scripts/new-post.mjs rename <filepath>
 *
 * Examples:
 *   node scripts/new-post.mjs "我的第一篇博客"
 *   node scripts/new-post.mjs "Hello World" hello-world
 *   node scripts/new-post.mjs "如何在 Valaxy 中配置" valaxy-config
 *   node scripts/new-post.mjs rename pages/posts/2026-07-22-old-name.md
 */

import { readFileSync, writeFileSync, existsSync, renameSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '..', 'pages', 'posts');

const { pinyin } = await import('pinyin-pro');

// ─── Helpers ───────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateSlug(title) {
  const hasChinese = /[\u4e00-\u9fff]/.test(title);
  if (!hasChinese) return slugify(title);

  // Split title by Chinese blocks: keep English words/numbers intact
  // e.g. "蒲公英X3A救砖指南" → segments: ["蒲公英", "X3A", "救砖指南"]
  const segments = title.split(/([a-zA-Z0-9]+)/).filter(Boolean);
  const converted = segments.map(seg => {
    if (/^[a-zA-Z0-9]+$/.test(seg)) return seg.toLowerCase();
    const py = pinyin(seg, { toneType: 'none', type: 'array', v: true });
    return py.join('-');
  });
  return slugify(converted.join('-'));
}

function parseFrontmatterDate(content) {
  const m = content.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m);
  return m ? m[1] : null;
}

function parseFrontmatterTitle(content) {
  const m = content.match(/^title:\s*(.*)$/m);
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, '');
}

// ─── Modes ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(`
Usage:
  Create: node scripts/new-post.mjs <title> [slug]
  Rename: node scripts/new-post.mjs rename <filepath>

Examples:
  node scripts/new-post.mjs "我的第一篇博客"
  node scripts/new-post.mjs "Hello World" hello-world
  node scripts/new-post.mjs rename pages/posts/old-name.md
  node scripts/new-post.mjs rename pages/posts/2024-10-27-*.md
`);
  process.exit(0);
}

// ── Rename mode ─────────────────────────────────────────────────
if (args[0] === 'rename') {
  const pattern = args[1];
  if (!pattern) {
    console.error('Usage: node scripts/new-post.mjs rename <filepath-or-glob>');
    process.exit(1);
  }

  // Expand glob via simple directory scan
  let files = [];
  if (pattern.includes('*')) {
    const dir = dirname(pattern);
    const pat = basename(pattern).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    const re = new RegExp(`^${pat}$`);
    const { readdirSync } = await import('fs');
    for (const f of readdirSync(dir)) {
      if (re.test(f)) files.push(join(dir, f));
    }
  } else {
    files = [pattern];
  }

  const fullDir = join(__dirname, '..');
  let renamed = 0, skipped = 0;
  for (const f of files) {
    const full = join(fullDir, f);
    if (!existsSync(full)) {
      console.error(`  Not found: ${f}`);
      skipped++;
      continue;
    }

    const content = readFileSync(full, 'utf-8');
    const title = parseFrontmatterTitle(content);
    if (!title) {
      console.error(`  No title in frontmatter: ${f}`);
      skipped++;
      continue;
    }

    const date = parseFrontmatterDate(content);
    const slug = generateSlug(title);
    const ext = extname(full);
    const newName = `${date || '0000-00-00'}-${slug}${ext}`;
    const newFull = join(dirname(full), newName);

    if (full === newFull) {
      console.log(`  Already correct: ${basename(full)}`);
      skipped++;
      continue;
    }

    if (existsSync(newFull)) {
      console.error(`  Target exists, skipping: ${newName}`);
      skipped++;
      continue;
    }

    renameSync(full, newFull);
    console.log(`  Renamed: ${basename(full)} → ${newName}`);
    renamed++;
  }

  console.log(`\nDone: ${renamed} renamed, ${skipped} skipped.`);
  process.exit(0);
}

// ── Create mode ─────────────────────────────────────────────────
const title = args[0];
const customSlug = args[1];

const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const dateStr = `${yyyy}-${mm}-${dd}`;

const slug = customSlug ? slugify(customSlug) : generateSlug(title);
const filename = `${dateStr}-${slug}.md`;
const filepath = join(POSTS_DIR, filename);

if (existsSync(filepath)) {
  console.error(`Error: File already exists: ${filename}`);
  process.exit(1);
}

const frontmatter = `---
title: ${title}
date: ${dateStr}
categories:
tags:
---

`;

writeFileSync(filepath, frontmatter, 'utf-8');
console.log(`✅ Created: pages/posts/${filename}`);
console.log(`   Title:  ${title}`);
console.log(`   Date:   ${dateStr}`);
