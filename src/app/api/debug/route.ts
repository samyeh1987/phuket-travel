import { createAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

// Debug endpoint to check Supabase connection
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Test all tables
    const results: Record<string, { count: number; error?: string; sample?: any }> = {};

    const tables = ['diving_packages', 'shows', 'islands', 'island_boats', 'show_packages'];

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(2);

        results[table] = {
          count: count || (data?.length || 0),
          error: error?.message,
          sample: data?.slice(0, 1),
        };
      } catch (e: any) {
        results[table] = { count: 0, error: e.message };
      }
    }

    return NextResponse.json({
      status: 'ok',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      results,
    });
  } catch (e: any) {
    return NextResponse.json({
      status: 'error',
      error: e.message,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }, { status: 500 });
  }
}
