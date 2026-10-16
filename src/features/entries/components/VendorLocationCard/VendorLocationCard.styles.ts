import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  } satisfies CSSProperties,
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } satisfies CSSProperties,
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } satisfies CSSProperties,
  icon: {
    fontSize: 17,
    color: 'primary.main',
  } satisfies SxProps<Theme>,
  title: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    color: 'text.primary',
    fontSize: '0.72rem',
  } satisfies SxProps<Theme>,
  vendorDetailsRow: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    flex: 1,
  } satisfies CSSProperties,
  vendorName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--mui-palette-text-primary)',
  } satisfies CSSProperties,
  coordsText: {
    fontSize: '0.72rem',
    color: 'var(--mui-palette-text-secondary)',
    marginTop: 2,
  } satisfies CSSProperties,
  mapLinkIcon: {
    fontSize: 14,
  } satisfies SxProps<Theme>,
  markerIcon: {
    fontSize: 18,
  } satisfies SxProps<Theme>,
} as const;
