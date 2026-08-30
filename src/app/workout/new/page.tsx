'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Search, Check, Trash2 } from 'lucide-react';

interface ExerciseSet {
  id: string;
  reps: number | '';
  weight: number | '';
  notes: string;
}

interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [name, setName] = useState('New Workout');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mock exercise list
  const availableExercises = [
    { id: '1', name: 'Barbell Bench Press', muscle: 'Chest' },
    { id: '2', name: 'Squat', muscle: 'Legs' },
    { id: '3', name: 'Deadlift', muscle: 'Back' },
    { id: '4', name: 'Overhead Press', muscle: 'Shoulders' },
    { id: '5', name: 'Pull Up', muscle: 'Back' },
  ];

  const addExercise = (exercise: { id: string; name: string; muscle: string }) => {
    setExercises([...exercises, {
      id: crypto.randomUUID(),
      name: exercise.name,
      sets: [{ id: crypto.randomUUID(), reps: '', weight: '', notes: '' }]
    }]);
    setShowExercisePicker(false);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        const lastSet = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [...e.sets, { 
            id: crypto.randomUUID(), 
            reps: lastSet?.reps || '', 
            weight: lastSet?.weight || '', 
            notes: '' 
          }]
        };
      }
      return e;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof ExerciseSet, value: string | number) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        return {
          ...e,
          sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return e;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        return {
          ...e,
          sets: e.sets.filter(s => s.id !== setId)
        };
      }
      return e;
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      router.push('/workout');
      router.refresh();
    }, 1000);
  };

  if (showExercisePicker) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <button onClick={() => setShowExercisePicker(false)} className="p-2 -ml-2 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search exercise..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {availableExercises.map(ex => (
            <button 
              key={ex.id}
              onClick={() => addExercise(ex)}
              className="w-full text-left p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-slate-200">{ex.name}</div>
                <div className="text-xs text-slate-500">{ex.muscle}</div>
              </div>
              <Plus className="w-5 h-5 text-emerald-500" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 max-w-lg mx-auto pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-slate-600 w-full"
          placeholder="Workout Name"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-xs text-slate-400 mb-1 block">Duration (min)</label>
          <input 
            type="number" 
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="e.g. 60"
          />
        </div>
        <div className="flex-[2]">
          <label className="text-xs text-slate-400 mb-1 block">Notes</label>
          <input 
            type="text" 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="How did you feel?"
          />
        </div>
      </div>

      <div className="space-y-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-slate-800/50">
              <h3 className="font-bold text-emerald-400">{exercise.name}</h3>
              <button onClick={() => removeExercise(exercise.id)} className="p-1 text-slate-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-3 space-y-2">
              <div className="flex gap-2 text-xs font-medium text-slate-400 px-2">
                <div className="w-8 text-center">Set</div>
                <div className="flex-1 text-center">kg</div>
                <div className="flex-1 text-center">Reps</div>
                <div className="w-8"></div>
              </div>

              {exercise.sets.map((set, setIndex) => (
                <div key={set.id} className="flex gap-2 items-center">
                  <div className="w-8 text-center text-sm font-bold text-slate-500">{setIndex + 1}</div>
                  <input 
                    type="number" 
                    value={set.weight}
                    onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-emerald-500"
                    placeholder="-"
                  />
                  <input 
                    type="number" 
                    value={set.reps}
                    onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-emerald-500"
                    placeholder="-"
                  />
                  <button onClick={() => removeSet(exercise.id, set.id)} className="w-8 flex justify-center text-slate-600 hover:text-red-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <button 
                onClick={() => addSet(exercise.id)}
                className="w-full mt-2 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                + Add Set
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setShowExercisePicker(true)}
        className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 font-medium hover:border-emerald-500 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Add Exercise
      </button>

      <div className="fixed bottom-20 left-0 w-full px-4 max-w-lg mx-auto left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={handleFinish}
          disabled={saving || exercises.length === 0}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : <><Check className="w-5 h-5" /> Finish Workout</>}
        </button>
      </div>
    </main>
  );
}
