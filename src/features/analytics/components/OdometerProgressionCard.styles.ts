import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '20px',
    background: 'rgba(15, 21, 36, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(125, 211, 252, 0.12)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    gridColumn: '1 / -1', // Span full width in grid if layout allows
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    color: '#38bdf8',
    fontSize: 22,
  },
  titleTextGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#f8fafc',
    margin: 0,
  },
  subTitle: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  deltaDistance: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#38bdf8',
  },
  currentBadge: {
    alignSelf: 'flex-end',
    background: 'rgba(192, 132, 252, 0.25)',
    border: '1px solid rgba(192, 132, 252, 0.5)',
    borderRadius: '12px',
    padding: '3px 10px',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#e9d5ff',
    marginBottom: '4px',
  },
  chartContainer: {
    width: '100%',
    height: 180,
    marginTop: '8px',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    fontSize: '0.8rem',
  },
  rollingPace: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#94a3b8',
  },
  paceHighlight: {
    color: '#f8fafc',
    fontWeight: 700,
  },
  nextMilestone: {
    color: '#38bdf8',
    fontWeight: 600,
  },
} as const satisfies Record<string, CSSProperties>;
