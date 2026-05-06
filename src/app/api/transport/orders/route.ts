import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const orderNumber = searchParams.get('order_number');
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('transport_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (orderId) {
      query = query.eq('id', orderId);
    } else if (orderNumber) {
      query = query.eq('order_number', orderNumber);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error fetching transport order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data?.[0] || null });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const {
      order_type,
      vehicle_package_id,
      vehicle_name,
      charter_hours,
      flight_number,
      flight_date,
      flight_time,
      charter_date,
      charter_start_time,
      charter_end_time,
      total_price,
      passenger_name,
      passenger_phone,
      passenger_wechat,
      hotel_name,
      hotel_address,
      pickup_location,
      dropoff_location,
      notes,
      user_id
    } = body;

    // 決定服務日期
    const travel_date = order_type === 'charter' ? charter_date : flight_date;

    // 決定服務類型標籤
    const orderTypeLabel = order_type === 'pickup' ? '接機' : order_type === 'dropoff' ? '送機' : '包車';

    // 1. 先寫入主 orders 表（供付款頁使用）
    const { data: mainOrder, error: mainOrderError } = await supabase
      .from('orders')
      .insert({
        type: 'transport',
        travel_date,
        total_price,
        contact_name_cn: passenger_name,
        contact_phone: passenger_phone,
        contact_wechat: passenger_wechat,
        hotel_name,
        hotel_address,
        notes,
        user_id,
        payment_status: 'unpaid',
        extra_data: {
          order_type,
          vehicle_name,
          vehicle_package_id,
          charter_hours,
          flight_number,
          flight_date,
          flight_time,
          charter_date,
          charter_start_time,
          charter_end_time,
          pickup_location,
          dropoff_location,
          service_label: orderTypeLabel,
        }
      })
      .select()
      .single();

    if (mainOrderError) {
      console.error('Error creating main order for transport:', mainOrderError);
      // 若主表寫入失敗，仍繼續寫獨立表，但 ID 改用獨立表的
    }

    // 2. 寫入 transport_orders 獨立表（後台管理用）
    const { data: transportOrder, error } = await supabase
      .from('transport_orders')
      .insert({
        order_type,
        vehicle_package_id,
        vehicle_name,
        charter_hours,
        flight_number,
        flight_date,
        flight_time,
        charter_date,
        charter_start_time,
        charter_end_time,
        total_price,
        passenger_name,
        passenger_phone,
        passenger_wechat,
        hotel_name,
        hotel_address,
        pickup_location,
        dropoff_location,
        notes,
        user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transport order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 回傳主表 ID（供付款頁跳轉），若主表失敗則回傳獨立表 ID
    const responseData = {
      ...transportOrder,
      id: mainOrder?.id || transportOrder.id,
      order_number: mainOrder?.order_number || transportOrder.order_number,
    };

    return NextResponse.json({ data: responseData });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const body = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('transport_orders')
      .update(body)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transport order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
