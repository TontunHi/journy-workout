'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function NewCardioPage() {
  const router = useRouter();
  const [type, setType] = useState('Treadmill');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const types = [
    { id: 'Treadmill', icon: '🏃', label: 'Treadmill' },
    { id: 'Cycling', icon: '🚴', label: 'Cycling' },
    { id: 'Swimming', icon: '🏊', label: 'Swimming' },
    { id: 'Jump Rope', icon: '🪢', label: 'Jump Rope' },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push('/cardio');
      router.refresh();
    }, 800);
  };

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href="/cardio" className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-white">Log Cardio</h1>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-300 mb-3 block">Activity Type</label>
        <div className="grid grid-cols-2 gap-3">
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
                type === t.id 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="text-3xl">{t.icon}</div>
              <span className="font-medium text-sm">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 bg-slate-900 p-5 rounded-xl border border-slate-800">
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Duration (minutes)</label>
          <input 
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 30"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Distance (km)</label>
          <input 
            type="number"
            step="0.1"
            value={distance}
            onChange={e => setDistance(e.target.value)}
            placeholder="e.g. 5.0"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Calories Burned (kcal)</label>
          <input 
            type="number"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            placeholder="e.g. 300"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Notes (Optional)</label>
        <textarea 
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How was the session?"
          rows={3}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      <div className="fixed bottom-20 left-0 w-full px-4 max-w-lg mx-auto left-1/2 -translate-x-1/2">
        <button 
          onClick={handleSave}
          disabled={saving || !duration}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-colors"
        >
          {saving ? 'Saving...' : <><Check className="w-5 h-5" /> Save Cardio Session</>}
        </button>
      </div>
    </main>
  );
}
