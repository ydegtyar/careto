import Typography from '@mui/material/Typography';
import type React from 'react';
import type { Entry, Vehicle } from '@/data/client/types';
import { computeEfficiencyTelemetry } from '@/features/analytics/lib/analytics-math';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './EfficiencyTelemetryCard.styles';

export interface Props {
  entries: Entry[];
  vehicle?: Vehicle;
}

export const EfficiencyTelemetryCard: React.FC<Props> = ({ entries, vehicle }) => {
  const efficiency = computeEfficiencyTelemetry(entries, vehicle);

  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Efficiency Telemetry
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {efficiency.unit}
        </Typography>
      </div>

      <div style={styles.grid}>
        <GlassCard style={styles.metricCard}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}
          >
            BEST
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#7dd3fc' }}>
            {efficiency.best ?? '-'}
          </Typography>
        </GlassCard>
        <GlassCard style={styles.metricCard}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}
          >
            AVG
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
            {efficiency.avg ?? '-'}
          </Typography>
        </GlassCard>
        <GlassCard style={styles.metricCard}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}
          >
            WORST
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f87171' }}>
            {efficiency.worst ?? '-'}
          </Typography>
        </GlassCard>
      </div>
    </GlassCard>
  );
};

export default EfficiencyTelemetryCard;
