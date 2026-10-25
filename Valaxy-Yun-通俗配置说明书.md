# Valaxy Yun 主题通俗配置说明书

适合：想搭建个人博客、能编辑文本文件，但不熟悉 Vue 或 TypeScript 的使用者。

适用范围：本说明书按本次核对的 Valaxy / valaxy-theme-yun 1.2.0 文档、官方示例与源码编写。npm 查询时，两者的 latest 均为 1.2.0；以后版本可能变化。已有项目先在项目目录执行 `pnpm list valaxy valaxy-theme-yun` 确认版本，不建议为了照抄本文直接升级。[11][12]

文中的“我的博客”“小明”“example.com”都是占位内容，需要换成你自己的。本文提供配置说明和示例，没有在你的实际项目中运行构建。

## 1. 先理解：到底要改哪个文件？

可以把博客想成一家店：Valaxy 负责让店运转，Yun 负责装修，Markdown 文件是店里的内容。

| 想做的事 | 去哪里修改 |
| --- | --- |
| 修改博客名、作者、头像、简介、社交链接 | `site.config.ts` |
| 选择 Yun 主题，安装或配置插件 | `valaxy.config.ts` |
| 修改颜色、首页大字、导航、背景、公告、页脚 | `theme.config.ts` |
| 写文章 | `pages/posts/文章名.md` |
| 写“关于我”等独立页面 | `pages/about.md` 等 |
| 放头像、背景和文章图片 | `public/images/` |
| 改字体、行距等样式 | `styles/` |

官方允许把站点配置写进主配置的 `siteConfig`，把主题配置写进 `themeConfig`；也支持拆成独立文件。本文统一使用独立文件，方便定位。[1][3][4][9]

**重要规则：下面所有明确标注写进 `theme.config.ts` 的字段，都直接放进 `defineThemeConfig({ ... })` 内，不要再包一层 `themeConfig`。** 如果原来主配置里已经有相同字段，先把它们迁移到同一处，避免自己忘记改的是哪份。

例如，官方写法：

```ts
// valaxy.config.ts 中的写法
export default defineValaxyConfig({
  theme: 'yun',
  themeConfig: {
    colors: { primary: '#0078E7' },
  },
})
```

在本文采用的独立文件中，等价部分是：

```ts
// theme.config.ts
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  colors: { primary: '#0078E7' },
})
```

不要把两段完整配置都留着，也不要在同一文件中写两个 `export default`。

## 2. 从零开始：先让默认博客跑起来

如果你已有能运行的 Yun 博客，跳到第 3 节即可。

官方当前要求 Node.js `>=22.12.0`，入门指南采用 pnpm `>=10.26.0`。先安装符合要求的 Node.js 和 pnpm，再在终端检查：[4]

```bash
node --version
pnpm --version
```

如果提示“找不到命令”，说明相应工具尚未安装成功，先按 Node.js 或 pnpm 官方安装说明处理。

在准备存放博客的文件夹里运行：

```bash
pnpm create valaxy@latest
```

依次选择：

1. 项目类型选 `Blog`。
2. 主题选 `Yun`。
3. 项目名填 `valaxy-blog`，或其他尚不存在的文件夹名。
4. 是否立即安装启动选 `No`，然后自己执行下面的命令。[4]

```bash
cd valaxy-blog
pnpm install
pnpm dev
```

打开终端显示的预览地址。默认开发端口是 4859，但应以你的实际输出为准。运行 `pnpm dev` 的终端要保持打开；按 `Ctrl+C` 停止。[4]

保留生成的 `pnpm-workspace.yaml`，其中包含模板需要的依赖安装设置。[4]

“项目根目录”就是能看见 `package.json` 的那一层。本文涉及的路径都从这一层开始，不是在 `node_modules` 中修改。

## 3. 推荐的文件结构

```text
valaxy-blog/
├── package.json
├── pnpm-workspace.yaml
├── valaxy.config.ts
├── site.config.ts
├── theme.config.ts          ← 没有就自己创建
├── pages/
│   ├── about.md
│   ├── links/
│   │   └── index.md
│   └── posts/
│       └── first-post.md
├── public/
│   └── images/
│       ├── avatar.jpg
│       ├── bg.jpg
│       └── bg-dark.jpg
└── styles/
    ├── index.ts
    └── custom.css
```

目录只是本文示例，不要求你把已有文件全部改名。页面、站点配置及自定义样式的组织方式来自官方约定。[4][9]

## 4. 第一步：确定使用 Yun

**文件：项目根目录的 `valaxy.config.ts`。**

全新且没有其他设置的项目，可以使用：

```ts
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  theme: 'yun',
})
```

这里的意思只有一个：这个博客使用 Yun 主题。主题包名叫 `valaxy-theme-yun`，但这里写的是 `'yun'`。[1]

如果现有文件包含 `addons`、`vite`、`unocss` 等配置，保留它们，只检查或修改 `theme`，不要把整个文件替换成这个最简示例。

已有非 Yun 项目若没有安装主题，需要先在项目目录执行：[1]

```bash
pnpm add valaxy-theme-yun
```

## 5. 第二步：修改博客的身份信息

**文件：项目根目录的 `site.config.ts`。**

下面是一份基础示例；已有项目请合并相应字段，保留自己需要的其他设置。[4][5]

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  // 正式上线后的地址；上线前换成自己的域名
  url: 'https://example.com/',

  lang: 'zh-CN',
  timezone: 'Asia/Shanghai',

  title: '我的博客',
  subtitle: '记录生活与技术',
  description: '这里是小明分享学习笔记和日常的地方。',

  author: {
    name: '小明',
    avatar: '/images/avatar.jpg',
  },

  social: [
    {
      name: 'GitHub',
      link: 'https://github.com/你的用户名',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '邮箱',
      link: 'mailto:你的邮箱@example.com',
      icon: 'i-ri-mail-line',
      color: '#8E71C1',
    },
  ],

  search: {
    enable: true,
    provider: 'fuse',
  },

  comment: {
    enable: false,
  },
})
```

这些字段分别表示：

- `title`：站点名称。
- `subtitle`：副标题。
- `description`：站点简介。
- `author.name`：作者名字。
- `author.avatar`：头像地址。
- `social`：GitHub、邮箱等社交入口。
- `search`：这里启用本地 Fuse 搜索。
- `comment`：暂时关闭评论，等配置好评论服务后再开启。[4][5]

**`url` 填上线后的正式网址，不是本地预览地址。修改它不会改变 `pnpm dev` 的端口。** 正式网址会用于生成文章链接、站点地图、RSS 等内容。[4]

**图片怎么放？** 把头像保存成 `public/images/avatar.jpg`，配置里写 `/images/avatar.jpg`。`public` 是磁盘上的文件夹名，不是公开网址的一部分。官方示例中的封面图片也采用这种方式。[8]

先在预览网址后加 `/images/avatar.jpg` 直接打开；若这里都无法显示，就先检查文件名、扩展名和大小写，再检查头像配置。

本文图片路径以部署在域名根目录为例。如果计划部署到 `example.com/blog/` 等子目录，还要检查部署的 base 和资源路径，不能仅把 `site.url` 改成带 `/blog/` 就认为完成。

## 6. 第三步：设置首页和外观

**文件：项目根目录的 `theme.config.ts`。**

下面是建议先采用的基础配置，暂不启用依赖额外图片或网络接口的功能：[1][2][7]

```ts
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  type: 'nimbo',

  colors: {
    primary: '#0078E7',
  },

  banner: {
    enable: true,
    title: '小明的博客',
    cloud: {
      enable: true,
    },
  },

  nav: [
    { text: '首页', link: '/', icon: 'i-ri-home-line' },
    { text: '关于', link: '/about', icon: 'i-ri-user-line' },
    { text: '友链', link: '/links/', icon: 'i-ri-link' },
  ],

  pages: [
    { name: '关于我', url: '/about', icon: 'i-ri-user-line' },
    { name: '友情链接', url: '/links/', icon: 'i-ri-link' },
  ],

  notice: {
    enable: true,
    content: '欢迎来到我的博客！',
  },

  bg_image: {
    enable: false,
  },

  say: {
    enable: false,
  },

  fireworks: {
    enable: false,
  },

  footer: {
    since: 2026,
    powered: true,
    beian: {
      enable: false,
      icp: '',
    },
  },
})
```

保存后应能检查到：首页大字、主题色、导航、公告和页脚。上面“关于”和“友链”还需要第 7 节创建对应页面后才能完整使用。

### 布局选哪个？

- `nimbo`：当前默认风格，顶部导航、首页动画，移动端使用全屏菜单。
- `strato`：经典风格，以左侧边栏为主要特征。[2]

想试经典布局，把 `type: 'nimbo'` 改成 `type: 'strato'` 即可。布局不同，同一选项的展示位置或效果也可能不同。[2][13]

### 为什么改了博客名，首页大字没变？

因为它们是两个设置：`site.config.ts` 的 `title` 是站点名称，`theme.config.ts` 的 `banner.title` 是首页大字。想保持一致，就把两处都改成相同文字。[4]

### 改颜色怎么做？

改 `colors.primary`，例如改成 `'#8B5CF6'`。这是主题主色，不表示页面上的每一种颜色都会统一改变。[2]

### `nav`、`pages`、`social`、`sidebar` 有什么区别？

| 配置 | 用途 | 单项里链接字段叫什么 |
| --- | --- | --- |
| `theme.config.ts` → `nav` | 顶部导航 | `link` |
| `theme.config.ts` → `pages` | 首页介绍区的页面入口；经典布局中对应侧栏相关区域 | `url` |
| `site.config.ts` → `social` | 社交平台、邮箱等入口 | `link` |
| `theme.config.ts` → `sidebar` | `docs` 文档布局的分组导航 | `link` |

它们不是可以随意换名字的同一组字段。尤其不要把所有“左边的东西”都理解成 `sidebar`：源码明确把该字段用于 `docs` 布局的导航。[2][5][13]

## 7. 添加“关于我”和友情链接

**加导航只是放了一块路牌，还需要实际的页面文件。**

### 关于我

创建 `pages/about.md`，写入：

```md
---
title: 关于我
---

你好，我是小明。

这里记录我的学习、生活和一些想法。

## 联系我

邮箱：your-name@example.com
```

在本文使用的文件路由方式下，对应访问路径为 `/about`。官方示例同样通过 `pages/posts/first-post.md` 对应 `/posts/first-post`。[4]

因为第 6 节已经配置 `/about` 的导航，不需要再添加一个重复入口。保存后先直接访问 `/about`，再检查导航能否跳转。

### 友情链接

创建 `pages/links/index.md`，写入以下完整内容：[6][7]

```md
---
title: 友情链接
links:
  - name: 小伙伴
    blog: 小伙伴的博客
    url: https://example.org/
    avatar: /images/avatar.jpg
    desc: 一个分享生活和技术的博客。
    color: '#0078E7'
random: false
---

<YunLinks :links="frontmatter.links" :random="frontmatter.random" />
```

将示例的网址、头像和文字替换为朋友的信息。多个朋友就在 `links` 下继续添加以 `- name:` 开头的项目，保持缩进一致。

- `name`：朋友的名字。
- `blog`：博客名字。
- `url`：点击卡片后访问的网址。
- `avatar`：头像图片地址。
- `desc`：介绍。
- `color`：卡片相关配色。
- `random`：是否随机排列。[6][7]

**最后一行 `<YunLinks ... />` 要保留。** 上面的 YAML 保存数据，这个组件负责把数据展示成友链卡片；只填数据不会得到示例中的卡片效果。[7]

## 8. 写文章：一篇文章就是一个 Markdown 文件

创建 `pages/posts/first-post.md`：[4][8]

```md
---
title: 我的第一篇文章
date: 2026-10-22
tags:
  - 日常
  - 学习
categories:
  - 随笔
---

这里是文章的开头，也用作列表中的摘要。

<!-- more -->

## 今天学到了什么

这里开始写完整正文。

## 插入图片

![图片说明](/images/avatar.jpg)
```

日期换成实际发布日期。顶部两条 `---` 之间的区域叫 Front Matter，理解成“文章资料卡”即可；后面才是正文。[4][8]

常用配置：

| 字段 | 用途 |
| --- | --- |
| `title` | 文章标题 |
| `date` | 发布日期 |
| `tags` | 标签，可以有多个 |
| `categories` | 分类；数组按顺序表示多层分类 |
| `cover` | 图片封面，例如 `/images/cover.jpg` |
| `top` | 置顶数字，越大越靠前 |
| `draft: true` | 草稿，仅开发模式展示 |
| `hide: true` | 从首页和归档列表隐藏，但仍会生成可直接访问的页面 |
| `excerpt` | 手动指定摘要，优先于 `<!-- more -->` |

标签、分类、置顶、草稿等行为见官方文章类型定义；`hide` 不能当作访问权限控制。[8]

`<!-- more -->` 上方内容用于摘要，下面继续正文。另一种方式是在 Front Matter 写 `excerpt: 这里是我手动填写的摘要`，两种方式按需选用。[8]

如果新文章没有排第一，检查模板的示例文章是否有 `top: 1`；置顶文章会排在普通文章前面。[4]

## 9. 按需增加功能

下面代码都是“配置片段”。**将它们合并到现有配置对象里，不要直接追加到文件最后，也不要建立第二个同名字段。**

### 换背景图

先准备 `public/images/bg.jpg` 和 `public/images/bg-dark.jpg`。然后在 `theme.config.ts` 中，把已有的 `bg_image` 整段替换成：[13]

```ts
bg_image: {
  enable: true,
  url: '/images/bg.jpg',
  dark: '/images/bg-dark.jpg',
  opacity: 0.3,
},
```

`url` 是亮色模式背景，`dark` 是暗色模式背景，`opacity` 是透明度。没有暗色图片时可以先删掉 `dark`，再检查实际显示。建议从较淡的背景开始，确保文字清晰。

### 开启随机一句话

若希望使用自己写的句子，创建 `public/sentences.json`，内容必须是合法 JSON：[13]

```json
[
  "慢慢来，也是在前进。",
  "今天也写一点喜欢的东西。"
]
```

再替换 `theme.config.ts` 的 `say`：[7][13]

```ts
say: {
  enable: true,
  api: '/sentences.json',
  hitokoto: {
    enable: false,
    api: 'https://v1.hitokoto.cn',
  },
},
```

这里关掉一言，使用自己的本地句子。JSON 里必须使用英文双引号，最后一条内容后面不能加逗号。

### 开启点击烟花

替换 `theme.config.ts` 中的 `fireworks`：[7]

```ts
fireworks: {
  enable: true,
  colors: ['#66A7DD', '#3E83E1', '#214EC2'],
},
```

### 页脚和备案

`footer.since` 填建站年份；`footer.powered` 控制是否显示 Valaxy 与主题署名；备案信息由 `footer.beian` 控制。[2][13]

有真实备案号时，再把已有的 `beian` 替换为：

```ts
beian: {
  enable: true,
  icp: '这里填写你自己的真实备案号',
  icpLink: 'https://beian.miit.gov.cn/',
},
```

不要保留官方演示站的备案号。没有需要展示的信息时，维持 `enable: false`。[4]

### 评论：先接服务，再开开关

单独设置 `comment.enable: true` 不能完成 Waline 接入。你还需要可用的 Waline 服务地址和 Valaxy 插件。[10]

先按 Waline 的部署文档准备服务，得到自己的服务地址；然后在项目目录安装插件：

```bash
pnpm add valaxy-addon-waline
```

在 `site.config.ts` 把已有评论设置改成：

```ts
comment: {
  enable: true,
},
```

在 `valaxy.config.ts` 添加导入，并把插件加入 `addons`。没有其他主配置时，完整示例为：[10]

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineValaxyConfig({
  theme: 'yun',
  addons: [
    addonWaline({
      serverURL: 'https://你的实际评论服务域名',
    }),
  ],
})
```

已有 `addons` 时，将 `addonWaline(...)` 放进原数组，保留原有插件。`serverURL` 填评论服务的地址，不是你的博客地址，除非你明确把两者部署在同一域名的相应位置。

## 10. 自定义样式：先从字体和背景变量入手

创建 `styles/index.ts`：[9]

```ts
import './custom.css'
```

创建 `styles/custom.css`：[6][9]

```css
:root {
  --va-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Microsoft YaHei", sans-serif;

  /* 首页及页脚云朵的颜色 */
  --yun-c-cloud: #ffffff;
}
```

保存后重启开发服务器，检查字体和云朵效果。

官方支持自动加载 `styles/index.ts`、`styles/index.scss` 或 `styles/index.css`，并提醒不要同时保留多个入口，以免重复引入。因此，如果已有 `styles/index.scss` 或 `styles/index.css`，直接编辑已有入口，或者迁移到本文的 `index.ts` 方案，不要重复创建。[9]

这里配置的是字体候选列表；访客设备没有某种字体时，会使用后面的候选字体，不会因为写了名字就自动下载字体。

## 11. 看懂配置语法，避免一改就报错

你不需要先学完整的 TypeScript，先记住这些规则：

```ts
notice: {
  enable: true,
  content: '欢迎访问！',
},
```

- `notice` 是一组设置，使用大括号 `{}`。
- `enable` 是开关；`true` 表示开，`false` 表示关，不加引号。
- 文本使用英文引号，例如 `'欢迎访问！'`。
- 字段之间用英文逗号分隔。
- `//` 后面是注释，用来解释代码，不是显示在页面上的文字。
- 多个导航、社交账号、友链等重复项目，通常使用数组 `[]`。

`.ts` 配置不是 JSON，可以包含导入、注释和函数。Markdown 顶部的资料卡使用 YAML，它靠缩进表达层级，不要把 TypeScript 的大括号和逗号写进去。

**修改方法建议：一次只改一个功能，保存后检查，确认正常再继续。** 在已有项目里复制示例前，先备份原文件，方便回退。

## 12. 修改后怎样检查？

日常改内容，用：

```bash
pnpm dev
```

开发预览正常后，上线前用官方模板提供的命令：[4]

```bash
pnpm build
pnpm serve
```

先等待 `pnpm build` 成功退出，再执行 `pnpm serve`。后者预览的是构建结果，不会自动替你重新构建。模板默认生成静态站点到 `dist/`，预览地址以终端输出为准。[4]

建议检查：

- 浏览器标题、站点名、作者名字正确。
- 首页大字已经修改。
- 头像、背景和文章图片可直接打开。
- 点击导航能进入“关于”和“友链”。
- 直接输入文章网址、刷新文章页面仍能访问。
- 手机宽度下菜单可用，亮色和暗色模式都能看清文字。
- 开启搜索后能搜到测试文章。
- 如果接了评论，可以实际提交并读取一条测试评论。
- 没有遗留演示站的账号、赞助二维码、备案号。

旧项目的 `package.json` 可能使用不同脚本。若提示缺少 `serve` 脚本，先看本项目 `package.json` 的 `scripts`，不要把其他项目的命令当作必然可用。

## 13. 常见问题速查

| 现象 | 先检查什么 |
| --- | --- |
| 修改后完全没变化 | 是否改了当前项目；是否保存；是否把主题选项放错进 `site.config.ts`；重启开发服务器 |
| 博客名变了，首页大字没变 | 修改 `theme.config.ts` 的 `banner.title` |
| 导航出现了，点击却 404 | 是否真的创建了页面；链接路径与文件位置是否匹配 |
| 头像或背景不显示 | 直接打开图片 URL；检查是否误写 `/public/images/...`；检查文件大小写 |
| 友链没有卡片 | 页面底部是否保留 `<YunLinks ... />` |
| 新文章没有排第一 | 检查旧文章的 `top` 置顶值 |
| 开发时有文章，构建后没有 | 检查是否设置 `draft: true` |
| 隐藏的文章仍能直接打开 | `hide` 只隐藏列表，不负责访问控制 |
| 评论位置有了，却不能使用 | 检查插件、实际服务地址和服务是否可访问 |
| 新建样式后没效果 | 检查入口文件、导入路径；重启开发服务器 |
| 文档中有选项，编辑器却报类型错误 | 先核对已安装版本，可能是新版文档与旧版依赖不匹配 |
| 本地正常，上线后图片或链接异常 | 检查部署目录、base、资源路径及托管平台的路由设置 |

上述字段行为和排查依据来自官方入门、主题、文章及样式文档；具体报错仍应以你项目终端输出为准。[2][4][6][8][9][10]

## 14. 推荐的配置顺序

1. 先跑通默认模板。
2. 改站点名、作者、头像、简介。
3. 改首页大字和主题色。
4. 写一篇文章，创建“关于我”和友链页面。
5. 检查导航、图片、搜索与生产构建。
6. 最后添加背景、评论、烟花和其他装饰。

不必一次写满所有选项。保留默认值，按实际需要增加配置，更容易知道每次变化来自哪里。

## Sources

[1] https://valaxy.site/themes/yun
[2] https://valaxy.site/themes/yun/config
[3] https://valaxy.site/guide/config
[4] https://valaxy.site/guide/getting-started
[5] https://github.com/YunYouJun/valaxy/blob/e97bb90c0c702c08ec39381e876c9d3b18cfbbae/demo/yun/site.config.ts
[6] https://github.com/YunYouJun/valaxy/blob/e97bb90c0c702c08ec39381e876c9d3b18cfbbae/packages/valaxy-theme-yun/docs/zh-CN/config.md
[7] https://github.com/YunYouJun/valaxy/blob/e97bb90c0c702c08ec39381e876c9d3b18cfbbae/docs/pages/themes/yun/widgets.md
[8] https://github.com/YunYouJun/valaxy/blob/e97bb90c0c702c08ec39381e876c9d3b18cfbbae/docs/pages/zh/guide/post.md
[9] https://github.com/YunYouJun/valaxy/blob/e97bb90c0c702c08ec39381e876c9d3b18cfbbae/docs/pages/zh/guide/custom/styles.md
[10] https://github.com/YunYouJun/valaxy/blob/e97bb90c0c702c08ec39381e876c9d3b18cfbbae/docs/pages/zh/guide/third-party/comment-system.md
[11] https://registry.npmjs.org/valaxy
[12] https://registry.npmjs.org/valaxy-theme-yun
[13] https://github.com/YunYouJun/valaxy/blob/e97bb90c0c702c08ec39381e876c9d3b18cfbbae/packages/valaxy-theme-yun/types/index.d.ts
