import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export const cardStyle: CSSProperties = {
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

export const headerContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

export const toggleButtonGroupSx: SxProps<Theme> = {
  backgroundColor: 'surfaceContainer',
  borderRadius: 3,
  p: 0.5,
  border: '1px solid',
  borderColor: 'divider',
  '& .MuiToggleButton-root': {
    flex: 1,
    borderRadius: 2.5,
    border: 'none',
    py: 1,
    px: 1.5,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: 'text.secondary',
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    '&.Mui-selected': {
      backgroundColor: 'primary.main',
      color: 'primary.contrastText',
      boxShadow: '0 0 16px rgba(125, 211, 252, 0.45), 0 2px 8px rgba(0, 0, 0, 0.2)',
      '& svg': {
        color: 'primary.contrastText',
      },
      '&:hover': {
        backgroundColor: 'primary.light',
        color: '#000000',
        boxShadow: '0 0 22px rgba(125, 211, 252, 0.75), 0 4px 12px rgba(0, 0, 0, 0.3)',
        transform: 'translateY(-1px)',
        '& svg': {
          color: '#000000',
        },
      },
    },
    '&:hover': {
      backgroundColor: 'rgba(125, 211, 252, 0.12)',
      color: 'text.primary',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'scale(0.97)',
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    },
    '& svg': {
      transition: 'transform 0.25s ease',
    },
    '&:hover svg': {
      transform: 'scale(1.15) rotate(-5deg)',
    },
  },
};
