import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  glassCard: {
    background: 'color-mix(in srgb, var(--mui-palette-background-paper) 70%, transparent)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 18%, transparent)',
    borderRadius: '20px',
    padding: '20px',
    color: 'var(--mui-palette-text-primary)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
    position: 'relative',
    overflow: 'hidden',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: 'var(--mui-palette-text-secondary)',
    margin: 0,
  },
  grid2x2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  subMetricText: {
    fontSize: '0.75rem',
    color: 'var(--mui-palette-text-secondary)',
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  highlightCyan: {
    color: 'var(--mui-palette-primary-main)',
    fontWeight: 600,
  },
  highlightPurple: {
    color: 'var(--mui-palette-tertiary-main)',
    fontWeight: 600,
  },
  highlightGreen: {
    color: '#10b981',
    fontWeight: 600,
  },
  highlightAmber: {
    color: '#f59e0b',
    fontWeight: 600,
  },
  highlightRed: {
    color: '#ef4444',
    fontWeight: 600,
  },
};
