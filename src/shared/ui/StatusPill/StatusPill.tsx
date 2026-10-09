import React from 'react';
import styles from './StatusPill.module.scss';

export type StatusLevel = 'ok' | 'upcoming' | 'due' | 'overdue';

interface Props {
  status: StatusLevel;
  label?: string;
}

const defaultLabels: Record<StatusLevel, string> = {
  ok: 'OK',
  upcoming: 'Upcoming',
  due: 'Due',
  overdue: 'Overdue',
};

export function StatusPill({ status, label }: Props) {
  return (
    <span className={`${styles.pill} ${styles[status]}`}>
      <span className={styles.dot} />
      <span className={styles.text}>{label ?? defaultLabels[status]}</span>
    </span>
  );
}
