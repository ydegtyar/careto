import type { SxProps, Theme } from '@mui/material/styles';

export const styles: Record<string, SxProps<Theme>> = {
  toggleGroup: {
    display: 'flex',
    gap: 1.25,
    width: '100%',
    '& .MuiToggleButtonGroup-grouped': {
      border: '1px solid rgba(125, 211, 252, 0.18) !important',
      borderRadius: '16px !important',
      margin: '0 !important',
      '&:not(:first-of-type)': {
        borderLeft: '1px solid rgba(125, 211, 252, 0.18) !important',
      },
    },
    '& .MuiToggleButton-root': {
      flex: 1,
      minWidth: 0,
      py: 1.25,
      px: 1.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      color: 'text.secondary',
      backgroundColor: 'rgba(15, 21, 36, 0.4)',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '& svg': {
        fontSize: '1.25rem',
        transition: 'transform 0.2s ease, color 0.2s ease',
        color: 'text.secondary',
      },
      '&:hover': {
        backgroundColor: 'rgba(125, 211, 252, 0.12)',
        borderColor: 'rgba(125, 211, 252, 0.35) !important',
        color: 'text.primary',
        transform: 'translateY(-1px)',
        '& svg': {
          color: 'primary.main',
          transform: 'scale(1.1)',
        },
      },
      '&.Mui-selected': {
        backgroundColor: 'rgba(125, 211, 252, 0.18) !important',
        color: 'primary.main',
        borderColor: 'rgba(125, 211, 252, 0.45) !important',
        boxShadow: '0 0 12px rgba(125, 211, 252, 0.15)',
        '& svg': {
          color: 'primary.main',
          transform: 'scale(1.05)',
        },
        '&:hover': {
          backgroundColor: 'rgba(125, 211, 252, 0.25) !important',
          borderColor: 'rgba(125, 211, 252, 0.6) !important',
        },
      },
      '&:active': {
        transform: 'scale(0.97)',
      },
    },
  },
};
