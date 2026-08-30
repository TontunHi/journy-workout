'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Smartphone, Target, User } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    workout: true,
    meals: true,
    water: false,
    streak: true
  });
  const [weightGoal, setWeightGoal] = useState('75.0');

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Journey Workout', {
            body: 'This is a test notification!',
            icon: '/icon-192x192.png'
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
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
            <User className="w-4 h-4" /> Profile & Goals
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-slate-200">Target Weight (kg)</div>
                <div className="text-xs text-slate-500">Your current body weight goal</div>
              </div>
              <input 
                type="number"
                step="0.1"
                value={weightGoal}
                onChange={e => setWeightGoal(e.target.value)}
                className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <Link href="/nutrition/goals" className="p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors block">
              <div>
                <div className="font-medium text-slate-200">Nutrition Goals</div>
                <div className="text-xs text-slate-500">Update calories and macros</div>
              </div>
              <Target className="w-5 h-5 text-slate-500" />
            </Link>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-3 px-2">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </h2>
            <button onClick={testNotification} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">
              Test
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

        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> App
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl">
            <div className="p-4 flex justify-between items-center border-b border-slate-800">
              <div className="font-medium text-slate-200">Theme</div>
              <div className="text-sm font-medium text-emerald-500">Dark (Always)</div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium text-slate-200">Version</div>
              <div className="text-sm text-slate-500">1.0.0-beta</div>
            </div>
          </div>
        </section>
        
        <div className="pt-4 text-center">
          <button className="text-sm text-red-500 hover:text-red-400 font-medium px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
