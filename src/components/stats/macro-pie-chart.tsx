'use client';
import { ResponsivePie } from '@nivo/pie';
import { nivoDarkTheme } from './nivo-theme';

export interface MacroData {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export function MacroPieChart({ data }: { data: MacroData[] }) {
  const displayData = data.length > 0 ? data : [
    { id: "Protein", label: "Protein", value: 150 },
    { id: "Carbs", label: "Carbs", value: 200 },
    { id: "Fat", label: "Fat", value: 65 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsivePie
        data={displayData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={[ '#10b981', '#3b82f6', '#f59e0b' ]}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [ [ 'darker', 0.2 ] ]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#94a3b8"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#ffffff"
        theme={nivoDarkTheme}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: '#94a3b8',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#f8fafc'
                }
              }
            ]
          }
        ]}
      />
    </div>
  );
}
