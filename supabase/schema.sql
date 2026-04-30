-- =============================================
-- 泰嗨了普吉旅行 - Supabase Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Tables
-- =============================================

-- 会员/用户资料（关联 auth.users）
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    name_cn VARCHAR(100),
    name_en VARCHAR(100),
    phone VARCHAR(50),
    wechat VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 关联 orders 表增加 user_id 字段（让用户能查自己的订单）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 管理员用户
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 首页 Banner
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    link_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 深潜套餐
CREATE TABLE diving_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    price_cny DECIMAL(10, 2), -- 人民币价格
    type VARCHAR(50) NOT NULL, -- 'experience', 'ow', 'aow', 'free2', 'free3'
    duration VARCHAR(100), -- e.g., '2小时', '3天课程'
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 岛屿
CREATE TABLE islands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 船只
CREATE TABLE island_boats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    island_id UUID REFERENCES islands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    itinerary TEXT,
    price DECIMAL(10, 2) NOT NULL,
    price_cny DECIMAL(10, 2), -- 人民币价格
    images TEXT[], -- Array of image URLs
    departure_time VARCHAR(100),
    duration VARCHAR(100),
    includes TEXT[], -- Array of included items
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 秀场
CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 秀场套餐
CREATE TABLE show_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    price_cny DECIMAL(10, 2), -- 人民币价格
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单（统一表）
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'custom', 'diving_experience', 'diving_cert', 'island', 'show'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'confirmed', 'cancelled'

    -- 预订信息
    travel_date DATE,
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2),

    -- 联系人
    contact_name_cn VARCHAR(100),
    contact_name_en VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_wechat VARCHAR(100),

    -- 酒店信息（跳岛游）
    hotel_name VARCHAR(255),
    hotel_address TEXT,

    -- 付款信息
    payment_method VARCHAR(50), -- 'alipay', 'wechat', 'thai_qr'
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- 'unpaid', 'pending_review', 'paid', 'rejected'
    payment_proof_url TEXT, -- 凭证图片URL
    paid_at TIMESTAMP WITH TIME ZONE, -- 付款时间
    reviewed_by UUID, -- 审核人ID
    reviewed_at TIMESTAMP WITH TIME ZONE, -- 审核时间

    -- 额外信息
    extra_data JSONB, -- 存储套餐ID等

    -- 客服信息
    customer_service_notes TEXT,

    -- 联系状态（定制旅行专用）: 'pending_contact', 'contacted'
    contact_status VARCHAR(50) DEFAULT 'pending_contact',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 财务流水表
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    order_number VARCHAR(50),
    order_type VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'alipay', 'wechat', 'thai_qr'
    transaction_ref VARCHAR(100), -- 流水号/备注
    proof_url TEXT,
    status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'refunded'
    admin_id UUID REFERENCES admin_users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单出行人
CREATE TABLE order_travelers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    name_cn VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    passport_number VARCHAR(50),
    birthday DATE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统设置
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_orders_type ON orders(type);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_contact_status ON orders(contact_status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_travelers_order_id ON order_travelers(order_id);
CREATE INDEX idx_diving_packages_type ON diving_packages(type);
CREATE INDEX idx_island_boats_island_id ON island_boats(island_id);
CREATE INDEX idx_show_packages_show_id ON show_packages(show_id);
CREATE INDEX idx_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON payment_transactions(status);

-- =============================================
-- 字段迁移（已有表新增 price_cny 字段）
-- =============================================

ALTER TABLE diving_packages ADD COLUMN IF NOT EXISTS price_cny DECIMAL(10, 2);
ALTER TABLE island_boats ADD COLUMN IF NOT EXISTS price_cny DECIMAL(10, 2);
ALTER TABLE show_packages ADD COLUMN IF NOT EXISTS price_cny DECIMAL(10, 2);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE diving_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE island_boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Admin: Full access for authenticated admins
CREATE POLICY "Admin full access" ON admin_users
    FOR ALL USING (auth.role() = 'authenticated');

-- Public: Read banners
CREATE POLICY "Public read banners" ON banners
    FOR SELECT USING (is_active = true);

-- Admin: Manage banners
CREATE POLICY "Admin manage banners" ON banners
    FOR ALL USING (auth.role() = 'authenticated');

-- Public: Read diving packages
CREATE POLICY "Public read diving packages" ON diving_packages
    FOR SELECT USING (is_active = true);

-- Admin: Manage diving packages
CREATE POLICY "Admin manage diving packages" ON diving_packages
    FOR ALL USING (auth.role() = 'authenticated');

-- Public: Read islands
CREATE POLICY "Public read islands" ON islands
    FOR SELECT USING (is_active = true);

-- Admin: Manage islands
CREATE POLICY "Admin manage islands" ON islands
    FOR ALL USING (auth.role() = 'authenticated');

-- Public: Read boats
CREATE POLICY "Public read boats" ON island_boats
    FOR SELECT USING (is_active = true);

-- Admin: Manage boats
CREATE POLICY "Admin manage boats" ON island_boats
    FOR ALL USING (auth.role() = 'authenticated');

-- Public: Read shows
CREATE POLICY "Public read shows" ON shows
    FOR SELECT USING (is_active = true);

-- Admin: Manage shows
CREATE POLICY "Admin manage shows" ON shows
    FOR ALL USING (auth.role() = 'authenticated');

-- Public: Read show packages
CREATE POLICY "Public read show packages" ON show_packages
    FOR SELECT USING (is_active = true);

-- Admin: Manage show packages
CREATE POLICY "Admin manage show packages" ON show_packages
    FOR ALL USING (auth.role() = 'authenticated');

-- Public: Create orders (no auth required for booking)
CREATE POLICY "Public create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Public: Read own orders (by order number)
CREATE POLICY "Public read orders" ON orders
    FOR SELECT USING (true);

-- Public: Update orders (for payment proof upload)
CREATE POLICY "Public update orders" ON orders
    FOR UPDATE USING (true);

-- Admin: Full access to orders
CREATE POLICY "Admin manage orders" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Public: Create travelers
CREATE POLICY "Public create travelers" ON order_travelers
    FOR INSERT WITH CHECK (true);

-- Public: Read travelers
CREATE POLICY "Public read travelers" ON order_travelers
    FOR SELECT USING (true);

-- Admin: Manage travelers
CREATE POLICY "Admin manage travelers" ON order_travelers
    FOR ALL USING (auth.role() = 'authenticated');

-- Public: Read settings
CREATE POLICY "Public read settings" ON system_settings
    FOR SELECT USING (true);

-- Admin: Manage settings
CREATE POLICY "Admin manage settings" ON system_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Payment transactions: Public can read, Admin can manage
CREATE POLICY "Public read transactions" ON payment_transactions
    FOR SELECT USING (true);

CREATE POLICY "Admin manage transactions" ON payment_transactions
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- Storage Buckets
-- =============================================

-- Enable storage extension if not exists
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('payment-proofs', 'payment-proofs', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public upload payment proofs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Public read payment proofs" ON storage.objects
    FOR SELECT USING (bucket_id = 'payment-proofs');

CREATE POLICY "Admin manage payment proofs" ON storage.objects
    FOR ALL USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

-- =============================================
-- Functions
-- =============================================

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'PT' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order number
CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diving_packages_updated_at BEFORE UPDATE ON diving_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_islands_updated_at BEFORE UPDATE ON islands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_island_boats_updated_at BEFORE UPDATE ON island_boats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_show_packages_updated_at BEFORE UPDATE ON show_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Seed Data (Demo)
-- =============================================

-- Admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name) VALUES
('admin@phukettravel.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Admin');

-- Banners
INSERT INTO banners (title, image_url, link_url, sort_order) VALUES
('欢迎来到普吉', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', '/custom-trip', 1),
('深潜体验', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80', '/diving', 2),
('跳岛一日游', 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1920&q=80', '/island-tour', 3);

-- 深潜套餐
INSERT INTO diving_packages (name, slug, description, price, price_cny, type, duration, sort_order) VALUES
('体验深潜', 'experience', '无需潜水证，专业教练带你体验海底世界的美妙', 680.00, 135.00, 'experience', '2-3小时', 1),
('水肺OW考证', 'ow', 'PADI开放水域潜水员课程，全球通用潜水证', 2800.00, 560.00, 'ow', '3-4天课程', 2),
('水肺AOW考证', 'aow', 'PADI进阶开放水域潜水员课程，探索更深海域', 2200.00, 440.00, 'aow', '2-3天课程', 3),
('自由潜2星', 'free2', 'PADI自由潜基础课程，探索自由潜水的魅力', 1800.00, 360.00, 'free2', '2天课程', 4),
('自由潜3星', 'free3', 'PADI自由潜进阶课程，下潜更深更远', 2500.00, 500.00, 'free3', '3天课程', 5);

-- 岛屿
INSERT INTO islands (name, slug, description, image_url, sort_order) VALUES
('皇帝岛', 'racha', '距离普吉岛仅12公里，水质清澈透亮，是浮潜和深潜的绝佳之地', 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80', 1),
('皮皮岛', 'pp', '由大皮皮岛和小皮皮岛组成，是电影《海滩》的取景地', 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80', 2),
('斯米兰', 'similan', '世界十大潜水圣地之一，每年仅开放半年，错过等一年', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 3);

-- 船只 (皇帝岛)
INSERT INTO island_boats (island_id, name, description, itinerary, price, price_cny, images, departure_time, duration, includes, sort_order)
SELECT id, '豪华双体帆船', '乘坐豪华双体帆船前往皇帝岛，享受私密舒适的海上时光',
'07:30 酒店接载\n08:30 码头出发\n10:00 抵达皇帝岛，浮潜\n12:00 船上享用午餐\n13:30 皇帝岛自由活动\n15:30 返回码头\n17:00 送回酒店',
780.00, 156.00,
ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80'],
'08:30', '约9小时',
ARRAY['酒店接送', '午餐', '水果饮料', '浮潜装备', '英文导游'],
1
FROM islands WHERE slug = 'racha';

INSERT INTO island_boats (island_id, name, description, itinerary, price, price_cny, images, departure_time, duration, includes, sort_order)
SELECT id, '快艇经典游', '经济实惠的快艇一日游，适合预算有限的朋友',
'08:00 酒店接载\n09:00 码头出发\n10:30 皇帝岛浮潜\n12:00 午餐\n13:30 皇帝岛自由活动\n15:00 返回\n16:30 送回酒店',
480.00, 96.00,
ARRAY['https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80'],
'09:00', '约8.5小时',
ARRAY['酒店接送', '午餐', '浮潜装备'],
2
FROM islands WHERE slug = 'racha';

-- 船只 (皮皮岛)
INSERT INTO island_boats (island_id, name, description, itinerary, price, price_cny, images, departure_time, duration, includes, sort_order)
SELECT id, 'VIP私人游艇', '高端私人游艇，最多8人，尊享私密体验',
'07:30 酒店接载\n08:30 私人游艇出发\n10:30 抵达小皮皮岛，游览玛雅湾\n12:00 船上精致午餐\n13:30 竹子岛/蚊子岛浮潜\n15:30 返程\n17:00 送回酒店',
1280.00, 256.00,
ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'],
'08:30', '约9.5小时',
ARRAY['酒店接送', '精致午餐', '水果香槟', '浮潜装备', 'SUP立式划板', '中文导游'],
1
FROM islands WHERE slug = 'pp';

INSERT INTO island_boats (island_id, name, description, itinerary, price, images, departure_time, duration, includes, sort_order)
SELECT id, '经典大船', '大船出行，平稳舒适，适合带老人小孩',
'08:00 酒店接载\n08:30 大船出发\n10:30 抵达皮皮岛\n12:00 午餐\n13:30 自由活动/浮潜\n15:30 返程\n17:00 送回酒店',
580.00, 116.00,
ARRAY['https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80'],
'08:30', '约9小时',
ARRAY['酒店接送', '午餐', '浮潜装备'],
2
FROM islands WHERE slug = 'pp';

-- 船只 (斯米兰)
INSERT INTO island_boats (island_id, name, description, itinerary, price, price_cny, images, departure_time, duration, includes, sort_order)
SELECT id, '精品小团船', '小团体出行，最多20人，深入探索斯米兰',
'05:00 酒店接载\n06:00 码头出发\n08:00 抵达斯米兰4号岛，开始第一次浮潜\n10:00 斯米兰9号岛，第二次浮潜\n12:00 船上午餐\n13:30 斯米兰8号岛，主岛游览\n15:00 斯米兰7号岛，第三次浮潜\n16:00 返程\n18:30 送回酒店',
980.00, 196.00,
ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80'],
'06:00', '约12.5小时',
ARRAY['酒店接送', '午餐', '水果饮料', '浮潜装备', '国家公园费', '中文导游'],
1
FROM islands WHERE slug = 'similan';

-- 秀场
INSERT INTO shows (name, slug, description, image_url, sort_order) VALUES
('天皇秀', 'kawaii', '泰国最著名的人妖秀之一，表演精彩绝伦，服装华丽', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', 1),
('西蒙秀', 'simon', '世界闻名的变装歌舞秀，演员阵容强大，舞台效果震撼', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', 2);

-- 秀场套餐 (天皇秀)
INSERT INTO show_packages (show_id, name, description, price, price_cny, sort_order)
SELECT id, 'VIP座位', '最佳观赏位置，近距离观看表演', 480.00, 96.00, 1
FROM shows WHERE slug = 'kawaii';

INSERT INTO show_packages (show_id, name, description, price, price_cny, sort_order)
SELECT id, '普通座位', '普通观赏区，性价比高', 380.00, 76.00, 2
FROM shows WHERE slug = 'kawaii';

-- 秀场套餐 (西蒙秀)
INSERT INTO show_packages (show_id, name, description, price, price_cny, sort_order)
SELECT id, 'VIP座位+接送', 'VIP座位，含酒店往返接送', 680.00, 136.00, 1
FROM shows WHERE slug = 'simon';

INSERT INTO show_packages (show_id, name, description, price, price_cny, sort_order)
SELECT id, 'VIP座位', '最佳观赏位置', 480.00, 96.00, 2
FROM shows WHERE slug = 'simon';

INSERT INTO show_packages (show_id, name, description, price, price_cny, sort_order)
SELECT id, '普通座位', '普通观赏区', 380.00, 76.00, 3
FROM shows WHERE slug = 'simon';

-- 系统设置
INSERT INTO system_settings (key, value, description) VALUES
('wechat', '', '客服微信号'),
('whatsapp', '', 'WhatsApp号码'),
('phone', '', '联系电话'),
('email', '', '邮箱'),
('service_qr', '', '客服二维码URL'),
('service_wechat_qr', '', '客服微信二维码URL'),
('service_line_qr', '', '客服Line二维码URL'),
('alipay_qr', '', '支付宝收款码URL'),
('wechat_qr', '', '微信收款码URL'),
('thai_qr', '', '泰国QR码收款URL');
