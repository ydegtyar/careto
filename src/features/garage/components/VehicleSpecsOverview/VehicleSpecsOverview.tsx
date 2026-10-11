import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import Typography from '@mui/material/Typography';
import type { Vehicle } from '@/data/client/types';
import { useAccountFuelGrades } from '@/shared/lib/fuel-grades';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
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
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {vehicle.trim ? `${vehicle.trim} • ` : ''}Powertrain: {vehicle.powertrain.toUpperCase()}
          </Typography>
        </div>
      </div>

      <div style={styles.grid}>
        <div>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            VIN
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
            {vehicle.vin || 'Not provided'}
          </Typography>
        </div>

        <div>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            License Plate
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {vehicle.plate || 'Not provided'}
          </Typography>
        </div>

        <div>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Capacity
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {capacityDisplay}
          </Typography>
        </div>

        <div>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Starting Odometer
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {vehicle.initial_odometer_m
              ? `${vehicle.initial_odometer_m / 1000} ${vehicle.distance_unit}`
              : '0'}
          </Typography>
        </div>

        <div>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Units
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {vehicle.distance_unit} / {vehicle.efficiency_unit}
          </Typography>
        </div>

        <div>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Fuel Grades
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {fuelGradesDisplay}
          </Typography>
        </div>
      </div>
    </GlassCard>
  );
};

export default VehicleSpecsOverview;
