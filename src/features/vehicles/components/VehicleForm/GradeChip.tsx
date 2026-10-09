import Chip from '@mui/material/Chip';

export function GradeChip({
  grade,
  isSelected,
  onToggle,
}: {
  grade: { id: string; label: string };
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <Chip
      label={grade.label}
      onClick={() => onToggle(grade.id)}
      variant={isSelected ? 'filled' : 'outlined'}
      sx={{
        borderRadius: '10px',
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 30,
        backgroundColor: isSelected ? 'rgba(125, 211, 252, 0.2)' : 'transparent',
        borderColor: isSelected ? 'primary.main' : 'rgba(125, 211, 252, 0.15)',
        color: isSelected ? 'primary.main' : 'text.secondary',
      }}
    />
  );
}
