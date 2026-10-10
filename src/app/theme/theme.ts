import { createTheme } from '@mui/material/styles';
import { glacier as g, glacierLight as gl } from './tokens';

declare module '@mui/material/styles' {
  interface Palette {
    surface2: string;
    surface3: string;
    surfaceContainer: string;
    primaryContainer: string;
    secondaryContainer: string;
    tertiary: Palette['primary'];
    tertiaryContainer: string;
  }
  interface PaletteOptions {
    surface2?: string;
    surface3?: string;
    surfaceContainer?: string;
    primaryContainer?: string;
    secondaryContainer?: string;
    tertiary?: PaletteOptions['primary'];
    tertiaryContainer?: string;
  }
}

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-color-scheme',
  },
  defaultColorScheme: 'dark',
  colorSchemes: {
    dark: {
      palette: {
        mode: 'dark',
        background: {
          default: g.bg,
          paper: g.surface,
        },
        primary: {
          main: g.primary,
          contrastText: g.onPrimary,
        },
        secondary: {
          main: g.secondary,
          contrastText: g.onSecondary,
        },
        error: {
          main: g.error,
          contrastText: '#ffffff',
        },
        text: {
          primary: g.text,
          secondary: g.textMuted,
        },
        divider: g.outlineVariant,
        surface2: g.surface2,
        surface3: g.surface3,
        surfaceContainer: g.surfaceContainer,
        primaryContainer: g.primaryContainer,
        secondaryContainer: g.secondaryContainer,
        tertiary: {
          main: g.tertiary,
          contrastText: g.onTertiary,
        },
        tertiaryContainer: g.tertiaryContainer,
      },
    },
    light: {
      palette: {
        mode: 'light',
        background: {
          default: gl.bg,
          paper: gl.surface,
        },
        primary: {
          main: gl.primary,
          contrastText: gl.onPrimary,
        },
        secondary: {
          main: gl.secondary,
          contrastText: gl.onSecondary,
        },
        error: {
          main: gl.error,
          contrastText: '#ffffff',
        },
        text: {
          primary: gl.text,
          secondary: gl.textMuted,
        },
        divider: gl.outlineVariant,
        surface2: gl.surface2,
        surface3: gl.surface3,
        surfaceContainer: gl.surfaceContainer,
        primaryContainer: gl.primaryContainer,
        secondaryContainer: gl.secondaryContainer,
        tertiary: {
          main: gl.tertiary,
          contrastText: gl.onTertiary,
        },
        tertiaryContainer: gl.tertiaryContainer,
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily:
      '"Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 12,
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.6px',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          height: 28,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          backgroundColor: 'var(--mui-palette-surface3)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'var(--mui-palette-surfaceContainer)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            backgroundColor: 'var(--mui-palette-surface2)',
          },
          '&.Mui-focused': {
            backgroundColor: 'var(--mui-palette-surface2)',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--mui-palette-divider)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--mui-palette-outline)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--mui-palette-primary-main)',
            borderWidth: '1.5px',
          },
        },
        input: {
          color: 'var(--mui-palette-text-primary)',
          '&::placeholder': {
            color: 'var(--mui-palette-text-secondary)',
            opacity: 0.7,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'var(--mui-palette-text-secondary)',
          '&.Mui-focused': {
            color: 'var(--mui-palette-primary-main)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'var(--mui-palette-background-paper)',
          color: 'var(--mui-palette-text-primary)',
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          slotProps: {
            paper: {
              elevation: 0,
              sx: {
                backgroundColor: 'var(--mui-palette-background-paper)',
                backgroundImage: 'none',
                border: '1px solid var(--mui-palette-divider)',
                color: 'var(--mui-palette-text-primary)',
                borderRadius: 3,
                boxShadow:
                  '0 8px 32px color-mix(in srgb, var(--mui-palette-text-primary) 12%, transparent)',
              },
            },
          },
        },
      },
      styleOverrides: {
        icon: {
          color: 'var(--mui-palette-text-secondary)',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: 'var(--mui-palette-text-secondary)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          backgroundColor: 'var(--mui-palette-background-paper)',
          backgroundImage: 'none',
          border: '1px solid var(--mui-palette-divider)',
          color: 'var(--mui-palette-text-primary)',
          boxShadow:
            '0 8px 32px color-mix(in srgb, var(--mui-palette-text-primary) 12%, transparent)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 36,
          backgroundColor: 'var(--mui-palette-surfaceContainer)',
          borderRadius: 12,
          padding: 3,
          border: '1px solid var(--mui-palette-divider)',
        },
        indicator: {
          height: '100%',
          borderRadius: 10,
          backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 18%, transparent)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 30,
          padding: '4px 14px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          color: 'var(--mui-palette-text-secondary)',
          zIndex: 1,
          transition: 'color 0.2s ease',
          '&:hover': {
            color: 'var(--mui-palette-text-primary)',
          },
          '&.Mui-selected': {
            color: 'var(--mui-palette-primary-main)',
            fontWeight: 700,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: 8,
          margin: '2px 6px',
          color: 'var(--mui-palette-text-primary)',
          '&:hover': {
            backgroundColor: 'var(--mui-palette-surfaceContainer)',
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--mui-palette-primaryContainer)',
            color: 'var(--mui-palette-primary-main)',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'var(--mui-palette-primaryContainer)',
            },
          },
        },
      },
    },
  },
});
