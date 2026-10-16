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
  confirmButton: {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: 9999,
  } satisfies SxProps<Theme>,
};
