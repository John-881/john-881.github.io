-- Waline PostgreSQL 建表脚本（可安全重复执行）
--
-- 来源：https://github.com/walinejs/waline/blob/main/assets/waline.pgsql
--       （核对时官方文件 sha: 5a6fbc616a2f89918c1c988ca6cc6b1ceb3cfbf1）
--
-- ---------------------------------------------------------------------------
-- 【为什么时间列是全小写 insertedat / createdat / updatedat】
--
-- 官方脚本里 `insertedAt` / `createdAt` / `updatedAt` 三列**故意不加双引号**，
-- PostgreSQL 于是把它们折叠成全小写 `insertedat` / `createdat` / `updatedat`。
-- Waline 现行驱动（@waline/vercel@1.43.4，src/service/storage/postgresql.js）
-- 正是按小写列名工作的，三条证据都在驱动源码里：
--   1. 发查询前把 field 列表、where 键、排序字段统一 toLowerCase()；
--   2. add() 把 insertedAt / createdAt / updatedAt 三个键 toLowerCase() 后才写入；
--   3. 读回时 mapKeys({ insertedat, createdat, updatedat, ...item }) 再还原成驼峰。
-- 也就是说：数据库列名 = 小写，驼峰只是 Waline JS 侧的字段名。
--
-- 千万不要在这里给这三列加双引号：那会建出真正的驼峰列 `"insertedAt"`，
-- 而驱动查的是 `"insertedat"`，线上立刻报
--     error: column "insertedat" does not exist (SQLSTATE 42703)
-- 2022 年的 issue #884 (https://github.com/walinejs/waline/issues/884) 是反向的
-- 同类事故：think-model-postgresql@1.1.7 曾无条件给字段加引号 → 查 `"insertedAt"`，
-- 而库里是小写，同样 42703；上游为此锁过版本（PR #888），Waline 后来自己做了小写化。
-- 同理 `like` 是 SQL 关键字、`2fa` 以数字开头，官方脚本本来就给这两列加了引号。
-- ---------------------------------------------------------------------------
--
-- 【本仓库相对官方脚本的改动】只加索引 + 幂等，列名与列定义与官方逐字一致。
-- 官方 PG 脚本只有主键、没有任何索引，评论列表和访问量查询会走全表扫描；
-- 这里移植官方 MySQL 脚本 assets/waline.sql 的索引。
--
-- 【用法】Neon SQL Editor 里全文粘贴执行。不删表、不删数据，可重复执行。
-- 若你的库里已经是**驼峰时间列**（执行过早期版本的错误脚本），IF NOT EXISTS
-- 不会替你改正，请先执行：
--     DROP TABLE IF EXISTS wl_comment, wl_counter, wl_users;
-- 再重跑本脚本。文件末尾的自检查询可以确认到底建成了哪种。
-- 想换表前缀就设 PG_PREFIX（默认 wl_），并把下面的 wl_ 全部替换成新前缀。


-- ============ wl_comment：评论正文 ============
CREATE SEQUENCE IF NOT EXISTS wl_comment_seq;

CREATE TABLE IF NOT EXISTS wl_comment (
  id int check (id > 0) NOT NULL DEFAULT NEXTVAL ('wl_comment_seq'),
  user_id int DEFAULT NULL,
  comment text,
  insertedAt timestamp(0) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip varchar(100) DEFAULT '',
  link varchar(255) DEFAULT NULL,
  mail varchar(255) DEFAULT NULL,
  nick varchar(255) DEFAULT NULL,
  pid int DEFAULT NULL,
  rid int DEFAULT NULL,
  sticky numeric DEFAULT NULL,
  status varchar(50) NOT NULL DEFAULT '',
  "like" int DEFAULT NULL,
  ua text,
  url varchar(255) DEFAULT NULL,
  createdAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_comment_url ON wl_comment (url);
CREATE INDEX IF NOT EXISTS idx_comment_user_id ON wl_comment (user_id);
CREATE INDEX IF NOT EXISTS idx_comment_status ON wl_comment (status);
CREATE INDEX IF NOT EXISTS idx_comment_pid_rid ON wl_comment (pid, rid);
CREATE INDEX IF NOT EXISTS idx_comment_created_at ON wl_comment (createdat);
CREATE INDEX IF NOT EXISTS idx_comment_updated_at ON wl_comment (updatedat);
CREATE INDEX IF NOT EXISTS idx_comment_sticky ON wl_comment (sticky);


-- ============ wl_counter：每篇文章的访问量与表情表态数 ============
CREATE SEQUENCE IF NOT EXISTS wl_counter_seq;

CREATE TABLE IF NOT EXISTS wl_counter (
  id int check (id > 0) NOT NULL DEFAULT NEXTVAL ('wl_counter_seq'),
  time int DEFAULT NULL,
  reaction0 int DEFAULT NULL,
  reaction1 int DEFAULT NULL,
  reaction2 int DEFAULT NULL,
  reaction3 int DEFAULT NULL,
  reaction4 int DEFAULT NULL,
  reaction5 int DEFAULT NULL,
  reaction6 int DEFAULT NULL,
  reaction7 int DEFAULT NULL,
  reaction8 int DEFAULT NULL,
  url varchar(255) NOT NULL DEFAULT '',
  createdAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_counter_url ON wl_counter (url);
CREATE INDEX IF NOT EXISTS idx_counter_time ON wl_counter (time);
CREATE INDEX IF NOT EXISTS idx_counter_created_at ON wl_counter (createdat);


-- ============ wl_users：后台管理员账号 ============
CREATE SEQUENCE IF NOT EXISTS wl_users_seq;

CREATE TABLE IF NOT EXISTS wl_users (
  id int check (id > 0) NOT NULL DEFAULT NEXTVAL ('wl_users_seq'),
  display_name varchar(255) NOT NULL DEFAULT '',
  email varchar(255) NOT NULL DEFAULT '',
  password varchar(255) NOT NULL DEFAULT '',
  type varchar(50) NOT NULL DEFAULT '',
  label varchar(255) DEFAULT NULL,
  url varchar(255) DEFAULT NULL,
  avatar text DEFAULT NULL,
  github varchar(255) DEFAULT NULL,
  twitter varchar(255) DEFAULT NULL,
  facebook varchar(255) DEFAULT NULL,
  google varchar(255) DEFAULT NULL,
  weibo varchar(255) DEFAULT NULL,
  qq varchar(255) DEFAULT NULL,
  oidc varchar(255) DEFAULT NULL,
  huawei varchar(255) DEFAULT NULL,
  "2fa" varchar(32) DEFAULT NULL,
  createdAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON wl_users (email);
CREATE INDEX IF NOT EXISTS idx_user_type ON wl_users (type);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON wl_users (createdat);


-- ============ 自检 ①：应当返回 7 行，column_name 全部是全小写 ============
-- wl_comment(insertedat, createdat, updatedat) + wl_counter(createdat, updatedat)
-- + wl_users(createdat, updatedat)
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('wl_comment', 'wl_counter', 'wl_users')
  AND column_name IN ('insertedat', 'createdat', 'updatedat')
ORDER BY table_name, column_name;

-- ============ 自检 ②：应当返回 0 行。返回任何一行都说明库是驼峰列，必须重建 ============
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('wl_comment', 'wl_counter', 'wl_users')
  AND column_name IN ('insertedAt', 'createdAt', 'updatedAt')
ORDER BY table_name, column_name;
