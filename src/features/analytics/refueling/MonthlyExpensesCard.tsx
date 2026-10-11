import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import BarChartIcon from '@mui/icons-material/BarChart';
import type { MonthlyFuelExpenseBarDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

export interface MonthlyExpensesCardProps {
  data: MonthlyFuelExpenseBarDto[];
}

export function MonthlyExpensesCard({ data }: MonthlyExpensesCardProps) {
  // Collect all fuel type names to generate dynamic stacked bars
  const fuelTypeKeys = new Set<string>();
  const chartData = data.map((item) => {
    const formattedMonth = item.month.slice(2); // "26-05" -> "05/26"
    const [year, month] = item.month.split('-');
    const label = `${month}/${year?.slice(2)}`;
    const point: Record<string, any> = { monthLabel: label, totalCost: item.totalCost };

    for (const ft of item.byFuelType) {
      fuelTypeKeys.add(ft.fuelTypeName);
      point[ft.fuelTypeName] = ft.cost;
    }
    return point;
  });

  const barColors = ['#38bdf8', '#c084fc', '#818cf8', '#34d399'];
  const keysArray = Array.from(fuelTypeKeys);

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <BarChartIcon sx={{ fontSize: 18, color: '#7dd3fc' }} />
          <h4 style={styles.title}>Monthly Expenses</h4>
        </div>
      </div>

      <div style={{ width: '100%', height: 200, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="monthLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={1}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(125, 211, 252, 0.2)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`$${value}`, '']}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '8px' }}
            />
            {keysArray.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={barColors[idx % barColors.length]}
                radius={idx === keysArray.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
