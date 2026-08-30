'use client';
import { ResponsiveBar } from '@nivo/bar';
import { nivoDarkTheme } from './nivo-theme';

export interface CardioData {
  type: string;
  duration: number;
  distance: number;
  calories: number;
  [key: string]: string | number;
}

export function CardioChart({ data }: { data: CardioData[] }) {
  const hasData = data && data.length > 0 && data.some((d) => d.duration > 0);

  if (!hasData) {
    return (
      <div className="h-[260px] w-full flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-800">
        <p>No cardio activity recorded for this period.</p>
        <p className="mt-1 text-slate-600">Track your runs or cycling sessions to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveBar
        data={data}
        keys={['duration']}
        indexBy="type"
        margin={{ top: 20, right: 20, bottom: 50, left: 55 }}
        padding={0.35}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors="#10b981"
        theme={nivoDarkTheme}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Activity Type',
          legendPosition: 'middle',
          legendOffset: 36
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Duration (min)',
          legendPosition: 'middle',
          legendOffset: -45
        }}
        enableLabel={true}
        labelTextColor="#ffffff"
        role="application"
        ariaLabel="Cardio Duration Chart"
      />
    </div>
  );
}
