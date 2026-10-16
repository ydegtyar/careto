import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type React from 'react';
import { styles as iconStyles } from './MonthlyComparisonBadge.styles';
import styles from './MonthlySummaryCard.module.scss';

export interface Props {
  costDiffPercent: number | null;
}

export const MonthlyComparisonBadge: React.FC<Props> = ({ costDiffPercent }) => {
  if (costDiffPercent === null) {
    return (
      <span className={`${styles.comparisonBadge} ${styles.neutral}`}>
        <TrendingFlatIcon sx={iconStyles.icon} />
        <span>No prior data</span>
      </span>
    );
  }

  if (costDiffPercent === 0) {
    return (
      <span className={`${styles.comparisonBadge} ${styles.neutral}`}>
        <TrendingFlatIcon sx={iconStyles.icon} />
        <span>0% vs last mo</span>
      </span>
    );
  }

  const isHigherCost = costDiffPercent > 0;
  const badgeClass = isHigherCost ? styles.up : styles.down;
  const Icon = isHigherCost ? TrendingUpIcon : TrendingDownIcon;
  const formattedSign = isHigherCost ? `+${costDiffPercent}%` : `${costDiffPercent}%`;

  return (
    <span
      className={`${styles.comparisonBadge} ${badgeClass}`}
      title={`${formattedSign} spend vs previous month`}
    >
      <Icon sx={iconStyles.icon} />
      <span>{formattedSign} vs last mo</span>
    </span>
  );
};

export default MonthlyComparisonBadge;
