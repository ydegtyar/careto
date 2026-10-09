import Typography from '@mui/material/Typography';
import type React from 'react';
import type { Entry } from '@/data/client/types';
import { MonthlyBars } from '@/features/analytics/charts/MonthlyBars/MonthlyBars';
import { computeMonthlyTrends } from '@/features/analytics/lib/analytics-math';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import type { TimeRangeMode } from './AnalyticsFilterPillsBar';
import { styles } from './SpendingTrendCard.styles';

interface Props {
  entries: Entry[];
  timeRange: TimeRangeMode;
}

export const SpendingTrendCard: React.FC<Props> = ({ entries, timeRange }) => {
  const monthlyTrends = computeMonthlyTrends(entries, timeRange === 'all' ? 12 : 6);

  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <div>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Spending Trajectory Trend
          </Typography>
        </div>
        <div style={styles.legendRow}>
          <span style={styles.fuelLegend}>● Fuel</span>
          <span style={styles.serviceLegend}>● Service</span>
          <span style={styles.adminLegend}>● Admin</span>
        </div>
      </div>

      <MonthlyBars data={monthlyTrends} />
    </GlassCard>
  );
};

export default SpendingTrendCard;
