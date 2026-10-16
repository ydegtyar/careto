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

export const chipsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 4,
};

export const baseCurrencySectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginTop: 8,
  paddingTop: 12,
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
};

export const baseCurrencyHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

export const selectSx: SxProps<Theme> = {
  borderRadius: 2,
};
