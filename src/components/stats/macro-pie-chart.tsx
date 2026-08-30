'use client';
import { ResponsivePie } from '@nivo/pie';
import { nivoDarkTheme } from './nivo-theme';

export interface MacroData {
  id: string;
  label: string;
  value: number;
}

export function MacroPieChart({ data }: { data: MacroData[] }) {
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="h-[260px] w-full flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-800">
        <p>No nutrition data logged for this period.</p>
        <p className="mt-1 text-slate-600">Log your daily meals to see your macronutrient split.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsivePie
        data={data}
        margin={{ top: 30, right: 80, bottom: 30, left: 80 }}
        innerRadius={0.5}
        padAngle={1.5}
        cornerRadius={4}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
        colors={[ '#3b82f6', '#f59e0b', '#ef4444' ]} // Protein (blue), Carbs (amber), Fat (red)
        theme={nivoDarkTheme}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#94a3b8"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#ffffff"
      />
    </div>
  );
}
