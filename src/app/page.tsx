'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, Activity, Utensils, Settings, Flame, Trophy, Scale, Check } from 'lucide-react';

interface DashboardData {
  todayWorkouts: number;
  todayCardio: number;
  nutrition: {
    consumedCalories: number;
    goalCalories: number;
    consumedProtein: number;
    goalProtein: number;
  };
  streaks: Array<{
    type: 'WORKOUT' | 'NUTRITION';
    current: number;
    max: number;
  }>;
}

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Daily Weight Logger State
  const [todayWeight, setTodayWeight] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => {
    // Fetch Dashboard stats
    fetch('/api/stats/dashboard')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setData(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch Today's Weight (or most recent weight)
    fetch('/api/body-weight')
      .then((res) => res.json())
      .then((json) => {
        if (json.data && json.data.length > 0) {
          const latest = json.data[json.data.length - 1];
          setTodayWeight(latest.weight);
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;
    setSavingWeight(true);
    try {
      const res = await fetch('/api/body-weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: parseFloat(weightInput) }),
      });
      if (res.ok) {
        setTodayWeight(parseFloat(weightInput));
        setShowWeightInput(false);
        setWeightInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingWeight(false);
    }
  };

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

  const workoutStreak = data?.streaks?.find((s) => s.type === 'WORKOUT')?.current || 0;
  const nutritionStreak = data?.streaks?.find((s) => s.type === 'NUTRITION')?.current || 0;
  const consumedCalories = data?.nutrition?.consumedCalories || 0;
  const goalCalories = data?.nutrition?.goalCalories || 2000;
  const consumedProtein = data?.nutrition?.consumedProtein || 0;
  const goalProtein = data?.nutrition?.goalProtein || 150;

  const caloriePercentage = Math.min(100, Math.round((consumedCalories / goalCalories) * 100));

  return (
    <main className="p-6 max-w-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{getGreeting()}</h1>
          <p className="text-slate-400 text-sm">{today}</p>
        </div>
        <Link
          href="/settings"
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-emerald-500 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Streaks & Daily Weight Card */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">🔥</span>
            <span className="text-xs text-slate-500 font-medium">Consecutive</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">{workoutStreak} <span className="text-sm font-normal text-slate-400">Days</span></div>
          <div className="text-xs text-slate-400 mt-0.5">Workout Streak</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">🥗</span>
            <span className="text-xs text-slate-500 font-medium">Consecutive</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">{nutritionStreak} <span className="text-sm font-normal text-slate-400">Days</span></div>
          <div className="text-xs text-slate-400 mt-0.5">Nutrition Streak</div>
        </div>
      </div>

      {/* Daily Body Weight Quick Logger Widget */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Daily Body Weight</div>
              <div className="text-xl font-bold text-slate-100">
                {todayWeight !== null ? `${todayWeight} kg` : <span className="text-sm text-slate-500 font-normal">Not logged today</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowWeightInput(!showWeightInput)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 rounded-lg border border-slate-700 transition-colors"
          >
            {showWeightInput ? 'Cancel' : todayWeight ? 'Update' : '+ Log Weight'}
          </button>
        </div>

        {showWeightInput && (
          <form onSubmit={handleSaveWeight} className="mt-3.5 pt-3 border-t border-slate-800/80 flex gap-2">
            <input
              type="number"
              step="0.1"
              required
              autoFocus
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="e.g. 75.5 (kg)"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={savingWeight || !weightInput}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              {savingWeight ? 'Saving...' : <><Check className="w-4 h-4" /> Save</>}
            </button>
          </form>
        )}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/workout/new"
          className="flex flex-col items-center justify-center p-3.5 bg-slate-900 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:bg-emerald-500/20">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Log Workout</span>
        </Link>

        <Link
          href="/cardio/new"
          className="flex flex-col items-center justify-center p-3.5 bg-slate-900 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 group-hover:bg-blue-500/20">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Log Cardio</span>
        </Link>

        <Link
          href="/nutrition/new"
          className="flex flex-col items-center justify-center p-3.5 bg-slate-900 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-2 group-hover:bg-amber-500/20">
            <Utensils className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Log Meal</span>
        </Link>
      </div>

      {/* Today Nutrition Progress */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-400" /> Today&apos;s Nutrition
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Calorie balance & protein target</p>
          </div>
          <div className="text-sm">
            <span className="text-emerald-400 font-bold">{consumedCalories}</span>
            <span className="text-slate-400 text-xs"> / {goalCalories} kcal</span>
          </div>
        </div>

        <div className="h-2 w-full bg-slate-800 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${caloriePercentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Protein Intake:</span>
          <span className="font-semibold text-slate-200">
            <span className="text-blue-400">{consumedProtein}g</span> / {goalProtein}g
          </span>
        </div>
      </div>

      {/* Today Summary Activity */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
        <h2 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Today&apos;s Activity Summary
        </h2>
        
        {loading ? (
          <div className="py-4 text-center text-xs text-slate-500">Loading today&apos;s logs...</div>
        ) : (data?.todayWorkouts || 0) === 0 && (data?.todayCardio || 0) === 0 && consumedCalories === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No activity recorded today yet. Ready for your first session?
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-slate-800/50">
              <span className="text-slate-300 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" /> Weight Sessions Today:
              </span>
              <span className="font-bold text-slate-100">{data?.todayWorkouts || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-slate-800/50">
              <span className="text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Cardio Sessions Today:
              </span>
              <span className="font-bold text-slate-100">{data?.todayCardio || 0}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
