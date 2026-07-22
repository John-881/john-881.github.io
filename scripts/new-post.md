# new-post.mjs

文章创建与文件名规范化脚本。自动将中文标题转为拼音 slug，避免 URL 编码导致的解析问题。

---

## 模式一：新建文章（Create）

```bash
node scripts/new-post.mjs <标题> [自定义slug]
```

### 示例

```bash
# 纯中文标题 → 自动转拼音
node scripts/new-post.mjs "我的第一篇博客"
# → pages/posts/2026-07-22-wo-de-di-yi-pian-bo-ke.md

# 中英混排 → 英文保留，中文转拼音
node scripts/new-post.mjs "Valaxy 静态博客搭建指南"
# → pages/posts/2026-07-22-valaxy-jing-tai-bo-ke-da-jian-zhi-nan.md

# 纯英文 → 直接 slugify
node scripts/new-post.mjs "Hello World"
# → pages/posts/2026-07-22-hello-world.md

# 自定义 slug（绕过自动生成）
node scripts/new-post.mjs "Valaxy 配置详解" valaxy-config
# → pages/posts/2026-07-22-valaxy-config.md
```

### 生成的 frontmatter

```yaml
---
title: 我的第一篇博客
date: 2026-07-22
categories:
tags:
---
```

---

## 模式二：批量重命名（Rename）

读取已有 markdown 文件 `frontmatter` 中的 `title`，自动重命名文件。

```bash
node scripts/new-post.mjs rename <文件路径>
node scripts/new-post.mjs rename <通配符>
```

### 示例

```bash
# 重命名单个文件
node scripts/new-post.mjs rename pages/posts/old-name.md

# 批量重命名所有文章（会自动跳过已经正确的文件）
node scripts/new-post.mjs rename "pages/posts/*.md"
```

### 重命名效果

| 原名 | 重命名后 |
|------|---------|
| `2024-10-27-e892b2e585ac...md` | `2024-10-27-pu-gong-ying-x3a-jiu-zhuan-zhi-nan.md` |
| `hello-valaxy.md` | `2022-04-01-hello-valaxy.md` |

> 文件名中的日期取自 frontmatter 中的 `date` 字段，因此 `hello-valaxy.md` 中的 `date: 2022-04-01` 会被正确提取。

---

## Slug 生成规则

| 输入 | 输出 | 说明 |
|------|------|------|
| `蒲公英X3A救砖指南` | `pu-gong-ying-x3a-jiu-zhuan-zhi-nan` | 中文转拼音，数字保留 |
| `Valaxy——一个可爱的静态博客框架` | `valaxy-yi-ge-ke-ai-de-jing-tai-bo-ke-kuang-jia` | 英文原样保留 |
| `C#与python中的属性` | `c-yu-python-zhong-de-shu-xing` | 特殊符号（`#`）自动过滤 |
| `Hello World` | `hello-world` | 纯英文直接 slugify |

---

## 依赖

- `pinyin-pro` — 中文转拼音（已安装为 devDependency）

```bash
pnpm add -D pinyin-pro
```
