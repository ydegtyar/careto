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
  const tanks = vehicle.tanks || [];
  const hasMultipleTanks = tanks.length > 1;

  return (
    <GlassCard className={styles.card}>
      <div className={styles.energySection}>
        {hasMultipleTanks ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}
            >
              Energy Storage Levels
            </Typography>
            {tanks.map((tank) => {
              const isTankEv = tank.type === 'ev';
              return (
                <div key={tank.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className={styles.energyLabels}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {tank.name} ({isTankEv ? 'Battery' : 'Fuel Tank'})
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {Math.round(fuelOrBatteryPercent)}%
                    </Typography>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    aria-label={`${tank.name} level progress`}
                    value={fuelOrBatteryPercent}
                    className={styles.progressBar}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <>
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
          </>
        )}
        <div className={styles.rangeRow} style={{ marginTop: hasMultipleTanks ? 8 : undefined }}>
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
