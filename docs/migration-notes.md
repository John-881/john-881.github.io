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
| 目标路由 | `/posts/<slug>`（7 篇），`/comment/`（留言板 + 6 条孤儿评论） |

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

建表脚本用官方 `assets/waline.pgsql`（已存为 `waline-import/waline.pgsql`，2275 字节）。要点：

- 表名是小写：`wl_comment` / `wl_counter` / `wl_users`；每个表配一个序列 `wl_*_seq`，主键 `id` 的默认值是 `NEXTVAL('wl_comment_seq')`。
- 驼峰列名 `insertedAt` / `createdAt` / `updatedAt` 在库里**保留大小写**，所以导入 SQL 里必须写成 `"insertedAt"`；
  PostgreSQL 会把未加引号的标识符折叠成小写，写错就报 column does not exist。
- 生成器结尾执行 `ALTER SEQUENCE wl_comment_seq RESTART WITH 61;`，让新评论从 61 开始编号，
  与 Waline 自身 `postgresql.js:setSeqId` 的做法一致。

### 2.3 表情短代码

旧站是 Argon 主题，评论正文里的 `{{name}}` 被渲染成表情图。本批数据只有 3 处，全部完成映射：

| 原文 | 次数 | 转成 | 依据 |
| --- | --- | --- | --- |
| `{{doge}}` | 1 | `:doge:` | `@waline/emojis@1.1.0/bilibili/info.json` 的 items 含 `doge` |
| `{{liulei}}` | 1 | `:sob:` | `liulei`（流泪）在 bilibili 表情包里没有同名项，取语义最近的 `sob` |
| `{{dianzan}}` | 1 | `:thumbsup:` | `dianzan`（点赞）同理，取 `thumbsup` |

**状态：已干净映射，无残留**。前提是前端 `addonWaline.emoji` 配了 bilibili 表情包；
不配的话这 3 处会显示成裸文本（`docs/waline-setup.md` 第 7 节与附录 A 已写明）。

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
- **6 条孤儿评论**（原所属文章已删）被放到 `/comment/` 并保持 `approved`。
  想隐藏它们见 `docs/waline-setup.md` 6.1 节。
- **本文不记录部署结果**：Vercel 项目、Neon 数据库、域名绑定都还没做，做完再补。
