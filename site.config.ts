import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://www.490633.xyz',
  lang: 'zh-CN',
  timezone: 'Asia/Shanghai',
  title: '凌渡冰点的主页',
  description: '一个兴趣使然的个人小站',

  author: {
    name: '凌渡冰点',
    // 不填 avatar / email / link 时会落回 Valaxy 默认值（https://valaxy.site/valaxy-logo.png、
    // i@valaxy.site、https://valaxy.site），并直接出现在 RSS/atom/feed.json 与每页作者头像（alt="avatar"）里。
    // 头像图片放进 public/（例如 public/avatar.webp），这里写 /avatar.webp 即可。
    // 头像右下角的状态表情由主题 YunAuthorAvatar.vue 读取 status 渲染；message 留空则鼠标悬浮不显示提示。
    avatar: '/avatar.webp',
    email: 'zeroice007@126.com',
    // TODO: 域名确定后与第 5 行的 url 一起替换。
    link: 'https://www.490633.xyz',
    status: {
      emoji: '🩵',
      message: '在写代码',
    },
  },

  social: [
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/421681448',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
  ],

  // 评论后端为 Waline，serverURL 配置在 valaxy.config.ts 的 addonWaline 中。
  comment: {
    enable: true,
  },

  search: {
    enable: true,
  },

  mediumZoom: {
    enable: true,
  },

  // 生成 readingTime / wordCount，等价于原站 Argon 的字数与阅读时间显示。
  statistics: {
    enable: true,
  },

  orderBy: 'date',
  lastUpdated: true,
  favicon: '/favicon.svg',

  // 组件路由（/、/posts、/moments 等没有 .md 源的页面）在 Valaxy 里只会拿到 siteConfig.frontmatter；
  // 缺了它，这些页面的 og:image 会兜底成 siteConfig.favicon（/favicon.svg），与 48 篇 markdown 的分享卡不一致。
  frontmatter: { ogImage: '/og/default.png' },
})
