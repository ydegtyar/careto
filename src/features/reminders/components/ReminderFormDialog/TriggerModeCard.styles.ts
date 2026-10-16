import type { CSSProperties } from 'react';

export const getTriggerModeCardStyle = (isSelected: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: 12,
  borderRadius: 12,
  border: isSelected
    ? '2px solid var(--mui-palette-primary-main, #0284c7)'
    : '1px solid var(--mui-palette-divider, rgba(255, 255, 255, 0.12))',
  backgroundColor: isSelected
    ? 'color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 10%, transparent)'
    : 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.15s ease',
});

export const getTriggerModeTitleStyle = (isSelected: boolean): CSSProperties => ({
  fontSize: 13,
  fontWeight: 700,
  color: isSelected
    ? 'var(--mui-palette-primary-main, #0284c7)'
    : 'var(--mui-palette-text-primary, inherit)',
});

export const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  recommendedBadge: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--mui-palette-primary-main, #0284c7)',
    backgroundColor:
      'color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 15%, transparent)',
    padding: '2px 6px',
    borderRadius: 4,
  },
  description: {
    fontSize: 11,
    color: 'var(--mui-palette-text-secondary, rgba(255, 255, 255, 0.6))',
    lineHeight: 1.3,
  },
} as const satisfies Record<string, CSSProperties>;
