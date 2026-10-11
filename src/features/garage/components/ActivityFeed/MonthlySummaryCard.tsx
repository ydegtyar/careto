import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Link } from '@tanstack/react-router';
import type { CostCategorySlice } from '@/features/analytics/lib/analytics-math';
import styles from './MonthlySummaryCard.module.scss';

export interface MonthlyStats {
  monthKey: string; // YYYY-MM
  monthLabel: string; // e.g. "October 2026"
  mileage: number; // in vehicle distance units (km or mi)
  distanceUnit: string; // 'km' or 'mi'
  avgConsumption: string; // e.g. "6.5" or "-"
  consumptionUnit: string; // e.g. "L/100km", "kWh/100km", "MPG"
  totalCostFormatted: string; // e.g. "250.00 EUR" or "$0.00"
  costDiffPercent: number | null; // e.g. +15 for 15% increase vs previous month
  categoryBreakdown: CostCategorySlice[];
}

type Props = {
  stats: MonthlyStats;
};

export const MonthlySummaryCard = ({ stats }: Props) => {
  const {
    monthLabel,
    mileage,
    distanceUnit,
    avgConsumption,
    consumptionUnit,
    totalCostFormatted,
    costDiffPercent,
    categoryBreakdown,
  } = stats;

  const renderComparison = () => {
    if (costDiffPercent === null) {
      return (
        <span className={`${styles.comparisonBadge} ${styles.neutral}`}>
          <TrendingFlatIcon sx={{ fontSize: 13 }} />
          <span>No prior data</span>
        </span>
      );
    }

    if (costDiffPercent === 0) {
      return (
        <span className={`${styles.comparisonBadge} ${styles.neutral}`}>
          <TrendingFlatIcon sx={{ fontSize: 13 }} />
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
        <Icon sx={{ fontSize: 13 }} />
        <span>{formattedSign} vs last mo</span>
      </span>
    );
  };

  const hasBreakdown = categoryBreakdown.length > 0;

  // Derive start and end date for the card's month (e.g., monthKey = "2026-10" -> "2026-10-01" to "2026-10-31")
  const [yearStr = '2026', monthStr = '01'] = stats.monthKey.split('-');
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  const from = `${yearStr}-${monthStr.padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${yearStr}-${monthStr.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.monthTitle}>{monthLabel}</span>
          {renderComparison()}
        </div>
        <div className={styles.headerRight}>
          <Link
            to="/analytics"
            search={{
              preset: 'custom',
              from,
              to,
            }}
            className={styles.analyticsLink}
          >
            <span>Analytics</span>
            <ArrowForwardIcon sx={{ fontSize: 12 }} />
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Mileage</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>{mileage > 0 ? mileage.toLocaleString() : '0'}</span>
            <span className={styles.statUnit}>{distanceUnit}</span>
          </div>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Avg Consumption</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>{avgConsumption}</span>
            {avgConsumption !== '-' && <span className={styles.statUnit}>{consumptionUnit}</span>}
          </div>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Cost</span>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>{totalCostFormatted}</span>
          </div>
        </div>
      </div>

      {hasBreakdown && (
        <div className={styles.breakdownSection}>
          <div className={styles.breakdownHeader}>
            <span className={styles.breakdownTitle}>Expenses Breakdown</span>
          </div>

          <div className={styles.breakdownBar}>
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.name}
                className={styles.breakdownSegment}
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
                title={`${cat.name}: ${cat.percentage}% ($${cat.value.toFixed(2)})`}
              />
            ))}
          </div>

          <div className={styles.breakdownPills}>
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className={styles.breakdownPill}>
                <span className={styles.breakdownDot} style={{ backgroundColor: cat.color }} />
                <span className={styles.breakdownCategory}>{cat.name}</span>
                <span className={styles.breakdownAmount}>{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
