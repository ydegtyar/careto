import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  } as CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as CSSProperties,
  amountRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  } as CSSProperties,
  amountInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '2.25rem',
    fontWeight: 600,
    color: 'var(--mui-palette-text-primary)',
  } as CSSProperties,
} as const;
