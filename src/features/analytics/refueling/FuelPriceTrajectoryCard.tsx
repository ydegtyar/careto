import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import type { FuelPriceTrajectoryDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

export interface FuelPriceTrajectoryCardProps {
  data: FuelPriceTrajectoryDto;
  volumeUnit?: string;
}

export function FuelPriceTrajectoryCard({ data, volumeUnit = 'L' }: FuelPriceTrajectoryCardProps) {
  const chartData = data.points.map((p) => {
    const [year, month] = p.month.split('-');
    const label = `${month}/${year?.slice(2)}`;
    return {
      monthLabel: label,
      avgPrice: p.overallAvgPrice,
    };
  });

  const change = data.changePercentOverPeriod;
  const isUp = change !== null && change > 0;

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <ShowChartIcon sx={{ fontSize: 18, color: '#7dd3fc' }} />
          <h4 style={styles.title}>Fuel Price Trajectory</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          ${data.overallWeightedAvgPrice?.toFixed(2) ?? '—'}/{volumeUnit}
        </span>
      </div>

      <div style={{ width: '100%', height: 160, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(125, 211, 252, 0.2)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`$${value}/${volumeUnit}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="avgPrice"
              stroke="#38bdf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '10px',
          fontSize: '0.75rem',
        }}
      >
        <span style={{ color: '#94a3b8' }}>
          Weighted Avg: <strong style={{ color: '#f8fafc' }}>${data.overallWeightedAvgPrice?.toFixed(2) ?? '—'}</strong>
        </span>

        {change !== null && (
          <span style={{ color: isUp ? '#f87171' : '#34d399', fontWeight: 600 }}>
            {isUp ? `+${change}%` : `${change}%`} over period
          </span>
        )}
      </div>
    </div>
  );
}
