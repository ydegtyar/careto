import CheckIcon from '@mui/icons-material/Check';

export function ColorSwatchButton({
  swatchHex,
  selectedValue,
  onSelect,
}: {
  swatchHex: string;
  selectedValue: string;
  onSelect: (hex: string) => void;
}) {
  const isSelected = selectedValue === swatchHex;
  return (
    <button
      type="button"
      onClick={() => onSelect(swatchHex)}
      style={{
        height: 36,
        borderRadius: 10,
        backgroundColor: swatchHex,
        border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isSelected ? `0 0 12px ${swatchHex}` : 'none',
      }}
    >
      {isSelected && <CheckIcon sx={{ color: '#000', fontSize: 18 }} />}
    </button>
  );
}
