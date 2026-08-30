'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Camera, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

export default function NewNutritionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mealType, setMealType] = useState('LUNCH');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const mealTypes = [
    { label: 'Breakfast', value: 'BREAKFAST' },
    { label: 'Lunch', value: 'LUNCH' },
    { label: 'Dinner', value: 'DINNER' },
    { label: 'Snacks', value: 'SNACK' },
    { label: 'Supper', value: 'SUPPER' },
  ];

  // Handle client-side image compression & conversion to base64
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800; // max 800px width/height for fast load & small storage
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setPhotoUrl(compressedBase64);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!foodName || !calories) return;
    setSaving(true);
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType,
          foodName,
          calories: parseInt(calories, 10),
          protein: protein ? parseFloat(protein) : 0,
          carbs: carbs ? parseFloat(carbs) : 0,
          fat: fat ? parseFloat(fat) : 0,
          photoUrl,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        router.push('/nutrition');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4 max-w-lg mx-auto space-y-6 pb-28">
      <div className="flex items-center gap-3">
        <Link href="/nutrition" className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-white">Log Meal</h1>
      </div>

      {/* Meal Types Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {mealTypes.map(item => (
          <button
            key={item.value}
            onClick={() => setMealType(item.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              mealType === item.value
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Food Name</label>
          <input 
            type="text"
            value={foodName}
            onChange={e => setFoodName(e.target.value)}
            placeholder="e.g. Grilled Chicken Breast & Jasmine Rice"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-emerald-400 uppercase tracking-wider block mb-1.5">Total Calories (kcal)</label>
            <input 
              type="number"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              placeholder="550"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-lg font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1 text-center">Protein (g)</label>
              <input 
                type="number"
                value={protein}
                onChange={e => setProtein(e.target.value)}
                placeholder="40"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1 text-center">Carbs (g)</label>
              <input 
                type="number"
                value={carbs}
                onChange={e => setCarbs(e.target.value)}
                placeholder="60"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1 text-center">Fat (g)</label>
              <input 
                type="number"
                value={fat}
                onChange={e => setFat(e.target.value)}
                placeholder="12"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Photo Upload & Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          {photoUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-700">
              <div className="relative w-full h-48">
                <Image 
                  src={photoUrl} 
                  alt="Meal preview" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <button 
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="absolute top-2 right-2 bg-slate-900/80 p-1.5 rounded-full text-slate-300 hover:text-white border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center border border-dashed border-slate-600 text-slate-500 shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-left w-full cursor-pointer"
                >
                  <div className="text-sm font-medium text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Camera className="w-4 h-4" /> Take Photo / Upload
                  </div>
                  <div className="text-xs text-slate-500">Take a snapshot with your camera or select from gallery</div>
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoSelect}
                  className="hidden" 
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Notes (Optional)</label>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Post-workout lunch, cooked with olive oil..."
            rows={2}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-20 left-0 w-full px-4 max-w-lg mx-auto left-1/2 -translate-x-1/2">
        <button 
          onClick={handleSave}
          disabled={saving || !foodName || !calories}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-colors"
        >
          {saving ? 'Saving Meal...' : <><Check className="w-5 h-5" /> Save Meal</>}
        </button>
      </div>
    </main>
  );
}
