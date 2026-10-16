import type { SxProps, Theme } from '@mui/material/styles';

export const styles = {
  dialogTitle: {
    fontWeight: 700,
  } satisfies SxProps<Theme>,
  dialogContentText: {
    color: 'text.secondary',
  } satisfies SxProps<Theme>,
  dialogActions: {
    pb: 2,
    px: 2,
  } satisfies SxProps<Theme>,
  cancelButton: {
    textTransform: 'none',
    borderRadius: 9999,
  } satisfies SxProps<Theme>,
  deleteConfirmButton: {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: 9999,
  } satisfies SxProps<Theme>,
  icon: {
    fontSize: 15,
    color: 'primary.main',
  } satisfies SxProps<Theme>,
  deleteIcon: {
    fontSize: 16,
  } satisfies SxProps<Theme>,
} as const;
