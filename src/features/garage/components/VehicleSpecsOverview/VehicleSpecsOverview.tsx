import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import Typography from '@mui/material/Typography';
import type { Vehicle } from '@/data/client/types';
import { useAccountFuelGrades } from '@/shared/lib/fuel-grades';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { CopyableStatCard } from './CopyableStatCard';
import { getIconContainerStyle, styles } from './VehicleSpecsOverview.styles';

export interface Props {
  vehicle: Vehicle;
}

export const VehicleSpecsOverview = ({ vehicle }: Props) => {
  const { allGrades } = useAccountFuelGrades();

  const isEv = vehicle.powertrain === 'ev';
  const VehicleIcon = isEv ? ElectricCarIcon : DirectionsCarIcon;
  const capacityDisplay = vehicle.tank_ml
    ? `${vehicle.tank_ml / 1000} L`
    : vehicle.battery_wh
      ? `${vehicle.battery_wh / 1000} kWh`
      : 'N/A';

  const fuelGradesDisplay = (() => {
    if (!vehicle.fuel_grades || vehicle.fuel_grades.length === 0) {
      return 'Default';
    }

    return vehicle.fuel_grades
      .map((id) => {
        const found = allGrades.find((grade) => grade.id === id);
        return found ? found.label : id;
      })
      .join(', ');
  })();

  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <div style={styles.iconWrapper}>
          <VehicleIcon style={getIconContainerStyle(vehicle.color)} />
        </div>
        <div>
          <Typography variant="subtitle1" sx={styles.title}>
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </Typography>
          <Typography variant="caption" sx={styles.subtitle}>
            {vehicle.trim && (
              <>
                <span>{vehicle.trim}</span>
                <span style={styles.subtitleDot} />
              </>
            )}
            <span style={{ fontWeight: 600 }}>{vehicle.powertrain.toUpperCase()}</span>
          </Typography>
        </div>
      </div>

      <div style={styles.grid}>
        <CopyableStatCard label="VIN" value={vehicle.vin} isMonospace />

        <CopyableStatCard label="License Plate" value={vehicle.plate} />

        <div style={styles.innerCard}>
          <Typography variant="caption" sx={styles.statLabel}>
            Capacity
          </Typography>
          <Typography variant="body2" sx={styles.statValue}>
            {capacityDisplay}
          </Typography>
        </div>

        <div style={styles.innerCard}>
          <Typography variant="caption" sx={styles.statLabel}>
            Starting Odometer
          </Typography>
          <Typography variant="body2" sx={styles.statValue}>
            {vehicle.initial_odometer_m
              ? `${vehicle.initial_odometer_m / 1000} ${vehicle.distance_unit}`
              : '0'}
          </Typography>
        </div>

        <div style={styles.innerCard}>
          <Typography variant="caption" sx={styles.statLabel}>
            Units
          </Typography>
          <Typography variant="body2" sx={styles.statValue}>
            {vehicle.distance_unit} / {vehicle.efficiency_unit}
          </Typography>
        </div>

        <div style={styles.innerCard}>
          <Typography variant="caption" sx={styles.statLabel}>
            Fuel Grades
          </Typography>
          <Typography
            variant="body2"
            sx={{ ...styles.statValue, fontSize: '0.8rem', lineHeight: 1.35 }}
          >
            {fuelGradesDisplay}
          </Typography>
        </div>
      </div>
    </GlassCard>
  );
};

export default VehicleSpecsOverview;
