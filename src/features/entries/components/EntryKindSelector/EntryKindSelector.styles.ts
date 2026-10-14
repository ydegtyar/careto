import type { SxProps, Theme } from '@mui/material/styles';

export const styles: Record<string, SxProps<Theme>> = {
  toggleGroup: {
    display: 'flex',
    gap: 1.25,
    width: '100%',
    '& .MuiToggleButtonGroup-grouped': {
      border:
        '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent) !important',
      borderRadius: '16px !important',
      margin: '0 !important',
      '&:not(:first-of-type)': {
        borderLeft:
          '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent) !important',
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
      backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-paper) 70%, transparent)',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '& svg': {
        fontSize: '1.25rem',
        transition: 'transform 0.2s ease, color 0.2s ease',
        color: 'text.secondary',
      },
      '&:hover': {
        backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)',
        borderColor:
          'color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent) !important',
        color: 'text.primary',
        transform: 'translateY(-1px)',
        '& svg': {
          color: 'primary.main',
          transform: 'scale(1.1)',
        },
      },
      '&.Mui-selected': {
        backgroundColor:
          'color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent) !important',
        color: 'primary.main',
        borderColor:
          'color-mix(in srgb, var(--mui-palette-primary-main) 45%, transparent) !important',
        boxShadow: '0 0 12px color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent)',
        '& svg': {
          color: 'primary.main',
          transform: 'scale(1.05)',
        },
        '&:hover': {
          backgroundColor:
            'color-mix(in srgb, var(--mui-palette-primary-main) 24%, transparent) !important',
          borderColor:
            'color-mix(in srgb, var(--mui-palette-primary-main) 60%, transparent) !important',
        },
      },
      '&:active': {
        transform: 'scale(0.97)',
      },
      '&.Mui-disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'auto',
      },
    },
  },
};
