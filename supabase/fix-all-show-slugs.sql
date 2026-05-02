-- ============================================
-- 修复 shows 表的 slug 字段
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 第一步：查看当前的 slug 情况
SELECT id, name, slug, 
       CASE 
         WHEN slug IS NULL OR slug = '' THEN '空'
         WHEN slug !~ '^[a-zA-Z0-9\-]+$' THEN '包含非ASCII'
         ELSE '正常'
       END as slug_status
FROM shows;

-- 第二步：备份当前数据（可选）
-- CREATE TABLE shows_backup AS SELECT * FROM shows;

-- 第三步：修复所有有问题的 slug
-- 方案 A：使用 show- 前缀 + id 后缀（确保唯一）

DO $$
DECLARE
  r RECORD;
  new_slug TEXT;
BEGIN
  FOR r IN SELECT id, name, slug FROM shows LOOP
    -- 检查 slug 是否需要修复
    IF r.slug IS NULL OR r.slug = '' OR r.slug !~ '^[a-zA-Z0-9\-]+$' THEN
      -- 生成新的 ASCII slug
      new_slug := 'show-' || replace(r.id::text, '-', '')::text;
      new_slug := substring(new_slug from 1 for 50);
      
      -- 更新
      UPDATE shows 
      SET slug = new_slug
      WHERE id = r.id;
      
      RAISE NOTICE 'Updated show %: slug = %', r.name, new_slug;
    END IF;
  END LOOP;
END $$;

-- 第四步：检查是否有重复的 slug
SELECT slug, COUNT(*) as cnt
FROM shows
GROUP BY slug
HAVING COUNT(*) > 1;

-- 如果有重复，执行以下脚本修复（添加随机后缀）
DO $$
DECLARE
  r RECORD;
  new_slug TEXT;
  counter INTEGER;
BEGIN
  FOR r IN 
    SELECT slug, COUNT(*) as cnt
    FROM shows
    GROUP BY slug
    HAVING COUNT(*) > 1
  LOOP
    counter := 0;
    FOR i IN (SELECT id FROM shows WHERE slug = r.slug) LOOP
      IF counter > 0 THEN
        new_slug := r.slug || '-' || counter::text;
        UPDATE shows SET slug = new_slug WHERE id = i.id;
      END IF;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- 第五步：添加唯一索引（在确认没有重复后执行）
CREATE UNIQUE INDEX IF NOT EXISTS shows_slug_unique 
ON shows (slug)
WHERE slug IS NOT NULL AND slug != '';

-- 第六步：验证结果
SELECT id, name, slug FROM shows ORDER BY name;
