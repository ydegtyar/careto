import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderRadius: 12,
    backgroundColor:
      'color-mix(in srgb, var(--mui-palette-background-paper, #0f1524) 55%, transparent)',
    border:
      '1px solid color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 12%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  } satisfies CSSProperties,
  memberInfo: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } satisfies CSSProperties,
  memberName: {
    fontWeight: 700,
    color: 'text.primary',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.825rem',
  } satisfies SxProps<Theme>,
  memberEmail: {
    color: 'text.secondary',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  } satisfies SxProps<Theme>,
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  } satisfies CSSProperties,
  deleteButton: {
    color: 'error.main',
    '&:hover': {
      backgroundColor:
        'color-mix(in srgb, var(--mui-palette-error-main, #dc2626) 12%, transparent)',
    },
  } satisfies SxProps<Theme>,
};
