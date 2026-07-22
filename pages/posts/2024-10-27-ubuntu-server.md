---
title: Ubuntu server
date: 2024-10-27
categories:
  - 玩机
tags:
  - server
  - Ubuntu
  - 服务器
  - 部署
---

经历种种艰辛，终于把Ubuntu server 安装好了，在安装过程中我通过以下流程初步部署好了服务器

## 使用root用户登录ssh终端

```
sudo passwd root
sudo vim /etc/ssh/sshd_config
```

改为PermitRootLogin yes

:wq保存并退出

接下来是

## 开机自动挂载硬盘

正常情况下只需要

```
fdisk -l
lsblk
df -h
```

一些命令查看需要挂载的磁盘

```
sudo vim /etc/fstab
```

在最下面添加一行

例：

```
/dev/sdb1 /data ext4 defaults 0 0
```

- 第一列 需要挂载的设备
- 第二列 挂载点
- 第三列 文件系统
- 第四列 一般为defaults自动挂载
- 第五列 为**Linux dump**备份选项
    - 0：不使用Linux dump。现在通常不使用，为0即可
    - 1：使用Linux dump
- 第六列 为**fsck**选项，即开机是否使用fsck检查磁盘
    - 0：表示不检验
    - 1：挂载点为(/)根目录的分区填写为1
    - 其他分区为2，系统按照数字从小到大依次检查
- 重启系统生效

## 对硬盘进行分区操作

GPT分区表需要使用parted命令工具进行分区操作

```
parted
# help
select /dev/sdx (选择需要分区的磁盘
mklabel gpt
mkpart
```

(交互式分区)

起始点建议从1开始，不然会提示4K未对齐

分区完毕输入quit回车退出

安装1panel面板

目前国内docker无法正常安装，需要使用以下命令先安装docker，再进行安装1panel

```
curl https://install.1panel.live/docker-install -o docker-install && sudo bash ./docker-install && rm -f ./docker-install

Ubuntu命令

curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh
```