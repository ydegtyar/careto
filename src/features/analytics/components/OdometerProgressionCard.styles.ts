import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '20px',
    background: 'color-mix(in srgb, var(--mui-palette-background-paper) 70%, transparent)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 18%, transparent)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
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
    color: 'var(--mui-palette-primary-main)',
    fontSize: 22,
  },
  titleTextGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--mui-palette-text-primary)',
    margin: 0,
  },
  subTitle: {
    fontSize: '0.75rem',
    color: 'var(--mui-palette-text-secondary)',
    marginTop: '2px',
  },
  deltaDistance: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--mui-palette-primary-main)',
  },
  currentBadge: {
    alignSelf: 'flex-end',
    background: 'color-mix(in srgb, var(--mui-palette-tertiary-main) 20%, transparent)',
    border: '1px solid color-mix(in srgb, var(--mui-palette-tertiary-main) 45%, transparent)',
    borderRadius: '12px',
    padding: '3px 10px',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--mui-palette-tertiary-main)',
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
    borderTop: '1px solid var(--mui-palette-divider)',
    fontSize: '0.8rem',
  },
  rollingPace: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--mui-palette-text-secondary)',
  },
  paceHighlight: {
    color: 'var(--mui-palette-text-primary)',
    fontWeight: 700,
  },
  nextMilestone: {
    color: 'var(--mui-palette-primary-main)',
    fontWeight: 600,
  },
} as const satisfies Record<string, CSSProperties>;
