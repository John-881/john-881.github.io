import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  lang: 'zh-CN',
  timezone: 'Asia/Shanghai',
  url: 'https://zeroice.490633.xyz/',
  languages: ['zh-CN', 'en'],
  title: '凌渡冰点的小博客',
  subtitle: '一个兴趣使然的个人小站',
  favicon: 'https://freehost.490633.xyz/img/20260722153625185.avif',
  author: {
    name: '凌渡冰点',
    avatar: 'https://freehost.490633.xyz/img/20260722153625185.avif',
    email: 'zeroice007@126.com',
    link: '/about/',
    status:
    {
      emoji: '🩵',
      message: 'Coding...',
    },
  },
  description: '一个兴趣使然的个人小站，分享日常、技术教程、编程学习、玩机折腾等内容。',
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/John-881',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '知乎',
      link: 'https://www.zhihu.com/people/bu-wan-mei-de-wo-81-92',
      icon: 'i-ri-zhihu-line',
      color: '#0084FF',
    },
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/421681448',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
    {
      name: 'E-Mail',
      link: 'mailto:it.007@qq.com',
      icon: 'i-ri-mail-line',
      color: '#8E71C1',
    },
    {
      name: 'Travelling',
      link: 'https://www.travellings.cn/go.html',
      icon: 'i-ri-train-line',
      color: 'var(--va-c-text)',
    },
  ],

  search: {
    enable: true,
  },

  //开启图片预览
  mediumZoom: { enable: true },

  /**
   * 开启阅读统计
   */
  statistics: {
    enable: true,
    readTime: {
      /**
       * 阅读速度
       */
      speed: {
        cn: 300,
        en: 200,
      },
    },
  },
})
