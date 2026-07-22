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
  'i-ri-women-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '凌渡冰点的小博客',
    },

    pages: [
      {
        name: '我的小伙伴们',
        url: '/links/',
        icon: 'i-ri-genderless-line',
        color: 'dodgerblue',
      },
      {
        name: '喜欢的女孩子',
        url: '/girls/',
        icon: 'i-ri-women-line',
        color: 'hotpink',
      },
      {
        name: '关于我',
        url: '/about/',
        icon: 'i-ri-heart-fill',
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
      since: 2016,
      beian: {
        enable: true,
        icp: '萌ICP备20265536号',
        police: '赣公网安备xxxxxx号',
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
