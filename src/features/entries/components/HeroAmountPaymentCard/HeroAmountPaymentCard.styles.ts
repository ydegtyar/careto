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
    color: '#e0e8f0',
  } as CSSProperties,
  paymentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 6,
  } as CSSProperties,
  paymentButtonGroup: {
    display: 'flex',
    gap: 8,
  } as CSSProperties,
  paymentOptionButton: (isSelected: boolean) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 10px',
    borderRadius: 12,
    border: isSelected
      ? '1px solid var(--mui-palette-primary-main)'
      : '1px solid var(--mui-palette-divider)',
    backgroundColor: isSelected
      ? 'color-mix(in srgb, var(--mui-palette-primary-main) 15%, transparent)'
      : 'transparent',
    color: isSelected ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  currencySelect: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    },
  },
} as const;
