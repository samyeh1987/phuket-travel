import { NextResponse } from 'next/server';

// Comprehensive debug endpoint
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    vercelEnv: process.env.VERCEL?.toString(),
    region: process.env.VERCEL_REGION,
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
    },
    tests: {},
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    results.error = 'Missing environment variables';
    return NextResponse.json(results, { status: 500 });
  }

  // Test 1: Basic external fetch (Google)
  try {
    const googleResponse = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    results.tests.googleFetch = {
      success: googleResponse.ok,
      status: googleResponse.status,
    };
  } catch (e: any) {
    results.tests.googleFetch = {
      success: false,
      error: e.message,
      errorType: e.constructor.name,
    };
  }

  // Test 2: Supabase REST API direct
  try {
    const testUrl = `${supabaseUrl}/rest/v1/?limit=1`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });
    results.tests.supabaseRest = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (e: any) {
    results.tests.supabaseRest = {
      success: false,
      error: e.message,
      errorType: e.constructor.name,
    };
  }

  // Test 3: DNS resolution test
  try {
    const dns = await import('dns').then(m => m.promises);
    const addresses = await dns.resolve4('jtzqnvnsvcnqmujeaduj.supabase.co');
    results.tests.dnsResolution = {
      success: true,
      addresses,
    };
  } catch (e: any) {
    results.tests.dnsResolution = {
      success: false,
      error: e.message,
      code: e.code,
    };
  }

  // Test 4: HTTPS module test (bypasses fetch restrictions)
  try {
    const https = await import('https');
    const urlObj = new URL(supabaseUrl);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: '/rest/v1/diving_packages?limit=1',
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const httpsResult = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            bodyPreview: data.substring(0, 200),
          });
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
      req.end();
    });

    results.tests.httpsModule = {
      success: true,
      result: httpsResult,
    };
  } catch (e: any) {
    results.tests.httpsModule = {
      success: false,
      error: e.message,
      errorType: e.constructor.name,
    };
  }

  // Test 5: Supabase JS library
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.from('diving_packages').select('*').limit(1);
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
    };
  }

  // Determine root cause
  if (results.tests.googleFetch?.success === false) {
    results.diagnosis = 'Vercel cannot make ANY outbound HTTP requests - network restriction';
  } else if (results.tests.httpsModule?.success === true) {
    results.diagnosis = 'fetch() is blocked but https module works - workaround available';
  } else if (results.tests.dnsResolution?.success === false) {
    results.diagnosis = 'DNS resolution failed - check Supabase project status';
  } else {
    results.diagnosis = 'Unknown network issue - check Supabase project status';
  }

  return NextResponse.json(results);
}
