'use client';
import { ResponsiveLine } from '@nivo/line';
import { nivoDarkTheme } from './nivo-theme';

export interface ProgressiveOverloadData {
  id: string;
  data: { x: string; y: number }[];
}

export function ProgressiveOverloadChart({ data }: { data: ProgressiveOverloadData[] }) {
  if (!data || data.length === 0 || !data[0]?.data || data[0].data.length === 0) {
    return (
      <div className="h-[260px] w-full flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-800">
        <p>No historical workout sets logged for this exercise yet.</p>
        <p className="mt-1 text-slate-600">Start logging workouts to track strength progression!</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveLine
        data={data}
        margin={{ top: 30, right: 30, bottom: 50, left: 50 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: false,
          reverse: false
        }}
        yFormat=">-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Date',
          legendOffset: 36,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Weight (kg)',
          legendOffset: -40,
          legendPosition: 'middle'
        }}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        theme={nivoDarkTheme}
        colors={['#10b981', '#3b82f6', '#f59e0b']}
      />
    </div>
  );
}
