-- 修复 shows 表的 slug 字段（将中文 slug 转换为 ASCII）
-- 在 Supabase SQL Editor 中执行

-- 1. 先查看当前的 slug 情况
SELECT id, name, slug FROM shows;

-- 2. 更新所有没有 slug 或 slug 包含非 ASCII 字符的记录
-- 为每个 show 生成新的 ASCII slug

-- 方案：使用 id 的后缀作为唯一标识
UPDATE shows 
SET slug = 'show-' || substring(id from 1 for 8)
WHERE slug IS NULL OR slug = '' OR slug !~ '^[a-zA-Z0-9\-]+$';

-- 3. 如果上面的更新导致重复，使用以下脚本逐个更新
-- （在 Supabase Dashboard 中手动执行，或使用更智能的 SQL）

-- 更好的方案：创建带有随机后缀的唯一 slug
DO $$
DECLARE
  r RECORD;
  new_slug TEXT;
BEGIN
  FOR r IN SELECT id, name FROM shows LOOP
    -- 生成基于 id 的唯一 slug
    new_slug := 'show-' || replace(r.id::text, '-', '')::text;
    
    -- 更新记录
    UPDATE shows 
    SET slug = substring(new_slug from 1 for 50)
    WHERE id = r.id;
  END LOOP;
END $$;

-- 4. 最后添加唯一约束
CREATE UNIQUE INDEX IF NOT EXISTS shows_slug_unique ON shows (slug)
WHERE slug IS NOT NULL AND slug != '';

-- 5. 验证结果
SELECT id, name, slug FROM shows;
