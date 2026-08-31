'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Target } from 'lucide-react';

export default function NutritionGoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState({
    calories: '2000',
    protein: '150',
    carbs: '250',
    fat: '65',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch actual saved goals from NeonDB on page load
  useEffect(() => {
    fetch('/api/nutrition/goals')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setGoals({
            calories: json.data.dailyCalories?.toString() || '2000',
            protein: json.data.dailyProtein?.toString() || '150',
            carbs: json.data.dailyCarbs?.toString() || '250',
            fat: json.data.dailyFat?.toString() || '65',
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/nutrition/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyCalories: parseInt(goals.calories, 10),
          dailyProtein: parseFloat(goals.protein),
          dailyCarbs: parseFloat(goals.carbs),
          dailyFat: parseFloat(goals.fat),
        }),
      });

      if (res.ok) {
        router.push('/nutrition');
        router.refresh();
      } else {
        alert('Failed to save nutrition goals');
      }
    } catch (e) {
      console.error(e);
      alert('Network error saving goals');
    } finally {
      setSaving(false);
    }
  };

  const calNum = Number(goals.calories) || 2000;
  const pNum = Number(goals.protein) || 0;
  const cNum = Number(goals.carbs) || 0;
  const fNum = Number(goals.fat) || 0;

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href="/nutrition" className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-white">Daily Nutrition Goals</h1>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-emerald-400">
        <Target className="w-6 h-6 shrink-0" />
        <p className="text-sm">
          Setting appropriate daily targets helps calculate your remaining macros &amp; calories accurately.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading saved goals...</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
              Daily Calories Target
            </label>
            <div className="relative">
              <input
                type="number"
                value={goals.calories}
                onChange={(e) => setGoals({ ...goals, calories: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">kcal</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Macronutrients Target</h2>

            <div>
              <label className="text-xs font-bold text-blue-400 block mb-1.5 flex justify-between">
                <span>Protein</span>
                <span className="text-slate-400 font-normal">
                  {pNum * 4} kcal ({Math.round(((pNum * 4) / calNum) * 100) || 0}%)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={goals.protein}
                  onChange={(e) => setGoals({ ...goals, protein: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">g</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-amber-400 block mb-1.5 flex justify-between">
                <span>Carbohydrates</span>
                <span className="text-slate-400 font-normal">
                  {cNum * 4} kcal ({Math.round(((cNum * 4) / calNum) * 100) || 0}%)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={goals.carbs}
                  onChange={(e) => setGoals({ ...goals, carbs: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">g</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-red-400 block mb-1.5 flex justify-between">
                <span>Fats</span>
                <span className="text-slate-400 font-normal">
                  {fNum * 9} kcal ({Math.round(((fNum * 9) / calNum) * 100) || 0}%)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={goals.fat}
                  onChange={(e) => setGoals({ ...goals, fat: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">g</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-colors"
      >
        {saving ? 'Saving Goals...' : <><Check className="w-5 h-5" /> Save Goals</>}
      </button>
    </main>
  );
}
