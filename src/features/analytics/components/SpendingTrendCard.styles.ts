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
  legendRow: {
    display: 'flex',
    gap: 8,
    fontSize: '0.7rem',
  },
  fuelLegend: { color: 'var(--mui-palette-primary-main)' },
  serviceLegend: { color: 'var(--mui-palette-secondary-main)' },
  adminLegend: { color: 'var(--mui-palette-tertiary-main)' },
} as const satisfies Record<string, CSSProperties>;
