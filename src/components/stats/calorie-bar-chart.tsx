'use client';
import { ResponsiveBar } from '@nivo/bar';
import { nivoDarkTheme } from './nivo-theme';

export interface CalorieData {
  [key: string]: string | number;
  date: string;
  calories: number;
}

export function CalorieBarChart({ data }: { data: CalorieData[] }) {
  const hasData = data && data.length > 0 && data.some((d) => d.calories > 0);

  if (!hasData) {
    return (
      <div className="h-[260px] w-full flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-800">
        <p>No calorie intake logged yet.</p>
        <p className="mt-1 text-slate-600">Track your calories and compare against your daily target.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveBar
        data={data}
        keys={['calories']}
        indexBy="date"
        margin={{ top: 20, right: 20, bottom: 50, left: 55 }}
        padding={0.3}
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
          legend: 'Date',
          legendPosition: 'middle',
          legendOffset: 36
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Calories',
          legendPosition: 'middle',
          legendOffset: -45
        }}
        enableLabel={false}
        role="application"
        ariaLabel="Calories Chart"
        markers={[
          {
            axis: 'y',
            value: 2000,
            lineStyle: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4 4' },
            legend: 'Goal (2000)',
            legendOrientation: 'horizontal',
            textStyle: { fill: '#ef4444', fontSize: 11 }
          }
        ]}
      />
    </div>
  );
}
