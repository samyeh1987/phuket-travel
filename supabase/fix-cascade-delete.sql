-- =============================================
-- 修復級聯刪除約束
-- 執行位置：Supabase Dashboard → SQL Editor
-- =============================================

-- 1. 確保 show_packages 表的外鍵有 ON DELETE CASCADE
ALTER TABLE show_packages 
DROP CONSTRAINT IF EXISTS show_packages_show_id_fkey,
ADD CONSTRAINT show_packages_show_id_fkey 
FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE;

-- 2. 確認外鍵約束已正確設置
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('show_packages', 'island_boats', 'yacht_orders', 'yacht_passengers');
