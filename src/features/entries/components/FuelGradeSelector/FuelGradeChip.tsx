import EvStationIcon from '@mui/icons-material/EvStation';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import Chip from '@mui/material/Chip';
import type { FuelGrade } from '@/shared/lib/fuel-grades';

interface Props {
  grade: FuelGrade;
  isSelected: boolean;
  onSelect: (id: string) => void;
  getChipSx: (selected: boolean) => object;
}

export function FuelGradeChip({ grade, isSelected, onSelect, getChipSx }: Props) {
  const isEv = grade.category === 'ev' || grade.id.startsWith('ev');
  return (
    <Chip
      key={grade.id}
      icon={
        isEv ? (
          <EvStationIcon sx={{ fontSize: 16 }} />
        ) : (
          <LocalGasStationIcon sx={{ fontSize: 16 }} />
        )
      }
      label={grade.label}
      onClick={() => onSelect(grade.id)}
      variant={isSelected ? 'filled' : 'outlined'}
      sx={getChipSx(isSelected)}
    />
  );
}
