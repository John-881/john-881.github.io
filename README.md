# 凌渡冰点的博客（Valaxy）

从 WordPress 迁移而来的静态博客，基于 [Valaxy](https://valaxy.site/zh/) 1.2.0 + 主题 [Yun](https://valaxy.site/zh/themes/yun)，
评论使用 Waline（Vercel + Neon PostgreSQL）。

**日常怎么用这个站：看 [docs/使用说明书.md](docs/使用说明书.md)**（写给前端初学者的操作手册：怎么写文章、放图片、发说说、改配置、发布上线、常见报错）。
原始迁移协议见 [docs/migration-protocol.md](docs/migration-protocol.md)。

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 本地预览，默认 http://localhost:4859/
pnpm build            # 生成静态站点到 dist/（valaxy build --ssg）
pnpm serve            # 预览 dist 产物
pnpm rss              # 单独生成 RSS
```

写作：文章放 `pages/posts/*.md`，说说放 `pages/moments/YYYY-MM-DD-<标题>.md`。
文章路由是 `/posts/<文件名>`（中文文件名即是中文 URL）。

## 目录

| 路径 | 说明 |
| --- | --- |
| `pages/posts/` | 31 篇迁移过来的文章 |
| `pages/moments/` | 7 条说说（valaxy-addon-moments） |
| `pages/` | 首页之外的自定义页面：about、links、comment、services、subscribe、archives、categories、tags |
| `media/` | 113 个媒体文件（7,503,774 B，已去重：每图只保留一份中等品质），按 `<年>/<月>` 存放，对应转义前的 `/wp-content/uploads/`；正文以 `../../media/...` 相对引用，Vite 单次处理、只产出一份 `dist/assets/` 哈希副本 |
| `public/images/` | 只保留说说 frontmatter 需要的那 1 个文件（`2025/12/68b55b4078002-1024x1024.jpg`，186,575 B），走 `/images/` 公共路径，不参与打包 |
| `scripts/` | 一次性迁移脚本（可重复执行、幂等），迁移完成后日常写作不需要它们 |
| `waline-import/` | 评论导入产物（SQL / CSV）+ 官方建表脚本 |
| `docs/` | 迁移说明与评论系统接入文档 |
| `backup/` | 原始 WordPress 备份包（未纳入版本控制） |
| `.work/` | 迁移过程中的勘察报告与验收脚本（未纳入版本控制） |

## 上线前需要你自己做的三件事

1. **部署 Waline 服务端**：按 [docs/waline-setup.md](docs/waline-setup.md) 在 Vercel 建 Waline + Neon 数据库，导入 `waline-import/waline-comments.sql`，拿到服务地址后填进 `valaxy.config.ts` 的 `addonWaline({ serverURL })`（现在是占位 `https://your-waline.vercel.app`）。
2. **改站点域名**：`site.config.ts` 的 `url` 现在是旧域名 `https://blog.490633.xyz`（带 TODO 注释），换成你最终使用的域名，否则 RSS 与 sitemap 里的绝对链接是错的。
3. **部署静态站**：Vercel（Framework Preset 选 Other，Output Directory 填 `dist`，`vercel.json` 已备好）或 Netlify（`netlify.toml` 已备好：build = `pnpm run build`、publish = `dist`，且已删掉会把 404 变成 200 的 SPA fallback）或任意静态托管。

作者头像、简介、ICP 备案号也都留了 TODO，位置见 `site.config.ts` 与 `valaxy.config.ts`。

## 迁移情况

31 篇文章 / 5 个页面 / 7 条说说 / 7 个分类 / 22 个标签 / 7 条友链 / 53 条评论 / 113 个媒体文件已全部落地（媒体已去重；另有 1 个说说封面图留在 `public/images/` 走公共路径），
未迁移项与已知降级逐项记录在 [docs/migration-notes.md](docs/migration-notes.md) 与 `.work/migration-report.md`。
