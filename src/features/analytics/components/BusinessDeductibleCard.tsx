import DownloadIcon from '@mui/icons-material/Download';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type React from 'react';
import type { Entry, Vehicle } from '@/data/client/types';
import { computeBusinessDeductible } from '@/features/analytics/lib/analytics-math';
import { exportAnalyticsCSV, exportAnalyticsPDF } from '@/features/analytics/lib/export-reports';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './BusinessDeductibleCard.styles';

export interface Props {
  entries: Entry[];
  vehicle?: Vehicle;
}

export const BusinessDeductibleCard: React.FC<Props> = ({ entries, vehicle }) => {
  const businessDeductible = computeBusinessDeductible(entries);

  return (
    <GlassCard style={styles.card}>
      <div>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Business Mileage Deductible
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
          {businessDeductible.distanceKm} km logged for business purposes this period.
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 800, color: '#7dd3fc', mt: 0.5 }}>
          ${businessDeductible.potentialWriteOffUsd.toFixed(2)}{' '}
          <span style={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 400 }}>
            potential tax write-off
          </span>
        </Typography>
      </div>

      <div style={styles.actionsRow}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => exportAnalyticsPDF(entries, vehicle)}
          startIcon={<DownloadIcon />}
          sx={styles.pdfButton}
        >
          Export PDF Report
        </Button>

        <Button
          variant="outlined"
          onClick={() => exportAnalyticsCSV(entries, vehicle)}
          sx={styles.csvButton}
        >
          CSV
        </Button>
      </div>
    </GlassCard>
  );
};

export default BusinessDeductibleCard;
