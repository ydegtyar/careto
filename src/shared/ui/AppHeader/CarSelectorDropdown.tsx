import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Stack } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
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
  isLoading?: boolean;
}
export const CarSelectorDropdown: React.FC<Props> = ({
  vehicles,
  activeVehicle,
  isLoading = false,
}) => {
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
      return (
        <DirectionsCarIcon
          className={styles.carIcon}
          style={{ color: 'var(--mui-palette-primary-main)' }}
        />
      );
    }
    const iconColor = v.color || 'var(--mui-palette-primary-main)';
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
            <div className={styles.avatarBox}>
              {isLoading ? (
                <CircularProgress size={16} sx={{ color: 'primary.main' }} />
              ) : (
                getVehicleIcon(activeVehicle)
              )}
            </div>
            <div className={styles.titleArea}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={styles.carName}>
                  {isLoading
                    ? 'Loading vehicles...'
                    : activeVehicle
                      ? activeVehicle.name
                      : 'Select vehicle'}
                </span>
              </div>
              <span className={styles.carSubtext}>
                {isLoading ? 'Connecting...' : getSubtext(activeVehicle)}
              </span>
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
        {isLoading ? (
          <MenuItem disabled sx={{ justifyContent: 'center', py: 2, gap: 1.5 }}>
            <CircularProgress size={18} sx={{ color: 'primary.main' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--mui-palette-text-secondary)' }}>
              Loading garage vehicles...
            </span>
          </MenuItem>
        ) : (
          vehicles.map((v) => (
            <VehicleMenuItem
              key={v.id}
              vehicle={v}
              activeVehicle={activeVehicle}
              onSelect={handleSelectVehicle}
              onEdit={handleEditVehicle}
            />
          ))
        )}

        <MenuItem
          onClick={() => {
            setCarMenuAnchor(null);
            router.navigate({ to: '/garage/vehicles/new' });
          }}
          sx={{
            fontSize: '0.85rem',
            color: 'var(--mui-palette-primary-main)',
            fontWeight: 600,
            borderRadius: '12px',
            mt: !isLoading && vehicles.length > 0 ? '8px' : 0,
            py: 1,
            px: 1.5,
            borderTop:
              !isLoading && vehicles.length > 0 ? '1px solid var(--mui-palette-divider)' : 'none',
            '&:hover': {
              backgroundColor:
                'color-mix(in srgb, var(--mui-palette-primary-main) 12%, transparent) !important',
              color: 'var(--mui-palette-primary-main) !important',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: '32px !important' }}>
            <AddIcon sx={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }} />
          </ListItemIcon>
          Add New Vehicle
        </MenuItem>
      </Menu>
    </div>
  );
};

export default CarSelectorDropdown;
