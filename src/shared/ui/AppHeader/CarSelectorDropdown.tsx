import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { useAppStore } from '@/app/store';
import type { Vehicle } from '@/data/client/types';
import styles from './AppHeader.module.scss';

export interface Props {
  vehicles: Vehicle[];
  activeVehicle?: Vehicle | null;
}

export const CarSelectorDropdown: React.FC<Props> = ({ vehicles, activeVehicle }) => {
  const router = useRouter();
  const { setActiveVehicleId } = useAppStore();
  const [carMenuAnchor, setCarMenuAnchor] = useState<null | HTMLElement>(null);

  const getVehicleIcon = (v?: Vehicle | null) => {
    if (!v) {
      return <DirectionsCarIcon className={styles.carIcon} style={{ color: '#7dd3fc' }} />;
    }
    const iconColor = v.color || '#7dd3fc';
    if (v.powertrain === 'ev' || v.powertrain === 'phev') {
      return <ElectricCarIcon className={styles.carIcon} style={{ color: iconColor }} />;
    }
    return <DirectionsCarIcon className={styles.carIcon} style={{ color: iconColor }} />;
  };

  const getSubtext = (v?: Vehicle | null) => {
    if (!v) return 'Garage is empty';
    const parts = [];
    if (v.vin) parts.push(`VIN: ${v.vin}`);
    if (v.trim) parts.push(v.trim);
    else if (v.make || v.model) parts.push(`${v.make || ''} ${v.model || ''}`.trim());
    return parts.join(' • ') || 'Vehicle';
  };

  return (
    <div className={styles.carSelectorContainer}>
      <button
        type="button"
        onClick={(e) => setCarMenuAnchor(e.currentTarget)}
        className={styles.carSelectorButton}
      >
        <Stack
          direction={'row'}
          sx={{ justifyContent: 'space-between', width: 1, alignItems: 'center', gap: 2 }}
        >
          <Stack direction={'row'} sx={{ gap: 1, alignItems: 'center' }}>
            <div className={styles.avatarBox}>{getVehicleIcon(activeVehicle)}</div>
            <div className={styles.titleArea}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={styles.carName}>
                  {activeVehicle ? activeVehicle.name : 'Select vehicle'}
                </span>
              </div>
              <span className={styles.carSubtext}>{getSubtext(activeVehicle)}</span>
            </div>
          </Stack>
          <KeyboardArrowDownIcon
            className={styles.arrowIcon}
            sx={{
              transform: carMenuAnchor ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </Stack>
      </button>

      <Menu
        anchorEl={carMenuAnchor}
        open={Boolean(carMenuAnchor)}
        onClose={() => setCarMenuAnchor(null)}
        slotProps={{
          paper: {
            className: styles.carMenuPaper,
            sx: {
              mt: 1,
              p: '8px',
            },
          },
        }}
      >
        {vehicles.map((v) => {
          const isSelected = activeVehicle ? v.id === activeVehicle.id : false;
          return (
            <MenuItem
              key={v.id}
              selected={isSelected}
              onClick={() => {
                setActiveVehicleId(v.id);
                setCarMenuAnchor(null);
              }}
              sx={{
                borderRadius: '14px',
                my: '4px',
                py: 1.2,
                px: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                backgroundColor: isSelected
                  ? 'rgba(125, 211, 252, 0.08) !important'
                  : 'transparent',
                border: isSelected
                  ? '1px solid rgba(125, 211, 252, 0.25)'
                  : '1px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(125, 211, 252, 0.06) !important',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <div className={styles.avatarBox} style={{ width: 36, height: 36 }}>
                {getVehicleIcon(v)}
              </div>

              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e0e8f0' }}>
                  {v.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {getSubtext(v)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconButton
                  size="small"
                  aria-label="Edit vehicle settings"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCarMenuAnchor(null);
                    router.navigate({
                      to: '/garage/vehicles/$vehicleId',
                      params: { vehicleId: v.id },
                    });
                  }}
                  sx={{
                    color: '#94a3b8',
                    p: 0.5,
                    '&:hover': { color: '#7dd3fc', backgroundColor: 'rgba(125, 211, 252, 0.1)' },
                  }}
                >
                  <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </div>
            </MenuItem>
          );
        })}

        <MenuItem
          onClick={() => {
            setCarMenuAnchor(null);
            router.navigate({ to: '/garage/vehicles/new' });
          }}
          sx={{
            fontSize: '0.85rem',
            color: '#7dd3fc',
            fontWeight: 600,
            borderRadius: '12px',
            mt: vehicles.length > 0 ? '8px' : 0,
            py: 1,
            px: 1.5,
            borderTop: vehicles.length > 0 ? '1px solid rgba(125, 211, 252, 0.12)' : 'none',
            '&:hover': {
              backgroundColor: 'rgba(125, 211, 252, 0.1) !important',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: '32px !important' }}>
            <AddIcon sx={{ fontSize: 18, color: '#7dd3fc' }} />
          </ListItemIcon>
          Add New Vehicle
        </MenuItem>
      </Menu>
    </div>
  );
};

export default CarSelectorDropdown;
