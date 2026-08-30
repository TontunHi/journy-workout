'use client';
import { ResponsiveBar } from '@nivo/bar';
import { nivoDarkTheme } from './nivo-theme';

export interface CalorieData {
  [key: string]: string | number;
  date: string;
  calories: number;
}

export function CalorieBarChart({ data }: { data: CalorieData[] }) {
  const displayData = data.length > 0 ? data : [
    { date: "Mon", calories: 2100 },
    { date: "Tue", calories: 2250 },
    { date: "Wed", calories: 1950 },
    { date: "Thu", calories: 2300 },
    { date: "Fri", calories: 2400 },
    { date: "Sat", calories: 2600 },
    { date: "Sun", calories: 2200 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveBar
        data={displayData}
        keys={['calories']}
        indexBy="date"
        margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors="#10b981" // emerald-500
        theme={nivoDarkTheme}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Date',
          legendPosition: 'middle',
          legendOffset: 40
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Calories',
          legendPosition: 'middle',
          legendOffset: -50
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#ffffff"
        role="application"
        ariaLabel="Calories Chart"
        markers={[
          {
            axis: 'y',
            value: 2200,
            lineStyle: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4 4' },
            legend: 'Goal (2200)',
            legendOrientation: 'horizontal',
            textStyle: { fill: '#ef4444', fontSize: 12 }
          }
        ]}
      />
    </div>
  );
}
