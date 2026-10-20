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

---

## 6. 导入 53 条 WordPress 旧评论

1. 回 Neon **SQL Editor**。
2. 打开 `waline-import/waline-comments.sql`，全文粘进去执行。
3. 验证：

```sql
SELECT count(*) FROM wl_comment;                          -- 期望 53
SELECT status, count(*) FROM wl_comment GROUP BY status;  -- 期望 approved 53
SELECT count(*) FROM wl_comment WHERE pid <> 0;           -- 期望 31（楼中楼）
```

**这个脚本做了什么**：

- 保留原始 `comment_ID` 作为 `id`，所以 `pid`（直接父评论）和 `rid`（顶层根评论）的引用闭合、可点。
- `insertedAt` 用 WordPress 的 GMT 时间；`createdAt` / `updatedAt` 用站点本地时间（与 WordPress 一致）。
- `url` 存的是**新博客的文章路由** `/posts/<slug>`，留言板的评论落在 `/comment/`。
- 结尾的 `ALTER SEQUENCE wl_comment_seq RESTART WITH 61;` 让后续新评论从 61 开始编号，不会撞车。

### 6.1 关于旧文章已删除的 6 条评论

这 6 条是 WordPress 里 `comment_approved = post-trashed` 的孤儿评论（所属文章已删除）。
**数据没丢**：它们被归到 `/comment/`（留言板）下，状态为 `approved`。
不想让它们露出来就导入后执行：

```sql
-- 可选：把这批孤儿评论标为待审核（不删除），在后台里就看不见了
UPDATE wl_comment SET status = 'waiting' WHERE id IN (SELECT id FROM wl_comment WHERE url = '/comment/' AND pid = 0);
```

> 注意上面这条只是示例，会把留言板的顶层评论也一起标为待审核。
> 精确做法：先在 `waline-import/comments.csv` 里按 url 与正文筛出那 6 个 id，再按 id 更新。
> 本项目**没有**自动隐藏它们 —— 保留原样更安全。

---

## 7. 把 serverURL 填进博客配置

编辑仓库根目录的 `valaxy.config.ts`，找到 addons 部分，把占位符换成第 4 步拿到的地址：

```ts
import { defineConfig } from 'valaxy'

export default defineConfig({
  // ... 其他配置 ...
  addons: [
    'valaxy-addon-waline',
  ],

  // valaxy-addon-waline 的配置项名称是 addonWaline
  addonWaline: {
    serverURL: 'https://YOUR-PROJECT.vercel.app',  // 换成你的 serverURL，结尾不要加 /
    emoji: [
      'https://unpkg.com/@waline/emojis@1.1.0/bilibili',
      'https://unpkg.com/@waline/emojis@1.1.0/tieba',
      'https://unpkg.com/@waline/emojis@1.1.0/alus',
    ],
    lang: 'zh-CN',
    login: 'enable',
  },
})
```

说明：

- **emoji 三件套必须包含 `bilibili`**。旧站 Argon 主题的表情短代码（`{doge}` / `{liulei}` / `{dianzan}`）
  在导入时被转换成了 Waline 语法，分别对应 `:doge:` / `:sob:` / `:thumbsup:`，这三个都在 bilibili 表情包里。
  **不配 bilibili 表情包，这 3 处会显示成裸文本**。
- 不写 `addonWaline` 也能构建（用默认值），但评论会发到你没配的地址上，等于没有。

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

| 原 Argon 短代码 | 出现次数 | 转换结果 | Waline 中的显示 |
| --- | --- | --- | --- |
| `{{doge}}` | 1 | `:doge:` | bilibili 表情包的 doge |
| `{{liulei}}` | 1 | `:sob:` | bilibili 表情包的 大哭 |
| `{{dianzan}}` | 1 | `:thumbsup:` | bilibili 表情包的 点赞 |

**前提**：`valaxy.config.ts` 的 `addonWaline.emoji` 必须包含 `https://unpkg.com/@waline/emojis@1.1.0/bilibili`，
否则这 3 处会显示成裸文本。这是唯一一处「需要前端配合」的导入项，除此之外没有降级。
