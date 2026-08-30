'use client';
import { ResponsiveCalendar } from '@nivo/calendar';
import { nivoDarkTheme } from './nivo-theme';

export interface WorkoutHeatmapData {
  day: string;
  value: number;
}

export function WorkoutHeatmap({ data }: { data: WorkoutHeatmapData[] }) {
  const currentYear = new Date().getFullYear();
  const from = `${currentYear}-01-01`;
  const to = `${currentYear}-12-31`;

  return (
    <div className="h-[250px] w-full">
      <ResponsiveCalendar
        data={data}
        from={from}
        to={to}
        emptyColor="#1e293b"
        colors={['#047857', '#10b981', '#34d399', '#6ee7b7']}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        yearSpacing={40}
        monthBorderColor="#334155"
        dayBorderWidth={2}
        dayBorderColor="#0f172a"
        theme={nivoDarkTheme}
      />
    </div>
  );
}
