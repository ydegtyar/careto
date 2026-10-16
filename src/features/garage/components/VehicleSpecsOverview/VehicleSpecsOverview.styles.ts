import type { CSSProperties } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

export const getIconContainerStyle = (color?: string): CSSProperties => ({
  color: color || 'var(--mui-palette-primary-main, #0284c7)',
  fontSize: 26,
});

export const styles = {
  card: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    borderRadius: 16,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 16,
    borderBottom:
      '1px solid color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 12%, transparent)',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor:
      'color-mix(in srgb, var(--mui-palette-background-paper, #0f1524) 80%, transparent)',
    border:
      '1px solid color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 25%, transparent)',
    boxShadow:
      '0 0 15px color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 15%, transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontWeight: 700,
    color: 'text.primary',
    letterSpacing: -0.3,
    fontSize: '1rem',
  },
  subtitle: {
    color: 'text.secondary',
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    mt: 0.25,
    fontSize: '0.75rem',
  },
  subtitleDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    backgroundColor: 'primary.main',
    display: 'inline-block',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  innerCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor:
      'color-mix(in srgb, var(--mui-palette-background-paper, #0f1524) 55%, transparent)',
    border:
      '1px solid color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 12%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  statLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'text.secondary',
    mb: 0.5,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  statValue: {
    fontWeight: 700,
    fontSize: '0.85rem',
    color: 'text.primary',
  },
} as const satisfies Record<string, CSSProperties | SxProps<Theme>>;
