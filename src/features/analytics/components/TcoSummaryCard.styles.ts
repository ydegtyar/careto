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
    backgroundColor: 'var(--mui-palette-surfaceContainer)',
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid var(--mui-palette-divider)',
  },
  depreciationLabel: { fontSize: '0.78rem', color: 'var(--mui-palette-tertiary-main, #c8a0f0)' },
  fuelLabel: { fontSize: '0.78rem', color: 'var(--mui-palette-primary-main, #7dd3fc)' },
  insuranceLabel: { fontSize: '0.78rem', color: 'var(--mui-palette-secondary-main, #88b4cc)' },
  maintenanceLabel: { fontSize: '0.78rem', color: 'var(--mui-palette-warning-main, #fbbf24)' },
  itemValue: { fontSize: '0.82rem', fontWeight: 700, color: 'var(--mui-palette-text-primary)' },
  chip: {
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 12%, transparent)',
    color: 'var(--mui-palette-primary-main)',
    fontSize: '0.72rem',
    fontWeight: 600,
    height: 26,
    borderRadius: '8px',
    width: 'fit-content',
  },
} as const satisfies Record<string, CSSProperties | Record<string, unknown>>;
