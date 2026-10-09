import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useAppStore } from '@/app/store';
import { vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import { getGradesForPowertrain, useAccountFuelGrades } from '@/shared/lib/fuel-grades';
import { useLastUsedFuelGrade } from '../../lib/fuel-grade-storage';
import { FuelGradeChip } from './FuelGradeChip';
import { getChipSx, styles } from './FuelGradeSelector.styles';

interface Props {
  selectedGrade: string;
  onSelectGrade: (gradeId: string) => void;
  filterCategory?: 'petrol' | 'diesel' | 'gas' | 'ev' | 'alternative' | 'all';
}

export const FuelGradeSelector: React.FC<Props> = ({
  selectedGrade,
  onSelectGrade,
  filterCategory = 'all',
}) => {
  const { activeVehicleId } = useAppStore();
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());
  const { allGrades } = useAccountFuelGrades();
  const [, setLastUsedFuelGrade] = useLastUsedFuelGrade();

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const powertrain = activeVehicle?.powertrain;

  const vehicleFuelGrades = activeVehicle?.fuel_grades;

  let availableGrades = allGrades;
  if (vehicleFuelGrades && vehicleFuelGrades.length > 0) {
    availableGrades = allGrades.filter((g) => vehicleFuelGrades.includes(g.id));
  } else if (powertrain) {
    availableGrades = getGradesForPowertrain(powertrain, allGrades);
  }

  const title =
    powertrain === 'ev' ? 'Energy Grade' : powertrain ? 'Fuel Grade' : 'Fuel / Energy Grade';

  let displayedGrades = availableGrades;
  if (filterCategory !== 'all') {
    displayedGrades = availableGrades.filter((g) => g.category === filterCategory);
  }

  const handleSelectGrade = (gradeId: string) => {
    onSelectGrade(gradeId);
    setLastUsedFuelGrade(gradeId);
  };

  return (
    <div style={styles.container}>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          display: 'block',
          mb: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </Typography>
      <div style={styles.chipGroup}>
        {displayedGrades.map((grade) => (
          <FuelGradeChip
            key={grade.id}
            grade={grade}
            isSelected={selectedGrade === grade.id}
            onSelect={handleSelectGrade}
            getChipSx={getChipSx}
          />
        ))}
      </div>
    </div>
  );
};
