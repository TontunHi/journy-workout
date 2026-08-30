import Link from 'next/link';
import { Plus, Flame, Timer, MapPin } from 'lucide-react';

export default async function CardioPage() {
  const tabs = ['All', '🏃 Treadmill', '🚴 Cycling', '🏊 Swimming', '🪢 Jump Rope'];
  
  // Mock data
  const activities = [
    { id: 1, type: 'Treadmill', date: 'Today', duration: 30, distance: 5.2, calories: 320, icon: '🏃' },
    { id: 2, type: 'Cycling', date: 'Yesterday', duration: 45, distance: 15.5, calories: 450, icon: '🚴' },
    { id: 3, type: 'Swimming', date: 'Aug 27, 2026', duration: 40, distance: 1.5, calories: 380, icon: '🏊' },
  ];

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl font-bold text-slate-100">Cardio</h1>
        <Link href="/cardio/new" className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
        {tabs.map((tab, i) => (
          <button 
            key={tab} 
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              i === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl shrink-0">
              {activity.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-100">{activity.type}</h3>
                  <div className="text-xs text-slate-500">{activity.date}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Timer className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">{activity.duration}m</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{activity.distance}km</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">{activity.calories}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
