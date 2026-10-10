import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export const styles = {
  dialogTitle: {
    fontWeight: 700,
    pb: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } satisfies SxProps<Theme>,

  headerActions: {
    display: 'flex',
    gap: 4,
  } satisfies CSSProperties,

  editButton: {
    textTransform: 'none',
    color: 'primary.main',
    fontWeight: 600,
  } satisfies SxProps<Theme>,

  deleteButton: {
    textTransform: 'none',
    fontWeight: 600,
  } satisfies SxProps<Theme>,

  dialogContent: {
    py: 2,
  } satisfies SxProps<Theme>,

  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  } satisfies CSSProperties,

  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } satisfies CSSProperties,

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    paddingTop: 8,
  } satisfies CSSProperties,

  formRow: {
    display: 'flex',
    gap: 12,
  } satisfies CSSProperties,

  currencyControl: {
    width: 210,
  } satisfies CSSProperties,
};
