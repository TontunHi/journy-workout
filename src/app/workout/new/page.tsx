'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Search, Check, Trash2, ArrowLeft, Dumbbell } from 'lucide-react';

interface ExerciseSet {
  id: string;
  reps: number | '';
  weight: number | '';
  notes: string;
}

interface WorkoutExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: ExerciseSet[];
}

interface AvailableExercise {
  id: string;
  name: string;
  muscleGroup: string;
  isPreset: boolean;
}

const MUSCLE_GROUPS = ['ALL', 'CHEST', 'BACK', 'LEGS', 'ARMS', 'SHOULDERS', 'CORE'];

export default function NewWorkoutPage() {
  const router = useRouter();
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');
  const [saving, setSaving] = useState(false);

  // Real exercises fetched from NeonDB
  const [availableExercises, setAvailableExercises] = useState<AvailableExercise[]>([]);
  const [loadingEx, setLoadingEx] = useState(true);

  const fetchExercises = () => {
    fetch('/api/exercises')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setAvailableExercises(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingEx(false));
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const addExercise = (exercise: AvailableExercise) => {
    setExercises([
      ...exercises,
      {
        exerciseId: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: [{ id: crypto.randomUUID(), reps: 10, weight: 20, notes: '' }],
      },
    ]);
    setShowExercisePicker(false);
    setSearchQuery('');
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, idx) => idx !== index));
  };

  const addSet = (exerciseIndex: number) => {
    setExercises(
      exercises.map((e, idx) => {
        if (idx === exerciseIndex) {
          const lastSet = e.sets[e.sets.length - 1];
          return {
            ...e,
            sets: [
              ...e.sets,
              {
                id: crypto.randomUUID(),
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight || 20,
                notes: '',
              },
            ],
          };
        }
        return e;
      })
    );
  };

  const removeSet = (exerciseIndex: number, setId: string) => {
    setExercises(
      exercises.map((e, idx) => {
        if (idx === exerciseIndex) {
          return {
            ...e,
            sets: e.sets.filter((s) => s.id !== setId),
          };
        }
        return e;
      })
    );
  };

  const updateSet = (
    exerciseIndex: number,
    setId: string,
    field: keyof ExerciseSet,
    value: string | number
  ) => {
    setExercises(
      exercises.map((e, idx) => {
        if (idx === exerciseIndex) {
          return {
            ...e,
            sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
          };
        }
        return e;
      })
    );
  };

  const handleFinish = async () => {
    if (exercises.length === 0) return;
    setSaving(true);

    try {
      const payload = {
        date: new Date(),
        duration: duration ? parseInt(duration, 10) : null,
        notes: notes || null,
        exercises: exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets.map((s, sIdx) => ({
            setNumber: sIdx + 1,
            reps: typeof s.reps === 'number' ? s.reps : parseInt(s.reps || '0', 10),
            weight: typeof s.weight === 'number' ? s.weight : parseFloat(s.weight || '0'),
            notes: s.notes || null,
          })),
        })),
      };

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/workout');
        router.refresh();
      } else {
        alert('Failed to save workout');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving workout');
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = availableExercises.filter((ex) => {
    const matchMuscle = selectedMuscle === 'ALL' || ex.muscleGroup === selectedMuscle;
    const matchSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMuscle && matchSearch;
  });

  if (showExercisePicker) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExercisePicker(false)}
                className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold text-white">Select Exercise</h2>
            </div>

            <Link
              href="/exercises"
              target="_blank"
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Manage Library
            </Link>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise by name..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Muscle Group Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg}
                onClick={() => setSelectedMuscle(mg)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedMuscle === mg
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mg}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
          {loadingEx ? (
            <div className="py-20 text-center text-xs text-slate-500">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              <p>No exercise matched your search.</p>
              <Link
                href="/exercises"
                className="mt-3 inline-block text-emerald-400 font-semibold"
              >
                + Add new custom exercise
              </Link>
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => addExercise(ex)}
                className="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex justify-between items-center group"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {ex.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{ex.muscleGroup}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 max-w-lg mx-auto pb-32 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/workout" className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-white">Log Workout Session</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            placeholder="60"
          />
        </div>
        <div className="flex-[2]">
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Notes (Optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            placeholder="Chest & Triceps power day..."
          />
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, exIdx) => (
          <div
            key={exercise.exerciseId + exIdx}
            className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
          >
            <div className="flex justify-between items-center p-3.5 bg-slate-800/60 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-emerald-400">{exercise.name}</h3>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{exercise.muscleGroup}</span>
              </div>
              <button
                onClick={() => removeExercise(exIdx)}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 space-y-2">
              <div className="flex gap-2 text-xs font-semibold text-slate-400 px-2">
                <div className="w-8 text-center">Set</div>
                <div className="flex-1 text-center">Weight (kg)</div>
                <div className="flex-1 text-center">Reps</div>
                <div className="w-8"></div>
              </div>

              {exercise.sets.map((set, setIndex) => (
                <div key={set.id} className="flex gap-2 items-center">
                  <div className="w-8 text-center text-xs font-bold text-slate-500">
                    {setIndex + 1}
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(
                        exIdx,
                        set.id,
                        'weight',
                        e.target.value === '' ? '' : parseFloat(e.target.value)
                      )
                    }
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-center text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="kg"
                  />
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(
                        exIdx,
                        set.id,
                        'reps',
                        e.target.value === '' ? '' : parseInt(e.target.value, 10)
                      )
                    }
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-center text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="reps"
                  />
                  <button
                    onClick={() => removeSet(exIdx, set.id)}
                    className="w-8 flex justify-center text-slate-600 hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addSet(exIdx)}
                className="w-full mt-2 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-dashed border-slate-800"
              >
                + Add Set
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowExercisePicker(true)}
        className="w-full py-3.5 border-2 border-dashed border-slate-800 rounded-xl text-slate-400 font-semibold hover:border-emerald-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 text-sm bg-slate-900/40"
      >
        <Plus className="w-5 h-5" /> Add Exercise
      </button>

      <div className="fixed bottom-20 left-0 w-full px-4 max-w-lg mx-auto left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={handleFinish}
          disabled={saving || exercises.length === 0}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-colors"
        >
          {saving ? 'Saving Workout...' : <><Check className="w-5 h-5" /> Finish & Save Workout</>}
        </button>
      </div>
    </main>
  );
}
