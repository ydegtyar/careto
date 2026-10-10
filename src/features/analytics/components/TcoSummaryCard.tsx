import ShowChartIcon from '@mui/icons-material/ShowChart';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type React from 'react';
import type { Entry, Vehicle } from '@/data/client/types';
import { computeTCO } from '@/features/analytics/lib/analytics-math';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './TcoSummaryCard.styles';

interface Props {
  entries: Entry[];
  vehicle?: Vehicle;
}

export const TcoSummaryCard: React.FC<Props> = ({ entries, vehicle }) => {
  const tcoSummary = computeTCO(entries, vehicle);

  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <div>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: 'primary.main',
              fontWeight: 700,
            }}
          >
            True Total Cost of Ownership
          </Typography>
          <div style={styles.tcoAmountRow}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
              ${tcoSummary.tcoPerKm.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              / km
            </Typography>
          </div>
        </div>
        <div style={styles.periodTotalContainer}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Period Total
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ${tcoSummary.monthTotalUsd.toFixed(2)}
          </Typography>
        </div>
      </div>

      <Chip
        icon={
          <ShowChartIcon sx={{ fontSize: '14px !important', color: 'primary.main !important' }} />
        }
        label="12% lower than hybrid avg ($0.38/km)"
        size="small"
        sx={styles.chip}
      />

      <div style={styles.grid}>
        <div style={styles.gridItem}>
          <span style={styles.depreciationLabel}>● Depreciation</span>
          <span style={styles.itemValue}>${tcoSummary.depreciationUsd}</span>
        </div>
        <div style={styles.gridItem}>
          <span style={styles.fuelLabel}>● Fuel</span>
          <span style={styles.itemValue}>${tcoSummary.fuelUsd}</span>
        </div>
        <div style={styles.gridItem}>
          <span style={styles.insuranceLabel}>● Insurance</span>
          <span style={styles.itemValue}>${tcoSummary.insuranceUsd}</span>
        </div>
        <div style={styles.gridItem}>
          <span style={styles.maintenanceLabel}>● Maintenance</span>
          <span style={styles.itemValue}>${tcoSummary.maintenanceUsd}</span>
        </div>
      </div>
    </GlassCard>
  );
};
