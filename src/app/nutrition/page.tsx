'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Target, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import Image from 'next/image';
import { format, addDays, subDays } from 'date-fns';

interface NutritionItem {
  id: string;
  foodName: string;
  mealType: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  photoUrl: string | null;
  notes: string | null;
}

interface NutritionGoalData {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

export default function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedSection, setExpandedSection] = useState<string | null>('LUNCH');
  const [entries, setEntries] = useState<NutritionItem[]>([]);
  const [goals, setGoals] = useState<NutritionGoalData>({
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 250,
    dailyFat: 65,
  });

  const mealTypes = [
    { key: 'BREAKFAST', label: 'Breakfast' },
    { key: 'LUNCH', label: 'Lunch' },
    { key: 'DINNER', label: 'Dinner' },
    { key: 'SNACK', label: 'Snacks' },
    { key: 'SUPPER', label: 'Supper' },
  ];

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    fetch(`/api/nutrition?date=${dateStr}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setEntries(json.data);
        }
        if (json.goals) {
          setGoals(json.goals);
        }
      })
      .catch(console.error);
  }, [selectedDate]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const totalCalories = entries.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = Math.round(entries.reduce((sum, item) => sum + (item.protein || 0), 0));
  const totalCarbs = Math.round(entries.reduce((sum, item) => sum + (item.carbs || 0), 0));
  const totalFat = Math.round(entries.reduce((sum, item) => sum + (item.fat || 0), 0));

  const progressPercentage = Math.min(100, Math.round((totalCalories / (goals.dailyCalories || 2000)) * 100));

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      {/* Date Navigator */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-2">
        <button 
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-slate-200">
          {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
            ? 'Today' 
            : format(selectedDate, 'EEE, dd MMM yyyy')}
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-800 mx-1"></div>
          <Link href="/nutrition/goals" className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
            <Target className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Main Calorie Ring */}
      <div className="flex justify-center py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1e293b" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="45" fill="transparent" 
              stroke="#10b981" strokeWidth="8" strokeDasharray="283" 
              strokeDashoffset={283 - (283 * progressPercentage) / 100} 
              className="transition-all duration-700 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-bold text-white">{totalCalories}</div>
            <div className="text-xs text-slate-400">/ {goals.dailyCalories} kcal</div>
            <div className="text-xs font-medium text-emerald-400 mt-1">
              {goals.dailyCalories - totalCalories >= 0 
                ? `${goals.dailyCalories - totalCalories} left` 
                : `${totalCalories - goals.dailyCalories} over`}
            </div>
          </div>
        </div>
      </div>

      {/* Macros Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-blue-400">Protein</span>
            <span className="text-slate-400">{totalProtein}/{goals.dailyProtein}g</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (totalProtein / goals.dailyProtein) * 100)}%` }}></div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-amber-400">Carbs</span>
            <span className="text-slate-400">{totalCarbs}/{goals.dailyCarbs}g</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (totalCarbs / goals.dailyCarbs) * 100)}%` }}></div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-red-400">Fat</span>
            <span className="text-slate-400">{totalFat}/{goals.dailyFat}g</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (totalFat / goals.dailyFat) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Meal Groups */}
      <div className="space-y-3">
        {mealTypes.map(({ key, label }) => {
          const items = entries.filter(e => e.mealType === key);
          const isExpanded = expandedSection === key;
          const totalMealCals = items.reduce((acc, curr) => acc + (curr.calories || 0), 0);
          
          return (
            <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleSection(key)}
                className="w-full p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-200">{label}</h3>
                  {totalMealCals > 0 && (
                    <span className="text-xs font-medium bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full border border-slate-700">
                      {totalMealCals} kcal
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>
              
              {isExpanded && (
                <div className="border-t border-slate-800 p-0">
                  {items.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500 italic">No food logged for {label.toLowerCase()}.</div>
                  ) : (
                    <div>
                      {items.map(item => (
                        <div key={item.id} className="p-4 border-b border-slate-800 last:border-0 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {item.photoUrl ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                                <Image 
                                  src={item.photoUrl} 
                                  alt={item.foodName} 
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-slate-800/60 rounded-lg flex items-center justify-center shrink-0 text-slate-600">
                                <Camera className="w-5 h-5" />
                              </div>
                            )}
                            <div className="truncate">
                              <div className="font-semibold text-sm text-slate-200 truncate">{item.foodName}</div>
                              <div className="text-xs text-slate-400 flex gap-2 mt-0.5">
                                <span className="text-blue-400">P: {item.protein || 0}g</span>
                                <span className="text-amber-400">C: {item.carbs || 0}g</span>
                                <span className="text-red-400">F: {item.fat || 0}g</span>
                              </div>
                              {item.notes && <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.notes}</div>}
                            </div>
                          </div>
                          <div className="font-bold text-slate-200 text-sm shrink-0">{item.calories} <span className="text-xs font-normal text-slate-500">kcal</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Link 
        href="/nutrition/new"
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-colors z-40"
      >
        <Plus className="w-7 h-7" />
      </Link>
    </main>
  );
}
