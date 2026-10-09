import EvStationIcon from '@mui/icons-material/EvStation';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useAppStore } from '@/app/store';
import { vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import { getGradesForPowertrain, useAccountFuelGrades } from '@/shared/lib/fuel-grades';
import { useLastUsedFuelGrade } from '../../lib/fuel-grade-storage';
import { getChipSx, styles } from './FuelGradeSelector.styles';

export interface Props {
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
        {displayedGrades.map((grade) => {
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
              onClick={() => handleSelectGrade(grade.id)}
              variant={selectedGrade === grade.id ? 'filled' : 'outlined'}
              sx={getChipSx(selectedGrade === grade.id)}
            />
          );
        })}
      </div>
    </div>
  );
};
