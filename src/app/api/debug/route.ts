import { NextResponse } from 'next/server';

// Debug endpoint to check Supabase connection
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
    },
    tests: {} as any,
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      ...results,
      error: 'Missing environment variables',
    }, { status: 500 });
  }

  // Test 1: Direct fetch to Supabase REST API
  try {
    const testUrl = `${supabaseUrl}/rest/v1/diving_packages?select=*&limit=1`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    });

    results.tests.directFetch = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
    };

    if (response.ok) {
      const data = await response.json();
      results.tests.directFetch.dataCount = Array.isArray(data) ? data.length : 'not array';
    }
  } catch (e: any) {
    results.tests.directFetch = {
      success: false,
      error: e.message,
      errorType: e.constructor.name,
    };
  }

  // Test 2: Using @supabase/supabase-js
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from('diving_packages')
      .select('*')
      .limit(1);

    results.tests.supabaseJs = {
      success: !error,
      error: error?.message,
      dataCount: data?.length,
    };
  } catch (e: any) {
    results.tests.supabaseJs = {
      success: false,
      error: e.message,
      errorType: e.constructor.name,
      stack: e.stack?.split('\n').slice(0, 3),
    };
  }

  // Test 3: Check if URL is valid
  try {
    const url = new URL(supabaseUrl);
    results.tests.urlValidation = {
      valid: true,
      protocol: url.protocol,
      hostname: url.hostname,
    };
  } catch (e: any) {
    results.tests.urlValidation = {
      valid: false,
      error: e.message,
    };
  }

  return NextResponse.json(results);
}
