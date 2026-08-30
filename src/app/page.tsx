'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Activity, Utensils, Settings } from 'lucide-react';

interface Macro {
  current: number;
  goal: number;
}

interface ActivityItem {
  id: number;
  type: 'workout' | 'meal' | 'cardio';
  title: string;
  time: string;
}

interface Stats {
  workoutStreak: number;
  nutritionStreak: number;
  calories: Macro;
  macros: {
    protein: Macro;
    carbs: Macro;
    fat: Macro;
  };
  recentActivity: ActivityItem[];
}

export default function Page() {
  const [stats] = useState<Stats | null>({
    workoutStreak: 3,
    nutritionStreak: 5,
    calories: { current: 1500, goal: 2500 },
    macros: {
      protein: { current: 120, goal: 160 },
      carbs: { current: 150, goal: 250 },
      fat: { current: 45, goal: 70 },
    },
    recentActivity: [
      { id: 1, type: 'workout', title: 'Upper Body', time: '2 hours ago' },
      { id: 2, type: 'meal', title: 'Chicken Salad', time: '4 hours ago' },
      { id: 3, type: 'cardio', title: 'Morning Run (5km)', time: 'Yesterday' },
    ],
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  if (!stats) return <div className="p-6 text-center text-slate-400">Loading...</div>;

  return (
    <main className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{getGreeting()}</h1>
          <p className="text-slate-400 text-sm">{today}</p>
        </div>
        <Link href="/settings" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-emerald-500">
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-xl font-bold text-slate-100">{stats.workoutStreak} Days</div>
          <div className="text-xs text-slate-400">Workout Streak</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-2xl mb-1">🥗</div>
          <div className="text-xl font-bold text-slate-100">{stats.nutritionStreak} Days</div>
          <div className="text-xs text-slate-400">Nutrition Streak</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Link href="/workout/new" className="flex flex-col items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500/50">
          <Dumbbell className="w-6 h-6 text-emerald-500 mb-2" />
          <span className="text-xs font-medium text-slate-300">Workout</span>
        </Link>
        <Link href="/cardio/new" className="flex flex-col items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500/50">
          <Activity className="w-6 h-6 text-emerald-500 mb-2" />
          <span className="text-xs font-medium text-slate-300">Cardio</span>
        </Link>
        <Link href="/nutrition/new" className="flex flex-col items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500/50">
          <Utensils className="w-6 h-6 text-emerald-500 mb-2" />
          <span className="text-xs font-medium text-slate-300">Meal</span>
        </Link>
      </div>

      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-semibold">Today&apos;s Nutrition</h2>
          <div className="text-sm">
            <span className="text-emerald-500 font-bold">{stats.calories.current}</span>
            <span className="text-slate-400"> / {stats.calories.goal} kcal</span>
          </div>
        </div>
        <div className="h-2 w-full bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (stats.calories.current / stats.calories.goal) * 100)}%` }}></div>
        </div>

        <div className="space-y-3">
          {Object.entries(stats.macros).map(([macro, data]: [string, Macro]) => (
            <div key={macro} className="flex items-center gap-3">
              <div className="w-16 text-xs text-slate-400 capitalize">{macro}</div>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${macro === 'protein' ? 'bg-blue-500' : macro === 'carbs' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (data.current / data.goal) * 100)}%` }}></div>
              </div>
              <div className="w-12 text-right text-xs text-slate-300">{data.current}g</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <div className="space-y-3">
          {stats.recentActivity.map((activity: ActivityItem) => (
            <div key={activity.id} className="flex items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="p-2 bg-slate-900 rounded-lg">
                {activity.type === 'workout' && <Dumbbell className="w-5 h-5 text-emerald-500" />}
                {activity.type === 'cardio' && <Activity className="w-5 h-5 text-emerald-500" />}
                {activity.type === 'meal' && <Utensils className="w-5 h-5 text-emerald-500" />}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">{activity.title}</div>
                <div className="text-xs text-slate-400">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
