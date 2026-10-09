import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  header: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'flex-start',
  },
  tcoAmountRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  periodTotalContainer: {
    textAlign: 'right',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 8,
    marginTop: 4,
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 21, 36, 0.4)',
    padding: '8px 12px',
    borderRadius: 10,
  },
  depreciationLabel: { fontSize: '0.78rem', color: '#c8a0f0' },
  fuelLabel: { fontSize: '0.78rem', color: '#7dd3fc' },
  insuranceLabel: { fontSize: '0.78rem', color: '#88b4cc' },
  maintenanceLabel: { fontSize: '0.78rem', color: '#fbbf24' },
  itemValue: { fontSize: '0.82rem', fontWeight: 700 },
  chip: {
    backgroundColor: 'rgba(125, 211, 252, 0.12)',
    color: '#7dd3fc',
    fontSize: '0.72rem',
    fontWeight: 600,
    height: 26,
    borderRadius: '8px',
    width: 'fit-content',
  },
} as const satisfies Record<string, CSSProperties | Record<string, unknown>>;
