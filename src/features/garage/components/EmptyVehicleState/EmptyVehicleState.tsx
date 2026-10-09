import AddIcon from '@mui/icons-material/Add';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import BoltIcon from '@mui/icons-material/Bolt';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SpeedIcon from '@mui/icons-material/Speed';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { getAmbientGlowStyle, getOrbShadowStyle, styles } from './EmptyVehicleState.styles';

export interface Props {
  onAddVehicle?: () => void;
}

const VEHICLE_TYPES = [
  {
    name: 'OBD-II • Real-Time Telemetry',
    short: 'Sedan',
    icon: DirectionsCarIcon,
    glowColor: 'rgba(125, 211, 252, 0.3)',
  },
  {
    name: 'Battery Health & Range Diagnostics',
    short: 'EV / HEV',
    icon: ElectricCarIcon,
    glowColor: 'rgba(125, 211, 252, 0.4)',
  },
  {
    name: 'Micro ECU & Bluetooth Sync',
    short: 'Moto',
    icon: TwoWheelerIcon,
    glowColor: 'rgba(200, 160, 240, 0.35)',
  },
  {
    name: 'CAN-Bus & Heavy Duty J1939',
    short: 'Truck',
    icon: LocalShippingIcon,
    glowColor: 'rgba(136, 180, 204, 0.4)',
  },
  {
    name: 'ISOBUS & Hydraulic Diagnostics',
    short: 'Tractor',
    icon: AgricultureIcon,
    glowColor: 'rgba(125, 211, 252, 0.35)',
  },
  {
    name: 'Fleet Anomaly & Expense Logging',
    short: 'Truck',
    icon: LocalShippingIcon,
    glowColor: 'rgba(200, 160, 240, 0.45)',
  },
] as const;

export const EmptyVehicleState: React.FC<Props> = ({ onAddVehicle }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % VEHICLE_TYPES.length);
          return 0;
        }
        return prev + 2.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const currentVehicle = VEHICLE_TYPES[currentIndex] ?? VEHICLE_TYPES[0];
  const ActiveIcon = currentVehicle.icon;

  const handleAddVehicle = () => {
    if (onAddVehicle) {
      onAddVehicle();
    } else {
      navigate({ to: '/garage/vehicles/new' });
    }
  };

  const handleSelectCategory = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  return (
    <div style={styles.container}>
      <GlassCard style={styles.card}>
        {/* Dynamic Vehicle Morphing Halo */}
        <div style={styles.haloContainer}>
          <div style={styles.haloCenter}>
            <div style={styles.haloBackdropRing} />
            <div
              style={{ ...styles.ambientGlow, ...getAmbientGlowStyle(currentVehicle.glowColor) }}
            />
          </div>

          <div style={{ ...styles.orbContainer, ...getOrbShadowStyle(currentVehicle.glowColor) }}>
            <ActiveIcon
              sx={{
                fontSize: 48,
                color: '#7dd3fc',
                filter: 'drop-shadow(0 0 10px rgba(125, 211, 252, 0.7))',
              }}
            />
          </div>

          <div style={styles.categoryBadge}>
            <div style={styles.categoryBadgeInner}>
              <span style={styles.categoryBadgeText}>{currentVehicle.name}</span>
            </div>
          </div>
        </div>

        {/* Category Selector Pills with Progress Bar */}
        <div style={styles.pillsContainer}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              mb: 1.5,
              backgroundColor: 'rgba(255,255,255,0.08)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(to right, #c8a0f0, #88b4cc, #7dd3fc)',
                borderRadius: 2,
              },
            }}
          />
          <div style={styles.pillsScrollRow}>
            {VEHICLE_TYPES.map((type, idx) => {
              const PillIcon = type.icon;
              const isActive = idx === currentIndex;
              return (
                <Button
                  key={`${type.short}-${idx}`}
                  onClick={() => handleSelectCategory(idx)}
                  variant={isActive ? 'contained' : 'text'}
                  startIcon={<PillIcon sx={{ fontSize: '14px !important' }} />}
                  sx={isActive ? styles.activePillButton : styles.pillButton}
                >
                  {type.short}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Text Section */}
        <div style={styles.textSection}>
          <Typography variant="h6" sx={styles.title}>
            No vehicle found
          </Typography>
          <Typography variant="body2" sx={styles.subtitle}>
            Add your first vehicle to get started with telemetry, automated diagnostics, and
            real-time cost tracking.
          </Typography>
        </div>

        {/* Actions Group */}
        <div style={styles.actionButtonsGroup}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddVehicle}
            sx={styles.primaryCta}
          >
            Add First Vehicle
          </Button>

          <Button
            variant="text"
            startIcon={<QrCodeScannerIcon sx={{ fontSize: 18 }} />}
            onClick={handleAddVehicle}
            sx={styles.secondaryBtn}
          >
            Scan VIN Barcode
          </Button>
        </div>
      </GlassCard>

      {/* Connected Capabilities Section */}
      <div>
        <div style={styles.capabilitiesHeader}>
          <span style={styles.capabilitiesTitle}>Connected Capabilities</span>
          <span style={styles.capabilitiesBadge}>
            Instant Ready <BoltIcon sx={{ fontSize: 14 }} />
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <GlassCard style={styles.capabilityCard}>
            <div
              style={{
                ...styles.capabilityIconContainer,
                backgroundColor: 'rgba(14, 77, 110, 0.8)',
                color: '#7dd3fc',
              }}
            >
              <SpeedIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                Smart Telemetry Sync
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                CAN bus & fuel anomaly logging in real time
              </Typography>
            </div>
            <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          </GlassCard>

          <GlassCard style={styles.capabilityCard}>
            <div
              style={{
                ...styles.capabilityIconContainer,
                backgroundColor: 'rgba(26, 58, 78, 0.8)',
                color: '#88b4cc',
              }}
            >
              <QueryStatsIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                Predictive Maintenance
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Dual-trigger mileage and lifespan reminders
              </Typography>
            </div>
            <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          </GlassCard>

          <GlassCard style={styles.capabilityCard}>
            <div
              style={{
                ...styles.capabilityIconContainer,
                backgroundColor: 'rgba(61, 32, 96, 0.8)',
                color: '#c8a0f0',
              }}
            >
              <ReceiptLongIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                Expense & Tax Deductions
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                1-tap mileage logging and automated receipts
              </Typography>
            </div>
            <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default EmptyVehicleState;
