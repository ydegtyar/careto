import MyLocationIcon from '@mui/icons-material/MyLocation';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useGeolocation } from '@/shared/lib/use-geolocation';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './EntryDetailsLocationCard.styles';

export interface Props {
  date: string;
  onDateChange: (val: string) => void;
  odometerKm: string;
  onOdometerKmChange: (val: string) => void;
  vendorName?: string;
  onVendorNameChange?: (val: string) => void;
  vendorLocation: string;
  onVendorLocationChange: (val: string) => void;
  lat?: number | null;
  lon?: number | null;
  onCoordsChange?: (lat: number | null, lon: number | null) => void;
  isFullTank: boolean;
  onFullTankChange: (val: boolean) => void;
  isBusiness: boolean;
  onBusinessChange: (val: boolean) => void;
  showFullTankOption?: boolean;
}

export const EntryDetailsLocationCard: React.FC<Props> = ({
  date,
  onDateChange,
  odometerKm,
  onOdometerKmChange,
  vendorName = '',
  onVendorNameChange,
  vendorLocation,
  onVendorLocationChange,
  lat,
  lon,
  onCoordsChange,
  isFullTank,
  onFullTankChange,
  isBusiness,
  onBusinessChange,
  showFullTankOption = true,
}) => {
  const { loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();

  const handleFetchLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      onVendorLocationChange(loc.address);
      if (onCoordsChange) {
        onCoordsChange(loc.latitude, loc.longitude);
      }
    }
  };

  return (
    <GlassCard style={styles.cardContainer}>
      <Typography variant="caption" sx={styles.cardTitle}>
        Details & Metadata
      </Typography>

      <div style={styles.inputsRow}>
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          sx={styles.inputRoot}
        />
        <TextField
          label="Odometer (km)"
          type="number"
          value={odometerKm}
          onChange={(e) => onOdometerKmChange(e.target.value)}
          required
          fullWidth
          sx={styles.inputRoot}
        />
      </div>

      {onVendorNameChange && (
        <TextField
          label="Vendor / Shop Name (e.g. AlexGas, Шиномонтаж, У Саши)"
          value={vendorName}
          onChange={(e) => onVendorNameChange(e.target.value)}
          fullWidth
          sx={styles.inputRoot}
        />
      )}

      <TextField
        label="Vendor / Facility Location"
        value={vendorLocation}
        onChange={(e) => onVendorLocationChange(e.target.value)}
        fullWidth
        helperText={
          locationError || (lat && lon ? `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}` : undefined)
        }
        error={Boolean(locationError)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Use current location">
                  <IconButton
                    onClick={handleFetchLocation}
                    disabled={locationLoading}
                    size="small"
                    edge="end"
                    aria-label="use current location"
                    sx={{ color: 'primary.main' }}
                  >
                    {locationLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <MyLocationIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
        sx={styles.inputRoot}
      />

      <div style={styles.switchContainer}>
        {showFullTankOption && (
          <FormControlLabel
            control={
              <Switch
                checked={isFullTank}
                onChange={(e) => onFullTankChange(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                Full Tank Fill
              </Typography>
            }
            sx={{ margin: 0 }}
          />
        )}

        <FormControlLabel
          control={
            <Switch
              checked={isBusiness}
              onChange={(e) => onBusinessChange(e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
              Business Expense
            </Typography>
          }
          sx={{ margin: 0 }}
        />
      </div>
    </GlassCard>
  );
};

export default EntryDetailsLocationCard;
