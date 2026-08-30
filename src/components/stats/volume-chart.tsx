'use client';
import { ResponsiveBar } from '@nivo/bar';
import { nivoDarkTheme } from './nivo-theme';

export interface VolumeData {
  period: string;
  [key: string]: string | number;
}

export function VolumeChart({ data }: { data: VolumeData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] w-full flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-800">
        <p>No volume data available.</p>
        <p className="mt-1 text-slate-600">Weekly weight volume will show here once workouts are logged.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveBar
        data={data}
        keys={['CHEST', 'BACK', 'LEGS', 'ARMS', 'SHOULDERS', 'CORE']}
        indexBy="period"
        margin={{ top: 20, right: 20, bottom: 50, left: 55 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']}
        theme={nivoDarkTheme}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Week',
          legendPosition: 'middle',
          legendOffset: 36
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Volume (kg)',
          legendPosition: 'middle',
          legendOffset: -45
        }}
        enableLabel={false}
        role="application"
        ariaLabel="Weekly Volume Chart"
      />
    </div>
  );
}
