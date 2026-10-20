// valaxy-theme-yun 1.2.0 与 valaxy-addon-waline 0.2.1 都没有能被 tsc 接受的声明入口
// （exports 指向 .ts 源码、无 types 字段，node_modules 里还是 .pnpm 的 symlink），
// types/shims.d.ts 里的 declare module 在 moduleResolution:"bundler" 下会被 tsc 丢弃，
// 因此这里只能用相对路径直接指向真实文件，详见 types/shims.d.ts 的注释。
import type { UserThemeConfig } from './node_modules/valaxy-theme-yun/types/index'
import { defineValaxyConfig } from 'valaxy'
import { addonMoments } from 'valaxy-addon-moments'
import { addonWaline } from './node_modules/valaxy-addon-waline/node/index'

// add icons what you will need
// Yun 主题约定：这里没用到的 i-ri-* 图标类会在构建时被 UnoCSS 摇掉，
// 因此首页导航、菜单与社交图标必须全部登记到 safelist。
const safelist = [
  // themeConfig.pages
  'i-ri-article-line',
  'i-ri-archive-line',
  'i-ri-folder-2-line',
  'i-ri-price-tag-3-line',
  'i-ri-links-line',
  'i-ri-chat-3-line',
  'i-ri-service-line',
  'i-ri-tv-2-line',
  // themeConfig.menu.custom
  'i-ri-rss-line',
  // site.config.ts social
  'i-ri-bilibili-line',
  // 模板默认
  'i-ri-home-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',

  themeConfig: {
    type: 'nimbo',

    banner: {
      enable: true,
      title: '凌渡冰点的博客',
    },

    pages: [
      {
        name: '文章',
        url: '/posts/',
        icon: 'i-ri-article-line',
        color: 'var(--va-c-primary)',
      },
      {
        name: '时光轴',
        url: '/archives/',
        icon: 'i-ri-archive-line',
        color: 'deepskyblue',
      },
      {
        name: '分类',
        url: '/categories/',
        icon: 'i-ri-folder-2-line',
        color: 'orange',
      },
      {
        name: '标签',
        url: '/tags/',
        icon: 'i-ri-price-tag-3-line',
        color: 'mediumseagreen',
      },
      {
        name: '友链',
        url: '/links/',
        icon: 'i-ri-links-line',
        color: 'dodgerblue',
      },
      {
        name: '留言板',
        url: '/comment/',
        icon: 'i-ri-chat-3-line',
        color: 'hotpink',
      },
      {
        name: '服务',
        url: '/services/',
        icon: 'i-ri-service-line',
        color: 'slateblue',
      },
      {
        name: '我的订阅',
        url: '/subscribe/',
        icon: 'i-ri-tv-2-line',
        color: 'crimson',
      },
    ],

    menu: {
      custom: {
        title: 'RSS',
        url: '/atom.xml',
        icon: 'i-ri-rss-line',
      },
    },

    footer: {
      since: 2024,
      powered: true,
      // TODO: 原站无 ICP 备案，故 enable 为 false、icp 留空；上线并备案后再填 icp / police 并打开 enable。
      // 类型要求 icp 必填（valaxy-theme-yun 1.2.0 types/index.d.ts 的 footer.beian），因此这里保留空字符串。
      beian: {
        enable: false,
        icp: '',
      },
    },
  },

  addons: [
    // TODO: 上线前替换为真实的 Waline 服务端地址（当前为占位地址，评论功能在替换前不可用）。
    addonWaline({
      serverURL: 'https://your-waline.vercel.app',
      // 中文界面。WalineOptions 继承 @waline/client 的 WalineInitOptions，含 lang?: string。
      // 实际渲染时 WalineClient.vue 的 :lang 绑定的是 vue-i18n 的 locale，
      // 显式写出这一项是为了让意图在配置里有据可查。
      lang: 'zh-CN',
      // 旧站 Argon 表情短代码被映射成 :doge: / :sob: / :thumbsup:，三者属于 bilibili 表情包，
      // 前端不加载该表情包就会退化成裸文本。
      // getEmojis() 会把数组元素拼成 `${emoji}/`，所以元素要写成不带结尾斜杠的完整地址。
      emoji: [
        'https://unpkg.com/@waline/emojis@1.1.0/bilibili',
      ],
    }),
    addonMoments({
      title: '说说',
      description: '值得记录的日常',
    }),
  ],

  unocss: { safelist },
})
