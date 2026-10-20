---
title: 关于站点
---

「凌渡冰点的博客」是一个由 [Valaxy](https://github.com/YunYouJun/valaxy) 驱动的静态博客。

## 前身

- 原站基于 **WordPress** 构建，域名 `blog.490633.xyz`，使用 **Argon** 主题。
- 原站的评论、说说、分类、标签、友链等内容均随本次迁移一并搬到新站。

## 现在

- 框架：[Valaxy](https://github.com/YunYouJun/valaxy) 1.2.0
- 主题：[valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/) 1.2.0
- 评论：[valaxy-addon-waline](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-waline)（服务端部署在 Vercel，数据库使用 Neon PostgreSQL）
- 说说：[valaxy-addon-moments](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-moments)

## 架构

博客在本地构建为纯静态文件后部署，内容全部以 Markdown 写在 `pages/` 目录下：

- 文章位于 `pages/posts/`，访问路径为 `/posts/<slug>`；
- 说说位于 `pages/moments/`，访问路径为 `/moments/`；
- 归档、分类、标签分别由 `/archives/`、`/categories/`、`/tags/` 自动聚合。

## 订阅

- RSS：[`/atom.xml`](/atom.xml)
- 我的订阅：[我的订阅](/subscribe/)（旧站该页由插件在服务端渲染，迁移后暂无条目）
