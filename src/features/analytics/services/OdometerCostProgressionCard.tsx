import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import type { OdometerCostProgressionDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

export interface OdometerCostProgressionCardProps {
  data: OdometerCostProgressionDto;
  distanceUnit?: string;
}

export function OdometerCostProgressionCard({
  data,
  distanceUnit = 'km',
}: OdometerCostProgressionCardProps) {
  const chartData = data.points.map((p) => ({
    odometerLabel: `${(p.odometerKm / 1000).toFixed(0)}k`,
    costPerKm: p.costPerKm,
    isServicePoint: p.isServicePoint,
  }));

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <ShowChartIcon sx={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }} />
          <h4 style={styles.title}>Odometer & Cost Progression</h4>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--mui-palette-primary-main)' }}>
            ${data.currentCostPerKm?.toFixed(2) ?? '—'}/{distanceUnit}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>
            Fleet avg: ${data.fleetAvgCostPerKm?.toFixed(2) ?? '—'}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 160, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis dataKey="odometerLabel" stroke="var(--mui-palette-text-secondary)" fontSize={11} tickLine={false} />
            <YAxis
              stroke="var(--mui-palette-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
              domain={['dataMin - 0.05', 'dataMax + 0.05']}
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
              formatter={(value: any) => [`$${value}/${distanceUnit}`, 'Cost Rate']}
            />
            <Line
              type="monotone"
              dataKey="costPerKm"
              stroke="var(--mui-palette-primary-main)"
              strokeWidth={2}
              dot={{ fill: 'var(--mui-palette-primary-main)', r: 3 }}
              activeDot={{ r: 5, fill: 'var(--mui-palette-primary-main)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mui-palette-text-secondary)' }}>
          <span>• {data.currentOdometerKm?.toLocaleString()} {distanceUnit} Current</span>
          <span>• Service Point</span>
        </div>

        <span
          style={{
            color: '#34d399',
            fontWeight: 700,
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(52, 211, 153, 0.1)',
          }}
        >
          {data.statusLabel}
        </span>
      </div>
    </div>
  );
}
