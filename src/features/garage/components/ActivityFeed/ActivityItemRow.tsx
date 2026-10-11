import Typography from '@mui/material/Typography';
import type React from 'react';
import { useExpenseCategories } from '@/features/entries/lib/useExpenseCategories';
import { formatAmount } from '@/shared/lib/currencies';
import { formatDatePreference, useDateFormatPreference } from '@/shared/lib/date-format-preference';
import { useAccountFuelGrades } from '@/shared/lib/fuel-grades';
import type { EntryRecord } from './ActivityFeed';
import styles from './ActivityFeed.module.scss';

interface Props {
  entry: EntryRecord;
  consumption?: string;
  volumeUnit?: string;
  distanceUnit?: string;
  onOpen: (entry: EntryRecord) => void;
  getIcon: (kind: string) => React.ReactNode;
}

export function ActivityItemRow({
  entry,
  consumption,
  volumeUnit = 'L',
  distanceUnit = 'km',
  onOpen,
  getIcon,
}: Props) {
  const [dateFormat] = useDateFormatPreference();
  const { allGrades } = useAccountFuelGrades();
  const { categories } = useExpenseCategories();

  const getPrimaryTitle = (): string => {
    // 1. Refuel / Charge -> Fuel grade
    if (entry.kind === 'refuel' || entry.kind === 'charge') {
      if (entry.fuel_grade) {
        const foundGrade = allGrades.find((g) => g.id === entry.fuel_grade);
        return foundGrade ? foundGrade.label : entry.fuel_grade;
      }
    }

    // 2. Service -> breakdown item titles.join(', ')
    if (entry.kind === 'service' && entry.sub_items && entry.sub_items.length > 0) {
      const titles = entry.sub_items
        .map((item) => item.name.trim())
        .filter(Boolean);
      if (titles.length > 0) {
        return titles.join(', ');
      }
    }

    // 3. Note / any entry with notes -> truncated note
    if (entry.kind === 'note' && entry.notes?.trim()) {
      const trimmed = entry.notes.trim();
      return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed;
    }

    // 4. Expense -> Expense category
    if (entry.kind === 'expense') {
      const categoryKey = entry.category || entry.category_id;
      if (categoryKey) {
        const foundCategory = categories.find((c) => c.id === categoryKey);
        return foundCategory ? foundCategory.label : categoryKey;
      }
    }

    // Secondary fallback: if note exists on any other kind
    if (entry.notes?.trim()) {
      const trimmed = entry.notes.trim();
      return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed;
    }

    // Fallback: entry kind
    return entry.kind;
  };

  const isRefuelOrCharge = entry.kind === 'refuel' || entry.kind === 'charge';
  const hasRefuelStats = isRefuelOrCharge && (entry.fuel_volume !== undefined || consumption);

  return (
    <button type="button" className={styles.item} onClick={() => onOpen(entry)}>
      <div className={`${styles.iconDisc} ${styles[entry.kind]}`}>{getIcon(entry.kind)}</div>
      <div className={styles.details}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            textTransform: getPrimaryTitle() === entry.kind ? 'capitalize' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getPrimaryTitle()}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formatDatePreference(entry.occurred_on, dateFormat)}
          {entry.odometer_m !== undefined &&
            ` · ${Math.round(
              distanceUnit === 'mi' ? entry.odometer_m / 1000 / 1.609344 : entry.odometer_m / 1000,
            ).toLocaleString()} ${distanceUnit}`}
          {hasRefuelStats && (
            <>
              {entry.fuel_volume !== undefined && ` · ${entry.fuel_volume} ${volumeUnit}`}
              {consumption && ` · ${consumption}`}
            </>
          )}
        </Typography>
      </div>
      {entry.amount_minor !== undefined && entry.amount_minor > 0 && (
        <div className={styles.amount}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {formatAmount(entry)}
          </Typography>
          {entry.usd_minor && entry.currency !== 'USD' && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ≈ ${(entry.usd_minor / 100).toFixed(2)}
            </Typography>
          )}
        </div>
      )}
    </button>
  );
}
