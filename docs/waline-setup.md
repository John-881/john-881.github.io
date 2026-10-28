# Waline 评论系统接入指南

> 面向：想给本站（Valaxy + Yun 主题）加上评论与访问量统计的你自己。
> 结论先行：评论后端用 **Waline**，数据库用 **Neon PostgreSQL**，服务端跑在 **Vercel** 免费额度上。
> 本文所有界面路径都可照做，不需要改源码，只需改 `valaxy.config.ts` 里的一段配置。

---

## 0. 前置条件

| 项 | 要求 |
| --- | --- |
| Node | 已装（本项目实测 v24.21.0） |
| Vercel 账号 | 免费注册即可，Google / GitHub 登录 |
| Neon 账号 | 不需要单独注册 —— 从 Vercel 内部创建会自动打通 |
| 评论数据 | `waline-import/waline-comments.sql`（53 条，由 `scripts/wp-comments-to-waline.mjs` 生成） |
| 建表脚本 | `waline-import/waline.pgsql`（Waline 官方 `assets/waline.pgsql`） |
| 库重建脚本 | `waline-import/reset.sql`（**破坏性**，清库重来才用，见 6.2） |

---

## 1. 在 Vercel 部署 Waline 服务端

1. 打开 https://vercel.com/new ，在模板搜索框里找 **Waline**，选择官方模板（仓库 `walinejs/waline`）。
2. 点 **Create**，填项目名（例如 `zeroice-waline`），区域选离自己近的（`Hong Kong` / `Singapore`）。
3. 点 **Deploy**，等它跑完。

### 1.1 首次部署大概率会报 500 —— 这是正常的

你会看到页面写着：

```
500: This Serverless Function has crashed.
```

**原因**：Waline 启动时找不到数据库环境变量，直接崩了。它本身是个空壳，必须先连上数据库才能干活。
**处理**：不用管，继续做第 2 步；连上数据库后重新 Deploy 就会正常。

---

## 2. 创建 Neon PostgreSQL 数据库

1. 进 Vercel 项目页，点顶部 **Storage**。
2. 点 **Create Database**。
3. 在 **Marketplace Database Providers** 里选 **Neon**（不是 Redis、不是 KV）。
4. 选免费套餐（Free / Hobby），Region 与项目一致，点 **Continue** → **Connect Project**。
5. 选**刚刚部署的那个 Waline 项目**，点 **Connect**。

连接完成后 Vercel 会往项目注入环境变量。Neon 通常只注入 **`POSTGRES_URL`**，
而 Waline 认的是 `PG_*` / `POSTGRES_*` 那一组具体变量。**若只有 `POSTGRES_URL`，需要手动补 5 个（见 §5）**：

```
POSTGRES_HOST       <- Neon 控制台里的 Host
POSTGRES_DATABASE   <- 数据库名，默认 neondb
POSTGRES_USER       <- Neon 控制台里的 Role / User
POSTGRES_PASSWORD   <- Neon 控制台里的 Password
POSTGRES_SSL        <- true
```

取值位置：Vercel → Storage → 你的 Neon 库 → **Quickstart / .env.local** 面板，
里面有完整连接串 `postgresql://<user>:<password>@<host>/<db>?sslmode=require`，按冒号 / @ / 斜杠拆分即可。

---

## 3. 在 Neon SQL Editor 里建表

1. 从 Vercel 的 Neon 存储页点 **Open in Neon**（或登录 https://console.neon.tech ）。
2. 左侧选 **SQL Editor**。
3. 打开本仓库的 `waline-import/waline.pgsql`，**全文复制**粘进去，点 **Run**。

它建出 3 张表和 3 个序列，默认前缀 `wl_`：

| 对象 | 用途 |
| --- | --- |
| `wl_comment` + `wl_comment_seq` | 评论正文（含楼中楼 pid/rid、审核状态 status） |
| `wl_counter` + `wl_counter_seq` | 每篇文章的访问量与表情表态数 |
| `wl_users` + `wl_users_seq` | 后台管理员账号 |

> 想换表前缀就设 `PG_PREFIX`（默认 `wl_`），但前缀要与改过的 `waline.pgsql` 一致。

> 这个文件末尾带了两条 `information_schema` 自检查询，Run 完顺手执行一下：自检 ① 应返回 7 行**全小写**列名，
> 自检 ② 应返回 **0 行**。若 ② 有结果，说明库里是驼峰时间列，Waline 驱动和第 6 节的导入都会报
> `SQLSTATE 42703` —— 按 6.2 处理，别去给导入 SQL 加引号。

---

## 4. 重新部署，拿到 serverURL

1. 回 Vercel 项目页 → **Deployments** → 最新一条右侧 `...` → **Redeploy**。
2. 等状态变成 **Ready**。
3. 点 **Visit**，页面应显示 Waline 欢迎页而不是 500。
4. **浏览器地址栏里那个域名就是 `serverURL`**，例如 `https://zeroice-waline.vercel.app`。
   注意**不要带结尾斜杠**，也**不要带 `/ui`**。

---

## 5. 环境变量清单（必选 / 可选）

Vercel 项目 → **Settings** → **Environment Variables**。

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `PG_DB` 或 `POSTGRES_DATABASE` | 是 | 数据库名 |
| `PG_USER` 或 `POSTGRES_USER` | 是 | 用户名 |
| `PG_PASSWORD` 或 `POSTGRES_PASSWORD` | 是 | 密码 |
| `PG_HOST` 或 `POSTGRES_HOST` | 是 | 主机名 |
| `PG_PORT` / `POSTGRES_PORT` | 否 | 默认 `5432`，Neon 一般不用填 |
| `PG_PREFIX` / `POSTGRES_PREFIX` | 否 | 表前缀，默认 `wl_` |
| `PG_SSL` / `POSTGRES_SSL` | 否 | Neon 必须设 `true`（连接串里 `sslmode=require`） |
| `JWT_TOKEN` | 否 | 自定义随机长字符串，用于登录态签名；不设也能跑 |

> `PG_*` 与 `POSTGRES_*` 是**同义**的，任选一组；两者都填时 `PG_*` 优先。
> 改完环境变量**必须 Redeploy** 才生效。

> ⚠️ **Waline 会在函数日志里打印完整数据库连接串（含明文密码）**，形如
> `postgresql://<user>:<password>@<host>:5432/<db>`。因此：
> 1. 不要把 Vercel 日志原文贴进 issue、群聊或本仓库任何文件；
> 2. 日志对团队所有成员可见，导出前先看一眼；
> 3. 一旦外泄，立刻在 Neon 里轮换该角色密码，再更新 Vercel 的 `POSTGRES_PASSWORD` / `PG_PASSWORD` 并 Redeploy。
> 排错要贴日志时，只保留 `SQL: ...` 那些行，连接串整条删掉。

---

## 6. 导入 53 条 WordPress 旧评论

1. 回 Neon **SQL Editor**。
2. **先确认库里的时间列是小写**（这条应当返回 **0 行**；返回任何一行说明第 3 节建表时建成了驼峰列，去看 6.2）：

```sql
SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('wl_comment', 'wl_counter', 'wl_users')
  AND column_name IN ('insertedAt', 'createdAt', 'updatedAt');
```

3. 打开 `waline-import/waline-comments.sql`，**从磁盘重新打开当前这份**（别复用编辑器里残留的旧草稿），全文粘进去执行。
   正确的产物长这样：`INSERT INTO wl_comment (id, user_id, comment, insertedat, ip, ...)`，时间列**不带双引号**，
   每条后面跟一行 `ON CONFLICT (id) DO NOTHING;`。整个文件包在 `BEGIN; ... COMMIT;` 里，**可安全重复执行**。
   > 若 Neon 编辑器对显式事务块报错，删掉文件里的 `BEGIN;` 和 `COMMIT;` 再执行，53 条语句各自独立同样安全。
4. 验证：

```sql
SELECT count(*) FROM wl_comment;                          -- 期望 53
SELECT status, count(*) FROM wl_comment GROUP BY status;  -- 期望 approved 53
SELECT count(*) FROM wl_comment WHERE pid <> 0;           -- 期望 31（楼中楼）
SELECT min(id), max(id) FROM wl_comment;                  -- 期望 2 / 60
SELECT count(*) FROM wl_comment WHERE rid IS NULL;        -- 期望 22（顶层评论，见 6.3）
```

**这个脚本做了什么**：

- 保留原始 `comment_ID` 作为 `id`，所以 `pid`（直接父评论）和 `rid`（顶层根评论）的引用闭合、可点。
- `insertedat` 用 WordPress 的 GMT 时间；`createdat` / `updatedat` 用站点本地时间（与 WordPress 一致）。
  这三列在库里是**全小写**，Waline 驱动在 JS 侧才叫 `insertedAt` / `createdAt` / `updatedAt`。
- `url` 存的是**新博客的文章路由** `/posts/<slug>`，留言板的评论落在 `/comment`。
  注意是**不带尾斜杠**的 `/comment`：浏览器停在 `/comment/`，但 `@waline/client` 发出的查询是
  `?path=%2Fcomment`（尾斜杠被剥掉），库里存成 `/comment/` 就会一条都匹配不上。文章路由本来就没尾斜杠。

> **已经导入过旧产物（`url = '/comment/'`）的库，执行一次修正即可，不用重导**：
>
> ```sql
> UPDATE wl_comment SET url = '/comment' WHERE url = '/comment/';
> SELECT count(*) FROM wl_comment WHERE url = '/comment';   -- 期望 35（6 条孤儿 + 留言板自填评论）
> ```
- 结尾的 `ALTER SEQUENCE wl_comment_seq RESTART WITH 61;` 让后续新评论从 61 开始编号，不会撞车。

### 6.1 关于旧文章已删除的 6 条评论

这 6 条是 WordPress 里 `comment_approved = post-trashed` 的孤儿评论（所属文章已删除）。
**数据没丢**：它们被归到 `/comment`（留言板）下，状态为 `approved`。
不想让它们露出来就导入后执行：

```sql
-- 可选：把这批孤儿评论标为待审核（不删除），在后台里就看不见了
UPDATE wl_comment SET status = 'waiting' WHERE id IN (SELECT id FROM wl_comment WHERE url = '/comment' AND pid = 0);
```

> 注意上面这条只是示例，会把留言板的顶层评论也一起标为待审核。
> 精确做法：先在 `waline-import/comments.csv` 里按 url 与正文筛出那 6 个 id，再按 id 更新。
> 本项目**没有**自动隐藏它们 —— 保留原样更安全。

### 6.2 报错 `SQLSTATE 42703: column does not exist`

时间列的大小写是唯一会在这一步踩到的坑，两个方向都会撞 42703，报错信息里的**引号写法**就是区分它们的钥匙：

| 报错 | 说明 | 处理 |
| --- | --- | --- |
| `column "insertedAt" ... does not exist` | 库里是小写列，**SQL 侧多写了双引号**（拿了旧产物，或执行了 Neon 编辑器里残留的旧草稿） | 从磁盘重新打开 `waline-import/waline-comments.sql`（现在是小写 `insertedat`，无引号）整份重粘执行 |
| `column "insertedat" ... does not exist` | SQL 是对的，**库里建成了驼峰列**（执行过早期带引号的错误 DDL） | 走下面的重建路径 |

Waline 自己的运行时也会因此挂掉：`postgresql.js` 查询前把列名 `toLowerCase()`，库里若真是驼峰，线上直接报
`column "insertedat" does not exist`。所以**唯一正确的形态是库里小写**，别反过来给 DDL 的三列加引号。
证据链和 2022 年上游同类事故（walinejs/waline issue #884）写在 `waline-import/waline.pgsql` 头部注释里。

**重建路径**：用 `waline-import/reset.sql`（破坏性 —— 清空评论、访问量**和后台账号**；只在自检 ② 返回非 0 行、
或库里没有需要保留的数据时使用）。它分四阶段：删除前快照（`wl_comment`/`wl_counter`/`wl_users` 行数 + 驼峰/小写列计数）
→ `DROP TABLE` + `DROP SEQUENCE` → 两条「应当 0 行」的确认查询 → 下一步指引。
序列要单独删：它们是 `CREATE SEQUENCE` 独立对象、不被 `DROP TABLE` 带走，残留会让重跑 `waline.pgsql` 的
`IF NOT EXISTS` 静默跳过。若 `wl_users` 里已有你注册过的管理员，重建后要重新注册一次。

跑完回到第 3 节重跑 `waline-import/waline.pgsql`（现在是幂等的 `IF NOT EXISTS`，还补了 `idx_comment_*` 索引，
表已存在时重复执行不删数据、只补索引），再执行第 6 节的导入。

> 另外：如果之前那次失败是在第一条 INSERT 就报 42703，整个脚本会回滚，库里不会有半成品数据，直接重跑即可。

### 6.3 评论数正常、评论区永远空白（顶层评论的 `rid` 必须是 NULL）

Vercel 函数日志里列表接口的实际 SQL 是这样的：

```sql
SELECT * FROM wl_comment
WHERE ( url = E'/posts/…' ) AND ( status NOT IN (E'waiting',E'spam') ) AND ( rid IS NULL )
ORDER BY sticky DESC NULLS LAST, insertedat DESC, id DESC LIMIT 10 OFFSET 0;
```

同一次请求还会发一条不带 `rid` 条件的 `SELECT COUNT(*)`。所以如果顶层评论的 `rid` 落的是 `0` 而不是 `NULL`，
就会出现**计数正常（比如 3）、列表 0 行**这个组合，前端渲染成 `.wl-empty`，页面看不出报错。

- 生成器已修：顶层的 `pid` / `rid` 落 `NULL`（`scripts/wp-comments-to-waline.mjs` 的 `qnNullable()`）。
  期望分布：53 行 = **22 行顶层（`rid IS NULL`）+ 31 行楼中楼（`rid` = 顶层 oid）**。
- JS 侧 `0` 与 `null` 都是 falsy，前端渲染与楼中楼嵌套不受影响，只有 SQL 的 `IS NULL` 过滤认得出来。
- 已经用旧产物导入过的库，一次修完（顺带把留言板路径的尾斜杠也改掉，见第 6 节）：

```sql
UPDATE wl_comment SET rid = NULL WHERE rid = 0;
UPDATE wl_comment SET pid = NULL WHERE pid = 0;
UPDATE wl_comment SET url = '/comment' WHERE url = '/comment/';

-- 修完应当是 22 / 31 / 0，且 /comment 那批不再带尾斜杠
SELECT (SELECT count(*) FROM wl_comment WHERE rid IS NULL) AS roots,
       (SELECT count(*) FROM wl_comment WHERE rid = 0)     AS bad_rid_zero,
       (SELECT count(*) FROM wl_comment WHERE url = '/comment/') AS bad_slash;
```

> **待确认**：从 `type=recent` 接口读回的数据看，你在后台/页面新发的顶层评论（`objectId` 51、53、55）
> `pid` 和 `rid` 也显示为 `0`。这有两种可能：库里真是 `0`（那就是 PostgreSQL 存储下服务端的写入形态与列表
> 过滤条件不一致，新评论同样不会显示），或者读回时被模型层默认值补成了 `0`。
> 修完上面那批之后，**在页面发一条新评论**，再去 Vercel 日志捞那条 `INSERT INTO wl_comment ...`，
> 看 `rid` 位置写的是 `NULL` 还是 `0` 就能定论。

---

## 7. 把 serverURL 填进博客配置

编辑仓库根目录的 `valaxy.config.ts`，找到 `addons` 数组里的 `addonWaline({...})`，把 `serverURL` 换成第 4 步（或第 8 节绑定后）拿到的地址。当前仓库里的实际配置：

```ts
// 本仓库的 import 走相对路径：valaxy-addon-waline 0.2.1 的 exports 没有可被 tsc 接受的声明入口，
// 详见 valaxy.config.ts 顶部注释。新站若不介意 tsc 诊断，可以直接 `import { addonWaline } from 'valaxy-addon-waline'`。
import { addonWaline } from './node_modules/valaxy-addon-waline/node/index'

export default defineValaxyConfig<UserThemeConfig>({
  addons: [
    addonWaline({
      serverURL: 'https://waline.490633.xyz',  // 结尾不要加 /，也不要带 /ui
      comment: true,                          // 文章元信息里挂评论数
      lang: 'zh-CN',
      login: 'enable',
      types: [],                              // 关掉 addon 的默认包，见下方说明
      emoji: [
        'https://unpkg.com/@waline/emojis@1.1.0/bilibili',
        'https://unpkg.com/@waline/emojis@1.1.0/tieba',
        'https://unpkg.com/@waline/emojis@1.1.0/alus',
        'https://unpkg.com/@waline/emojis@1.1.0/qq',
        'https://unpkg.com/@waline/emojis@1.1.0/weibo',
      ],
    }),
  ],
})
```

说明：

- **`emoji` 只服务于评论框的表情选择器**，不再决定历史正文能否显示表情：那 3 处 Argon 短代码
  现在在导入阶段就被展开成了 `<img class="wl-emoji">` 写进 `comment`（原因见附录 A）。
  `types` 要显式写成 `[]`：addon 的 `getEmojis(cdn, types, emoji)` 把两组拼接，默认
  `types = ['bilibili','qq','weibo']` 既会与我们 `emoji` 里的 bilibili 重复出一个页签，
  又是无版本号的 `//unpkg.com/@waline/emojis/<type>/`（跟 latest 漂）。`types: []` + 5 个钉死 1.1.0 的包，
  正好 5 个页签且与导入正文里的 CDN 同源。
- **`comment: true` 开、`pageview` 不开**。两者都由主题 `components/third/YunWalineMeta.vue` 消费
  （挂在 `YunPostMeta` 里，`v-if="addonWaline.options.pageview / .comment"`）：开了才会渲染
  `.waline-comment-count` / `.waline-pageview-count` 两个占位并由 addon 调 `commentCount()` / `pageviewCount()`。
  旧站 `wp_postmeta.views` 按 [migration-notes.md](migration-notes.md) 2.4 的决策没有导入，
  开 `pageview` 只会让 31 篇文章都显示从 0 起步的阅读量，所以保持关闭。
- 不写 `addonWaline` 也能构建（用默认值），但评论会发到你没配的地址上，等于没有。
- **换 `serverURL` 等于换评论库**（见第 8 节第 4 条）：改成新地址前，先确认新服务端指向的是同一个 Neon 数据库。

---

## 8. 绑定自有域名

1. Vercel 项目 → **Settings** → **Domains** → 输入 `waline.你的域名`，点 **Add**。
2. 到域名 DNS 服务商添加记录：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| `CNAME` | `waline` | `cname.vercel-dns.com` |

3. 等 Vercel 面板状态变成通过（通常 1-10 分钟，最多 24 小时）。
4. **绑好域名后回来把 `valaxy.config.ts` 的 `serverURL` 改成 `https://waline.你的域名`**，再重新构建博客。
   **换了 serverURL 就等于换了评论库**：旧域名下的评论不会自动迁移。
   所以要么一开始就用最终域名，要么先绑域名再导入评论。

---

## 9. 注册管理员（第一个注册的人自动是管理员）

1. 浏览器打开 `<serverURL>/ui`，例如 `https://zeroice-waline.vercel.app/ui`。
2. 点 **注册**，填昵称 / 邮箱 / 密码。
3. **第一次注册的账号自动获得管理员权限**，之后进来就是后台面板。
4. 后台能做的事：审核评论（`waiting`）、标记垃圾（`spam`）、回复、置顶、看访问量。

> 注册开放意味着**别人也可能抢先注册成管理员**。部署完请立刻去 `/ui` 注册；
> 或者之后设 `DISABLE_USER_REGISTER=true` 禁止注册（**先注册再设**）。

---

## 10. 常见问题排查

### 10.1 部署后一直 500 `This Serverless Function has crashed`

| 可能原因 | 怎么确认 | 怎么修 |
| --- | --- | --- |
| 没连数据库 | 刚部署还没做第 2 步 | 做完第 2、4 步 |
| 环境变量名不对 | Settings → Environment Variables 里只有 `POSTGRES_URL` | 按 §5 补齐 |
| 没开 SSL | Neon 要求 SSL | 设 `PG_SSL=true` 或 `POSTGRES_SSL=true` |
| 改了变量没重新部署 | 最新 Deployment 时间早于改变量的时间 | Redeploy |

看具体报错：Vercel 项目 → **Logs**（或 Deployments → 某次部署 → **Functions** → Runtime Logs）。

### 10.2 页面能打开，但评论列表一直是空的

1. F12 → Console，看有没有跨域报错或 404。
2. 直接访问 `<serverURL>/api/comment?path=/posts/你的slug&pageSize=10`，应返回 JSON。返回空说明 `url` 对不上。
3. **最常见原因：`url` 不匹配**。Waline 按 `path`（浏览器里的 `location.pathname`）查评论。
   本站文章路由是 `/posts/<slug>`，云函数看到的就是 `/posts/<slug>`，必须与导入脚本写入的 `url` **逐字符相等**。核对：

```sql
SELECT url, count(*) FROM wl_comment GROUP BY url ORDER BY 2 DESC;
```

   再用浏览器打开对应文章，在 F12 里看 `location.pathname`；不一致就批量改：

```sql
UPDATE wl_comment SET url = '/posts/正确的slug' WHERE url = '/posts/旧的slug';
```

4. **`url` 明明对得上、页面头部「X 条评论」也正常，但列表就是空** → 这是顶层评论的 `rid` 没落 `NULL`。
   列表 SQL 带 `AND ( rid IS NULL )` 而计数那条不带，所以症状恰好是「计数正常 + 列表空白 + 无报错」。
   核对与修复见本文 **6.3 节**：

```sql
SELECT count(*) AS rid_zero FROM wl_comment WHERE rid = 0;   -- 期望 0，非 0 就按 6.3 修
```

### 10.3 跨域 CORS 报错

Waline 服务端默认允许所有来源，一般不会遇到。若遇到：

- 确认 `serverURL` 里**没有**结尾 `/`、**没有** `/ui`。
- 确认博客是 `https`、`serverURL` 也是 `https`（混合协议会被浏览器拦）。

### 10.4 导入后评论数不对

Waline 显示的「X 条评论」口径是**该 path 下 status 不是 waiting/spam 的条数**（源码即 `status NOT IN (waiting, spam)`）。所以：

- 数不对 → 先 `SELECT status, count(*) FROM wl_comment GROUP BY status;` 看有没有 `waiting`。
- 想让待审核的也显示 → 后台逐条通过，或 `UPDATE wl_comment SET status = approved WHERE status = waiting;`

### 10.5 访问量一直是 0

访问量存在 `wl_counter` 表里，**需要前端上报 pageview**。Valaxy 的 waline addon 会自动上报，
前提是 `serverURL` 正确且 `wl_counter` 表已建好（`waline.pgsql` 已包含）。
想把 WordPress 的旧浏览量搬过来，见 `waline-import/waline-counters.sql`（脚本 `--with-view-counts` 生成）。
**默认没有导入**：WordPress 的 views 口径与 Waline 不同，混在一起数字会失真。详见 `docs/migration-notes.md`。

### 10.6 前端报 `C() is not defined`

这是 `@waline/client` 与服务端**版本不匹配**的已知问题（官方 FAQ 条目）。
本项目已把 `@waline/client` **锁死在 `3.4.1`**，请**不要升级**：

```json
"@waline/client": "3.4.1"   // 注意：没有 ^ 或 ~，就是精确版本
```

一旦出现这个错，第一件事是 `git diff package.json` 看版本号是不是被加上了 `^`。

---

## 附录 A：表情短代码的处理状态

| 原 Argon 短代码 | 出现次数 | 现在写进 `comment` 的内容 | 目标包与文件 |
| --- | --- | --- | --- |
| `{{doge}}` | 1 | `<img class="wl-emoji" src="…/bilibili/bb_doge.png" alt="bb_doge">` | bilibili `bb_doge.png` |
| `{{liulei}}` | 1 | 同上，`bb_sob.png` | bilibili `bb_sob.png`（流泪取语义最近的 `sob`） |
| `{{dianzan}}` | 1 | 同上，`bb_thumbsup.png` | bilibili `bb_thumbsup.png`（点赞取 `thumbsup`） |

**已定论（2026-10-27）**：Waline 的渲染路径不认库里的 `:name:` 短代码。客户端是在**输入时**把选中的表情展开成
`<img>`，服务端只存这段 HTML 并原样回吐。证据是一条通过表情选择器提交的评论在 Vercel 日志里的 INSERT：

```sql
INSERT INTO wl_comment ("comment",insertedat,…,url) VALUES (E'<img class="wl-emoji" src="https://unpkg.com/@waline/emojis@1.1.0/bilibili/bb_doge.png" alt="bb_doge">',…,E'/comment')
```

包元数据来自 `@waline/emojis@1.1.0/<pack>/info.json`：`{"name":"BiliBili","prefix":"bb_","type":"png",…}`，
所以文件名和 `alt` 都带 `bb_` 前缀——这也意味着**短代码的正确写法是 `:bb_doge:` 而不是 `:doge:`**；
但既然存成短代码在展示时不会被展开，导入就直接写 `<img>`。生成器已按此实现（`convertEmoji` + `EMOJI_PACK_META`）。

**老库里那 3 行还写着短代码的，执行一次**（不是重导，`ON CONFLICT DO NOTHING` 改不了已有行）：

```sql
UPDATE wl_comment SET comment = replace(comment, ':doge:',
  '<img class="wl-emoji" src="https://unpkg.com/@waline/emojis@1.1.0/bilibili/bb_doge.png" alt="bb_doge">')
 WHERE comment LIKE '%:doge:%';
UPDATE wl_comment SET comment = replace(comment, ':sob:',
  '<img class="wl-emoji" src="https://unpkg.com/@waline/emojis@1.1.0/bilibili/bb_sob.png" alt="bb_sob">')
 WHERE comment LIKE '%:sob:%';
UPDATE wl_comment SET comment = replace(comment, ':thumbsup:',
  '<img class="wl-emoji" src="https://unpkg.com/@waline/emojis@1.1.0/bilibili/bb_thumbsup.png" alt="bb_thumbsup">')
 WHERE comment LIKE '%:thumbsup:%';

-- 期望：3 行含 wl-emoji、0 行残留短代码
SELECT count(*) FILTER (WHERE comment LIKE '%wl-emoji%')    AS with_img,
       count(*) FILTER (WHERE comment LIKE '%:doge:%'
                             OR comment LIKE '%:sob:%'
                             OR comment LIKE '%:thumbsup:%') AS leftover
FROM wl_comment;
```

> 表情选择器的页签数量由 `getEmojis(cdn, types, emoji)` 决定：默认 `types = ['bilibili','qq','weibo']`
> 会与我们 `emoji` 里的 bilibili 重复，显式写 `types: ['qq','weibo']` 正好 5 个页签。
> 这只是观感，与历史正文的显示无关。
