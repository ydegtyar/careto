import type { Components, Theme } from '@mui/material/styles';

export const MuiDialog: Components<Theme>['MuiDialog'] = {
  styleOverrides: {
    paper: {
      borderRadius: 16,
      backgroundColor: 'var(--mui-palette-background-paper)',
      backgroundImage: 'none',
      color: 'var(--mui-palette-text-primary)',
      border: '1px solid var(--mui-palette-divider)',
      boxShadow: '0 8px 32px color-mix(in srgb, var(--mui-palette-text-primary) 12%, transparent)',
    },
  },
};
