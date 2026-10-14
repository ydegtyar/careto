import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface CostSlice {
  name: string;
  value: number;
  color: string;
}

export function CostDonut({ data = [] }: { data?: CostSlice[] }) {
  const chartData = data;

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
              backgroundColor: 'var(--mui-palette-background-paper)',
              borderColor: 'var(--mui-palette-divider)',
              borderRadius: 8,
              color: 'var(--mui-palette-text-primary)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Cost']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
