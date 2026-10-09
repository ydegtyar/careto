export const glacier = {
  // Backgrounds / Surfaces
  bg: '#0a0e1a', // background, surface_container_lowest
  surface: '#0f1524', // surface, surface_dim -> MUI background.paper
  surfaceContainer: '#141c2e', // surface_container -> glass card base
  surface2: '#1a2438', // surface_container_high, surface_variant
  surface3: '#202c42', // surface_container_highest
  surfaceBright: '#1a2438', // surface_bright

  // Primary (ice-blue)
  primary: '#7dd3fc',
  onPrimary: '#001f2e',
  primaryContainer: '#0e4d6e',
  primaryFixed: '#c8eaff',
  primaryFixedDim: '#7dd3fc',
  inversePrimary: '#0a4c6e',

  // Secondary (slate blue)
  secondary: '#88b4cc',
  onSecondary: '#001f2e',
  secondaryContainer: '#1a3a4e',
  secondaryFixed: '#c0d8e8',

  // Tertiary (lavender - predictive/AI accents)
  tertiary: '#c8a0f0',
  onTertiary: '#1a002e',
  tertiaryContainer: '#3d2060',
  tertiaryFixed: '#e8d0ff',

  // Error
  error: '#ff6b6b',
  onError: '#1a0000',
  errorContainer: '#3d1414',
  onErrorContainer: '#ffb3b3',

  // Text
  text: '#e0e8f0', // on_surface
  textMuted: '#a0b4c4', // on_surface_variant

  // Outlines
  outline: '#4a6070',
  outlineVariant: '#2a3a48',

  // Inverse & Accents
  inverseSurface: '#e0e8f0',
  inverseOnSurface: '#0a0e1a',
  surfaceTint: '#7dd3fc',
} as const;

export const glacierLight = {
  // Backgrounds / Surfaces
  bg: '#f4f8fb',
  surface: '#ffffff',
  surfaceContainer: '#ebf2f8',
  surface2: '#dfe9f2',
  surface3: '#d3e0eb',
  surfaceBright: '#ffffff',

  // Primary
  primary: '#0284c7',
  onPrimary: '#ffffff',
  primaryContainer: '#e0f2fe',
  primaryFixed: '#0284c7',
  primaryFixedDim: '#38bdf8',
  inversePrimary: '#7dd3fc',

  // Secondary
  secondary: '#475569',
  onSecondary: '#ffffff',
  secondaryContainer: '#f1f5f9',
  secondaryFixed: '#64748b',

  // Tertiary
  tertiary: '#7c3aed',
  onTertiary: '#ffffff',
  tertiaryContainer: '#f3e8ff',
  tertiaryFixed: '#8b5cf6',

  // Error
  error: '#dc2626',
  onError: '#ffffff',
  errorContainer: '#fee2e2',
  onErrorContainer: '#991b1b',

  // Text
  text: '#0f172a',
  textMuted: '#64748b',

  // Outlines
  outline: '#94a3b8',
  outlineVariant: '#cbd5e1',

  // Inverse & Accents
  inverseSurface: '#0f172a',
  inverseOnSurface: '#ffffff',
  surfaceTint: '#0284c7',
} as const;
