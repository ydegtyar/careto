import React from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyTrendItem } from '../../lib/analytics-math';

const defaultData: MonthlyTrendItem[] = [
  { month: 'Dec', fuel: 140, service: 60, admin: 40 },
  { month: 'Jan', fuel: 160, service: 80, admin: 50 },
  { month: 'Feb', fuel: 130, service: 50, admin: 30 },
  { month: 'Mar', fuel: 180, service: 120, admin: 60 },
  { month: 'Apr', fuel: 150, service: 70, admin: 40 },
  { month: 'May', fuel: 170, service: 90, admin: 50 },
];

export function MonthlyBars({ data = defaultData }: { data?: MonthlyTrendItem[] }) {
  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div style={{ width: '100%', height: 210 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="month" stroke="#a0b4c4" fontSize={11} tickLine={false} />
          <YAxis stroke="#a0b4c4" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 21, 36, 0.95)',
              borderColor: 'rgba(125, 211, 252, 0.3)',
              borderRadius: 8,
              color: '#e0e8f0',
            }}
            formatter={(value: any, name: any) => [`$${value}`, name.toUpperCase()]}
          />
          <Bar dataKey="fuel" stackId="a" fill="#7dd3fc" radius={[0, 0, 0, 0]} />
          <Bar dataKey="service" stackId="a" fill="#88b4cc" radius={[0, 0, 0, 0]} />
          <Bar dataKey="admin" stackId="a" fill="#c8a0f0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
