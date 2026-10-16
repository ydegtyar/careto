import type React from 'react';
import type { CostCategorySlice } from '@/features/analytics/lib/analytics-math';
import { getBreakdownSegmentStyle } from './CategoryBreakdown.styles';
import styles from './MonthlySummaryCard.module.scss';

export interface Props {
  category: CostCategorySlice;
}

export const CategoryBreakdownSegment: React.FC<Props> = ({ category }) => {
  return (
    <div
      className={styles.breakdownSegment}
      style={getBreakdownSegmentStyle(category.percentage, category.color)}
      title={`${category.name}: ${category.percentage}% ($${category.value.toFixed(2)})`}
    />
  );
};

export default CategoryBreakdownSegment;
