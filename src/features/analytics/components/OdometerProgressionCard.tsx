import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type React from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Entry, Vehicle } from '@/data/client/types';
import { computeOdometerProgression } from '@/features/analytics/lib/analytics-math';
import { styles } from './OdometerProgressionCard.styles';

interface Props {
  entries: Entry[];
  vehicle?: Vehicle;
}

export const OdometerProgressionCard: React.FC<Props> = ({ entries, vehicle }) => {
  const {
    points,
    startOdometer,
    currentOdometer,
    distanceLogged,
    rollingPacePerDay,
    nextMilestoneKm,
    daysToNextMilestone,
    distanceUnit,
  } = computeOdometerProgression(entries, vehicle);

  // If no points, render fallback baseline
  const chartData =
    points.length > 0
      ? points
      : [
          {
            date: '2026-01-01',
            monthLabel: '01/2026',
            odometer: startOdometer,
          },
          {
            date: '2026-06-01',
            monthLabel: '06/2026',
            odometer: currentOdometer,
          },
        ];

  const milestoneLabel = `${Math.round(nextMilestoneKm / 1000)}k ${distanceUnit}`;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <ShowChartIcon sx={styles.icon} />
          <div style={styles.titleTextGroup}>
            <h3 style={styles.title}>Odometer Progression</h3>
            <span style={styles.subTitle}>
              {startOdometer.toLocaleString()} {distanceUnit} →{' '}
              {currentOdometer.toLocaleString()} {distanceUnit} logged
            </span>
          </div>
        </div>

        <div style={styles.deltaDistance}>
          +{distanceLogged.toLocaleString()} {distanceUnit}
        </div>
      </div>

      <div style={styles.currentBadge}>
        Current: {currentOdometer.toLocaleString()} {distanceUnit}
      </div>

      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="odometerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="monthLabel"
              stroke="var(--mui-palette-text-secondary)"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="var(--mui-palette-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              domain={['dataMin - 1000', 'dataMax + 1000']}
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
              formatter={(value: any) => [`${Number(value).toLocaleString()} ${distanceUnit}`, 'Odometer']}
            />
            <Area
              type="monotone"
              dataKey="odometer"
              stroke="var(--mui-palette-primary-main)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#odometerGradient)"
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const isService = payload.isService;
                const isLast = payload.odometer === currentOdometer;
                const fill = isLast ? '#c084fc' : isService ? '#fb923c' : '#7dd3fc';
                return (
                  <circle
                    key={`dot-${props.index}`}
                    cx={cx}
                    cy={cy}
                    r={isLast ? 6 : 4}
                    fill={fill}
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.footerRow}>
        <div style={styles.rollingPace}>
          <AccessTimeIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
          <span>
            Rolling pace:{' '}
            <strong style={styles.paceHighlight}>
              {rollingPacePerDay} {distanceUnit}/day
            </strong>
          </span>
        </div>

        <div style={styles.nextMilestone}>
          Next {milestoneLabel} in ~{daysToNextMilestone} days
        </div>
      </div>
    </div>
  );
};

export default OdometerProgressionCard;
