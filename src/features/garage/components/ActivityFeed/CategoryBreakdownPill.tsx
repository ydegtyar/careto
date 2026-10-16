import type React from 'react';
import type { CostCategorySlice } from '@/features/analytics/lib/analytics-math';
import { getBreakdownDotStyle } from './CategoryBreakdown.styles';
import styles from './MonthlySummaryCard.module.scss';

export interface Props {
  category: CostCategorySlice;
}

export const CategoryBreakdownPill: React.FC<Props> = ({ category }) => {
  return (
    <div className={styles.breakdownPill}>
      <span className={styles.breakdownDot} style={getBreakdownDotStyle(category.color)} />
      <span className={styles.breakdownCategory}>{category.name}</span>
      <span className={styles.breakdownAmount}>{category.percentage}%</span>
    </div>
  );
};
