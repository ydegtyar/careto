import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Stack } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { useAppStore } from '@/app/store';
import type { Vehicle } from '@/data/client/types';
import styles from './AppHeader.module.scss';
import { VehicleMenuItem } from './VehicleMenuItem';

interface Props {
  vehicles: Vehicle[];
  activeVehicle?: Vehicle | null;
}
export const CarSelectorDropdown: React.FC<Props> = ({ vehicles, activeVehicle }) => {
  const router = useRouter();
  const { setActiveVehicleId } = useAppStore();
  const [carMenuAnchor, setCarMenuAnchor] = useState<null | HTMLElement>(null);

  const handleSelectVehicle = (id: string) => {
    setActiveVehicleId(id);
    setCarMenuAnchor(null);
  };

  const handleEditVehicle = (id: string) => {
    setCarMenuAnchor(null);
    router.navigate({
      to: '/garage/vehicles/$vehicleId',
      params: { vehicleId: id },
    });
  };

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
        {vehicles.map((v) => (
          <VehicleMenuItem
            key={v.id}
            vehicle={v}
            activeVehicle={activeVehicle}
            onSelect={handleSelectVehicle}
            onEdit={handleEditVehicle}
          />
        ))}

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
