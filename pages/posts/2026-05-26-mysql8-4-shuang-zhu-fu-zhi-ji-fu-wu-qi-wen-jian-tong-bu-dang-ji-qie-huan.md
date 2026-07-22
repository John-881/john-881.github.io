---
title: MySQL8.4双主复制及服务器文件同步宕机切换
date: 2026-05-26
categories:
  - 探索
tags:
  - VPS
  - 搞机
  - 日常
  - 服务器
  - 部署
---

这是一份极其详尽的 **MySQL 8.4 双主复制 + WireGuard + Syncthing + Nginx 高可用架构配置手册**，已整合所有踩坑经验、关键配置文件和命令。

---

## 一、架构目标与拓扑

- 两台公网服务器：主服务器 (M1) 和备用服务器 (M2)
- 通过 WireGuard 建立虚拟局域网，内网 IP 分别为 `10.0.0.1/24` 和 `10.0.0.2/24`
- MySQL 8.4 运行于 Docker（1Panel 管理），端口仅映射到本地回环和 WireGuard IP
- 数据库双向实时同步（双主复制），基于 GTID + SOURCE\_AUTO\_POSITION
- 文件同步：`wp-content` 目录通过 Syncthing 实时同步
- Web 服务：Nginx 反向代理，upstream 中后备服务器设为 `backup`

---

## 二、网络与安全基础

### 2.1 WireGuard 配置

生成密钥并编写 `/etc/wireguard/wg0.conf`。

**服务器 M1 (10.0.0.1)**：

```
[Interface]
Address = 10.0.0.1/24
PrivateKey = <M1 私钥>
ListenPort = 51820

[Peer]
PublicKey = <M2 公钥>
Endpoint = <M2 公网IP>:51820
AllowedIPs = 10.0.0.2/32
PersistentKeepalive = 25

```

**服务器 M2 (10.0.0.2)**：

```
[Interface]
Address = 10.0.0.2/24
PrivateKey = <M2 私钥>
ListenPort = 51820

[Peer]
PublicKey = <M1 公钥>
Endpoint = <M1 公网IP>:51820
AllowedIPs = 10.0.0.1/32
PersistentKeepalive = 25

```

启动并测试：

```
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0
ping 10.0.0.2   # 在 M1 上执行

```

### 2.2 Docker 容器端口隔离（1Panel）

编辑 MySQL 容器的编排文件，将端口映射修改为：

```
ports:
  - "127.0.0.1:3306:3306"   # 仅本机回环
  - "10.0.0.1:3306:3306"    # 仅 WireGuard IP （M1 为例，M2 换为 10.0.0.2）

```

> **注意**：重建容器后，公网彻底无法访问 3306 端口，但本地和通过 WireGuard 的主机可正常连接。

---

## 三、MySQL 8.4 双主复制完整配置

### 3.1 配置文件 (`my.cnf`) 详解

两台服务器均需自定义 MySQL 配置。由于使用 Docker，可将配置文件挂载进容器，或通过 1Panel 的 " 配置挂载 " 功能添加。

**M1 (10.0.0.1) 的完整 `[mysqld]` 附加配置**：

```
[mysqld]
# 基础标识
server_id = 1                       # 必须唯一
log_bin = mysql-bin                 # 开启二进制日志
binlog_format = ROW                 # 推荐 ROW 格式，记录行变更
binlog_row_image = FULL             # 完整记录前后镜像，避免数据不一致

# 双主关键：将从库接收到的更新也写入自己的 binlog
log_slave_updates = ON

# 自增主键冲突避免
auto_increment_increment = 2        # 步长（主库数量）
auto_increment_offset   = 1        # M1 从 1 开始，M2 设为 2

# GTID 强制开启
gtid_mode = ON
enforce_gtid_consistency = ON

# 中继日志
relay_log = relay-log
relay_log_recovery = ON             # 防止从库崩溃后 relay log 损坏

# 并行复制（可选，提升性能）
slave_parallel_workers = 4
slave_preserve_commit_order = ON

# 其他稳定性参数
sync_binlog = 1
innodb_flush_log_at_trx_commit = 1
expire_logs_days = 7               # 根据需要调整 binlog 保留天数

```

**M2 (10.0.0.2) 配置**：

```
[mysqld]
server_id = 2
log_bin = mysql-bin
binlog_format = ROW
binlog_row_image = FULL
log_slave_updates = ON
auto_increment_increment = 2
auto_increment_offset   = 2         # 与 M1 不同
gtid_mode = ON
enforce_gtid_consistency = ON
relay_log = relay-log
relay_log_recovery = ON
slave_parallel_workers = 4
slave_preserve_commit_order = ON
sync_binlog = 1
innodb_flush_log_at_trx_commit = 1
expire_logs_days = 7

```

> **重要提醒**：修改配置后必须重启 MySQL 服务（容器重建）。

### 3.2 创建复制用户

在**两台服务器**的 MySQL 中均执行：

```
CREATE USER 'repl'@'10.0.0.%' IDENTIFIED BY 'Your_Strong_Password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'10.0.0.%';
FLUSH PRIVILEGES;

```

> 虽然命令中仍含 `SLAVE` 关键字，但这是权限名称，MySQL 8.4 仍保留。

### 3.3 初始数据同步

假设 M1 已有生产数据，M2 为空或需要覆盖。**以下操作在 M1 上执行**：

1. **全量导出**（包含 GTID 信息）：
    
      
    ```bash
    mysqldump -u root -p --single-transaction --set-gtid-purged=ON --all-databases > /tmp/full_backup.sql
</br>
    ```
2. **将备份文件传输到 M2**：
    
      
    ```bash
    scp /tmp/full_backup.sql user@<M2公网IP>:/tmp/
</br>
    ```
3. **在 M2 上重置并导入**：
    
      
    ```sql
    -- 登录 M2 的 MySQL
</br>STOP REPLICA;
</br>RESET REPLICA ALL;
</br>RESET BINARY LOGS AND GTIDS;   -- 清空 GTID 执行历史和 binlog
</br>
    ```
    
      
    退出 MySQL，执行导入：
    
      
    ```bash
    mysql -u root -p < /tmp/full_backup.sql
</br>
    ```

### 3.4 配置双主复制

**M1 指向 M2**（在 M1 上执行）：

```
CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = '10.0.0.2',
    SOURCE_PORT = 3306,
    SOURCE_USER = 'repl',
    SOURCE_PASSWORD = 'Your_Strong_Password',
    SOURCE_AUTO_POSITION = 1,      -- 启用 GTID 自动定位
    GET_SOURCE_PUBLIC_KEY = 1;     -- 解决 caching_sha2_password 认证问题
START REPLICA;

```

**M2 指向 M1**（在 M2 上执行）：

```
CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = '10.0.0.1',
    SOURCE_PORT = 3306,
    SOURCE_USER = 'repl',
    SOURCE_PASSWORD = 'Your_Strong_Password',
    SOURCE_AUTO_POSITION = 1,
    GET_SOURCE_PUBLIC_KEY = 1;
START REPLICA;

```

### 3.5 验证双主状态

分别在两台服务器执行：

```
SHOW REPLICA STATUS\G

```

**必须确认所有关键字段正常**：

- `Replica_IO_Running: Yes`
- `Replica_SQL_Running: Yes`
- `Auto_Position: 1`
- `Seconds_Behind_Source: 0`
- `Last_IO_Error:` 为空
- `Last_SQL_Error:` 为空

测试同步：

```
-- 在 M1 上插入测试数据
CREATE DATABASE IF NOT EXISTS test_db;
USE test_db;
CREATE TABLE t1 (id INT AUTO_INCREMENT PRIMARY KEY, data VARCHAR(100));
INSERT INTO t1 (data) VALUES ('from M1');
-- 在 M2 上查询，应能立即看到
SELECT * FROM test_db.t1;
-- 同理，在 M2 插入测试，M1 查询

```

---

## 四、MySQL 8.4 命令对照速查表

| 功能 | 旧语法 (MySQL 8.3 及之前) | 新语法 (MySQL 8.4+) |
|---|---|---|
| 查看主库 binlog 状态 | `SHOW MASTER STATUS;` | `SHOW BINARY LOG STATUS;` |
| 配置复制源 | `CHANGE MASTER TO ...` | `CHANGE REPLICATION SOURCE TO ...` |
| 启动复制 | `START SLAVE;` | `START REPLICA;` |
| 停止复制 | `STOP SLAVE;` | `STOP REPLICA;` |
| 查看从库状态 | `SHOW SLAVE STATUS;` | `SHOW REPLICA STATUS;` |
| 重置从库配置 | `RESET SLAVE ALL;` | `RESET REPLICA ALL;` |
| 清空 binlog 和 GTID | `RESET MASTER;` | `RESET BINARY LOGS AND GTIDS;` |

---

## 五、常见故障的深度剖析与解决

### 5.1 认证插件错误

**现象**：

```
Last_IO_Error: ... Authentication plugin 'caching_sha2_password' reported error: Authentication requires secure connection.

```

**原因**：MySQL 8.4 默认要求复制连接使用 SSL 或安全公钥交换。

**解决**：在 `CHANGE REPLICATION SOURCE TO` 中加入 `GET_SOURCE_PUBLIC_KEY = 1`。

### 5.2 GTID 匿名事务冲突

**现象**：

```
Got fatal error 1236 ... Cannot replicate anonymous transaction when @@GLOBAL.GTID_MODE = ON

```

**原因**：主库 binlog 中包含未携带 GTID 的事务（例如历史数据，或 GTID 模式未完全开启时产生的）。

**解决**：

1. 确保双方 `gtid_mode=ON` 且 `enforce_gtid_consistency=ON`。
2. 使用基于 GTID 的自动定位（`SOURCE_AUTO_POSITION=1`），而非手动指定 binlog 文件和位置。
3. 如果错误依旧，说明主库 binlog 中确实存在匿名事务，需要重新进行全量备份恢复。

### 5.3 GTID\_PURGED 重叠冲突

**现象**：

```
ERROR 3546: @@GLOBAL.GTID_PURGED cannot be changed: the added gtid set must not overlap with @@GLOBAL.GTID_EXECUTED

```

**发生场景**：在导入包含 `SET GTID_PURGED` 的全量备份时，从库已有部分相同的 GTID 执行记录。

**彻底解决**：在目标库上先清空 GTID 历史：

```
STOP REPLICA;
RESET REPLICA ALL;
RESET BINARY LOGS AND GTIDS;

```

然后再导入备份。

### 5.4 复制用户连接失败

**排查步骤**：

- 在从库命令行测试连接：`mysql -u repl -p -h 10.0.0.x -P 3306`
- 检查主库防火墙和 Docker 端口绑定是否正确
- 确认 `repl` 用户的主机部分与来源 IP 匹配（`10.0.0.%`）
- 检查用户权限：`SHOW GRANTS FOR 'repl'@'10.0.0.%';`

### 5.5 写入冲突（唯一键冲突）

**现象**：

```
Last_SQL_Error: Could not execute Write_rows event on table db.tbl; Duplicate entry 'xxx' for key 'unique_key', Error_code: 1062

```

**分析**：双主同时插入相同的唯一值（如用户名），后同步的事件因键冲突而失败，SQL 线程停止。

**应对措施**：

- **业务层规避**：确保不会在两端同时写入可能冲突的唯一键。常用方法：只在一台主库进行写入（Nginx backup 模式本身就保证了这点）。
- **跳过错误**（紧急情况，谨慎使用）：
    
      
    ```sql
    SET GLOBAL SQL_SLAVE_SKIP_COUNTER = 1;
</br>START REPLICA;
</br>
    ```
    
      
    但会丢失该事务，需要后续修复数据。
- **使用无冲突主键**：如 UUID 或雪花 ID，避免自增主键和唯一键冲突。

### 5.6 复制延迟过大

- 检查是否存在大事务、未提交的长事务。
- 增加 `slave_parallel_workers`，并设置 `slave_preserve_commit_order=ON`。
- 检查网络带宽和延迟（WireGuard 本身有一定开销，但通常不是瓶颈）。
- 查看 `Seconds_Behind_Source` 并结合慢日志分析。

### 5.7 服务器重启或容器重建后的恢复

- 如果双主中的一台意外停止，重启后通常会自动追平数据（GTID 自动定位）。
- 若复制中断，先查看 `SHOW REPLICA STATUS\G`，根据错误处理。
- **严禁在数据不一致的情况下直接启动双向复制**，尤其在故障期间主库已发生写入的情况下。

---

## 六、文件同步：Syncthing 配置要点

### 6.1 安装（以 Debian/Ubuntu 为例）

```
sudo mkdir -p /etc/apt/keyrings
sudo curl -L -o /etc/apt/keyrings/syncthing-archive-keyring.gpg https://syncthing.net/release-key.gpg
echo "deb [signed-by=/etc/apt/keyrings/syncthing-archive-keyring.gpg] https://apt.syncthing.net/ syncthing stable-v2" | sudo tee /etc/apt/sources.list.d/syncthing.list
sudo apt update
sudo apt install syncthing

```

### 6.2 基本配置

1. 以专用用户运行，并确保对 `wp-content` 有读写权限。
2. 通过 Web GUI（可绑定到 `127.0.0.1:8384` 并通过 SSH 隧道访问）添加远程设备，输入对方设备 ID。
3. 在两台服务器上添加同一个文件夹（路径指向 WordPress 的 `wp-content` 目录），并互相共享。
4. **关键设置**：在 " 高级 " 选项卡中，将 " 地址 " 添加为 `tcp://10.0.0.x:22000`（使用 WireGuard 内网 IP），关闭中继和全局发现，纯点对点加密传输。

---

## 七、Nginx 故障切换配置

```
upstream backend {
    server 10.0.0.1:80;          # 主服务器
    server 10.0.0.2:80 backup;   # 备用，仅当主不可用时启用
}

server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

```

> 建议结合 Keepalived 或云负载均衡器实现自动故障转移，单纯 Nginx 的 `backup` 选项在检测到主服务器故障时会切换，但缺乏健康检查的精细控制。

---

## 八、日常监控与预防措施

1. **复制状态监控**：
    
    
    - 定时获取 `SHOW REPLICA STATUS`，重点关注 `Replica_IO_Running`、`Replica_SQL_Running`、`Seconds_Behind_Source`。
    - 可通过脚本 + cron 实现告警。
2. **检查自增偏移**：
    
      
    ```sql
    SHOW VARIABLES LIKE 'auto_increment%';
</br>
    ```
    
      
    确保双主的 offset 正确。
3. **Binlog 空间管理**：
    
    
    - 设置合理的 `expire_logs_days`，并监控磁盘使用。
4. **定期数据一致性校验**：
    
    
    - 推荐使用 Percona Toolkit 的 `pt-table-checksum` 进行全库校验。
5. **故障切换演练**：
    
    
    - 模拟主库宕机，验证 Nginx 切换、数据同步、文件同步是否正常。
    - 演练将恢复的主机重新加回双主架构的流程。

---

## 九、终极操作清单（从零开始）

1. **服务器基础**：两台 Ubuntu，安装好 Docker/1Panel，WordPress 已部署。
2. **网络**：配置 WireGuard，确保 `10.0.0.1` 和 `10.0.0.2` 互通。
3. **端口安全**：修改 MySQL 容器端口绑定，只保留 `127.0.0.1` 和 WG IP。
4. **MySQL 配置**：按前述 my.cnf 配置，尤其注意 `server_id`、`log_slave_updates`、`auto_increment`、`gtid`。
5. **创建复制用户**（两台）。
6. **全量同步**：从一台导出带 GTID 的备份，在另一台重置并导入。
7. **建立双主**：使用 `CHANGE REPLICATION SOURCE TO ... SOURCE_AUTO_POSITION=1, GET_SOURCE_PUBLIC_KEY=1`。
8. **验证**：双向插入测试。
9. **文件同步**：配置 Syncthing 同步 `wp-content`，使用 WG IP。
10. **Nginx 切换**：配置 upstream backup，验证故障转移。
11. **监控**：设置复制状态告警，定期校验数据一致性。

---

此文档已包含所有关键命令、配置文件片段和排错逻辑，可以直接作为生产环境的部署指南。若还有特定环节需要更深入展开，可以继续补充。

PS: 仍有不足，但我还在继续学习，本篇文章由 deepseek 总结，说明了我在配置过程遇到的问题和解决方法，最后成功配置的历程，喜欢的话点点收藏吧 (*^▽^*)