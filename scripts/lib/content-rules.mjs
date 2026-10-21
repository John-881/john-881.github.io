// 内容规则数据层：转换阶段统一应用的常量与改写表。
// 目的：把「手工改产物」变成「改这里 + 重跑转换器」，避免 wp-convert 重跑时静默回退。

/** 全站分享卡：与 public/og/default.png 对应（站点级默认 og:image）。
    posts/moments 的 frontmatter 直接写上它；没有 .md 源的组件路由由
    site.config.ts 的 siteConfig.frontmatter 兜底，两者指向同一张图。 */
export const OG_IMAGE = '/og/default.png'

/** 站外链接改写表（原 URL -> 目标 URL），在转换阶段按字面量替换。
    规则：只放「原站已失效/已跳转」的已知深链；每条都要有 note 说明依据。
    命中数为 0 时 wp-convert 会 warn，提示该条可能已过期（防止再次静默）。 */
export const LINK_REWRITES = [
  {
    from: 'https://1panel.cn/docs/installation/online_installation/',
    to: 'https://docs.fit2cloud.com/1panel/installation/online-installation',
    note: '1panel.cn 旧文档站已下线/跳转，旧深链不可达（t1 F6）；改指官方文档同一页',
    pages: ['pages/posts/玩客云（onecloud）折腾记.md'],
  },
  {
    from: 'https://1panel.cn/docs/v2/installation/package_installation/',
    to: 'https://docs.fit2cloud.com/1panel/installation/package-installation',
    note: '同上，离线安装页的 v2 路径已下线（t1 F6）',
    pages: ['pages/posts/对于lxc环境1panel-php容器无法编译问题的解决.md'],
  },
]

/** 对正文 markdown 应用改写表；applied 用来累计每个规则的实际命中数。
    返回改写后的 markdown（无命中时原样返回，保证 byte-identical）。 */
export function rewriteLinks(markdown, applied = []) {
  let out = markdown
  for (const rule of LINK_REWRITES) {
    if (!out.includes(rule.from)) continue
    const count = out.split(rule.from).length - 1
    out = out.split(rule.from).join(rule.to)
    let hit = applied.find((a) => a.from === rule.from)
    if (!hit) { hit = { from: rule.from, to: rule.to, count: 0 }; applied.push(hit) }
    hit.count += count
  }
  return out
}

/** 收尾自检：任何一条规则实际命中 0 次都会 warn（表可能已过期 / 数据源变了）。 */
export function reportLinkRewriteHits(applied) {
  const hits = new Map(applied.map((a) => [a.from, a.count]))
  for (const rule of LINK_REWRITES) {
    if (!hits.get(rule.from)) {
      console.warn('[warn] LINK_REWRITES 未命中：' + rule.from + ' -> ' + rule.to + '（请核对 scripts/lib/content-rules.mjs 是否已过期）')
    }
  }
  return LINK_REWRITES.map((rule) => ({ from: rule.from, to: rule.to, hits: hits.get(rule.from) || 0 }))
}
