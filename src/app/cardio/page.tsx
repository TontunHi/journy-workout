'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Flame, Timer, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface CardioItem {
  id: string;
  type: 'TREADMILL' | 'CYCLING' | 'SWIMMING' | 'JUMP_ROPE';
  date: string;
  duration: number;
  distance: number | null;
  caloriesBurned: number | null;
  notes: string | null;
}

export default function CardioPage() {
  const [activeType, setActiveType] = useState<string>('ALL');
  const [sessions, setSessions] = useState<CardioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'ALL', label: 'All' },
    { key: 'TREADMILL', label: '🏃 Treadmill' },
    { key: 'CYCLING', label: '🚴 Cycling' },
    { key: 'SWIMMING', label: '🏊 Swimming' },
    { key: 'JUMP_ROPE', label: '🪢 Jump Rope' },
  ];

  const typeIcons: Record<string, string> = {
    TREADMILL: '🏃',
    CYCLING: '🚴',
    SWIMMING: '🏊',
    JUMP_ROPE: '🪢',
  };

  useEffect(() => {
    fetch('/api/cardio')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setSessions(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredSessions = activeType === 'ALL'
    ? sessions
    : sessions.filter((s) => s.type === activeType);

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Cardio</h1>
          <p className="text-xs text-slate-400">Track runs, cycling & endurance</p>
        </div>
        <Link
          href="/cardio/new"
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Log Cardio
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveType(tab.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeType === tab.key
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-500">Loading cardio logs...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="text-4xl mb-3">🏃</div>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">No Cardio Logged</h2>
          <p className="text-slate-400 text-xs mb-6 max-w-[240px]">
            Ready to log your endurance workout or treadmill session?
          </p>
          <Link
            href="/cardio/new"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            Log First Cardio
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((activity) => (
            <div
              key={activity.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                {typeIcons[activity.type] || '🏃'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">
                      {activity.type.replace('_', ' ')}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {format(new Date(activity.date), 'EEEE, dd MMM yyyy')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Timer className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-medium">{activity.duration}m</span>
                  </div>
                  {activity.distance ? (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-medium">{activity.distance}km</span>
                    </div>
                  ) : <div></div>}
                  {activity.caloriesBurned ? (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-medium">{activity.caloriesBurned} kcal</span>
                    </div>
                  ) : <div></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
