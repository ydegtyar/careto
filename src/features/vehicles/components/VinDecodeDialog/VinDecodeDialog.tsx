import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type { DecodedVehicleSpecs } from '../../lib/vin-decoder';

interface Props {
  open: boolean;
  specs: DecodedVehicleSpecs | null;
  onAccept: (specs: DecodedVehicleSpecs) => void;
  onDecline: () => void;
}

export function VinDecodeDialog({ open, specs, onAccept, onDecline }: Props) {
  if (!specs) return null;

  const highlights = [
    specs.make && { label: 'Make', value: specs.make },
    specs.model && { label: 'Model', value: specs.model },
    specs.year && { label: 'Year', value: specs.year },
    specs.trim && { label: 'Trim / Spec', value: specs.trim },
    specs.powertrain && { label: 'Powertrain', value: specs.powertrain.toUpperCase() },
    specs.bodyClass && { label: 'Body Style', value: specs.bodyClass },
    specs.fuelTypePrimary && { label: 'Primary Fuel', value: specs.fuelTypePrimary },
    specs.driveType && { label: 'Drive Type', value: specs.driveType },
    specs.displacementL && { label: 'Engine Size', value: `${specs.displacementL} L` },
    specs.plantCountry && { label: 'Assembly Country', value: specs.plantCountry },
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <Dialog
      open={open}
      onClose={onDecline}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            backgroundColor: 'background.paper',
            border: '1px solid var(--mui-palette-divider)',
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ color: 'text.primary', fontWeight: 700, pb: 1, pt: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DirectionsCarIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <div>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Decoded VIN Vehicle Specs
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              NHTSA Open Source VPIC Database
            </Typography>
          </div>
        </div>
      </DialogTitle>

      <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <div>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                VIN Code
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                {specs.vin}
              </Typography>
            </div>
          </div>
          <Chip label="Verified" size="small" color="primary" variant="outlined" />
        </div>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
          Identified Specifications
        </Typography>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {highlights.map((item) => (
            <div
              key={item.label}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                backgroundColor: 'var(--mui-palette-action-hover)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.value}
              </Typography>
            </div>
          ))}
        </div>

        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Would you like to populate these details into your vehicle form?
        </Typography>
      </DialogContent>

      <Divider sx={{ my: 1 }} />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onDecline}
          variant="outlined"
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            flex: 1,
          }}
        >
          Decline / Keep Current
        </Button>

        <Button
          variant="contained"
          onClick={() => onAccept(specs)}
          sx={{
            borderRadius: 3,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
            textTransform: 'none',
            flex: 1,
          }}
        >
          Apply to Form
        </Button>
      </DialogActions>
    </Dialog>
  );
}
