---
title: 玩客云（Onecloud）折腾记
date: 2025-03-11
categories:
  - 玩机
tags:
  - Onecloud
  - 玩客云
---

## 前记

我一直想拥有一个属于自己的个人服务器，看到在B站上很多人用玩客云刷Armbian把玩客云改造成个人服务器，于是攒钱买下来了一台玩客云，并且着手进行改造，先后把玩客云刷过Openwrt&Armbian系统+CasaOS，但是感觉不够好用，后面因为Docker被Ban，导致CasaOS无法使用，软件仓库也无法使用，遂转向1panel+镜像仓库&自建镜像，1panel有更丰富的设置，并且基本上都可以使用WEBUI，操作方便；因为Openwrt是一个只读文件系统，并且我的主要需求不是软路由（科学上网，所以最后选择Armbian+Docker+1Panel(Docker手动安装，使用自建镜像仓库，1Panel功能全，操作方便)

## 准备

一台电脑

一条双USB公头线（电脑是笔记本有Type-C口的话也可以用手机数据线，但是一定要保证功能完好）

一把镊子或者一根铜线

SSH软件(我推荐MobaXterm)

## 历程

### 拆机、刷固件

买回来的时候商家给了我一些拆机工具和使用说明，获取到商家给的网址后，打开网址，发现是商家自己搭建的群晖服务器，我从上面下载了所需的工具和固件，就进行拆机，先拿撬棒从SD卡口撬开后面板，然后螺丝刀拧开后盖，最后将PCB板本体从外壳中拿出来。从工具包里拿出镊子，按照教程，用USB-A双公头线连接电脑接口和主板靠近HDMI的USB-A，短接主板背后的两个触点然后通电，电脑软件（USB\_Burning\_Tool）成功识别接口，导入需要刷入的IMG格式固件，点击开始

![示意图](/images/2025/03/202503-27f92727.webp)因为过程忘记拍照了，所以只有文字描述，可以参考一下：

[玩客云内置EMMC存储刷入Armbian\_玩客云可以刷成小主机吗-CSDN博客](https://blog.csdn.net/bigbear00007/article/details/123457243)

[](https://www.right.com.cn/FORUM/thread-8402306-1-1.html)[【2024.10.14】玩客云变身家用轻量nas Armbian24.5+LNMP+青龙面板+alist+docker-京东云、网心云、玩客云等PCDN云设备-恩山无线论坛](https://www.right.com.cn/FORUM/thread-8402306-1-1.html)

接着等待几分钟，直到进度达到100%，读条变成绿色，刷机完成

### Armbian安装1Panel

接下来拔下电源，玩客云通过网线接到路由器上，重新连接电源，查看路由器后台找到Onecloud的IP，使用电脑ssh连接到玩客云（默认账号：root 默认密码：1234）

![](/images/2025/03/202503-30e7b536.webp)设定root密码，登录后会提示修改密码。修改你记得住的密码，提示选择1.bash 提示创建用户，我们直接按Ctrl+C取消。

#### 更换时区、更换软件源

```
#更换时区
cp /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
```

```
date -R
```

```
#一键更换国内源脚本
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
```

**建议更新软件源后把软件包也更新一下**

#### 安装docker

```
#使用 apt 安装 docker 就可以
apt install docker.io
```

#### 安装1panel面板

[在线安装 - 1Panel 文档](https://1panel.cn/docs/installation/online_installation/)

```
#使用一键命令根据提示安装即可 下列是Ubuntu的安装命令
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh
```

根据脚本提示进行操作，输入安装位置、端口、账号、密码、安全入口，最后使用

http://玩客云ip:端口/安全入口

访问1Panel面板

注：这一步很可能出错，因为网络环境原因，所以我接下来提供几个备选方案

<details>
<summary>官方脚本无法使用的备选方法</summary>

官方论坛提供了docker被墙之后的安装脚本，可以试试看能不能能安装

[大陆服务器安装docker的临时方法（2024.6月）（docker安装失败的情况） - 1Panel - 社区论坛 - FIT2CLOUD 飞致云](https://bbs.fit2cloud.com/t/topic/5891)
</details>
在脚本安装过程中还可能遇到docker-compose安装错误，建议遇到这种情况，请单独去github下载对应的docker-compose文件，下载完成后修改文件名为"docker-compose"，通过SFTP上传到/usr/local/bin目录下(推荐使用WinSCP)，然后重新运行官方脚本就能正常安装了(由于玩客云是arm32位架构，所以属于armv7/armv7l)

#### docker换源

进入1Panel面板首先配置docker镜像加速，容器——>配置——>镜像加速，点击设置添加链接

![](/images/2025/03/202503-e020ca54.webp)#### 安装LNMP

登录1panel面板后可以从应用商店安装以下四个应用

![](/images/2025/03/202503-07ad55ae.webp)注：其中openresty和mysql首次安装会报错，但是别担心，跟着我的步骤走，就可以很快地解决问题

安装前可以在SSH终端中执行：

拉取 **MySQL 5.7 armv7l** 架构最新版本镜像

```
docker pull biarms/mysql:5.7.33-beta-circleci
```

拉取 **OpenResty armv7l** 架构最新版本镜像

```
docker pull imzcc/openresty:1.21.4.1-7-alpine
```

拉取完成后到1panel面板找到这两个镜像名称复制等下用

![](/images/2025/03/202503-6bf099ff.webp)回到应用商店已安装的应用打开应用安装目录

打开Openresty的应用目录

![](/images/2025/03/202503-4ac8e260.webp)![](/images/2025/03/202503-2dc5a9d9.webp)![](/images/2025/03/202503-cb0147f5.webp)把上面的image: 后面的内容修改为刚刚复制的镜像名，如图，点击确认，并且需要清空waf.conf，因为新旧版waf不兼容，会导致应用无法启动

![](/images/2025/03/202503-a50d6ef8.webp)打开MySQL安装目录

与前面步骤相同，不过只需要修改image: 后面的内容即可

![](/images/2025/03/202503-5b6f0361.webp)
<details>
<summary>使用面板编排功能更方便，也是直接编辑docker-compose.yml</summary>

![](/images/2025/03/202503-f34c25d6.webp)
</details>
编辑完成后在应用商店重建应用就可以正常运行了

最后一步
在应用商店安装PHP8，日志中显示done就表示构建完成了，可以在网站——>运行环境查看运行状态。

![](/images/2025/03/202503-b046f558.webp)![](/images/2025/03/202503-d56934dc.webp)**以上LNMP环境安装完成，可以部署你的网站了**

访问地址:

alist ip:5244

ddns-go ip:9876

**本地服务部署完成，现在玩客云已经可以在局域网内被访问了，教程结束**

最后分享一下教程需要用到的文件：

通过网盘分享的文件：玩客云
链接: [https://pan.baidu.com/s/1iUJV3qPuvLdZb4qZSUZfFA?pwd=7y6a](https://pan.baidu.com/s/1iUJV3qPuvLdZb4qZSUZfFA?pwd=7y6a) 提取码: 7y6a
