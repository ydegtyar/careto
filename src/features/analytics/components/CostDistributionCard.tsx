import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Typography from '@mui/material/Typography';
import type React from 'react';
import type { Entry } from '@/data/client/types';
import { CostDonut } from '@/features/analytics/charts/CostDonut/CostDonut';
import { computeCategoryDistribution, computeTCO } from '@/features/analytics/lib/analytics-math';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './CostDistributionCard.styles';
import { LegendItemRow } from './LegendItemRow';

interface Props {
  entries: Entry[];
}

export const CostDistributionCard: React.FC<Props> = ({ entries }) => {
  const categoryDistribution = computeCategoryDistribution(entries);
  const { totalSpentUsd } = computeTCO(entries);

  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <div>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Cost Distribution
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: 'block', color: 'text.secondary', fontSize: '0.72rem' }}
          >
            Category breakdown (${totalSpentUsd.toFixed(2)} logged)
          </Typography>
        </div>
        <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      </div>

      <div style={styles.content}>
        <div style={styles.donutContainer}>
          <CostDonut data={categoryDistribution} />
        </div>
        <div style={styles.legendList}>
          {categoryDistribution.map((cat) => (
            <LegendItemRow key={cat.name} cat={cat} styles={styles} />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default CostDistributionCard;
