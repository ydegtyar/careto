import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useState } from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './ConsumptionAnomalyBanner.styles';

export type Props = {};

export const ConsumptionAnomalyBanner: React.FC<Props> = () => {
  const [anomalyDismissed, setAnomalyDismissed] = useState(false);

  if (anomalyDismissed) {
    return null;
  }

  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <WarningAmberIcon sx={{ color: '#fbbf24', fontSize: 24 }} />
          <div>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff' }}>
              Consumption Anomaly Detected
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}
            >
              Last 2 fill-ups showed 6.8 L/100km over 3-month baseline of 5.7 L/100km.
            </Typography>
          </div>
        </div>
        <Chip
          label="+19% SPIKE"
          size="small"
          sx={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            fontWeight: 700,
            fontSize: '0.65rem',
          }}
        />
      </div>

      <div style={styles.recBox}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          💡 Recommended checks: Tire pressures (fronts measuring ~29 PSI vs 33 PSI factory spec) or
          engine air filter restriction.
        </Typography>
      </div>

      <div style={styles.actionsRow}>
        <Button
          variant="contained"
          size="small"
          sx={{
            flex: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.78rem',
            backgroundColor: 'rgba(125, 211, 252, 0.2)',
            color: 'primary.main',
          }}
        >
          Check Tire Specs
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setAnomalyDismissed(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.78rem',
            color: 'text.secondary',
            borderColor: 'rgba(255, 255, 255, 0.15)',
          }}
        >
          Dismiss
        </Button>
      </div>
    </GlassCard>
  );
};

export default ConsumptionAnomalyBanner;
