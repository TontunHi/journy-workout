const BASE_URL = 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  ok: boolean;
  notes: string;
}

const results: TestResult[] = [];

async function testEndpoint(endpoint: string, method: string = 'GET', body?: unknown) {
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    const ok = res.status >= 200 && res.status < 300;
    results.push({
      endpoint,
      method,
      status: res.status,
      ok,
      notes: ok ? 'PASS' : `FAIL: ${JSON.stringify(data)}`,
    });
    return { ok, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    results.push({
      endpoint,
      method,
      status: 0,
      ok: false,
      notes: `Network/Fetch Error: ${message}`,
    });
    return { ok: false, data: null };
  }
}

async function runAllTests() {
  console.log('🚀 Starting Safe API Endpoints Test Suite (Zero Data Destruction)...\n');

  // 1. Core Resources (GET)
  await testEndpoint('/api/exercises');
  await testEndpoint('/api/workouts');
  await testEndpoint('/api/cardio');
  await testEndpoint('/api/nutrition');
  await testEndpoint('/api/nutrition/goals');
  await testEndpoint('/api/body-weight');
  await testEndpoint('/api/streaks');

  // 2. Stats & Analytics Endpoints (GET)
  await testEndpoint('/api/stats/dashboard');
  await testEndpoint('/api/stats/heatmap');
  await testEndpoint('/api/stats/progressive-overload');
  await testEndpoint('/api/stats/volume');
  await testEndpoint('/api/stats/cardio-summary');
  await testEndpoint('/api/stats/macros');
  await testEndpoint('/api/stats/calories');
  await testEndpoint('/api/stats/body-weight-trend');
  await testEndpoint('/api/stats/personal-records');

  // 3. Notification Settings (GET)
  await testEndpoint('/api/notifications/settings');

  // 4. Safe Verification of CRUD flow (Create -> Verify -> Clean up ONLY the test item)
  console.log('\n🧪 Testing Controlled Create & Clean-up of Test Exercise...');
  const createExRes = await testEndpoint('/api/exercises', 'POST', {
    name: 'Temporary Test Exercise',
    muscleGroup: 'CHEST',
  });

  if (createExRes.ok && createExRes.data?.data?.id) {
    const testId = createExRes.data.data.id;
    // Test PUT
    await testEndpoint(`/api/exercises/${testId}`, 'PUT', {
      name: 'Temporary Test Exercise Updated',
      muscleGroup: 'CHEST',
    });
    // Test DELETE
    await testEndpoint(`/api/exercises/${testId}`, 'DELETE');
  }

  // Summary Report
  console.log('\n======================================================');
  console.log('📊 API ENDPOINTS TEST RESULTS');
  console.log('======================================================');
  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} [${r.method}] ${r.endpoint.padEnd(35)} -> Status: ${r.status} (${r.notes})`);
    if (r.ok) passed++;
    else failed++;
  }

  console.log('======================================================');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('🔒 Note: Existing database data was preserved 100% without wiping.');
  console.log('======================================================\n');
}

runAllTests();
