import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import BuildIcon from '@mui/icons-material/Build';
import type { MonthlyServiceTrajectoryDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

export interface MonthlyServiceTrajectoryCardProps {
  data: MonthlyServiceTrajectoryDto;
}

export function MonthlyServiceTrajectoryCard({ data }: MonthlyServiceTrajectoryCardProps) {
  const chartData = data.points.map((p) => {
    const [year, month] = p.month.split('-');
    const label = `${month}/${year?.slice(2)}`;
    return {
      monthLabel: label,
      cost: p.totalCost,
      isPeak: p.isPeak,
    };
  });

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <BuildIcon sx={{ fontSize: 18, color: 'var(--mui-palette-tertiary-main)' }} />
          <h4 style={styles.title}>Monthly Service Trajectory</h4>
        </div>

        {data.peakMonth && (
          <span style={{ fontSize: '0.75rem', color: 'var(--mui-palette-tertiary-main)', fontWeight: 600 }}>
            Peak: ${data.peakCost} ({data.peakMonth})
          </span>
        )}
      </div>

      <div style={{ width: '100%', height: 160, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis dataKey="monthLabel" stroke="var(--mui-palette-text-secondary)" fontSize={11} tickLine={false} />
            <YAxis
              stroke="var(--mui-palette-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--mui-palette-background-paper)',
                borderColor: 'var(--mui-palette-divider)',
                borderRadius: '8px',
                color: 'var(--mui-palette-text-primary)',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
              formatter={(value: any) => [`$${value}`, 'Service Spend']}
            />
            <Bar
              dataKey="cost"
              fill="var(--mui-palette-tertiary-main)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
