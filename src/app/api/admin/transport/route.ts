import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('vehicle_packages')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching vehicle packages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
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
      name,
      slug,
      description,
      image_url,
      capacity,
      luggage_count,
      price_pickup,
      price_pickup_cny,
      price_charter_4h,
      price_charter_6h,
      price_charter_8h,
      price_charter_10h,
      price_charter_full,
      sort_order,
      is_active
    } = body;

    const { data, error } = await supabase
      .from('vehicle_packages')
      .insert({
        name,
        slug,
        description,
        image_url,
        capacity,
        luggage_count,
        price_pickup,
        price_pickup_cny,
        price_charter_4h,
        price_charter_6h,
        price_charter_8h,
        price_charter_10h,
        price_charter_full,
        sort_order: sort_order || 0,
        is_active: is_active !== false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle package:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const {
      id,
      name,
      slug,
      description,
      image_url,
      capacity,
      luggage_count,
      price_pickup,
      price_pickup_cny,
      price_charter_4h,
      price_charter_6h,
      price_charter_8h,
      price_charter_10h,
      price_charter_full,
      sort_order,
      is_active
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('vehicle_packages')
      .update({
        name,
        slug,
        description,
        image_url,
        capacity,
        luggage_count,
        price_pickup,
        price_pickup_cny,
        price_charter_4h,
        price_charter_6h,
        price_charter_8h,
        price_charter_10h,
        price_charter_full,
        sort_order,
        is_active
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle package:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('vehicle_packages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle package:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
