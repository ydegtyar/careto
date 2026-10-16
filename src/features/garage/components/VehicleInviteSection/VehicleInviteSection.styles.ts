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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  } satisfies CSSProperties,
  submitButton: {
    background:
      'linear-gradient(135deg, var(--mui-palette-primary-main, #0284c7) 0%, var(--mui-palette-secondary-container, #39b8fd) 100%)',
    color: 'primary.contrastText',
    fontWeight: 700,
    fontSize: '0.8rem',
    textTransform: 'none',
    borderRadius: '12px',
    py: 1.25,
    boxShadow:
      '0 0 20px color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 35%, transparent)',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow:
        '0 0 25px color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 50%, transparent)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    mt: 0.5,
  } satisfies SxProps<Theme>,
  submitSpinner: {
    color: 'inherit',
  } satisfies SxProps<Theme>,
  inviteLinkContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor:
      'color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 10%, transparent)',
    border:
      '1px solid color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 30%, transparent)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } satisfies CSSProperties,
  inviteLinkTitle: {
    color: 'primary.main',
    fontWeight: 600,
  } satisfies SxProps<Theme>,
  inviteInputRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  } satisfies CSSProperties,
  inviteInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--mui-palette-text-primary, #0f172a)',
    fontSize: '0.8rem',
    outline: 'none',
    textOverflow: 'ellipsis',
  } satisfies CSSProperties,
  copyButton: {
    color: 'primary.main',
  } satisfies SxProps<Theme>,
};
