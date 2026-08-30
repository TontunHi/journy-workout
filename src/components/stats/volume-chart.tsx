'use client';
import { ResponsiveBar } from '@nivo/bar';
import { nivoDarkTheme } from './nivo-theme';

export interface VolumeData {
  period: string;
  [key: string]: string | number;
}

export function VolumeChart({ data }: { data: VolumeData[] }) {
  const displayData = data.length > 0 ? data : [
    { period: 'Week 1', CHEST: 4200, BACK: 5500, LEGS: 6800, ARMS: 2400, SHOULDERS: 3100, CORE: 1200 },
    { period: 'Week 2', CHEST: 4600, BACK: 5900, LEGS: 7200, ARMS: 2700, SHOULDERS: 3400, CORE: 1300 },
    { period: 'Week 3', CHEST: 4900, BACK: 6300, LEGS: 7800, ARMS: 2900, SHOULDERS: 3700, CORE: 1500 },
    { period: 'Week 4', CHEST: 5300, BACK: 6800, LEGS: 8400, ARMS: 3200, SHOULDERS: 4000, CORE: 1600 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveBar
        data={displayData}
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
