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
          <BuildIcon sx={{ fontSize: 18, color: '#c8a0f0' }} />
          <h4 style={styles.title}>Monthly Service Trajectory</h4>
        </div>

        {data.peakMonth && (
          <span style={{ fontSize: '0.75rem', color: '#c8a0f0', fontWeight: 600 }}>
            Peak: ${data.peakCost} ({data.peakMonth})
          </span>
        )}
      </div>

      <div style={{ width: '100%', height: 160, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={11} tickLine={false} />
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
              formatter={(value: any) => [`$${value}`, 'Service Spend']}
            />
            <Bar
              dataKey="cost"
              fill="#c8a0f0"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
