import ShowChartIcon from '@mui/icons-material/ShowChart';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { FuelPriceTrajectoryDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

interface Props {
  data: FuelPriceTrajectoryDto;
  volumeUnit?: string;
}

export const FuelPriceTrajectoryCard = ({ data, volumeUnit = 'L' }: Props) => {
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
          <ShowChartIcon sx={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }} />
          <h4 style={styles.title}>Fuel Price Trajectory</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--mui-palette-text-secondary)' }}>
          ${data.overallWeightedAvgPrice?.toFixed(2) ?? '—'}/{volumeUnit}
        </span>
      </div>

      <div style={{ width: '100%', height: 160, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--mui-palette-primary-main)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--mui-palette-primary-main)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="monthLabel"
              stroke="var(--mui-palette-text-secondary)"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="var(--mui-palette-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
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
              formatter={(value: any) => [`$${value}/${volumeUnit}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="avgPrice"
              stroke="var(--mui-palette-primary-main)"
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
          borderTop: '1px solid var(--mui-palette-divider)',
          paddingTop: '10px',
          fontSize: '0.75rem',
        }}
      >
        <span style={{ color: 'var(--mui-palette-text-secondary)' }}>
          Weighted Avg:{' '}
          <strong style={{ color: 'var(--mui-palette-text-primary)' }}>
            ${data.overallWeightedAvgPrice?.toFixed(2) ?? '—'}
          </strong>
        </span>

        {change !== null && (
          <span style={{ color: isUp ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {isUp ? `+${change}%` : `${change}%`} over period
          </span>
        )}
      </div>
    </div>
  );
}
