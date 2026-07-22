---
title: Linux中清空文件内容的方法
date: 2026-03-15
---

在使用Linux的过程中，我经常有需要清空一个文件的内容的情况，比如日志文件占用过大，或者systemd服务文件重写，需要用命令清空，我逐渐在学习过程中掌握了一些方法来应对这些情况。在这里记录一下防止遗忘。

## 方法1（>重定向）

通过重定向到NULL来清空文件。

```
> example.log
```

## 方法2（`echo` 命令）

使用 echo 命令 将空字符串重定向到文件中。

```
echo "" > example.log
或者
echo > example.log
```

## 方法3（`cat` 及 `/dev/null` 设备<sup class="fn" data-fn="7d8df544-1bbe-47c6-bf2f-b5fd192b3109">[1](#7d8df544-1bbe-47c6-bf2f-b5fd192b3109)</sup>）

可以通过使用 cat 命令 显示 /dev/null 的内容然后重定向输出到某个文件，以此来达到清空该文件的目的。

```
cat /dev/null > example.log
```

## 方法4（`cp` 及 `/dev/null` 设备）

```
cp /dev/null example.log
```

## 方法5（Linux `dd` 命令）

```
dd if=/dev/null of=example.log // if 代表输入文件，of 代表输出文件。
```

## 方法6（`true`命令<sup class="fn" data-fn="d870d80d-8da9-4b6c-b6cc-1c96e365ade4">[2](#d870d80d-8da9-4b6c-b6cc-1c96e365ade4)</sup>）

```
true > example.log
或者
: > example.log
```

## 方法7（`truncate` 命令）

truncate 可被用来将文件缩减或扩展至指定大小。

```
truncate -s 0 my_access.log
```

## 方法8（`sed` 命令）

sed命令可以通过删除文件内容的方式清空文件。

```
sed -i 'd' example.log
```

## 方法对比

以下是8种方法的对比表格，帮助读者选择最适合的方案。

| 方法 | 优点 | 缺点 | 适用场景 |
|---|---|---|---|
| `>`/`true`重定向 | 简单、快速、高效 | 无 | 适用于大多数场景 |
| `echo`命令 | 易于理解，适合初学者 | 略微冗余 | 适用于脚本中需要明确清空意图的场景 |
| `truncate`命令 | 不改变文件权限和时间戳，适合日志管理 | 需要额外安装工具 | 适用于需要保留文件元信息的场景 |
| `dd`命令 | 灵活，适合高级操作 | 性能较低，代码较复杂 | 适用于需要精确控制的场景 |
| `cat`/`cp`命令 | 简单，适合快速操作 | 依赖`/dev/null`设备 | 适用于大多数场景 |
| `sed`命令 | 可扩展性强，适合复杂文本处理 | 性能较低，代码较复杂 | 适用于需要处理文本内容的场景 |