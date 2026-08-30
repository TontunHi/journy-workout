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
  const displayData = data.length > 0 ? data : [
    { type: "TREADMILL", duration: 180, distance: 28.5, calories: 1950 },
    { type: "CYCLING", duration: 240, distance: 75.0, calories: 2400 },
    { type: "SWIMMING", duration: 90, distance: 4.5, calories: 850 },
    { type: "JUMP_ROPE", duration: 60, distance: 5.0, calories: 720 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveBar
        data={displayData}
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
