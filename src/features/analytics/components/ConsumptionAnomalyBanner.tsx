import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { Entry, Vehicle } from '@/data/client/types';
import { computeConsumptionAnomaly } from '@/features/analytics/lib/analytics-math';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './ConsumptionAnomalyBanner.styles';

export interface ConsumptionAnomalyBannerProps {
  entries: Entry[];
  vehicle?: Vehicle;
}

export const ConsumptionAnomalyBanner: React.FC<ConsumptionAnomalyBannerProps> = ({
  entries,
  vehicle,
}) => {
  const navigate = useNavigate();
  const [dismissedAnomalyId, setDismissedAnomalyId] = useState<string | null>(null);

  const anomaly = useMemo(() => {
    return computeConsumptionAnomaly(entries, vehicle);
  }, [entries, vehicle]);

  if (!anomaly || dismissedAnomalyId === anomaly.id) {
    return null;
  }

  const fillUpsLabel =
    anomaly.recentRefuelCount === 1
      ? 'Last fill-up showed'
      : `Last ${anomaly.recentRefuelCount} fill-ups showed`;

  const comparisonText = `${fillUpsLabel} ${anomaly.recentRate} ${anomaly.unit} over baseline of ${anomaly.baselineRate} ${anomaly.unit}.`;

  const recommendationText = `💡 Recommended checks: ${anomaly.recommendations.join(' ')}`;

  const handleCheckTireSpecs = () => {
    navigate({ to: '/reminders' });
  };

  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 24 }} />
          <div>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Consumption Anomaly Detected
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}
            >
              {comparisonText}
            </Typography>
          </div>
        </div>
        <Chip label={`+${anomaly.spikePercentage}% SPIKE`} size="small" color="error" />
      </div>

      <div style={styles.recBox}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {recommendationText}
        </Typography>
      </div>

      <div style={styles.actionsRow}>
        <Button
          variant="contained"
          size="small"
          onClick={handleCheckTireSpecs}
          sx={{
            flex: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.78rem',
          }}
        >
          Check Maintenance & Tires
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setDismissedAnomalyId(anomaly.id)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.78rem',
            color: 'text.secondary',
            borderColor: 'divider',
          }}
        >
          Dismiss
        </Button>
      </div>
    </GlassCard>
  );
};

export default ConsumptionAnomalyBanner;
