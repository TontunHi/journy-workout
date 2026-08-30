import Link from 'next/link';
import { ArrowLeft, Clock, Activity, Calendar, MoreVertical, Trophy } from 'lucide-react';

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Mock data
  const workout = {
    id,
    name: 'Upper Body Power',
    date: 'August 30, 2026',
    duration: 65,
    volume: 8400,
    notes: 'Felt strong today, good energy.',
    exercises: [
      {
        id: '1',
        name: 'Barbell Bench Press',
        sets: [
          { set: 1, weight: 60, reps: 10 },
          { set: 2, weight: 80, reps: 8 },
          { set: 3, weight: 100, reps: 5, pr: true },
          { set: 4, weight: 100, reps: 4 },
        ]
      },
      {
        id: '2',
        name: 'Pull Ups',
        sets: [
          { set: 1, weight: 0, reps: 12 },
          { set: 2, weight: 0, reps: 10 },
          { set: 3, weight: 10, reps: 8 },
        ]
      }
    ]
  };

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/workout" className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-white flex-1">{workout.name}</h1>
        <button className="p-2 text-slate-400 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
          <Calendar className="w-5 h-5 text-emerald-500 mb-1" />
          <div className="text-xs font-medium text-slate-300">{workout.date}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
          <Clock className="w-5 h-5 text-emerald-500 mb-1" />
          <div className="text-xs font-medium text-slate-300">{workout.duration} min</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
          <Activity className="w-5 h-5 text-emerald-500 mb-1" />
          <div className="text-xs font-medium text-slate-300">{workout.volume.toLocaleString()} kg</div>
        </div>
      </div>

      {workout.notes && (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <p className="text-sm text-slate-300 italic">&quot;{workout.notes}&quot;</p>
        </div>
      )}

      <div className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold text-slate-200">Exercises</h2>
        
        {workout.exercises.map((exercise) => (
          <div key={exercise.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800/80 p-3">
              <h3 className="font-bold text-emerald-400">{exercise.name}</h3>
            </div>
            
            <div className="p-0">
              <div className="grid grid-cols-4 text-xs font-medium text-slate-500 bg-slate-900/50 p-2 border-b border-slate-800/50">
                <div className="text-center">Set</div>
                <div className="text-center">kg</div>
                <div className="text-center">Reps</div>
                <div className="text-center"></div>
              </div>
              
              {exercise.sets.map((set) => (
                <div key={set.set} className="grid grid-cols-4 text-sm p-3 border-b border-slate-800/50 last:border-0 items-center">
                  <div className="text-center font-bold text-slate-500">{set.set}</div>
                  <div className="text-center text-slate-200">{set.weight}</div>
                  <div className="text-center text-slate-200">{set.reps}</div>
                  <div className="flex justify-center">
                    {set.pr && (
                      <div className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> PR
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
