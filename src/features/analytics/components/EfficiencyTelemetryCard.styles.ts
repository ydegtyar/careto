import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 10,
    textAlign: 'center',
  },
  metricCard: {
    padding: '10px 6px',
    backgroundColor: 'rgba(15, 21, 36, 0.5)',
  },
} as const satisfies Record<string, CSSProperties>;
