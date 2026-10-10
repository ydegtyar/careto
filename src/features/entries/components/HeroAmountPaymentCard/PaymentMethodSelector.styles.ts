import type { CSSProperties } from 'react';

export const getPaymentOptionButtonStyle = (isSelected: boolean): CSSProperties => ({
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
    : 'var(--mui-palette-action-hover, rgba(0, 0, 0, 0.02))',
  color: isSelected ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-text-primary)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  font: 'inherit',
  outline: 'none',
});

export const styles = {
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
} as const;
