import Button from '@mui/material/Button';

interface Props {
  inv: string;
  isSelected: boolean;
  onSelect: (inv: string) => void;
}

export function RecurringIntervalButton({ inv, isSelected, onSelect }: Props) {
  return (
    <Button
      type="button"
      size="small"
      onClick={() => onSelect(inv)}
      sx={{
        flex: 1,
        borderRadius: 3,
        textTransform: 'capitalize',
        fontWeight: 600,
        backgroundColor: isSelected ? 'primary.main' : 'rgba(32, 44, 66, 0.6)',
        color: isSelected ? 'primary.contrastText' : 'text.primary',
      }}
    >
      {inv}
    </Button>
  );
}
