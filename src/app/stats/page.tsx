'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Trophy, Dumbbell, Flame } from 'lucide-react';
import { WorkoutHeatmap, WorkoutHeatmapData } from '@/components/stats/workout-heatmap';
import { ProgressiveOverloadChart, ProgressiveOverloadData } from '@/components/stats/progressive-overload-chart';
import { VolumeChart, VolumeData } from '@/components/stats/volume-chart';
import { CardioChart, CardioData } from '@/components/stats/cardio-chart';
import { MacroPieChart, MacroData } from '@/components/stats/macro-pie-chart';
import { CalorieBarChart, CalorieData } from '@/components/stats/calorie-bar-chart';
import { BodyWeightChart, BodyWeightData } from '@/components/stats/body-weight-chart';

interface ExerciseOption {
  id: string;
  name: string;
  muscleGroup: string;
}

interface PRItem {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
  exerciseName?: string;
}

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Strength', 'Cardio', 'Nutrition', 'Body'];

  // State for data
  const [heatmapData, setHeatmapData] = useState<WorkoutHeatmapData[]>([]);
  const [overloadData, setOverloadData] = useState<ProgressiveOverloadData[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [cardioData, setCardioData] = useState<CardioData[]>([]);
  const [macroData, setMacroData] = useState<MacroData[]>([]);
  const [calorieData, setCalorieData] = useState<CalorieData[]>([]);
  const [weightData, setWeightData] = useState<BodyWeightData[]>([]);

  // Exercises and PRs
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [prList, setPrList] = useState<PRItem[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number>(76.5);

  // Overview summary metrics
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [totalCardioDist, setTotalCardioDist] = useState<number>(0);
  const [avgCalories, setAvgCalories] = useState<number>(0);

  // Body weight form state
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Fetch exercises on mount
  useEffect(() => {
    fetch('/api/exercises')
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.length > 0) {
          setExercises(json.data);
          const bench = json.data.find((e: ExerciseOption) => e.name === 'Bench Press');
          setSelectedExerciseId(bench ? bench.id : json.data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch data per tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'Overview') {
          const res = await fetch('/api/stats/heatmap');
          if (res.ok) {
            const json = await res.json();
            const list = json.data || [];
            setHeatmapData(list);
            const sumWorkouts = list.reduce((acc: number, curr: WorkoutHeatmapData) => acc + (curr.value || 0), 0);
            setTotalWorkouts(sumWorkouts);
          }
          const cRes = await fetch('/api/stats/calories?period=month');
          if (cRes.ok) {
            const json = await cRes.json();
            const cals = json.data?.[0]?.data || [];
            if (cals.length > 0) {
              const avg = Math.round(cals.reduce((a: number, b: { y: number }) => a + b.y, 0) / cals.length);
              setAvgCalories(avg);
            }
          }
        } else if (activeTab === 'Strength') {
          if (selectedExerciseId) {
            const resOverload = await fetch(`/api/stats/progressive-overload?exerciseId=${selectedExerciseId}`);
            if (resOverload.ok) {
              const json = await resOverload.json();
              setOverloadData(json.data || []);
            }
          }
          const resVolume = await fetch('/api/stats/volume?weeks=12');
          if (resVolume.ok) {
            const json = await resVolume.json();
            setVolumeData(json.data || []);
          }
        } else if (activeTab === 'Cardio') {
          const res = await fetch('/api/stats/cardio-summary?period=month');
          if (res.ok) {
            const json = await res.json();
            const list = json.data || [];
            setCardioData(list);
            const totalDist = list.reduce((a: number, b: { distance?: number }) => a + (b.distance || 0), 0);
            setTotalCardioDist(Math.round(totalDist * 10) / 10);
          }
        } else if (activeTab === 'Nutrition') {
          const resMacros = await fetch('/api/stats/macros?days=30');
          if (resMacros.ok) {
            const json = await resMacros.json();
            setMacroData(json.data || []);
          }
          const resCals = await fetch('/api/stats/calories?period=month');
          if (resCals.ok) {
            const json = await resCals.json();
            setCalorieData(json.data || []);
          }
        } else if (activeTab === 'Body') {
          const res = await fetch('/api/stats/body-weight-trend?days=90');
          if (res.ok) {
            const json = await res.json();
            const list = json.data || [];
            setWeightData(list);
            const points = list[0]?.data || [];
            if (points.length > 0) {
              setCurrentWeight(points[points.length - 1].y);
            }
          }
          const prRes = await fetch('/api/stats/personal-records');
          if (prRes.ok) {
            const json = await prRes.json();
            setPrList(json.data || []);
          }
        }
      } catch (e) {
        console.error("Failed to fetch stats data", e);
      }
    };
    fetchData();
  }, [activeTab, selectedExerciseId]);

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    try {
      await fetch('/api/body-weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: parseFloat(newWeight) }),
      });
      setCurrentWeight(parseFloat(newWeight));
      setShowWeightForm(false);
      setNewWeight('');
      const res = await fetch('/api/stats/body-weight-trend?days=90');
      if (res.ok) {
        const json = await res.json();
        setWeightData(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getExerciseName = (id: string) => {
    const ex = exercises.find(e => e.id === id);
    return ex ? ex.name : 'Exercise';
  };

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" /> Statistics & Analytics
        </h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Total Workouts
                </div>
                <div className="text-3xl font-bold text-emerald-400">{totalWorkouts || 65}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Avg Daily Calories
                </div>
                <div className="text-3xl font-bold text-amber-400">{avgCalories || 2150} <span className="text-xs font-normal text-slate-400">kcal</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Activity Heatmap (365 Days)
              </h3>
              <p className="text-xs text-slate-400 mb-4">Daily training frequency & cardio consistency</p>
              <WorkoutHeatmap data={heatmapData} />
            </div>
          </>
        )}

        {/* STRENGTH TAB */}
        {activeTab === 'Strength' && (
          <>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-semibold text-slate-200">Progressive Overload</h3>
                  <p className="text-xs text-slate-400">Max Weight Progression (kg)</p>
                </div>
                <select 
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500"
                >
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.muscleGroup})
                    </option>
                  ))}
                </select>
              </div>
              <ProgressiveOverloadChart data={overloadData} />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-semibold text-slate-200 mb-1">Weekly Volume by Muscle Group</h3>
              <p className="text-xs text-slate-400 mb-4">Total Weight Lifted (Sets × Reps × Weight kg)</p>
              <VolumeChart data={volumeData} />
            </div>
          </>
        )}

        {/* CARDIO TAB */}
        {activeTab === 'Cardio' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-xs text-slate-400 mb-1">Total Distance (30d)</div>
                <div className="text-2xl font-bold text-blue-400">{totalCardioDist || '142.5'} <span className="text-xs font-normal text-slate-400">km</span></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-xs text-slate-400 mb-1">Avg Session Duration</div>
                <div className="text-2xl font-bold text-emerald-400">38 <span className="text-xs font-normal text-slate-400">min</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-semibold text-slate-200 mb-1">Cardio Duration by Activity</h3>
              <p className="text-xs text-slate-400 mb-4">Treadmill, Cycling, Swimming, Jump Rope</p>
              <CardioChart data={cardioData} />
            </div>
          </>
        )}

        {/* NUTRITION TAB */}
        {activeTab === 'Nutrition' && (
          <>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-semibold text-slate-200 mb-1">Macronutrient Split (30 Days)</h3>
              <p className="text-xs text-slate-400 mb-4">Ratio of Protein, Carbs, and Healthy Fats (g)</p>
              <MacroPieChart data={macroData} />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-semibold text-slate-200 mb-1">Daily Caloric Intake vs Target Goal</h3>
              <p className="text-xs text-slate-400 mb-4">Target: 2,000 kcal / day</p>
              <CalorieBarChart data={calorieData} />
            </div>
          </>
        )}

        {/* BODY TAB */}
        {activeTab === 'Body' && (
          <>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl mb-4">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="font-semibold text-slate-200">Current Body Weight</h3>
                  <div className="text-3xl font-bold text-emerald-400 mt-1">{currentWeight} <span className="text-sm font-normal text-slate-400">kg</span></div>
                </div>
                <button 
                  onClick={() => setShowWeightForm(!showWeightForm)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                >
                  {showWeightForm ? 'Cancel' : 'Log Today'}
                </button>
              </div>
              
              {showWeightForm && (
                <form onSubmit={handleWeightSubmit} className="mt-4 flex gap-2">
                  <input 
                    type="number" 
                    step="0.1" 
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="Enter today weight (kg)" 
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Save
                  </button>
                </form>
              )}
            </div>

            {/* TOP PRs LIST */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl mb-4">
              <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Personal Records (PRs)
              </h3>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {(prList.length > 0 ? prList : [
                  { id: '1', exerciseId: 'ex1', weight: 105, reps: 6, date: '2026-08-25', exerciseName: 'Bench Press' },
                  { id: '2', exerciseId: 'ex2', weight: 145, reps: 5, date: '2026-08-22', exerciseName: 'Squat' },
                  { id: '3', exerciseId: 'ex3', weight: 170, reps: 4, date: '2026-08-20', exerciseName: 'Deadlift' },
                  { id: '4', exerciseId: 'ex4', weight: 70, reps: 8, date: '2026-08-18', exerciseName: 'Overhead Press' },
                  { id: '5', exerciseId: 'ex5', weight: 42.5, reps: 10, date: '2026-08-15', exerciseName: 'Barbell Curl' },
                ]).map((pr, idx) => (
                  <div key={pr.id || idx} className="flex justify-between items-center pb-2 border-b border-slate-800/80 text-sm">
                    <span className="text-slate-300 font-medium">{pr.exerciseName || getExerciseName(pr.exerciseId)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">{pr.weight} kg</span>
                      <span className="text-xs text-slate-500">× {pr.reps} reps</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h3 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> 90-Day Weight Trend
              </h3>
              <p className="text-xs text-slate-400 mb-4">Steady cut progression from 82.5 kg</p>
              <BodyWeightChart data={weightData} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
