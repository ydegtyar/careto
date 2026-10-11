import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  glassCard: {
    background: 'rgba(15, 21, 36, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(125, 211, 252, 0.12)',
    borderRadius: '20px',
    padding: '20px',
    color: '#e0e8f0',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
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
    color: '#94a3b8',
    margin: 0,
  },
  grid2x2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  subMetricText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  highlightCyan: {
    color: '#7dd3fc',
    fontWeight: 600,
  },
  highlightPurple: {
    color: '#c8a0f0',
    fontWeight: 600,
  },
  highlightGreen: {
    color: '#34d399',
    fontWeight: 600,
  },
  highlightAmber: {
    color: '#fbbf24',
    fontWeight: 600,
  },
  highlightRed: {
    color: '#f87171',
    fontWeight: 600,
  },
};
