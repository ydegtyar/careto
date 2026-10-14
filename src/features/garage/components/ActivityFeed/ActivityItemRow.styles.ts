import type { CSSProperties } from 'react';

export const getTitleStyle = (isCapitalized: boolean): CSSProperties => ({
  fontWeight: 600,
  textTransform: isCapitalized ? 'capitalize' : 'none',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const styles = {
  details: {
    minWidth: 0,
    overflow: 'hidden',
  },
  dateAndStats: {
    color: 'text.secondary',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  amount: {
    flexShrink: 0,
  },
  amountValue: {
    fontWeight: 700,
    color: 'text.primary',
    whiteSpace: 'nowrap',
  },
  amountUsd: {
    color: 'text.secondary',
    whiteSpace: 'nowrap',
  },
} as const satisfies Record<string, CSSProperties>;
