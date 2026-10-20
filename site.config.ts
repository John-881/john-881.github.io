import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  // TODO: 上线前替换为最终域名（用户尚未确定新域名，先沿用旧站域名）。
  url: 'https://blog.490633.xyz',
  lang: 'zh-CN',
  timezone: 'Asia/Shanghai',
  title: '凌渡冰点的博客',
  description: '一个兴趣使然的个人小站',

  author: {
    name: '凌渡冰点',
    // TODO: 头像与个人简介尚未提供，待用户补充后填入 avatar / intro。
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
})
