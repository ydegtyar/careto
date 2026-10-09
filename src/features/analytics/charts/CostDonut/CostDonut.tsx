import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface CostSlice {
  name: string;
  value: number;
  color: string;
}

const defaultData: CostSlice[] = [
  { name: 'Fuel & Energy', value: 142.5, color: '#7dd3fc' },
  { name: 'Maintenance', value: 82.0, color: '#c8a0f0' },
  { name: 'Insurance & Tax', value: 68.0, color: '#88b4cc' },
  { name: 'Parking & Tolls', value: 48.0, color: '#fbbf24' },
];

export function CostDonut({ data = defaultData }: { data?: CostSlice[] }) {
  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 21, 36, 0.9)',
              borderColor: 'rgba(125, 211, 252, 0.3)',
              borderRadius: 8,
              color: '#e0e8f0',
            }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Cost']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
