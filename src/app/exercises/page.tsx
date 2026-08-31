'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Dumbbell, Edit3, Trash2, Check, X, ShieldAlert } from 'lucide-react';

interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: 'CHEST' | 'BACK' | 'LEGS' | 'ARMS' | 'SHOULDERS' | 'CORE';
  isPreset: boolean;
}

const MUSCLE_GROUPS = [
  { key: 'ALL', label: 'All' },
  { key: 'CHEST', label: 'Chest' },
  { key: 'BACK', label: 'Back' },
  { key: 'LEGS', label: 'Legs' },
  { key: 'ARMS', label: 'Arms' },
  { key: 'SHOULDERS', label: 'Shoulders' },
  { key: 'CORE', label: 'Core' },
];

export default function ExercisesManagementPage() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formMuscle, setFormMuscle] = useState<'CHEST' | 'BACK' | 'LEGS' | 'ARMS' | 'SHOULDERS' | 'CORE'>('CHEST');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      const res = await fetch('/api/exercises');
      if (res.ok) {
        const json = await res.json();
        setExercises(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const openCreateModal = () => {
    setEditingExercise(null);
    setFormName('');
    setFormMuscle(selectedMuscle !== 'ALL' ? (selectedMuscle as any) : 'CHEST');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (ex: ExerciseItem) => {
    setEditingExercise(ex);
    setFormName(ex.name);
    setFormMuscle(ex.muscleGroup);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingExercise) {
        // Edit Custom Exercise
        const res = await fetch(`/api/exercises/${editingExercise.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName.trim(), muscleGroup: formMuscle }),
        });
        const json = await res.json();
        if (!res.ok) {
          setErrorMsg(json.error || 'Failed to update exercise');
          return;
        }
      } else {
        // Create New Custom Exercise
        const res = await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName.trim(), muscleGroup: formMuscle }),
        });
        const json = await res.json();
        if (!res.ok) {
          setErrorMsg(json.error || 'Failed to create exercise');
          return;
        }
      }

      setShowModal(false);
      fetchExercises();
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to delete exercise');
        return;
      }
      fetchExercises();
    } catch (err) {
      console.error(err);
      alert('Failed to delete exercise');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter exercises
  const filtered = exercises.filter((ex) => {
    const matchMuscle = selectedMuscle === 'ALL' || ex.muscleGroup === selectedMuscle;
    const matchSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMuscle && matchSearch;
  });

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/workout" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" /> Exercises Library
            </h1>
            <p className="text-xs text-slate-400">Manage, add custom, or edit exercises</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Muscle Group Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {MUSCLE_GROUPS.map((mg) => (
          <button
            key={mg.key}
            onClick={() => setSelectedMuscle(mg.key)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              selectedMuscle === mg.key
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {mg.label}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-500">Loading exercises library...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-300 font-medium text-sm">No exercises found</p>
          <p className="text-slate-500 text-xs mt-1">Try a different search or create a new custom exercise.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            + Create New Exercise
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-400 px-1">
            Total {filtered.length} Exercises ({selectedMuscle})
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
            {filtered.map((ex) => (
              <div
                key={ex.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100 truncate">{ex.name}</span>
                    {ex.isPreset ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                        Preset
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{ex.muscleGroup}</div>
                </div>

                {/* Actions: only editable/deletable if Custom */}
                {!ex.isPreset ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(ex)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Exercise"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ex.id, ex.name)}
                      disabled={deletingId === ex.id}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic pr-2">Default</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingExercise ? 'Edit Custom Exercise' : 'Add New Exercise'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Bulgarian Split Squat"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Muscle Group
                </label>
                <select
                  value={formMuscle}
                  onChange={(e) => setFormMuscle(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="CHEST">Chest</option>
                  <option value="BACK">Back</option>
                  <option value="LEGS">Legs</option>
                  <option value="ARMS">Arms</option>
                  <option value="SHOULDERS">Shoulders</option>
                  <option value="CORE">Core</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formName.trim()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? 'Saving...' : <><Check className="w-4 h-4" /> {editingExercise ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
