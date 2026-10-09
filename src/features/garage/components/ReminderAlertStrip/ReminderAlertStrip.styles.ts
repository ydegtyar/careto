import type { CSSProperties } from 'react';

export const getStackCardStyle = (index: number, total: number): CSSProperties => {
  if (index === 0) {
    return {
      position: 'relative',
      zIndex: 3,
    };
  }
  if (index === 1) {
    return {
      position: 'absolute',
      bottom: -6,
      left: 8,
      right: 8,
      height: '100%',
      zIndex: 2,
      pointerEvents: 'none',
      opacity: 0.65,
      transform: 'scale(0.96)',
    };
  }
  return {
    position: 'absolute',
    bottom: -12,
    left: 16,
    right: 16,
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
    opacity: 0.35,
    transform: 'scale(0.92)',
  };
};

export const styles = {
  stackWrapper: {
    position: 'relative',
    width: '100%',
    cursor: 'pointer',
  },
  cardInner: {
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '8px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: 'rgba(125, 211, 252, 0.15)',
    color: '#7dd3fc',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
} as const satisfies Record<string, CSSProperties>;
