# Cloudflare Pages 部署手册

本文记录本站（`zeroice-blog`）在 Cloudflare Pages 上的真实部署方式。最后核对：2026-11-07。

## 1. 当前部署

| 项目 | 值 |
| --- | --- |
| Cloudflare 账户 | 凌渡冰点（Account ID 在 Dashboard 账户首页复制，不写进仓库） |
| Pages 项目 | `zeroice-blog` |
| 生产分支 | `main` |
| 构建命令 | `pnpm install --frozen-lockfile && pnpm build` |
| 输出目录 | `dist/` |
| 默认域名 | <https://zeroice-blog.pages.dev/> |
| 自定义域名 | <https://www.490633.xyz/>（canonical）、<https://490633.xyz/> |
| 最近部署 | `99481930-dfbc-49c1-a3fd-b59a81976884`，<https://99481930.zeroice-blog.pages.dev> |
| 部署方式 | 本地构建 + Wrangler 直传（未使用 Git 集成） |

`site.config.ts` 的 `url` 为 `https://www.490633.xyz`，所以 RSS、sitemap 和 canonical 都以 www 为准；根域同样可以直接访问。

## 2. 前置条件与凭据

- Node.js >= 22.12.0；本机验证 Node v24.21.0、pnpm 12.9.1。
- 构建不需要额外环境变量（仓库没有 `.env` 依赖；Waline 地址在 `valaxy.config.ts` 里是公开配置）。
- 部署需要本机 User 环境变量 `CLOUDFLARE_API_TOKEN`，**不要把它的值写进仓库、文档或命令历史**。
  Token 权限至少：
  - Account → Cloudflare Pages → Edit
  - Zone → DNS → Edit
  - Zone → Zone → Read
  - Zone Resources 包含 `490633.xyz`
- `CLOUDFLARE_ACCOUNT_ID` 可选；不设置时 Wrangler 可能询问账户。本机可用 `npx wrangler@4 whoami` 查看账户，或在 Dashboard 账户首页复制。

PowerShell 中确认变量已设置（不打印值）：

```powershell
if (-not $env:CLOUDFLARE_API_TOKEN) { throw 'CLOUDFLARE_API_TOKEN 未设置' }
$env:CLOUDFLARE_ACCOUNT_ID = '<account-id>'
```

如果刚用 `setx` 写入 User 环境变量，普通 PowerShell 需要新开窗口；DSH 子进程直接读 User scope 可立即生效。

## 3. 构建

```bash
pnpm install --frozen-lockfile
pnpm build
```

`pnpm build` 实际执行 `valaxy build --ssg`，产物写入 `dist/`。本次构建 283 个文件，日志末尾出现 `√ [HOOK] build:after done.` 和 `EXIT=0`。

## 4. 部署

```bash
npx --yes wrangler@4 pages deploy dist --project-name zeroice-blog --branch main --commit-dirty=true
```

- `--branch main`：对应生产分支，部署完成后 `zeroice-blog.pages.dev` 指向新版本。
- `--commit-dirty=true`：允许工作区存在未提交改动（本仓库的 `site.config.ts` 等常有本地改动）；不加时 Wrangler 会要求确认。
- 首次或重建项目：

  ```bash
  npx --yes wrangler@4 pages project create zeroice-blog --production-branch main
  ```

- 成功输出示例：`✨ Deployment complete! Take a peek over at https://<hash>.zeroice-blog.pages.dev`。

## 5. 自定义域名与 DNS

Cloudflare Dashboard → `490633.xyz` → DNS → Records：

| 类型 | 名称 | 内容 | 代理 |
| --- | --- | --- | --- |
| CNAME | `www` | `zeroice-blog.pages.dev` | 已代理（橙色云） |
| CNAME | `@` | `zeroice-blog.pages.dev` | 已代理（橙色云） |

Pages 项目 → Custom domains 中 `490633.xyz` 与 `www.490633.xyz` 都应为 `active`。根域使用 CNAME flattening，Cloudflare 允许它与 MX/TXT/NS 记录共存。

**保留的记录**：根域的 MX（`route1/2/3.mx.cloudflare.net`）、SPF/DKIM/Google 验证 TXT、以及 4 条华为云 NS 记录。后者是多提供者 DNS 的一部分，不要按“普通 Cloudflare 托管”去删除。也不要去动 `imgbed.490633.xyz`（`john-881-imgbed` 项目）、`blog.490633.xyz`、`zeroice.490633.xyz` 等其他记录。

**已移除的旧记录**（2026-11-07）：

- `zeroice-blog.490633.xyz` CNAME → `zeroice-blog.pages.dev`
- 根域 4 条 A：`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
- 根域 4 条 AAAA：`2606:50c0:8000::153`、`2606:50c0:8001::153`、`2606:50c0:8002::153`、`2606:50c0:8003::153`

修改 DNS 前先在 Dashboard → DNS → Records → Export 导出 BIND 备份；不要用脚本批量删记录。

## 6. 验证

```bash
node -e "fetch('https://www.490633.xyz/').then(r=>console.log(r.status))"
```

应满足：

- `https://www.490633.xyz/` → 200，标题「凌渡冰点的主页」
- `https://490633.xyz/` → 200
- `https://zeroice-blog.pages.dev/` → 200
- `https://www.490633.xyz/links/` → 200（友链页）
- `zeroice-blog.490633.xyz` → 无记录（NXDOMAIN/ENODATA）

## 7. 回滚

### 7.1 回滚到旧部署（推荐）

Cloudflare Dashboard → Workers & Pages → `zeroice-blog` → Deployments → 选上一个健康部署 → `...` → **Rollback to this deployment**。两个自定义域名会立即跟回该部署。

查看部署：

```bash
npx --yes wrangler@4 pages deployment list --project-name zeroice-blog
```

Wrangler 4 没有 `pages rollback` 子命令，回滚在 Dashboard 做。

### 7.2 用旧提交重新部署

```bash
git checkout <commit>
pnpm install --frozen-lockfile && pnpm build
npx --yes wrangler@4 pages deploy dist --project-name zeroice-blog --branch main
git checkout main
```

### 7.3 DNS 回滚

在 Dashboard 用第 5 节的 BIND 备份恢复：

- 恢复根域 4 条 A 到 `185.199.108.153`–`185.199.111.153`，4 条 AAAA 到 `2606:50c0:8000::153`–`...:8003::153`；
- 恢复 `zeroice-blog.490633.xyz` CNAME 到 `zeroice-blog.pages.dev`；
- 删除 `www` 与 `@` 的 CNAME。

注意：这只在确实要回到旧站时做；只回滚页面版本不要动 DNS。

### 7.4 删除并重建项目

删除项目会连同所有部署一起消失，且 Cloudflare 要求先解绑自定义域名：Cloudflare Dashboard → Pages → `zeroice-blog` → Custom domains 删除 `www.490633.xyz`、`490633.xyz` → Settings → Delete project。之后用第 4 节重建并重新绑定域名。

## 8. 2026-11-07 部署记录

- 删除旧 `zeroice-blog` 项目及其 `zeroice-blog.490633.xyz` 自定义域名，新建同名项目。
- 构建：`pnpm install --frozen-lockfile && pnpm build`；`dist/` 283 个文件。
- 部署：`npx --yes wrangler@4 pages deploy dist --project-name zeroice-blog --branch main`；部署 ID `99481930-dfbc-49c1-a3fd-b59a81976884`。
- 绑定 `www.490633.xyz`、`490633.xyz`，状态均为 `active`。
- 验证：www/根域/pages.dev 均 200；`/links/` 200。
- 旧 DNS：根域 A/AAAA 与 `zeroice-blog.490633.xyz` CNAME 已删除；MX/TXT/NS 保留。

## 9. 2026-11-07 开屏动画故障与站点图标更新

- 现象：首页开屏动画（Yun `nimbo` banner，约 1s 的大字/横线入场）不再出现。
- 排查：`valaxy.config.ts` 的 `themeConfig.banner.enable` 一直为 `true`；`dist/` 内包含 YunBanner 组件，线上 HTML 的 assets 列表与本地 `dist/` 完全一致 → 排除「配置被关闭」「构建产物未包含」「缓存旧版」三种可能。
- 根因：Cloudflare zone `490633.xyz` 开启了 **Rocket Loader**。它把站点 HTML 的 `<script type="module">` 改写成延迟执行类型并注入 `/cdn-cgi/scripts/.../rocket-loader.min.js`，Vue SPA 被推迟到 DOMContentLoaded 之后才执行，开屏动画首帧被跳过；GitHub Pages 侧没有这一层改写。
- 处置：`PATCH /zones/<zone_id>/settings/rocket_loader` 置为 `off`（已复查）。**此设置必须保持 `off`**，重新打开会让开屏动画再次消失。
- 图标：`public/avatar.webp` 生成 `favicon.ico` / `favicon-16x16.png` / `favicon-32x32.png` / `apple-touch-icon.png`（并替换 `pwa-192x192.png`、`pwa-512x512.png`）；`site.config.ts` 的 `favicon` 改为 `/favicon-32x32.png`；`valaxy.config.ts` 的 `ssgOptions.onFinished` 增加 `injectIcons()`，为所有 SSG HTML 补 `apple-touch-icon` 与 16x16 link。
- 部署：Cloudflare Pages 部署 ID `8c248021`（`https://8c248021.zeroice-blog.pages.dev`）；GitHub 提交 `ea365a3` 推送后 Actions 发布到 `gh-pages`（`f0ff411`）。
- 后续（同日）：Rocket Loader 关闭后手机端动画恢复，但电脑端仍不显示——原因是 `valaxy-theme-yun@1.2.0` 自上游 `012ba2ea`（#765，2026-10-17）起会读取 `prefers-reduced-motion: reduce`，系统开启「减少动态效果」时跳过开屏动画（云游君站点部署的是该提交之前的版本，故不受影响）。处置：新增 `components/YunBanner.vue` 覆盖主题组件并去掉该判断（只影响开屏动画，其他动画仍尊重系统设置），重新构建后双端部署。
