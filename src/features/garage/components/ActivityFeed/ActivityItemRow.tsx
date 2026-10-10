import Typography from '@mui/material/Typography';
import type React from 'react';
import { formatAmount } from '@/shared/lib/currencies';
import { formatDatePreference, useDateFormatPreference } from '@/shared/lib/date-format-preference';
import type { EntryRecord } from './ActivityFeed';
import styles from './ActivityFeed.module.scss';

interface Props {
  entry: EntryRecord;
  onOpen: (entry: EntryRecord) => void;
  getIcon: (kind: string) => React.ReactNode;
}

export function ActivityItemRow({ entry, onOpen, getIcon }: Props) {
  const [dateFormat] = useDateFormatPreference();

  return (
    <button type="button" className={styles.item} onClick={() => onOpen(entry)}>
      <div className={`${styles.iconDisc} ${styles[entry.kind]}`}>{getIcon(entry.kind)}</div>
      <div className={styles.details}>
        <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {entry.kind}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formatDatePreference(entry.occurred_on, dateFormat)}
          {entry.odometer_m && ` · ${(entry.odometer_m / 1000).toLocaleString()} km`}
        </Typography>
      </div>
      {entry.amount_minor && (
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
