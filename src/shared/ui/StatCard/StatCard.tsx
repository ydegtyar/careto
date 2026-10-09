import type { ReactNode } from 'react';
import { GlassCard } from '../GlassCard/GlassCard';
import styles from './StatCard.module.scss';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: ReactNode;
}

export function StatCard({ label, value, unit, trend, trendPositive, icon }: Props) {
  return (
    <GlassCard className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {trend && (
        <div className={`${styles.trend} ${trendPositive ? styles.positive : styles.negative}`}>
          {trend}
        </div>
      )}
    </GlassCard>
  );
}
