import type { SxProps, Theme } from '@mui/material/styles';
import type React from 'react';

export const cardStyle: React.CSSProperties = {
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

export const headerContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

export const toggleButtonGroupSx: SxProps<Theme> = {
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    display: 'flex',
    gap: 0.5,
    borderRadius: 2,
    py: 0.75,
  },
};
