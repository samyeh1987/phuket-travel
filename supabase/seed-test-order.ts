/**
 * Seed 測試訂單
 * 
 * 使用方式：
 * 1. 確保環境變量 SUPABASE_SERVICE_ROLE_KEY 已設置
 * 2. 運行: npx tsx supabase/seed-test-order.ts
 */

import { createAdminClient } from '../src/lib/supabase-admin';

async function seedTestOrder() {
  console.log('📝 創建測試訂單...');

  const supabase = createAdminClient();

  // 創建測試訂單
  const { data, error } = await supabase
    .from('orders')
    .insert({
      type: 'diving',
      status: 'pending',
      payment_status: 'unpaid',
      contact_name_cn: '測試用戶',
      contact_phone: '1234567890',
      contact_email: 'test@example.com',
      travel_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7天後
      quantity: 2,
      total_price: 1360,
      payment_method: 'alipay',
      extra_data: {
        package_id: 'test-package-id',
        package_name: '體驗深潛',
      },
    })
    .select()
    .single();

  if (error) {
    console.error('❌ 創建失敗:', error);
    process.exit(1);
  }

  console.log('✅ 測試訂單創建成功!');
  console.log('\n📋 訂單詳情:');
  console.log(`   訂單號: ${data.order_number}`);
  console.log(`   ID: ${data.id}`);
  console.log(`   類型: ${data.type}`);
  console.log(`   金額: ¥${data.total_price}`);

  // 再創建一個定制旅行訂單
  console.log('\n📝 創建測試定制旅行訂單...');
  
  const { data: customOrder, error: customError } = await supabase
    .from('orders')
    .insert({
      type: 'custom',
      status: 'pending',
      payment_status: 'unpaid',
      contact_name_cn: '張三',
      contact_phone: '0987654321',
      contact_wechat: 'zhangsan_test',
      contact_email: 'zhangsan@example.com',
      travel_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: 4,
      total_price: 0,
      hotel_name: '普吉島希爾頓酒店',
      contact_status: 'pending_contact',
      extra_data: {
        message: '我想安排一個5天的普吉島行程，包含深潛和跳島游',
      },
    })
    .select()
    .single();

  if (customError) {
    console.error('❌ 定制訂單創建失敗:', customError);
  } else {
    console.log('✅ 定制旅行訂單創建成功!');
    console.log(`   訂單號: ${customOrder.order_number}`);
  }

  console.log('\n✨ 完成! 刷新後台訂單頁面查看測試訂單');
}

seedTestOrder().catch(console.error);
