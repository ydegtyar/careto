import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyTrendItem } from '../../lib/analytics-math';

type Props = {
  data?: MonthlyTrendItem[];
};

export const MonthlyBars = ({ data = [] }: Props) => {
  const chartData = data;

  return (
    <div style={{ width: '100%', height: 210 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="month"
            stroke="var(--mui-palette-text-secondary)"
            fontSize={11}
            tickLine={false}
          />
          <YAxis stroke="var(--mui-palette-text-secondary)" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--mui-palette-background-paper)',
              borderColor: 'var(--mui-palette-divider)',
              borderRadius: 8,
              color: 'var(--mui-palette-text-primary)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            formatter={(value, name) => [`$${value ?? 0}`, String(name).toUpperCase()]}
          />
          <Bar
            dataKey="fuel"
            stackId="a"
            fill="var(--mui-palette-primary-main)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="service"
            stackId="a"
            fill="var(--mui-palette-secondary-main)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="admin"
            stackId="a"
            fill="var(--mui-palette-tertiary-main)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
