'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';

interface WorkoutSessionItem {
  id: string;
  date: string;
  duration: number | null;
  notes: string | null;
  sets: Array<{
    id: string;
    weight: number;
    reps: number;
  }>;
}

export default function WorkoutPage() {
  const [sessions, setSessions] = useState<WorkoutSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workouts')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setSessions(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Workouts</h1>
          <p className="text-xs text-slate-400">Weight training & strength logs</p>
        </div>
        <Link
          href="/workout/new"
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Start Workout
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-500">Loading workout history...</div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-emerald-400">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">No Workouts Yet</h2>
          <p className="text-slate-400 text-xs mb-6 max-w-[240px]">
            Start your fitness journey by logging your first workout session.
          </p>
          <Link
            href="/workout/new"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            Start First Workout
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const totalVolume = session.sets?.reduce(
              (sum, s) => sum + (s.weight || 0) * (s.reps || 0),
              0
            ) || 0;
            const totalSets = session.sets?.length || 0;

            return (
              <Link
                key={session.id}
                href={`/workout/${session.id}`}
                className="block bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">
                      {format(new Date(session.date), 'EEEE, dd MMM yyyy')}
                    </h4>
                    <div className="text-xs text-slate-500">
                      {format(new Date(session.date), 'hh:mm a')}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>

                <div className="flex gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-emerald-400 font-bold">{totalSets}</span> Sets
                  </div>
                  <div>
                    <span className="text-blue-400 font-bold">{totalVolume.toLocaleString()}</span> kg Vol
                  </div>
                  {session.duration && (
                    <div>
                      <span className="text-amber-400 font-bold">{session.duration}</span> min
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
