import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import type { Vehicle } from '@/data/client/types';
import styles from './AppHeader.module.scss';

interface Props {
  vehicle: Vehicle;
  activeVehicle?: Vehicle | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
}

export function VehicleMenuItem({ vehicle: v, activeVehicle, onSelect, onEdit }: Props) {
  const isSelected = activeVehicle ? v.id === activeVehicle.id : false;

  const getVehicleIcon = (veh?: Vehicle | null) => {
    if (!veh) {
      return <DirectionsCarIcon className={styles.carIcon} style={{ color: '#7dd3fc' }} />;
    }
    const iconColor = veh.color || '#7dd3fc';
    if (veh.powertrain === 'ev' || veh.powertrain === 'phev') {
      return <ElectricCarIcon className={styles.carIcon} style={{ color: iconColor }} />;
    }
    return <DirectionsCarIcon className={styles.carIcon} style={{ color: iconColor }} />;
  };

  const getSubtext = (veh?: Vehicle | null) => {
    if (!veh) return 'Garage is empty';
    const parts = [];
    if (veh.vin) parts.push(`VIN: ${veh.vin}`);
    if (veh.trim) parts.push(veh.trim);
    else if (veh.make || veh.model) parts.push(`${veh.make || ''} ${veh.model || ''}`.trim());
    return parts.join(' • ') || 'Vehicle';
  };

  return (
    <MenuItem
      selected={isSelected}
      onClick={() => onSelect(v.id)}
      sx={{
        borderRadius: '14px',
        my: '4px',
        py: 1.2,
        px: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        backgroundColor: isSelected
          ? 'color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 12%, transparent) !important'
          : 'transparent',
        border: isSelected
          ? '1px solid color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 30%, transparent)'
          : '1px solid transparent',
        '&:hover': {
          backgroundColor:
            'color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 8%, transparent) !important',
        },
        transition: 'all 0.15s ease',
      }}
    >
      <div className={styles.avatarBox} style={{ width: 36, height: 36 }}>
        {getVehicleIcon(v)}
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.88rem',
            color: 'var(--mui-palette-text-primary, inherit)',
          }}
        >
          {v.name}
        </span>
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--mui-palette-text-secondary, #64748b)',
            fontFamily: 'monospace',
          }}
        >
          {getSubtext(v)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconButton
          size="small"
          aria-label="Edit vehicle settings"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(v.id);
          }}
          sx={{
            color: 'var(--mui-palette-text-secondary, #64748b)',
            p: 0.5,
            '&:hover': {
              color: 'var(--mui-palette-primary-main, #0284c7)',
              backgroundColor:
                'color-mix(in srgb, var(--mui-palette-primary-main, #0284c7) 12%, transparent)',
            },
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </div>
    </MenuItem>
  );
}
