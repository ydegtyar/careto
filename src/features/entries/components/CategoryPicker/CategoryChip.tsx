import Chip from '@mui/material/Chip';

export function CategoryChip({
  cat,
  isSelected,
  onSelect,
  onRemove,
  renderIcon,
  getChipSx,
}: {
  cat: { id: string; label: string; iconName: string; isDefault?: boolean };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove?: (e: React.MouseEvent, id: string) => void;
  renderIcon: (name: string) => React.ReactElement | undefined;
  getChipSx: (selected: boolean) => object;
}) {
  return (
    <Chip
      icon={renderIcon(cat.iconName)}
      label={cat.label}
      onClick={() => onSelect(cat.id)}
      onDelete={!cat.isDefault && onRemove ? (e) => onRemove(e, cat.id) : undefined}
      variant={isSelected ? 'filled' : 'outlined'}
      sx={getChipSx(isSelected)}
    />
  );
}
