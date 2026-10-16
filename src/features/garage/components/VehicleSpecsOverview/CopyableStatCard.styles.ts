import type { SxProps, Theme } from '@mui/material/styles';

export const statStyles = {
  label: {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'text.secondary',
    mb: 0.5,
  } satisfies SxProps<Theme>,

  value: {
    fontWeight: 700,
    fontSize: '0.85rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s ease',
  } satisfies SxProps<Theme>,

  monospaceValue: {
    fontFamily: 'monospace',
    letterSpacing: '-0.02em',
  } satisfies SxProps<Theme>,
};
