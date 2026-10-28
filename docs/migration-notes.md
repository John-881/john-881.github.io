# 迁移说明（WordPress → Valaxy）

本文只记录**已核实**或**已有产物证明**的内容。尚未发生的部署结果不在此列。

---

## 1. 已定的迁移决策

| 项 | 决策 | 备注 |
| --- | --- | --- |
| 框架 | Valaxy 1.2.0 + 主题 Yun（`valaxy-theme-yun` 1.2.0） | 脚手架来源 create-valaxy 1.2.0 的 template-blog |
| 文章路由 | **`/posts/<slug>`** | 由用户拍板，与并行产物一致 |
| 旧链接 | **不保留**，不做 301 重定向 | 旧站 `permalink_structure = /%year%/%monthnum%/%postname%/`（已在 dump 的 `wp_options` 中核实） |
| 评论 | Waline + Neon PostgreSQL，跑在 Vercel | 见 `docs/waline-setup.md` |
| 说说 | 迁到 `valaxy-addon-moments` | 旧站 `post_type = shuoshuo`，共 7 条（已核实） |
| 分类 / 标签 / 友链 | 全部迁移 | — |

---

## 2. 评论迁移细节（已落地，有产物可验）

生成器：`scripts/wp-comments-to-waline.mjs`；产物：`waline-import/waline-comments.sql` + `waline-import/comments.csv`。

| 项 | 结果 |
| --- | --- |
| 评论总数 | 53（`wp_comments` 全部行） |
| 原状态分布 | `comment_approved = 1` 47 条、`= post-trashed` 6 条 |
| 导入后状态分布 | `approved` 53 条 |
| 楼中楼 | 31 条 `comment_parent <> 0`，`pid`/`rid` 引用闭合 |
| 唯一 id | 直接沿用 `comment_ID`，因此父引用天然可解析 |
| 目标路由 | `/posts/<slug>`（7 篇），`/comment`（留言板 + 6 条孤儿评论；落库路径不带尾斜杠，页面地址是 `/comment/`） |

### 2.1 状态映射的依据

`@waline/vercel@1.43.4` 包内 `node_modules/@waline/core/dist/index.js` 原文：

```js
data.status = config.audit ? "waiting" : "approved";
if (data.status === "approved" && services.spam && await services.spam.check(data, ctx)) data.status = "spam";
```

后台筛选口径：`where.status = input.status === "approved" ? ["NOT IN", ["waiting", "spam"]] : input.status;`；
官方 `packages/server/openapi.yaml` 里 Comment 的 `status` 定义 `enum: [approved, waiting, spam]`。
因此映射为 `1 -> approved`、`0 -> waiting`、`spam -> spam`；本批数据里**没有** `0` 与 `spam`。
`post-trashed -> approved` 是本次的**主动选择**（保留数据、不丢，不因文章删除而隐藏评论），不是 Waline 的要求。

### 2.2 表与列

建表脚本用官方 `assets/waline.pgsql`（已存为 `waline-import/waline.pgsql`，6913 字节；相对官方只多加了索引与 `IF NOT EXISTS` 幂等，列定义逐字一致）。要点：

- 表名是小写：`wl_comment` / `wl_counter` / `wl_users`；每个表配一个序列 `wl_*_seq`，主键 `id` 的默认值是 `NEXTVAL('wl_comment_seq')`。
- 三个时间列在库里是**全小写** `insertedat` / `createdat` / `updatedat`：官方 DDL 故意**不加引号**声明 `insertedAt timestamp(0) ...`，
  PostgreSQL 会把未加引号的标识符折叠成小写。导入 SQL 里也必须不加引号；写成 `"insertedAt"` 会报
  `column "insertedAt" of relation "wl_comment" does not exist (SQLSTATE 42703)` —— 首次导入就踩过这条。
  驼峰只是 Waline JS 侧的字段名，驱动 `postgresql.js` 查询前 `toLowerCase()`、读回后 `mapKeys` 还原。
  完整证据链与反向案例（issue #884）见 `waline-import/waline.pgsql` 头部注释。
- 生成的 `waline-comments.sql` 每条 INSERT 都带 `ON CONFLICT (id) DO NOTHING`，包在 `BEGIN; ... COMMIT;` 里，可安全重复执行。
- **顶层评论的 `pid` / `rid` 落 `NULL`，不落 `0`**（2026-10-27 修正）。列表接口按 `rid IS NULL` 判别顶层，
  落 `0` 的行进不了列表，但同请求里不带该条件的 `COUNT(*)` 照常返回，症状是「评论数正常、评论区永远空白」。
  证据是 Vercel 函数日志里的原始 SQL；详见 `docs/waline-setup.md` 6.3。期望分布 22 顶层 + 31 楼中楼。
- 要彻底清库重来用 `waline-import/reset.sql`（删除前快照 → `DROP TABLE` + `DROP SEQUENCE` → 两条「应当 0 行」的确认）。
  序列必须单独删：它们是 `CREATE SEQUENCE` 独立对象、不被 `DROP TABLE` 带走，残留会让重跑 DDL 的 `IF NOT EXISTS` 静默跳过。
  注意它会连 `wl_users`（后台账号）一起删。
- 生成器结尾执行 `ALTER SEQUENCE wl_comment_seq RESTART WITH 61;`，让新评论从 61 开始编号，
  与 Waline 自身 `postgresql.js:setSeqId` 的做法一致。

### 2.3 表情短代码

旧站是 Argon 主题，评论正文里的 `{{name}}` 被渲染成表情图。本批数据只有 3 处，全部完成映射：

| 原文 | 次数 | 转成（写进 `comment` 的字面量） | 依据 |
| --- | --- | --- | --- |
| `{{doge}}` | 1 | `<img class="wl-emoji" src="…/@waline/emojis@1.1.0/bilibili/bb_doge.png" alt="bb_doge">` | bilibili 包 `prefix: "bb_"`、`type: "png"`、items 含 `doge` |
| `{{liulei}}` | 1 | 同上，`bb_sob.png` | `liulei`（流泪）在 bilibili 包里无同名项，取语义最近的 `sob` |
| `{{dianzan}}` | 1 | 同上，`bb_thumbsup.png` | `dianzan`（点赞）同理，取 `thumbsup` |

**为什么不是写 `:doge:` 短代码**（2026-10-27 定论）：Waline 的渲染路径不认库里的短代码——客户端是在你**输入时**
把 `:name:` 展开成 `<img>`，服务端只存和回吐这段 HTML。证据是 Vercel 日志里一条通过表情选择器提交的评论：

```sql
INSERT INTO wl_comment ("comment",insertedat,…,url) VALUES (E'<img class="wl-emoji" src="https://unpkg.com/@waline/emojis@1.1.0/bilibili/bb_doge.png" alt="bb_doge">',…
```

所以导入必须写同一段 `<img>`；早期版本写 `:doge:` 的那 3 行，在页面上就是裸文本
（注意 `alt`/文件名带包前缀 `bb_`，所以连 `:bb_doge:` 这种"正确"短代码也不会被二次展开）。

**状态**：3 处映射目标都存在于 bilibili 包，无未解析残留。老库里那 3 行还是 `:doge:` 文本的，
用 `docs/waline-setup.md` 附录 A 的三条 `replace()` 更新一次即可；前端 `addonWaline.emoji` 只影响表情选择器，
不再决定这 3 处能否显示。

### 2.4 浏览量（可选，默认不导入）

`scripts/wp-comments-to-waline.mjs --with-view-counts` 会额外生成 `waline-import/waline-counters.sql`：
31 篇已发布文章各一行 `wl_counter`，`time` 取旧站 `wp_postmeta.views`。
**默认关闭**，原因：WordPress 的 views 是 Jetpack/主题的计数器，与 Waline 的 `wl_counter.time` 口径不同，
混在一起会让旧数字与新访问量加起来失真。要导入就执行那个 SQL，不要就忽略。

---

## 3. 未迁移的数据类别（已核实的存在量）

以下 `post_type` 的内容**不进新站**，只留在备份里：

| post_type | 条数 | 是什么 |
| --- | --- | --- |
| `wprss_feed_item` | 20 | WP RSS Aggregator 抓来的 RSS 聚合条目，不是原创内容 |
| `revision` | 110 | 文章修订历史 |
| `nav_menu_item` | 7 | 旧导航菜单项（Yun 主题有自己的菜单配置） |
| `wp_navigation` | 4 | 区块主题的导航实体 |
| `wp_global_styles` | 4 | 区块主题全局样式 |
| `attachment` | 107 | 媒体库附件（图片本体在 `backup/website_blog.*.tar.gz` 里） |

另外 `wp_fsmpt_email_logs` 里有 26 条发信记录（FluentSMTP 日志），属于运维日志，不迁移。

---

## 4. 后续可选项（都还没做）

| 项 | 说明 |
| --- | --- |
| `valaxy-addon-abbrlink` | 把中文 slug 换成 ASCII 短链，避免百分比编码的 URL |
| 浏览量导入 | 执行 `waline-import/waline-counters.sql`（见 2.4） |
| 图片转 webp | 附件迁出后统一压缩 |

---

## 5. 本次迁移的边界说明

- **旧链接不保留**：旧站是 `/2025/09/玩客云（Onecloud）折腾记/` 这类路径，新站是 `/posts/玩客云（onecloud）折腾记`。
  搜索引擎里的旧链接会 404，这是既定决策，不做重定向。
- **评论跟着文章走**：评论的 `url` 字段存的是文章的新路由，所以文章 slug 一旦改动，那条评论就对不上了。
  改 slug 时必须同步 `UPDATE wl_comment SET url = ...`。
- **6 条孤儿评论**（原所属文章已删）被放到 `/comment` 并保持 `approved`。
  想隐藏它们见 `docs/waline-setup.md` 6.1 节。
- **留言板落库路径是 `/comment`，不带尾斜杠**：浏览器停在 `/comment/`，而 `@waline/client` 发出的查询是
  `?path=%2Fcomment`（实测抓到的请求）。存成 `/comment/` 时 `count` 查得到、列表一条不显示，
  2026-10-27 已把生成器里的 `PAGE_ROUTE` 改正；老库用 `UPDATE wl_comment SET url = '/comment' WHERE url = '/comment/';` 修正。
- **部署状态（2026-10-27 补记）**：Waline 服务端已上线 `https://waline.490633.xyz`（自有域名指向 Vercel，
  数据库是 Vercel Storage 里的 Neon PostgreSQL），建表与 53 条评论导入完成。
  浏览器实测复验通过：`/posts/玩客云（onecloud）折腾记` 3 条含楼中楼引用正常渲染，
  留言板 `/comment/` 渲染 24 张卡片，`.wl-empty` 不再出现，`comment: true` 的评论数挂件出数。
  主站 `site.config.ts` 的 `url` 定为 `https://www.490633.xyz`，`valaxy.config.ts` 的 `serverURL` 已填真实地址。
  3 处 Argon 表情已按附录 A 的写法更新进库并复验：`bb_doge.png` / `bb_sob.png` / `bb_thumbsup.png` 均以
  `img.wl-emoji` 渲染（naturalWidth 96），页面不再有 `:doge:` 之类裸文本。**数据层与显示层均已闭环**。

---

## 6. 内容层最终形态与维护注意（迁移收尾时补）

**媒体**：源站 455 个上传文件经迭代去重（剥 `-scaled(-N)?` 与 `-{W}x{H}` 到不动点）后为 `media/` 下 113 文件 / 7,503,774 B，
正文用 `../../media/...` 相对引用（96 处），Vite 只产出一份 `dist/assets/` 哈希副本；`public/images/` 仅留说说 frontmatter 需要的
`2025/12/68b55b4078002-1024x1024.jpg`（186,575 B，走 `/images/` 公共路径不参与打包）。dist 由改造前 20,849,383 B 降至约 10.59 MB，内容重复组 0。

**分享卡**：`public/og/default.png`（1200x630、89,422 B）为全站唯一 og:image —— 48 篇 markdown 写 `ogImage`，
无 .md 源的组件路由（`/`、`/posts`、`/moments`）靠 `site.config.ts` 的 `siteConfig.frontmatter.ogImage` 兜底；实测 dist 61/61 html 全部命中，0 条 `.svg`、0 条含 `/public/`。

**验收口径**：`.work/verify.ps1` 共 39 条断言（posts 31 / moments 7 / `pages` 全树含 ogImage 的 md 48 / media 113 与精确字节数 / public/images 恰 1 个 / dist ≤11MB 且内容重复组 0 / dist/posts 32 html / dist 内无 `/public/` 前缀图片 / og:image 61/61 / 旧 1panel.cn 命中 0）。
干净复现五步全绿：`node scripts/wp-media.mjs` → `node scripts/wp-convert.mjs` → `pnpm build` → `node .work/check-images.mjs` → `pwsh -File .work/verify.ps1`。sitemap 清洗后 50 唯一 loc、无 `/404`。

**维护注意（重要）**

- `scripts/wp-convert.mjs` 用 `rmSync` 全量重建 `pages/posts` 与 `pages/moments`，**会覆盖手工编辑**。要改正文请改数据层
  （`scripts/lib/content-rules.mjs` 的 `OG_IMAGE` / `LINK_REWRITES`）或转换器本身，然后重跑；48 篇的 `ogImage` 与两条已下线深链现已上游化，重跑不再丢失。
- 10 个页面级 md（`pages/about/*`、`archives`、`categories`、`tags`、`links`、`comment`、`services`、`subscribe`、`404`）不被转换器触碰：
  新增页面级 md 时自行加 `ogImage: /og/default.png`，漏加会被 verify.ps1 的 48 计数断言拦住。
- 图片必须放在 `media/<年>/<月>/` 下。Vite 会把根路径图片当模块 import，引用到不存在的文件会让构建直接失败
  （`[UNRESOLVED_IMPORT]`）；源站即缺失的那张 `2025/03/1759852453-image-1024x551.png` 已按此规则删除并在 `.work/needs-review.md` 记录。

**交付时仍未实测/未执行的事项**

| 项 | 状态 |
| --- | --- |
| Netlify 的 404 行为 | 只做静态判定（本机无 netlify CLI）；部署后应 `curl -I https://<域名>/nonexistent` 确认返回 404 而非 SPA fallback 的 200 |
| `docker build` | 未实跑（本机无 docker）；`package.json` 也没有 `packageManager` 字段 |
| 作者头像 | `site.config.ts` 的 `author.avatar` 仍是占位的 `/favicon.svg`；ICP 备案开关保持关闭 |
| Waline 服务端 | Vercel 项目、Neon 数据库、域名绑定均未创建，`addonWaline({ serverURL })` 仍是占位值，见 `docs/waline-setup.md` |

> 上述未实测项不影响静态站点本体的可交付性：`pnpm build`（`valaxy build --ssg`）在干净工作区可复现通过，产物为 `dist/`。
