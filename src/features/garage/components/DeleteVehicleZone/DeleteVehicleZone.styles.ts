import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    borderRadius: 16,
    border: '1px solid color-mix(in srgb, var(--mui-palette-error-main, #dc2626) 25%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-error-main, #dc2626) 8%, transparent)',
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
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-error-main, #dc2626) 15%, transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } satisfies CSSProperties,
  headerIcon: {
    color: 'error.main',
    fontSize: 18,
  } satisfies SxProps<Theme>,
  headerTitle: {
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: -0.2,
    color: 'error.main',
  } satisfies SxProps<Theme>,
  description: {
    color: 'text.secondary',
    fontSize: '0.75rem',
    lineHeight: 1.5,
  } satisfies SxProps<Theme>,
  deleteButton: {
    width: '100%',
    py: 1.25,
    borderRadius: '12px',
    background:
      'linear-gradient(135deg, var(--mui-palette-error-main, #dc2626) 0%, color-mix(in srgb, var(--mui-palette-error-main, #dc2626) 80%, black) 100%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.8rem',
    textTransform: 'none',
    boxShadow:
      '0 0 16px color-mix(in srgb, var(--mui-palette-error-main, #dc2626) 35%, transparent)',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow:
        '0 0 22px color-mix(in srgb, var(--mui-palette-error-main, #dc2626) 50%, transparent)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    mt: 0.5,
  } satisfies SxProps<Theme>,
  dialogTitle: {
    fontWeight: 700,
    color: 'error.main',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  } satisfies SxProps<Theme>,
  dialogContentTextPrimary: {
    color: 'text.primary',
  } satisfies SxProps<Theme>,
  dialogContentTextSecondary: {
    color: 'text.secondary',
    mt: 1,
    fontSize: '0.875rem',
  } satisfies SxProps<Theme>,
  dialogActions: {
    px: 3,
    pb: 2,
  } satisfies SxProps<Theme>,
  cancelButton: {
    color: 'text.secondary',
    textTransform: 'none',
  } satisfies SxProps<Theme>,
  confirmButton: {
    fontWeight: 700,
    textTransform: 'none',
  } satisfies SxProps<Theme>,
};
