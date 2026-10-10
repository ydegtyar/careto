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
    backgroundColor: 'var(--mui-palette-surfaceContainer)',
    border: '1px solid var(--mui-palette-divider)',
  },
} as const satisfies Record<string, CSSProperties>;
