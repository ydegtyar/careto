import type { SxProps, Theme } from '@mui/material/styles';

export const styles = {
  totalSettledCaption: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
    color: 'text.secondary',
    fontSize: '0.68rem',
  } satisfies SxProps<Theme>,
  totalAmountText: {
    fontWeight: 800,
    color: 'text.primary',
    letterSpacing: -0.5,
  } satisfies SxProps<Theme>,
};
