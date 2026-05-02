-- 修复 shows 表 slug 重复问题
-- 1. 先查看是否有重复的 slug
SELECT slug, COUNT(*) as cnt
FROM shows
GROUP BY slug
HAVING COUNT(*) > 1;

-- 2. 如果有重复，更新重复的 slug（添加后缀）
-- 先查看重复的数据
-- 根据实际查询结果，手动更新重复的 slug

-- 3. 添加唯一约束（在确认没有重复后执行）
-- 先删除可能已有的索引
DROP INDEX IF EXISTS shows_slug_unique;

-- 添加唯一索引（允许 NULL 值，但如果填写则必须唯一）
CREATE UNIQUE INDEX shows_slug_unique ON shows (slug)
WHERE slug IS NOT NULL AND slug != '';

-- 或者使用完整约束（如果所有行都有 slug 且非空）
-- ALTER TABLE shows ADD CONSTRAINT shows_slug_unique UNIQUE (slug);
