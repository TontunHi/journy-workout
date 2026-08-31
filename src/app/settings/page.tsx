'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Smartphone, Target, User, Check, Scale, Dumbbell } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    workout: true,
    meals: true,
    streak: true,
  });

  const [targetWeight, setTargetWeight] = useState('75.0');
  const [savingWeight, setSavingWeight] = useState(false);
  const [weightSaved, setWeightSaved] = useState(false);

  // Daily Weight Quick Log State inside settings
  const [dailyWeight, setDailyWeight] = useState('');
  const [savingDailyWeight, setSavingDailyWeight] = useState(false);
  const [dailyWeightSaved, setDailyWeightSaved] = useState(false);

  useEffect(() => {
    // Load target weight from goals API
    fetch('/api/nutrition/goals')
      .then(res => res.json())
      .then(json => {
        if (json.data?.targetWeight) {
          setTargetWeight(json.data.targetWeight.toString());
        }
      })
      .catch(console.error);

    // Load latest daily weight
    fetch('/api/body-weight')
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.length > 0) {
          const latest = json.data[json.data.length - 1];
          setDailyWeight(latest.weight.toString());
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveTargetWeight = async () => {
    if (!targetWeight) return;
    setSavingWeight(true);
    try {
      const res = await fetch('/api/nutrition/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetWeight: parseFloat(targetWeight) }),
      });
      if (res.ok) {
        setWeightSaved(true);
        setTimeout(() => setWeightSaved(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingWeight(false);
    }
  };

  const handleSaveDailyWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyWeight) return;
    setSavingDailyWeight(true);
    try {
      const res = await fetch('/api/body-weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: parseFloat(dailyWeight) }),
      });
      if (res.ok) {
        setDailyWeightSaved(true);
        setTimeout(() => setDailyWeightSaved(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingDailyWeight(false);
    }
  };

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Journey Workout', {
            body: 'This is a test notification!',
            icon: '/icons/icon-192x192.png',
          });
        } else {
          alert('Notification permission denied.');
        }
      });
    } else {
      alert('Your browser does not support notifications.');
    }
  };

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile & Weight Goals */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" /> Body Weight & Profile
          </h2>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
            {/* Daily Weight Logger in Settings */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium text-slate-200 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-400" /> Log Today Weight
                  </div>
                  <div className="text-xs text-slate-500">Record today body weight to track history</div>
                </div>
              </div>
              <form onSubmit={handleSaveDailyWeight} className="flex gap-2 mt-2">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={dailyWeight}
                  onChange={e => setDailyWeight(e.target.value)}
                  placeholder="e.g. 76.5 (kg)"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={savingDailyWeight || !dailyWeight}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors shrink-0"
                >
                  {savingDailyWeight ? 'Saving...' : dailyWeightSaved ? <><Check className="w-4 h-4" /> Saved</> : 'Update'}
                </button>
              </form>
            </div>

            {/* Target Goal Weight */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium text-slate-200 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-400" /> Target Goal Weight
                  </div>
                  <div className="text-xs text-slate-500">Your target goal body weight (kg)</div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={e => setTargetWeight(e.target.value)}
                  placeholder="75.0"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSaveTargetWeight}
                  disabled={savingWeight || !targetWeight}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors shrink-0"
                >
                  {savingWeight ? 'Saving...' : weightSaved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Goal'}
                </button>
              </div>
            </div>

            {/* Link to Exercises Library */}
            <Link href="/exercises" className="p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors block">
              <div>
                <div className="font-medium text-slate-200 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" /> Exercises Library
                </div>
                <div className="text-xs text-slate-500">Create, edit, or remove custom workout exercises</div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">Manage &rarr;</span>
            </Link>

            {/* Link to Nutrition Goals */}
            <Link href="/nutrition/goals" className="p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors block">
              <div>
                <div className="font-medium text-slate-200">Daily Nutrition Goals</div>
                <div className="text-xs text-slate-500">Calories, Protein, Carbs, Fat</div>
              </div>
              <Target className="w-5 h-5 text-slate-500" />
            </Link>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <div className="flex justify-between items-end mb-3 px-2">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Notifications
            </h2>
            <button onClick={testNotification} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
              Test Push
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-slate-200">Workout Reminders</div>
                <div className="text-xs text-slate-500">Remind to log daily workout</div>
              </div>
              <button
                onClick={() => handleToggle('workout')}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.workout ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications.workout ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-slate-200">Meal Logging</div>
                <div className="text-xs text-slate-500">Reminders for breakfast, lunch, dinner</div>
              </div>
              <button
                onClick={() => handleToggle('meals')}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.meals ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications.meals ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-slate-200">Streak Alerts</div>
                <div className="text-xs text-slate-500">Warn before losing a streak</div>
              </div>
              <button
                onClick={() => handleToggle('streak')}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.streak ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications.streak ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* App Info */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> App Info
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl">
            <div className="p-4 flex justify-between items-center border-b border-slate-800">
              <div className="font-medium text-slate-200">Theme</div>
              <div className="text-sm font-medium text-emerald-400">Dark Modern (Always)</div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium text-slate-200">Version</div>
              <div className="text-sm text-slate-500">1.0.0 (Production)</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
