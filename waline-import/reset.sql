-- Waline 库重建脚本（破坏性 —— 会清空所有评论、访问量与后台账号）
--
-- 【什么时候用】只在这两种情况下用：
--   1. 时间列建成了驼峰 `"insertedAt"`，导入/线上报 SQLSTATE 42703（排错见 docs/waline-setup.md 6.2）；
--   2. 想要一个绝对干净的库重来一遍导入。
-- 平时不要跑。`waline.pgsql` 和 `waline-comments.sql` 都是幂等的，正常补跑不需要重建。
--
-- 【删什么】waline.pgsql 建的全部对象：3 张表 + 3 个序列，没有外键。
--   表：wl_comment / wl_counter / wl_users          （索引随表自动删除）
--   序列：wl_comment_seq / wl_counter_seq / wl_users_seq
--   序列必须显式删 —— 它们是用 CREATE SEQUENCE 单独建的，不是 OWNED BY / IDENTITY，
--   DROP TABLE 不会替你带走，残留会让重跑 waline.pgsql 的 IF NOT EXISTS 静默跳过。
--
-- 【注意】wl_users 里存的是 Waline 后台账号。如果你已经在 /ui/ 注册过管理员，
--   跑完这个脚本要重新注册一次。阶段 1 的快照会先告诉你有几行。
--
-- 【用法】Neon SQL Editor 全文粘贴执行，按四个阶段的输出逐条对照；
--   跑完接着执行 waline.pgsql（建表），再执行 waline-comments.sql（导入 53 条）。
--   注：阶段 1 的三条 count(*) 需要表已存在。如果是还没跑过 waline.pgsql 的全新空库，
--   它会报 relation does not exist 并停在这里（后面的 DROP 都是 IF EXISTS，本就安全）—— 那种情况直接从阶段 2 开始。


-- ============ 阶段 1 · 删除前快照（只读，先看再删） ============
-- 期望：comments 0（上次导入失败已整批回滚）；counters 0；
--       users 若 >0 说明已有后台账号，删完需要重新注册。
SELECT (SELECT count(*) FROM wl_comment) AS comments,
       (SELECT count(*) FROM wl_counter) AS counters,
       (SELECT count(*) FROM wl_users)   AS users;

-- 列形态快照。期望 camel_cols = 0 且 lower_cols = 7；
-- camel_cols > 0 就是本次事故要修的那种库。
SELECT count(*) FILTER (WHERE column_name IN ('insertedAt', 'createdAt', 'updatedAt')) AS camel_cols,
       count(*) FILTER (WHERE column_name IN ('insertedat', 'createdat', 'updatedat')) AS lower_cols
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('wl_comment', 'wl_counter', 'wl_users');


-- ============ 阶段 2 · 删除 ============
DROP TABLE IF EXISTS wl_comment, wl_counter, wl_users;
DROP SEQUENCE IF EXISTS wl_comment_seq, wl_counter_seq, wl_users_seq;


-- ============ 阶段 3 · 确认已彻底清空（两条都应当返回 0 行） ============
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'wl\_%'
ORDER BY table_name;

SELECT sequence_name
FROM information_schema.sequences
WHERE sequence_schema = 'public' AND sequence_name LIKE 'wl\_%'
ORDER BY sequence_name;


-- ============ 阶段 4 · 下一步 ============
-- 1) 全文执行 waline-import/waline.pgsql          —— 建表 + 索引；文件末尾自检 ① 应返回 7 行全小写，自检 ② 应返回 0 行。
-- 2) 全文执行 waline-import/waline-comments.sql   —— 导入 53 条旧评论（可选：waline-counters.sql 导入浏览量，默认不做）。
-- 3) 验证：
--      SELECT count(*) FROM wl_comment;                          -- 期望 53
--      SELECT status, count(*) FROM wl_comment GROUP BY status;  -- 期望 approved 53
--      SELECT count(*) FROM wl_comment WHERE pid <> 0;           -- 期望 31（楼中楼）
--      SELECT min(id), max(id) FROM wl_comment;                  -- 期望 2 / 60
--      SELECT last_value, is_called FROM wl_comment_seq;         -- 期望 61 / false
--    完整说明见 docs/waline-setup.md 第 3 节与第 6 节。
