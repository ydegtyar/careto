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
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(192, 132, 252, 0.2))',
              border: '1px solid rgba(125, 211, 252, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7dd3fc',
            }}
          >
            <DirectionsCarIcon />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                {vehicle?.name || 'Honda CR-V Touring'}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#7dd3fc',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                AWD
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#34d399' }}>
                <SensorsIcon sx={{ fontSize: 13 }} />
                <span>OBD-II Live</span>
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <SpeedIcon sx={{ fontSize: 13, color: '#7dd3fc' }} />
                <span>{odoKm.toLocaleString()} {distanceUnit}</span>
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <LocalGasStationIcon sx={{ fontSize: 13, color: '#c8a0f0' }} />
                <span>{refuelCount} fills</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
