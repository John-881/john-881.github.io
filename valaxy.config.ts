import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
  'i-ri-archive-line',
  'i-ri-archive-fill',
  'i-ri-folder-2-line',
  'i-ri-folder-2-fill',
  'i-ri-price-tag-3-line',
  'i-ri-price-tag-3-fill',
  'i-ri-search-line',
  'i-ri-sun-line',
  'i-ri-moon-line',
  'i-ri-arrow-up-s-line',
  'i-ri-arrow-left-s-line',
  'i-ri-arrow-right-s-line',
  'i-ri-file-list-line',
  'i-ri-heart-fill',
  'i-ri-cloud-line',
  'i-ri-genderless-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',

  themeConfig: {
    nav: [
      { text: '文章', link: '/posts/', icon: 'i-ri-article-line' },
      { text: '归档', link: '/archives/', icon: 'i-ri-archive-line' },
      { text: '分类', link: '/categories/', icon: 'i-ri-folder-2-line' },
      { text: '标签', link: '/tags/', icon: 'i-ri-price-tag-3-line' },
      { text: '友链', link: '/links/', icon: 'i-ri-link' },
      { text: '服务', link: '/services/', icon: 'i-ri-tools-line'},
      { text: '关于我', link: '/about/', icon: 'i-ri-user-3-line' },
      { text: '关于站点', link: '/about/site', icon: 'i-ri-file-list-line' },
    ],

    bg_image: {
      enable: true,
      url: 'https://freehost.490633.xyz/img/20260722224433721.avif',
      dark: 'https://freehost.490633.xyz/img/20260722224433722.avif', // 深色模式
      opacity: 0.7,
    },

    banner: {
      enable: true,
      title: '凌渡冰点的小博客',
    },

    pages: [
      {
        name: '友链',
        url: '/links/',
        icon: 'i-ri-link',
        color: 'dodgerblue',
      },
      {
        name: '关于我',
        url: '/about/',
        icon: 'i-ri-user-3-line',
        color: 'blue',
      },
      {
        name: '关于站点',
        url: '/about/site',
        icon: 'i-ri-file-list-line',
        color: 'skyblue',
      },
    ],

    footer: {
      since: 2024,
      beian: {
        enable: true,
        icp: '萌ICP备20265536号',
      },
    },
  },

  siteConfig: {
    // 启用评论
    comment: {
      enable: true
    },
  },
  // 设置 valaxy-addon-waline 配置项
  addons: [
    addonWaline({
      serverURL: 'https://discuss.490633.xyz',
      pageSize: 10,
      reaction: true,
      dark: 'html.dark',
      requiredMeta: ['nick', 'mail'],
    }),
  ],

  unocss: { safelist },

  vue: {
    template: {
      transformAssetUrls: false,
    },
  },
})
