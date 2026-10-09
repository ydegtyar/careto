import Typography from '@mui/material/Typography';
import type React from 'react';
import type { EntryRecord } from './ActivityFeed';
import styles from './ActivityFeed.module.scss';

interface Props {
  entry: EntryRecord;
  onOpen: (entry: EntryRecord) => void;
  getIcon: (kind: string) => React.ReactNode;
  formatAmount: (entry: EntryRecord) => string;
}

export function ActivityItemRow({ entry, onOpen, getIcon, formatAmount }: Props) {
  return (
    <button
      type="button"
      className={styles.item}
      onClick={() => onOpen(entry)}
      style={{
        width: '100%',
        textIndent: 0,
        textAlign: 'left',
        background: 'none',
        border: 'none',
        padding: 0,
      }}
    >
      <div className={`${styles.iconDisc} ${styles[entry.kind]}`}>{getIcon(entry.kind)}</div>
      <div className={styles.details}>
        <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {entry.kind}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {entry.occurred_on}
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
