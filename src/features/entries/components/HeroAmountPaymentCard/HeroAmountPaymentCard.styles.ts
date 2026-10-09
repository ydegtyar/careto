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
  currencySelect: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'primary.main',
    backgroundColor: 'rgba(32, 44, 66, 0.8)',
    borderRadius: 4,
    px: 1.5,
    py: 0.25,
  },
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
    border: isSelected ? '1px solid #7dd3fc' : '1px solid rgba(125, 211, 252, 0.1)',
    backgroundColor: isSelected ? 'rgba(32, 54, 86, 0.85)' : 'rgba(10, 14, 26, 0.5)',
    color: isSelected ? '#7dd3fc' : '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
} as const;
