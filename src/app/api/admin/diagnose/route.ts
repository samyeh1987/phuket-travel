import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = createAdminClient();

  try {
    // Check if price_cny column exists in diving_packages
    const { data: colData, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'diving_packages')
      .eq('column_name', 'price_cny');

    // Try to insert a test record with price_cny and immediately read it back
    const testPayload = {
      name: '__TEST_PRICE_CNY__',
      slug: '__test-price-cny__',
      description: 'Test',
      price: 0,
      price_cny: 999.88,
      type: 'experience',
      duration: 'test',
      is_active: false,
    };

    // First try INSERT with price_cny
    const { data: insertData, error: insertError } = await supabase
      .from('diving_packages')
      .insert(testPayload)
      .select()
      .single();

    // Try UPDATE existing record with price_cny if insert has no error
    let updateTest = null;
    if (!insertError && insertData?.id) {
      const { data: updateData, error: updateError } = await supabase
        .from('diving_packages')
        .update({ price_cny: 888.77 })
        .eq('id', insertData.id)
        .select()
        .single();

      // Delete the test record
      await supabase.from('diving_packages').delete().eq('id', insertData.id);

      updateTest = { updatedValue: updateData?.price_cny, updateError: updateError?.message };
    }

    return NextResponse.json({
      columnExists: colData && colData.length > 0,
      columnQueryError: colError?.message,
      columnData: colData,
      insertTest: {
        insertedPriceCny: insertData?.price_cny,
        insertError: insertError?.message,
        fullInsertData: insertData,
      },
      updateTest,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
