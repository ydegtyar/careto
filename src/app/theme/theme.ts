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
          backgroundColor: g.surface3,
        },
      },
    },
  },
});
