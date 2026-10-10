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
  switchContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: 12,
    border: '1px solid var(--mui-palette-divider)',
  },
  inputRoot: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
    },
  },
} as const satisfies Record<string, CSSProperties | object>;
