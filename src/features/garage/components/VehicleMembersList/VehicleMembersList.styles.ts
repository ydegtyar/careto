import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    borderRadius: 16,
  } satisfies CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  } satisfies CSSProperties,
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor:
      'color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 12%, transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } satisfies CSSProperties,
  headerIcon: {
    color: 'primary.main',
    fontSize: 18,
  } satisfies SxProps<Theme>,
  headerTitle: {
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: -0.2,
  } satisfies SxProps<Theme>,
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  } satisfies CSSProperties,
  skeletonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 8,
    backgroundColor:
      'color-mix(in srgb, var(--mui-palette-background-paper, #0f1524) 60%, transparent)',
    border:
      '1px solid color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 15%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  } satisfies CSSProperties,
  skeletonTextCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
    minWidth: 0,
  } satisfies CSSProperties,
  skeletonActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  } satisfies CSSProperties,
};
