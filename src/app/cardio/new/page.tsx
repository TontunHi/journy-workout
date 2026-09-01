'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function NewCardioPage() {
  const router = useRouter();
  const [type, setType] = useState('TREADMILL');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const types = [
    { id: 'TREADMILL', icon: '🏃', label: 'Treadmill' },
    { id: 'CYCLING', icon: '🚴', label: 'Cycling' },
    { id: 'SWIMMING', icon: '🏊', label: 'Swimming' },
    { id: 'JUMP_ROPE', icon: '🪢', label: 'Jump Rope' },
  ];

  const handleSave = async () => {
    if (!duration) return;
    setSaving(true);
    try {
      const payload = {
        date: new Date().toISOString(),
        type,
        duration: parseInt(duration, 10),
        distance: distance ? parseFloat(distance) : null,
        caloriesBurned: calories ? parseInt(calories, 10) : null,
        notes: notes.trim() || null,
      };

      const res = await fetch('/api/cardio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/cardio');
        router.refresh();
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to save cardio session');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving cardio session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-32">
      <div className="flex items-center gap-3">
        <Link href="/cardio" className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-white">Log Cardio</h1>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-300 mb-3 block">Activity Type</label>
        <div className="grid grid-cols-2 gap-3">
          {types.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors cursor-pointer ${
                type === t.id 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="text-3xl">{t.icon}</div>
              <span className="font-semibold text-sm">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 bg-slate-900 p-5 rounded-xl border border-slate-800">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Duration (minutes) *</label>
          <input 
            type="number"
            required
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 30"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Distance (km)</label>
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
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Calories Burned (kcal)</label>
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
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Notes (Optional)</label>
        <textarea 
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How was the session?"
          rows={3}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      <div className="fixed bottom-20 left-0 w-full px-4 max-w-lg mx-auto left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={handleSave}
          disabled={saving || !duration}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {saving ? 'Saving Session...' : <><Check className="w-5 h-5" /> Save Cardio Session</>}
        </button>
      </div>
    </main>
  );
}
