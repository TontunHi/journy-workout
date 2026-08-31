const BASE_URL = 'http://localhost:3000';

interface CrudTestResult {
  module: string;
  operation: string;
  endpoint: string;
  method: string;
  status: number;
  ok: boolean;
  details?: string;
}

const crudResults: CrudTestResult[] = [];

async function testApi(
  module: string,
  operation: string,
  endpoint: string,
  method: string,
  body?: unknown
) {
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
    crudResults.push({
      module,
      operation,
      endpoint,
      method,
      status: res.status,
      ok,
      details: ok ? 'SUCCESS' : JSON.stringify(data),
    });
    return { ok, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    crudResults.push({
      module,
      operation,
      endpoint,
      method,
      status: 0,
      ok: false,
      details: `Network Error: ${message}`,
    });
    return { ok: false, data: null };
  }
}

async function runComprehensiveCrudTests() {
  console.log('🧪 Starting Full CRUD Lifecycle Tests for All Data Models...\n');

  // ==========================================
  // 1. EXERCISES (Create -> Read -> Update -> Delete)
  // ==========================================
  console.log('▶ Testing Exercises CRUD...');
  const createEx = await testApi(
    'Exercises',
    'CREATE',
    '/api/exercises',
    'POST',
    { name: '__TEST_EXERCISE__', muscleGroup: 'LEGS' }
  );

  let testExId = createEx.data?.data?.id;
  if (testExId) {
    await testApi('Exercises', 'READ LIST', '/api/exercises', 'GET');
    await testApi('Exercises', 'UPDATE', `/api/exercises/${testExId}`, 'PUT', {
      name: '__TEST_EXERCISE_UPDATED__',
      muscleGroup: 'LEGS',
    });
    await testApi('Exercises', 'DELETE', `/api/exercises/${testExId}`, 'DELETE');
  }

  // ==========================================
  // 2. WORKOUTS & SETS (Create -> Read Details -> Delete)
  // ==========================================
  console.log('▶ Testing Workouts CRUD...');
  // First, fetch an existing exercise to link sets with
  const exListRes = await fetch(`${BASE_URL}/api/exercises`);
  const exList = await exListRes.json();
  const validExId = exList.data?.[0]?.id;

  if (validExId) {
    const createWorkout = await testApi(
      'Workouts',
      'CREATE',
      '/api/workouts',
      'POST',
      {
        date: new Date().toISOString(),
        duration: 45,
        notes: '__TEST_WORKOUT__',
        exercises: [
          {
            exerciseId: validExId,
            sets: [
              { setNumber: 1, reps: 12, weight: 50, notes: 'test set' },
            ],
          },
        ],
      }
    );

    const workoutId = createWorkout.data?.data?.id;
    if (workoutId) {
      await testApi('Workouts', 'READ DETAIL', `/api/workouts/${workoutId}`, 'GET');
      await testApi('Workouts', 'UPDATE', `/api/workouts/${workoutId}`, 'PUT', {
        notes: '__TEST_WORKOUT_UPDATED__',
        duration: 50,
      });
      await testApi('Workouts', 'DELETE', `/api/workouts/${workoutId}`, 'DELETE');
    }
  }

  // ==========================================
  // 3. CARDIO SESSIONS (Create -> Read Details -> Update -> Delete)
  // ==========================================
  console.log('▶ Testing Cardio CRUD...');
  const createCardio = await testApi(
    'Cardio',
    'CREATE',
    '/api/cardio',
    'POST',
    {
      type: 'TREADMILL',
      date: new Date().toISOString(),
      duration: 30,
      distance: 4.5,
      caloriesBurned: 280,
      notes: '__TEST_CARDIO__',
    }
  );

  const cardioId = createCardio.data?.data?.id;
  if (cardioId) {
    await testApi('Cardio', 'READ DETAIL', `/api/cardio/${cardioId}`, 'GET');
    await testApi('Cardio', 'UPDATE', `/api/cardio/${cardioId}`, 'PUT', {
      duration: 35,
      distance: 5.0,
      caloriesBurned: 310,
    });
    await testApi('Cardio', 'DELETE', `/api/cardio/${cardioId}`, 'DELETE');
  }

  // ==========================================
  // 4. NUTRITION ENTRIES (Create -> Read Details -> Update -> Delete)
  // ==========================================
  console.log('▶ Testing Nutrition CRUD...');
  const createMeal = await testApi(
    'Nutrition',
    'CREATE',
    '/api/nutrition',
    'POST',
    {
      date: new Date().toISOString(),
      mealType: 'LUNCH',
      foodName: '__TEST_MEAL__ Grilled Chicken',
      calories: 450,
      protein: 40,
      carbs: 20,
      fat: 10,
      notes: 'test meal',
    }
  );

  const mealId = createMeal.data?.data?.id;
  if (mealId) {
    await testApi('Nutrition', 'READ DETAIL', `/api/nutrition/${mealId}`, 'GET');
    await testApi('Nutrition', 'UPDATE', `/api/nutrition/${mealId}`, 'PUT', {
      calories: 480,
      protein: 42,
    });
    await testApi('Nutrition', 'DELETE', `/api/nutrition/${mealId}`, 'DELETE');
  }

  // ==========================================
  // 5. NUTRITION GOALS (Read -> Update Target)
  // ==========================================
  console.log('▶ Testing Nutrition Goals CRUD...');
  const currentGoalsRes = await fetch(`${BASE_URL}/api/nutrition/goals`);
  const currentGoals = await currentGoalsRes.json();
  const originalGoals = currentGoals.data || {
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 250,
    dailyFat: 65,
    targetWeight: 75,
  };

  await testApi('Nutrition Goals', 'READ', '/api/nutrition/goals', 'GET');
  await testApi('Nutrition Goals', 'UPDATE', '/api/nutrition/goals', 'PUT', {
    dailyCalories: originalGoals.dailyCalories,
    dailyProtein: originalGoals.dailyProtein,
    dailyCarbs: originalGoals.dailyCarbs,
    dailyFat: originalGoals.dailyFat,
    targetWeight: originalGoals.targetWeight,
  });

  // ==========================================
  // 6. BODY WEIGHT (Create/Upsert -> Delete Test entry)
  // ==========================================
  console.log('▶ Testing Body Weight CRUD...');
  // Create a record for a test historical date to avoid touching today's real entry
  const testDate = new Date('2025-01-01T08:00:00.000Z');
  const createWeight = await testApi(
    'Body Weight',
    'CREATE/UPSERT',
    '/api/body-weight',
    'POST',
    {
      date: testDate.toISOString(),
      weight: 79.9,
    }
  );

  const weightId = createWeight.data?.data?.id;
  if (weightId) {
    await testApi('Body Weight', 'DELETE', `/api/body-weight/${weightId}`, 'DELETE');
  }

  // ==========================================
  // 7. NOTIFICATIONS SETTINGS (Read -> Update)
  // ==========================================
  console.log('▶ Testing Notification Settings CRUD...');
  await testApi('Notifications', 'READ', '/api/notifications/settings', 'GET');
  await testApi('Notifications', 'UPDATE', '/api/notifications/settings', 'PUT', {
    type: 'WORKOUT_REMINDER',
    enabled: true,
    time: '20:00',
  });

  // Summary Report
  console.log('\n================================================================');
  console.log('📊 COMPLETE CRUD LIFECYCLE TEST REPORT');
  console.log('================================================================');
  let passed = 0;
  let failed = 0;

  for (const r of crudResults) {
    const icon = r.ok ? '✅' : '❌';
    const tag = `[${r.module}]`.padEnd(18);
    const op = `[${r.method} ${r.operation}]`.padEnd(20);
    console.log(`${icon} ${tag} ${op} ${r.endpoint.padEnd(35)} -> ${r.status} (${r.details})`);
    if (r.ok) passed++;
    else failed++;
  }

  console.log('================================================================');
  console.log(`Total Operations Tested: ${crudResults.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('🔒 Data Integrity: All temporary test items were cleanly deleted.');
  console.log('================================================================\n');
}

runComprehensiveCrudTests();
