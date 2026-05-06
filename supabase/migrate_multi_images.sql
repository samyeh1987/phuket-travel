-- =====================================================
-- 多图片支持数据库迁移脚本
-- 添加 islands.images 和 yacht_packages.images 字段
-- =====================================================

-- 1. 修改 islands 表：添加 images 数组字段
ALTER TABLE islands
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 将现有的 image_url 数据迁移到 images 数组（第一张）
UPDATE islands
SET images = ARRAY[image_url]
WHERE images IS NULL OR array_length(images, 1) IS NULL
  AND image_url IS NOT NULL
  AND image_url != '';

-- 2. 修改 yacht_packages 表：添加 images 数组字段
ALTER TABLE yacht_packages
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 将现有的 image_url 数据迁移到 images 数组（第一张）
UPDATE yacht_packages
SET images = ARRAY[image_url]
WHERE images IS NULL OR array_length(images, 1) IS NULL
  AND image_url IS NOT NULL
  AND image_url != '';

-- 3. 同样为 island_boats 表添加 images 字段（如果不存在）
-- 注意：island_boats 可能已经有 images 字段，这个是安全检查
ALTER TABLE island_boats
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 4. 为新的 images 字段创建 RLS 策略（公开读取）
-- islands.images
DROP POLICY IF EXISTS "Public can read island images" ON islands;
CREATE POLICY "Public can read island images"
ON islands FOR SELECT
USING (true);

-- yacht_packages.images
DROP POLICY IF EXISTS "Public can read yacht images" ON yacht_packages;
CREATE POLICY "Public can read yacht images"
ON yacht_packages FOR SELECT
USING (true);

-- island_boats.images
DROP POLICY IF EXISTS "Public can read boat images" ON island_boats;
CREATE POLICY "Public can read boat images"
ON island_boats FOR SELECT
USING (true);

-- 5. 添加索引以优化查询（可选，但建议）
CREATE INDEX IF NOT EXISTS idx_islands_images ON islands USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_yacht_packages_images ON yacht_packages USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_island_boats_images ON island_boats USING GIN (images);

-- =====================================================
-- 回滚脚本（如果需要回滚）
-- =====================================================
-- ALTER TABLE islands DROP COLUMN IF EXISTS images;
-- ALTER TABLE yacht_packages DROP COLUMN IF EXISTS images;
-- ALTER TABLE island_boats DROP COLUMN IF EXISTS images;
-- DROP POLICY IF EXISTS "Public can read island images" ON islands;
-- DROP POLICY IF EXISTS "Public can read yacht images" ON yacht_packages;
-- DROP POLICY IF EXISTS "Public can read boat images" ON island_boats;
-- DROP INDEX IF EXISTS idx_islands_images;
-- DROP INDEX IF EXISTS idx_yacht_packages_images;
-- DROP INDEX IF EXISTS idx_island_boats_images;
