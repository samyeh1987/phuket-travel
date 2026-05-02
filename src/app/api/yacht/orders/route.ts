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
      .from('yacht_orders')
      .select('*, yacht_passengers(*)')
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
      console.error('Error fetching yacht order:', error);
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
      yacht_package_id,
      yacht_name,
      charter_date,
      passenger_count,
      total_price,
      main_passenger_name,
      main_passenger_phone,
      main_passenger_wechat,
      main_passenger_passport,
      main_passenger_birthday,
      hotel_name,
      hotel_address,
      boarding_location,
      notes,
      passengers, // array of { name, passport, is_child }
      user_id
    } = body;

    // 先創建訂單
    const { data: order, error: orderError } = await supabase
      .from('yacht_orders')
      .insert({
        yacht_package_id,
        yacht_name,
        charter_date,
        passenger_count,
        total_price,
        main_passenger_name,
        main_passenger_phone,
        main_passenger_wechat,
        main_passenger_passport,
        main_passenger_birthday,
        hotel_name,
        hotel_address,
        boarding_location,
        notes,
        user_id
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating yacht order:', orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 如果有同行乘客，一併創建
    if (passengers && passengers.length > 0) {
      const passengerRecords = passengers.map((p: any, index: number) => ({
        yacht_order_id: order.id,
        passenger_name: p.name,
        passport_number: p.passport,
        is_child: p.is_child || false,
        sort_order: index + 1
      }));

      const { error: passengerError } = await supabase
        .from('yacht_passengers')
        .insert(passengerRecords);

      if (passengerError) {
        console.error('Error creating yacht passengers:', passengerError);
      }
    }

    return NextResponse.json({ data: order });
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
      .from('yacht_orders')
      .update(body)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating yacht order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
