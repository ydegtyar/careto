import type { SxProps, Theme } from '@mui/material/styles';

export const getCopyButtonSx = (copied: boolean): SxProps<Theme> => ({
  p: '2px',
  color: copied ? 'success.main' : 'text.secondary',
  '&:hover': {
    color: 'primary.main',
  },
});
