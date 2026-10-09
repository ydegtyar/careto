import type { CSSProperties } from 'react';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  topBar: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    overflowX: 'auto',
    paddingBottom: 4,
  },
  select: {
    borderRadius: '16px',
    backgroundColor: 'rgba(15, 21, 36, 0.6)',
    color: '#e0e8f0',
    fontSize: '0.82rem',
    fontWeight: 600,
    height: 34,
    border: '1px solid rgba(125, 211, 252, 0.2)',
  },
  customRangeCard: {
    padding: '12px 14px',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: 'rgba(15, 21, 36, 0.6)',
      fontSize: '0.8rem',
    },
  },
} as const satisfies Record<string, CSSProperties | Record<string, unknown>>;
