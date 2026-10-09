import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import type { Vehicle } from '@/data/client/types';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import styles from './VehicleHeroCard.module.scss';

interface Props {
  vehicle: Vehicle;
  fuelOrBatteryPercent?: number;
  rangeKm?: number;
}

export function VehicleHeroCard({ vehicle, fuelOrBatteryPercent = 78, rangeKm = 395 }: Props) {
  const isEv = vehicle.powertrain === 'ev';

  return (
    <GlassCard className={styles.card}>
      <div className={styles.energySection}>
        <div className={styles.energyLabels}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}
          >
            {isEv ? 'Battery Level' : 'Fuel Tank'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {Math.round(fuelOrBatteryPercent)}%
          </Typography>
        </div>
        <LinearProgress
          variant="determinate"
          aria-label={isEv ? 'Battery level progress' : 'Fuel tank level progress'}
          value={fuelOrBatteryPercent}
          className={styles.progressBar}
        />
        <div className={styles.rangeRow}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Estimated Range
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
            ~{rangeKm} {vehicle.distance_unit}
          </Typography>
        </div>
      </div>
    </GlassCard>
  );
}
