import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import type { Vehicle } from '@/data/client/types';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import styles from './VehicleHeroCard.module.scss';

interface Props {
  vehicle: Vehicle;
  fuelOrBatteryPercent?: number;
  rangeKm?: number;
  daysSinceRefuel?: number | null;
  tankPercentages?: Record<string, number>;
}

export function VehicleHeroCard({
  vehicle,
  fuelOrBatteryPercent,
  rangeKm,
  daysSinceRefuel,
  tankPercentages,
}: Props) {
  const isEv = vehicle.powertrain === 'ev';
  const tanks = vehicle.tanks || [];
  const hasMultipleTanks = tanks.length > 1;

  const displayPercent =
    fuelOrBatteryPercent !== undefined ? Math.round(fuelOrBatteryPercent) : null;

  return (
    <GlassCard className={styles.card}>
      <div className={styles.energySection}>
        {hasMultipleTanks ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}
              >
                Energy Storage Levels
              </Typography>
              {daysSinceRefuel !== undefined && daysSinceRefuel !== null && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {daysSinceRefuel === 0
                    ? 'Refueled today'
                    : `${daysSinceRefuel}d since refuel`}
                </Typography>
              )}
            </div>
            {tanks.map((tank) => {
              const isTankEv = tank.type === 'ev';
              const specificPercent =
                tankPercentages?.[tank.id] ?? fuelOrBatteryPercent;
              const roundedTankPercent =
                specificPercent !== undefined ? Math.round(specificPercent) : null;

              return (
                <div key={tank.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className={styles.energyLabels}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {tank.name} ({isTankEv ? 'Battery' : 'Fuel Tank'})
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {roundedTankPercent !== null ? `${roundedTankPercent}%` : '—'}
                    </Typography>
                  </div>
                  <LinearProgress
                    variant={roundedTankPercent !== null ? 'determinate' : 'indeterminate'}
                    aria-label={`${tank.name} level progress`}
                    value={roundedTankPercent !== null ? roundedTankPercent : 0}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {daysSinceRefuel !== undefined && daysSinceRefuel !== null && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {daysSinceRefuel === 0 ? 'Refueled today' : `${daysSinceRefuel}d ago`}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {displayPercent !== null ? `${displayPercent}%` : '—'}
                </Typography>
              </div>
            </div>
            <LinearProgress
              variant={displayPercent !== null ? 'determinate' : 'indeterminate'}
              aria-label={isEv ? 'Battery level progress' : 'Fuel tank level progress'}
              value={displayPercent !== null ? displayPercent : 0}
              className={styles.progressBar}
            />
          </>
        )}
        <div className={styles.rangeRow} style={{ marginTop: hasMultipleTanks ? 8 : undefined }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Estimated Range
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {rangeKm !== undefined && rangeKm !== null
              ? `~${Math.round(rangeKm)} ${vehicle.distance_unit}`
              : '—'}
          </Typography>
        </div>
      </div>
    </GlassCard>
  );
}
