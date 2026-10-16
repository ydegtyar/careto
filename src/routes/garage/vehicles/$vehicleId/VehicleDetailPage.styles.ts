import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export const styles = {
  container: {
    padding: '16px',
    maxWidth: 720,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
  } satisfies CSSProperties,

  notFoundWrapper: {
    padding: 16,
    maxWidth: 600,
    margin: '0 auto',
  } satisfies CSSProperties,

  notFoundCard: {
    padding: 24,
  } satisfies CSSProperties,

  notFoundTitle: {
    fontWeight: 700,
  } satisfies SxProps<Theme>,

  notFoundText: {
    color: 'text.secondary',
    mt: 1,
  } satisfies SxProps<Theme>,

  notFoundButton: {
    mt: 2,
    textTransform: 'none',
  } satisfies SxProps<Theme>,

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } satisfies CSSProperties,

  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  } satisfies CSSProperties,

  backButton: {
    color: 'text.primary',
    width: 36,
    height: 36,
    borderRadius: '12px',
    border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 18%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-paper) 60%, transparent)',
    '&:hover': {
      backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 12%, transparent)',
      borderColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent)',
    },
  } satisfies SxProps<Theme>,

  title: {
    fontWeight: 700,
    letterSpacing: -0.5,
    fontSize: '1.25rem',
  } satisfies SxProps<Theme>,

  subtitle: {
    color: 'text.secondary',
    fontSize: '0.75rem',
  } satisfies SxProps<Theme>,

  editButton: {
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-paper) 60%, transparent)',
    color: 'primary.main',
    border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 25%, transparent)',
    borderRadius: '12px',
    px: 1.5,
    py: 0.75,
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'none',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 15%, transparent)',
      borderColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 40%, transparent)',
      boxShadow: 'none',
    },
  } satisfies SxProps<Theme>,
};
