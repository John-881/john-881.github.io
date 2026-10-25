// valaxy-theme-yun 1.2.0 与 valaxy-addon-waline 0.2.1 都没有能被 tsc 接受的声明入口
// （exports 指向 .ts 源码、无 types 字段，node_modules 里还是 .pnpm 的 symlink），
// 只能像下面这样用相对路径直接指向真实文件；types/shims.d.ts 垫片已删除
// （declare module 在 moduleResolution:"bundler" 下会被 tsc 丢弃，留着只会让人以为它有效）。
import type { UserThemeConfig } from './node_modules/valaxy-theme-yun/types/index'
import { defineValaxyConfig } from 'valaxy'
import { addonMoments } from 'valaxy-addon-moments'
import { addonWaline } from './node_modules/valaxy-addon-waline/node/index'
// F11 修复用：valaxy.config.ts 只在 Node 侧被加载（客户端拿到的是 valaxy:config 虚拟模块），
// 因此这里可以安全地直接 import node:fs / node:path。
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
  // 导航页 pages/nav/index.md 正文卡片
  'i-ri-compass-3-line',
  'i-ri-user-3-line',
  'i-ri-book-2-line',
  'i-ri-quill-pen-line',
  'i-ri-image-line',
  'i-ri-tools-line',
  'i-ri-file-transfer-line',
  'i-ri-music-2-line',
  'i-ri-speed-up-line',
  'i-ri-earth-line',
  'i-ri-mail-line',
  // 模板默认
  'i-ri-home-line',
]

// F11 修复：清洗 vite-ssg-sitemap 的产物 —— 去掉 /404 条目、按 <loc> 去重，
// 其余部分的顺序与 XML 头尾保持原样。valaxy build 的工作目录就是项目根目录，故用 process.cwd() 定位。
// 整体 try/catch：清洗失败只告警，绝不让构建失败。
async function cleanSitemap() {
  try {
    const file = resolve(process.cwd(), 'dist/sitemap.xml')
    // vite-ssg-sitemap 的 sitemap.xml 不是同步写盘：它在 SitemapStream 的 promise 回调里才 writeFileSync，
    // 而 valaxy 调完 generateSitemap 就立刻 await onFinished（见 node_modules/valaxy/dist/shared/valaxy.CRodiDWz.mjs:7336），
    // 所以进入本函数时文件往往还没落地。先轮询等它出现（最多 10s，每 100ms 一次），再清洗。
    let waited = 0
    while (!existsSync(file) && waited < 100) {
      await new Promise(r => setTimeout(r, 100))
      waited++
    }
    if (!existsSync(file)) {
      console.warn(`[sitemap] 等待 ${waited * 100}ms 后仍未出现 dist/sitemap.xml，跳过清洗`)
      return
    }
    console.log(`[sitemap] 等待 ${waited * 100}ms 后拿到 dist/sitemap.xml`)
    const seen = new Set<string>()
    let dropped404 = 0
    let droppedDup = 0
    const cleaned = readFileSync(file, 'utf8').replace(/<url>[\s\S]*?<\/url>/g, (block) => {
      const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1]?.trim()
      if (!loc)
        return block
      if (/\/404$/.test(loc)) {
        dropped404++
        return ''
      }
      if (seen.has(loc)) {
        droppedDup++
        return ''
      }
      seen.add(loc)
      return block
    })
    writeFileSync(file, cleaned)
    console.log(`[sitemap] 清洗 dist/sitemap.xml：删除 /404 条目 ${dropped404} 条、重复 loc ${droppedDup} 条，保留唯一 loc ${seen.size} 条`)
  }
  catch (e) {
    console.warn('[sitemap] 清洗 dist/sitemap.xml 失败（不影响构建）：', e)
  }
}

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

    nav: [
      { text: '首页', link: '/', icon: 'i-ri-home-line' },
      { text: '导航', link: '/nav/', icon: 'i-ri-compass-3-line' },
      { text: '文章', link: '/posts/', icon: 'i-ri-article-line' },
      { text: '时光轴', link: '/archives/', icon: 'i-ri-archive-line' },
      { text: '分类', link: '/categories/', icon: 'i-ri-folder-2-line' },
      { text: '标签', link: '/tags/', icon: 'i-ri-price-tag-3-line' },
      { text: '友链', link: '/links/', icon: 'i-ri-links-line' },
      { text: '留言板', link: '/comment/', icon: 'i-ri-chat-3-line' },
      { text: '服务', link: '/services/', icon: 'i-ri-service-line' },
    ],

    pages: [
      {
        name: '导航',
        url: '/nav/',
        icon: 'i-ri-compass-3-line',
        color: 'coral',
      },
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
    ],

    notice: {
      enable: true,
      content: '欢迎来到凌渡冰点的博客！',
    },

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

  // F11 修复：vite-ssg-sitemap 会同时收录 X 与 X.html 两条逐字相同的 loc，并把 /404 也写进 sitemap；
  // 它在 valaxy 里是硬打开的 import（node_modules/valaxy/dist/node/index.mjs:66），既没有开关，
  // 也没有过滤/去重选项（generateSitemap 只收到 { hostname }，调用点在 ssgBuild 尾部），
  // 因此只能在 SSG 跑完时清洗产物：ssgOptions.onFinished 正是 ssgBuild 里 generateSitemap()
  // 之后、build:after 钩子之前执行的回调（见 node_modules/valaxy/dist/shared/valaxy.CRodiDWz.mjs:7333-7340）。
  vite: {
    ssgOptions: {
      onFinished: cleanSitemap,
    },
  },
})
