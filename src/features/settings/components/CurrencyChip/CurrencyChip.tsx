import Chip from '@mui/material/Chip';

interface Props {
  item: { code: string; symbol: string };
  isFav: boolean;
  onToggle: (code: string) => void;
}

export function CurrencyChip({ item, isFav, onToggle }: Props) {
  return (
    <Chip
      label={`${item.code} (${item.symbol})`}
      onClick={() => onToggle(item.code)}
      variant={isFav ? 'filled' : 'outlined'}
      sx={{
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.8rem',
        backgroundColor: isFav ? 'rgba(125, 211, 252, 0.2)' : 'transparent',
        borderColor: isFav ? 'primary.main' : 'rgba(125, 211, 252, 0.15)',
        color: isFav ? 'primary.main' : 'text.secondary',
      }}
    />
  );
}
