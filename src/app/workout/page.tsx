import Link from 'next/link';
import { Plus, ChevronRight, Dumbbell } from 'lucide-react';

export default async function Page() {
  // Mock data, in real app fetch from /api/workouts
  const workouts = [
    {
      date: 'Today',
      items: [
        { id: '1', name: 'Upper Body Power', exercises: 6, volume: 8400, duration: 65 }
      ]
    },
    {
      date: 'Yesterday',
      items: [
        { id: '2', name: 'Lower Body Hypertrophy', exercises: 5, volume: 12500, duration: 75 }
      ]
    },
    {
      date: 'August 28, 2026',
      items: [
        { id: '3', name: 'Push Day', exercises: 7, volume: 9200, duration: 60 }
      ]
    }
  ];

  return (
    <main className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Workouts</h1>
        <Link href="/workout/new" className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Start
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200 mb-2">No Workouts Yet</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-[250px]">Start your fitness journey by logging your first workout.</p>
          <Link href="/workout/new" className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-medium">
            Start Workout
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {workouts.map((group) => (
            <div key={group.date} className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 px-1">{group.date}</h3>
              {group.items.map((workout) => (
                <Link key={workout.id} href={`/workout/${workout.id}`} className="block bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-emerald-500/50 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-100">{workout.name}</h4>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-300 font-medium">{workout.exercises}</span> Exercises
                    </div>
                    <div>
                      <span className="text-slate-300 font-medium">{workout.volume.toLocaleString()}</span> kg Vol
                    </div>
                    <div>
                      <span className="text-slate-300 font-medium">{workout.duration}</span> min
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
