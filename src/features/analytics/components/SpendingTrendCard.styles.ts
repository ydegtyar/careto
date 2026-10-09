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
  fuelLegend: { color: '#7dd3fc' },
  serviceLegend: { color: '#88b4cc' },
  adminLegend: { color: '#c8a0f0' },
} as const satisfies Record<string, CSSProperties>;
