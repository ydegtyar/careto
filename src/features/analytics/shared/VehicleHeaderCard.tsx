import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SensorsIcon from '@mui/icons-material/Sensors';
import type { Vehicle } from '@/data/client/types';
import { styles } from './glacier.styles';

export interface VehicleHeaderCardProps {
  vehicle?: Vehicle;
  currentOdometerKm?: number | null;
  refuelCount?: number;
}

export function VehicleHeaderCard({ vehicle, currentOdometerKm, refuelCount = 12 }: VehicleHeaderCardProps) {
  const odoKm = currentOdometerKm ?? (vehicle ? Math.round(vehicle.initial_odometer_m / 1000) : 55450);
  const distanceUnit = vehicle?.distance_unit || 'km';

  return (
    <div style={{ ...styles.glassCard, padding: '14px 18px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent), color-mix(in srgb, var(--mui-palette-tertiary-main) 20%, transparent))',
              border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 25%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--mui-palette-primary-main)',
            }}
          >
            <DirectionsCarIcon />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--mui-palette-text-primary)' }}>
                {vehicle?.name || 'Honda CR-V Touring'}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'color-mix(in srgb, var(--mui-palette-primary-main) 15%, transparent)',
                  color: 'var(--mui-palette-primary-main)',
                  border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)',
                }}
              >
                AWD
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', fontSize: '0.75rem', color: 'var(--mui-palette-text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10b981' }}>
                <SensorsIcon sx={{ fontSize: 13 }} />
                <span>OBD-II Live</span>
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <SpeedIcon sx={{ fontSize: 13, color: 'var(--mui-palette-primary-main)' }} />
                <span>{odoKm.toLocaleString()} {distanceUnit}</span>
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <LocalGasStationIcon sx={{ fontSize: 13, color: 'var(--mui-palette-tertiary-main)' }} />
                <span>{refuelCount} fills</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
