import type { CSSProperties } from 'react';

export const getIconContainerStyle = (color?: string): CSSProperties => ({
  color: color || '#7dd3fc',
  fontSize: 26,
});

export const styles = {
  card: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(125, 211, 252, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    paddingTop: 8,
    borderTop: '1px solid rgba(125, 211, 252, 0.1)',
  },
} as const satisfies Record<string, CSSProperties>;
