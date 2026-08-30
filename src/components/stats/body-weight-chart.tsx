'use client';
import { ResponsiveLine } from '@nivo/line';
import { nivoDarkTheme } from './nivo-theme';

export interface BodyWeightData {
  id: string;
  data: { x: string; y: number }[];
}

export function BodyWeightChart({ data }: { data: BodyWeightData[] }) {
  const displayData = data.length > 0 ? data : [
    {
      id: "Body Weight",
      data: [
        { x: "Jan", y: 180 },
        { x: "Feb", y: 178 },
        { x: "Mar", y: 176 },
        { x: "Apr", y: 175 },
      ]
    }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveLine
        data={displayData}
        margin={{ top: 30, right: 30, bottom: 50, left: 50 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: false,
          reverse: false
        }}
        yFormat=">-.1f"
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
          legend: 'Weight',
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
        colors={[ '#3b82f6' ]} // blue-500
      />
    </div>
  );
}
