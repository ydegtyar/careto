import type { CSSProperties } from 'react';

export const styles = {
  cardContainer: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  cardTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'text.secondary',
    fontWeight: 600,
  },
  inputsRow: {
    display: 'flex',
    gap: 12,
  },
  inputRoot: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'rgba(15, 21, 36, 0.6)',
    },
  },
  switchContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 21, 36, 0.4)',
    padding: '8px 14px',
    borderRadius: 12,
    border: '1px solid rgba(125, 211, 252, 0.1)',
  },
} as const satisfies Record<string, CSSProperties | object>;
