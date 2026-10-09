import type { CSSProperties } from 'react';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  chipGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
} as const satisfies Record<string, CSSProperties>;

export const getChipSx = (isSelected: boolean) => ({
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '0.78rem',
  height: 32,
  backgroundColor: isSelected ? 'rgba(125, 211, 252, 0.2)' : 'transparent',
  borderColor: isSelected ? 'primary.main' : 'rgba(125, 211, 252, 0.15)',
  color: isSelected ? 'primary.main' : 'text.secondary',
  '& .MuiChip-icon': {
    color: isSelected ? 'primary.main' : 'text.secondary',
  },
});
