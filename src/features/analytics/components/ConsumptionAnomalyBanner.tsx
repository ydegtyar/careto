import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useState } from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './ConsumptionAnomalyBanner.styles';

export const ConsumptionAnomalyBanner: React.FC = () => {
  const [anomalyDismissed, setAnomalyDismissed] = useState(false);

  if (anomalyDismissed) {
    return null;
  }

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
              Last 2 fill-ups showed 6.8 L/100km over 3-month baseline of 5.7 L/100km.
            </Typography>
          </div>
        </div>
        <Chip
          label="+19% SPIKE"
          size="small"
          sx={{
            backgroundColor: 'error.light',
            color: 'error.main',
            fontWeight: 700,
            fontSize: '0.65rem',
            opacity: 0.9,
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
