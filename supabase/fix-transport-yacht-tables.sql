-- =============================================
-- 修復包車/包船相關資料表
-- 請在 Supabase SQL Editor 中執行此腳本
-- 所有語句均使用 IF NOT EXISTS，可安全重複執行
-- =============================================

-- 確保 uuid-ossp 擴展已啟用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 車型套餐表
-- =============================================
CREATE TABLE IF NOT EXISTS vehicle_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    capacity INTEGER DEFAULT 4,
    luggage_count INTEGER DEFAULT 2,
    price_pickup DECIMAL(10, 2),
    price_pickup_cny DECIMAL(10, 2),
    price_charter_4h DECIMAL(10, 2),
    price_charter_6h DECIMAL(10, 2),
    price_charter_8h DECIMAL(10, 2),
    price_charter_10h DECIMAL(10, 2),
    price_charter_full DECIMAL(10, 2),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 包船套餐表
-- =============================================
CREATE TABLE IF NOT EXISTS yacht_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    capacity INTEGER DEFAULT 10,
    duration VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    price_cny DECIMAL(10, 2),
    price_per_person DECIMAL(10, 2),
    includes TEXT[],
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 交通訂單表（接機/送機/包車）
-- =============================================
CREATE TABLE IF NOT EXISTS transport_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT '',
    order_type VARCHAR(20) NOT NULL,
    vehicle_package_id UUID,
    vehicle_name VARCHAR(255),
    charter_hours INTEGER,
    flight_number VARCHAR(50),
    flight_date DATE,
    flight_time TIME,
    charter_date DATE,
    charter_start_time TIME,
    charter_end_time TIME,
    total_price DECIMAL(10, 2),
    passenger_name VARCHAR(100),
    passenger_phone VARCHAR(50),
    passenger_wechat VARCHAR(100),
    hotel_name VARCHAR(255),
    hotel_address TEXT,
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    payment_proof_url TEXT,
    user_id UUID,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 補充外鍵（若表已存在但沒有外鍵）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'transport_orders_vehicle_package_id_fkey'
    ) THEN
        ALTER TABLE transport_orders
            ADD CONSTRAINT transport_orders_vehicle_package_id_fkey
            FOREIGN KEY (vehicle_package_id) REFERENCES vehicle_packages(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =============================================
-- 包船訂單表
-- =============================================
CREATE TABLE IF NOT EXISTS yacht_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT '',
    yacht_package_id UUID,
    yacht_name VARCHAR(255),
    charter_date DATE,
    passenger_count INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2),
    main_passenger_name VARCHAR(100),
    main_passenger_phone VARCHAR(50),
    main_passenger_wechat VARCHAR(100),
    main_passenger_passport VARCHAR(50),
    main_passenger_birthday DATE,
    hotel_name VARCHAR(255),
    hotel_address TEXT,
    boarding_location VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    payment_proof_url TEXT,
    user_id UUID,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 補充外鍵
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'yacht_orders_yacht_package_id_fkey'
    ) THEN
        ALTER TABLE yacht_orders
            ADD CONSTRAINT yacht_orders_yacht_package_id_fkey
            FOREIGN KEY (yacht_package_id) REFERENCES yacht_packages(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =============================================
-- 包船同行乘客表
-- =============================================
CREATE TABLE IF NOT EXISTS yacht_passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    yacht_order_id UUID REFERENCES yacht_orders(id) ON DELETE CASCADE,
    passenger_name VARCHAR(100) NOT NULL,
    passport_number VARCHAR(50),
    is_child BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 訂單序號生成函數與觸發器
-- =============================================

-- 交通訂單序號
CREATE OR REPLACE FUNCTION generate_transport_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'TR' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_transport_order_number ON transport_orders;
CREATE TRIGGER set_transport_order_number
    BEFORE INSERT ON transport_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_transport_order_number();

-- 包船訂單序號
CREATE OR REPLACE FUNCTION generate_yacht_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'YT' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_yacht_order_number ON yacht_orders;
CREATE TRIGGER set_yacht_order_number
    BEFORE INSERT ON yacht_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_yacht_order_number();

-- =============================================
-- 索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_vehicle_packages_active ON vehicle_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicle_packages_sort ON vehicle_packages(sort_order);
CREATE INDEX IF NOT EXISTS idx_yacht_packages_active ON yacht_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_yacht_packages_sort ON yacht_packages(sort_order);
CREATE INDEX IF NOT EXISTS idx_transport_orders_type ON transport_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_transport_orders_status ON transport_orders(status);
CREATE INDEX IF NOT EXISTS idx_transport_orders_payment ON transport_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_transport_orders_created_at ON transport_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yacht_orders_status ON yacht_orders(status);
CREATE INDEX IF NOT EXISTS idx_yacht_orders_payment ON yacht_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_yacht_orders_created_at ON yacht_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yacht_passengers_order_id ON yacht_passengers(yacht_order_id);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE vehicle_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE yacht_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE yacht_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE yacht_passengers ENABLE ROW LEVEL SECURITY;

-- 車型套餐：公開讀取（已啟用的）
DROP POLICY IF EXISTS "Public read vehicle packages" ON vehicle_packages;
CREATE POLICY "Public read vehicle packages" ON vehicle_packages
    FOR SELECT USING (true);

-- 車型套餐：允許所有寫入（服務端使用 service_role_key 繞過）
DROP POLICY IF EXISTS "Service manage vehicle packages" ON vehicle_packages;
CREATE POLICY "Service manage vehicle packages" ON vehicle_packages
    FOR ALL USING (true) WITH CHECK (true);

-- 包船套餐：公開讀取
DROP POLICY IF EXISTS "Public read yacht packages" ON yacht_packages;
CREATE POLICY "Public read yacht packages" ON yacht_packages
    FOR SELECT USING (true);

-- 包船套餐：允許所有寫入
DROP POLICY IF EXISTS "Service manage yacht packages" ON yacht_packages;
CREATE POLICY "Service manage yacht packages" ON yacht_packages
    FOR ALL USING (true) WITH CHECK (true);

-- 交通訂單：完全公開（服務端控制）
DROP POLICY IF EXISTS "Public create transport orders" ON transport_orders;
CREATE POLICY "Public create transport orders" ON transport_orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read transport orders" ON transport_orders;
CREATE POLICY "Public read transport orders" ON transport_orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update transport orders" ON transport_orders;
CREATE POLICY "Public update transport orders" ON transport_orders
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service manage transport orders" ON transport_orders;
CREATE POLICY "Service manage transport orders" ON transport_orders
    FOR ALL USING (true) WITH CHECK (true);

-- 包船訂單：完全公開（服務端控制）
DROP POLICY IF EXISTS "Public create yacht orders" ON yacht_orders;
CREATE POLICY "Public create yacht orders" ON yacht_orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read yacht orders" ON yacht_orders;
CREATE POLICY "Public read yacht orders" ON yacht_orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update yacht orders" ON yacht_orders;
CREATE POLICY "Public update yacht orders" ON yacht_orders
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service manage yacht orders" ON yacht_orders;
CREATE POLICY "Service manage yacht orders" ON yacht_orders
    FOR ALL USING (true) WITH CHECK (true);

-- 包船乘客：完全公開（服務端控制）
DROP POLICY IF EXISTS "Public create yacht passengers" ON yacht_passengers;
CREATE POLICY "Public create yacht passengers" ON yacht_passengers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read yacht passengers" ON yacht_passengers;
CREATE POLICY "Public read yacht passengers" ON yacht_passengers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service manage yacht passengers" ON yacht_passengers;
CREATE POLICY "Service manage yacht passengers" ON yacht_passengers
    FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 種子資料（使用 ON CONFLICT DO NOTHING 確保冪等）
-- =============================================

-- 車型套餐
INSERT INTO vehicle_packages (name, slug, description, image_url, capacity, luggage_count, price_pickup, price_pickup_cny, price_charter_4h, price_charter_6h, price_charter_8h, price_charter_10h, price_charter_full, sort_order, is_active)
VALUES
('舒適轎車', 'sedan', 'Toyota Camry 或同級，適合1-3人，標準行李2件', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', 3, 2, 800.00, 160.00, 1600.00, 2200.00, 2800.00, 3400.00, 4000.00, 1, true),
('商務SUV', 'suv', 'Toyota Fortuner 或同級，適合1-4人，大空間行李3件', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80', 4, 3, 1200.00, 240.00, 2400.00, 3200.00, 4000.00, 4800.00, 5800.00, 2, true),
('保姆車', 'van', 'Toyota Commuter 或同級，適合成團隊，座位7人', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 7, 5, 1800.00, 360.00, 3500.00, 4500.00, 5500.00, 6500.00, 8000.00, 3, true)
ON CONFLICT (slug) DO NOTHING;

-- 包船套餐
INSERT INTO yacht_packages (name, slug, description, image_url, capacity, duration, price, price_cny, price_per_person, includes, sort_order, is_active)
VALUES
('豪華遊艇', 'luxury-yacht', '45尺豪華遊艇，船上設施齊全，適合家庭聚會或朋友派對', 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80', 12, '6小時', 35000.00, 7000.00, 0.00, ARRAY['船長船員', '午餐/晚餐', '水果飲料', '浮潛裝備', '浴巾'], 1, true),
('超級遊艇', 'super-yacht', '60尺超級遊艇，奢華配置，適合高端商務接待或特別慶祝', 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&q=80', 20, '8小時', 65000.00, 13000.00, 0.00, ARRAY['專業船長船員', '精緻餐飲', '香檳紅酒', '浮潛/潛水裝備', '按摩浴缸', '水上玩具'], 2, true),
('私人快艇', 'private-speedboat', '私人快艇，靈活自由，適合小團隊一日遊', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 8, '4小時', 18000.00, 3600.00, 0.00, ARRAY['船長', '簡餐', '水果飲料', '浮潛裝備'], 3, true)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 驗證（執行後可查看此結果確認表已建立）
-- =============================================
SELECT
    'vehicle_packages' AS table_name, COUNT(*) AS row_count FROM vehicle_packages
UNION ALL
SELECT
    'yacht_packages', COUNT(*) FROM yacht_packages
UNION ALL
SELECT
    'transport_orders', COUNT(*) FROM transport_orders
UNION ALL
SELECT
    'yacht_orders', COUNT(*) FROM yacht_orders;
