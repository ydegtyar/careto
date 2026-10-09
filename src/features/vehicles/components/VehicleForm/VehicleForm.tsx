import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import type { Vehicle } from '@/data/client/types';
import { VinScanner } from '@/features/ai/components/VinScanner/VinScanner';
import { WheelsScanner } from '@/features/ai/components/WheelsScanner/WheelsScanner';
import type { VinParseResult, WheelsParseResult } from '@/features/ai/lib/ai-client';
import {
  type FuelGrade,
  getDefaultFuelGradesForPowertrain,
  getGradesForPowertrain,
  useAccountFuelGrades,
} from '@/shared/lib/fuel-grades';
import { GradeChip } from './GradeChip';
import { ColorSwatchButton } from './VehicleFormHelpers';

const COLOR_SWATCHES = [
  '#7dd3fc', // Ice Blue
  '#c8a0f0', // Lavender
  '#38bdf8', // Sky Blue
  '#34d399', // Emerald
  '#fbbf24', // Amber
  '#f87171', // Red
  '#e8e8e8', // White / Silver
  '#94a3b8', // Slate
  '#334155', // Dark Grey
  '#0f172a', // Navy
  '#a855f7', // Purple
  '#ec4899', // Pink
];

export interface VehicleFormValues {
  name: string;
  make: string;
  model: string;
  year: string;
  trim: string;
  tireSize: string;
  tireModel: string;
  plate: string;
  vin: string;
  powertrain: 'ice' | 'hybrid' | 'phev' | 'ev' | 'hydrogen';
  color: string;
  capacity: string;
  tanks?: Vehicle['tanks'];
  fuelGrades?: string[];
  initialOdometerKm: string;
  distanceUnit: string;
  efficiencyUnit: string;
}

interface Props {
  initialVehicle?: Vehicle;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
}

function getDefaultTanksForPowertrain(powertrain: string): Vehicle['tanks'] {
  switch (powertrain) {
    case 'phev':
      return [
        {
          id: 'tank_1',
          name: 'Primary Gasoline Tank',
          type: 'petrol',
          capacity_ml_or_wh: 50000,
          primary_fuel_grade: 'ron95',
        },
        {
          id: 'tank_2',
          name: 'Traction Battery',
          type: 'ev',
          capacity_ml_or_wh: 15000,
          primary_fuel_grade: 'ev_ac',
        },
      ];
    case 'hybrid':
      return [
        {
          id: 'tank_1',
          name: 'Primary Gasoline Tank',
          type: 'petrol',
          capacity_ml_or_wh: 50000,
          primary_fuel_grade: 'ron95',
        },
      ];
    case 'ev':
      return [
        {
          id: 'tank_1',
          name: 'Main Battery Pack',
          type: 'ev',
          capacity_ml_or_wh: 75000,
          primary_fuel_grade: 'ev_fast',
        },
      ];
    case 'hydrogen':
      return [
        {
          id: 'tank_1',
          name: '700bar Hydrogen Tank',
          type: 'hydrogen',
          capacity_ml_or_wh: 5000,
          primary_fuel_grade: 'hydrogen',
        },
      ];
    default:
      return [
        {
          id: 'tank_1',
          name: 'Primary Fuel Tank',
          type: 'petrol',
          capacity_ml_or_wh: 55000,
          primary_fuel_grade: 'ron95',
        },
      ];
  }
}

export function VehicleForm({ initialVehicle, onSubmit, onCancel, submitting = false }: Props) {
  const [copiedVin, setCopiedVin] = useState(false);
  const { allGrades, addCustomGrade } = useAccountFuelGrades();

  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customCategory, setCustomCategory] = useState<FuelGrade['category']>('petrol');
  const [customColor, _setCustomColor] = useState('#7dd3fc');

  const initialPowertrain = initialVehicle?.powertrain ?? 'ev';
  const initialTanks =
    initialVehicle?.tanks && initialVehicle.tanks.length > 0
      ? initialVehicle.tanks
      : getDefaultTanksForPowertrain(initialPowertrain);

  const initialCapacity = initialVehicle
    ? initialVehicle.battery_wh
      ? (initialVehicle.battery_wh / 1000).toString()
      : initialVehicle.tank_ml
        ? (initialVehicle.tank_ml / 1000).toString()
        : '82'
    : '82';

  const initialFuelGrades =
    initialVehicle?.fuel_grades && initialVehicle.fuel_grades.length > 0
      ? initialVehicle.fuel_grades
      : getDefaultFuelGradesForPowertrain(initialPowertrain, allGrades);

  const form = useForm({
    defaultValues: {
      name: initialVehicle?.name ?? '',
      make: initialVehicle?.make ?? '',
      model: initialVehicle?.model ?? '',
      year: initialVehicle?.year?.toString() ?? '2024',
      trim: initialVehicle?.trim ?? '',
      tireSize: '',
      tireModel: '',
      plate: initialVehicle?.plate ?? '',
      vin: initialVehicle?.vin ?? '',
      powertrain: initialPowertrain,
      color: initialVehicle?.color ?? '#7dd3fc',
      capacity: initialCapacity,
      tanks: initialTanks,
      fuelGrades: initialFuelGrades,
      initialOdometerKm: initialVehicle
        ? (initialVehicle.initial_odometer_m / 1000).toString()
        : '0',
      distanceUnit: initialVehicle?.distance_unit ?? 'km',
      efficiencyUnit: initialVehicle?.efficiency_unit ?? 'kwh100km',
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const copyVinToClipboard = (vinStr: string) => {
    if (!vinStr) return;
    navigator.clipboard.writeText(vinStr);
    setCopiedVin(true);
    setTimeout(() => setCopiedVin(false), 2000);
  };

  const handleAddCustomGrade = (currentFuelGrades: string[], _currentPowertrain: string) => {
    if (!customLabel.trim()) return;
    const sanitizedLabel = customLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newId = `custom_${sanitizedLabel}`;
    addCustomGrade({
      id: newId,
      label: customLabel.trim(),
      category: customCategory,
      color: customColor,
    });
    form.setFieldValue('fuelGrades', [...currentFuelGrades, newId]);
    setCustomLabel('');
    setCustomDialogOpen(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <form.Field
        name="name"
        children={(field) => (
          <TextField
            label="Nickname / Display Name"
            placeholder="e.g. Daily Commuter"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(15, 21, 36, 0.6)',
              },
            }}
          />
        )}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <form.Field
          name="make"
          children={(field) => (
            <TextField
              label="Make"
              placeholder="e.g. Tesla"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}
        />

        <form.Field
          name="model"
          children={(field) => (
            <TextField
              label="Model"
              placeholder="e.g. Model 3"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <form.Field
          name="year"
          children={(field) => (
            <TextField
              label="Year"
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}
        />

        <form.Field
          name="trim"
          children={(field) => (
            <TextField
              label="Trim / Spec"
              placeholder="e.g. Long Range AWD"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <form.Field
          name="tireSize"
          children={(field) => (
            <TextField
              label="Tire Size"
              placeholder="e.g. 235/45 R18"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}
        />

        <form.Field
          name="tireModel"
          children={(field) => (
            <TextField
              label="Tire Brand / Model"
              placeholder="e.g. Michelin Pilot Sport 4"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}
        />
      </div>

      {/* Powertrain Selector */}
      <form.Field
        name="powertrain"
        children={(field) => (
          <div>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                display: 'block',
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Powertrain / Energy Type
            </Typography>
            <ToggleButtonGroup
              value={field.state.value}
              exclusive
              onChange={(_, val) => {
                if (val) {
                  field.handleChange(val);
                  form.setFieldValue('efficiencyUnit', val === 'ev' ? 'kwh100km' : 'l100km');
                  form.setFieldValue('capacity', val === 'ev' ? '82' : '55');
                  form.setFieldValue('tanks', getDefaultTanksForPowertrain(val));
                  form.setFieldValue(
                    'fuelGrades',
                    getDefaultFuelGradesForPowertrain(val, allGrades),
                  );
                }
              }}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px !important',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  border: '1px solid rgba(125, 211, 252, 0.15) !important',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(125, 211, 252, 0.15) !important',
                    color: 'primary.main',
                    borderColor: 'rgba(125, 211, 252, 0.4) !important',
                  },
                },
              }}
            >
              <ToggleButton value="ice">ICE</ToggleButton>
              <ToggleButton value="hybrid">Hybrid</ToggleButton>
              <ToggleButton value="phev">PHEV</ToggleButton>
              <ToggleButton value="ev">EV</ToggleButton>
            </ToggleButtonGroup>
          </div>
        )}
      />

      {/* Color Swatch Picker Grid */}
      <form.Field
        name="color"
        children={(field) => (
          <div>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                display: 'block',
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Vehicle Accent Color
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {COLOR_SWATCHES.map((swatchHex) => (
                <ColorSwatchButton
                  key={swatchHex}
                  swatchHex={swatchHex}
                  selectedValue={field.state.value}
                  onSelect={field.handleChange}
                />
              ))}
            </div>
          </div>
        )}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <form.Subscribe
          selector={(state) => state.values.powertrain}
          children={(powertrain) => (
            <form.Field
              name="capacity"
              children={(field) => (
                <TextField
                  label={powertrain === 'ev' ? 'Battery (kWh)' : 'Tank Capacity (L)'}
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(15, 21, 36, 0.6)',
                    },
                  }}
                />
              )}
            />
          )}
        />

        <form.Field
          name="initialOdometerKm"
          children={(field) => (
            <TextField
              label="Starting Odometer (km)"
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}
        />
      </div>

      <VinScanner
        onParsed={(parsed: VinParseResult) => {
          if (parsed.vin) form.setFieldValue('vin', parsed.vin);
          if (parsed.make) form.setFieldValue('make', parsed.make);
          if (parsed.model) form.setFieldValue('model', parsed.model);
          if (parsed.year) form.setFieldValue('year', parsed.year.toString());
          if (parsed.plate) form.setFieldValue('plate', parsed.plate);
        }}
      />

      <WheelsScanner
        onParsed={(parsed: WheelsParseResult) => {
          if (parsed.tireSize) {
            form.setFieldValue('tireSize', parsed.tireSize);
          }
          const brandModel = [parsed.brand, parsed.season && `(${parsed.season})`]
            .filter(Boolean)
            .join(' ');
          if (brandModel) {
            form.setFieldValue('tireModel', brandModel);
          }
          const wheelParts = [
            parsed.tireSize && `Tires: ${parsed.tireSize}`,
            parsed.brand && parsed.brand,
            parsed.season && `(${parsed.season})`,
          ]
            .filter(Boolean)
            .join(' ');
          if (wheelParts) {
            const currentTrim = form.getFieldValue('trim');
            form.setFieldValue('trim', currentTrim ? `${currentTrim} | ${wheelParts}` : wheelParts);
          }
        }}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <form.Field
          name="plate"
          children={(field) => (
            <TextField
              label="License Plate"
              placeholder="e.g. AB-123-CD"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}
        />

        <form.Field
          name="vin"
          children={(field) => (
            <TextField
              label="VIN (Optional)"
              placeholder="17-digit VIN"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: field.state.value ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="Copy VIN"
                        onClick={() => copyVinToClipboard(field.state.value)}
                        sx={{ color: copiedVin ? 'success.main' : 'primary.main' }}
                      >
                        {copiedVin ? (
                          <CheckIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <ContentCopyIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}
        />
      </div>

      {/* Supported Fuel & Charge Grades per vehicle */}
      <form.Subscribe
        selector={(state) => [state.values.powertrain, state.values.fuelGrades] as const}
        children={([powertrain, activeFuelGrades]) => (
          <form.Field
            name="fuelGrades"
            children={(field) => {
              const activeIds = activeFuelGrades || [];
              const toggleGrade = (gradeId: string) => {
                if (activeIds.includes(gradeId)) {
                  if (activeIds.length <= 1) return;
                  field.handleChange(activeIds.filter((id) => id !== gradeId));
                } else {
                  field.handleChange([...activeIds, gradeId]);
                }
              };

              const displayedGrades = getGradesForPowertrain(powertrain, allGrades);

              return (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LocalGasStationIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Enabled Fuel / Charge Grades for Vehicle
                      </Typography>
                    </div>
                    <Button
                      size="small"
                      startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                      onClick={() => {
                        setCustomCategory(powertrain === 'ev' ? 'ev' : 'petrol');
                        setCustomDialogOpen(true);
                      }}
                      sx={{
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        color: 'primary.main',
                        py: 0,
                      }}
                    >
                      Add Custom
                    </Button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {displayedGrades.map((grade) => (
                      <GradeChip
                        key={grade.id}
                        grade={grade}
                        isSelected={activeIds.includes(grade.id)}
                        onToggle={toggleGrade}
                      />
                    ))}
                  </div>

                  <Dialog
                    open={customDialogOpen}
                    onClose={() => setCustomDialogOpen(false)}
                    slotProps={{
                      paper: {
                        sx: {
                          borderRadius: 3,
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(125, 211, 252, 0.2)',
                          p: 1,
                        },
                      },
                    }}
                  >
                    <DialogTitle sx={{ color: 'text.primary', fontWeight: 700 }}>
                      Add Custom Fuel / Charge Grade
                    </DialogTitle>
                    <DialogContent
                      style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}
                    >
                      <TextField
                        label="Grade Name / Label"
                        placeholder="e.g. Ethanol E100, Supercharger 250kW"
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(15, 21, 36, 0.6)',
                          },
                        }}
                      />
                      <FormControl fullWidth>
                        <InputLabel id="custom-category-label">Category</InputLabel>
                        <Select
                          labelId="custom-category-label"
                          value={customCategory}
                          label="Category"
                          onChange={(e) =>
                            setCustomCategory(e.target.value as FuelGrade['category'])
                          }
                          sx={{ borderRadius: 3, backgroundColor: 'rgba(15, 21, 36, 0.6)' }}
                        >
                          <MenuItem value="petrol">Petrol / Gasoline</MenuItem>
                          <MenuItem value="diesel">Diesel</MenuItem>
                          <MenuItem value="gas">Gas (LPG / CNG)</MenuItem>
                          <MenuItem value="ev">EV Charging</MenuItem>
                          <MenuItem value="alternative">Alternative (E85 / H2 / DEF)</MenuItem>
                        </Select>
                      </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                      <Button
                        onClick={() => setCustomDialogOpen(false)}
                        sx={{ color: 'text.secondary' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleAddCustomGrade(activeIds, powertrain)}
                        disabled={!customLabel.trim()}
                        sx={{
                          borderRadius: 2,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          fontWeight: 700,
                        }}
                      >
                        Add & Enable
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              );
            }}
          />
        )}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <form.Field
          name="distanceUnit"
          children={(field) => (
            <FormControl fullWidth>
              <InputLabel id="distance-unit-label">Distance Unit</InputLabel>
              <Select
                labelId="distance-unit-label"
                value={field.state.value}
                label="Distance Unit"
                onChange={(e) => field.handleChange(e.target.value)}
                sx={{ borderRadius: 3, backgroundColor: 'rgba(15, 21, 36, 0.6)' }}
              >
                <MenuItem value="km">Kilometers (km)</MenuItem>
                <MenuItem value="mi">Miles (mi)</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <form.Field
          name="efficiencyUnit"
          children={(field) => (
            <FormControl fullWidth>
              <InputLabel id="efficiency-unit-label">Efficiency Unit</InputLabel>
              <Select
                labelId="efficiency-unit-label"
                value={field.state.value}
                label="Efficiency Unit"
                onChange={(e) => field.handleChange(e.target.value)}
                sx={{ borderRadius: 3, backgroundColor: 'rgba(15, 21, 36, 0.6)' }}
              >
                <MenuItem value="kwh100km">kWh / 100km</MenuItem>
                <MenuItem value="l100km">L / 100km</MenuItem>
                <MenuItem value="mpg">MPG (US)</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {onCancel && (
          <Button
            variant="outlined"
            fullWidth
            onClick={onCancel}
            sx={{
              borderRadius: 3,
              height: 48,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(125, 211, 252, 0.2)',
              color: 'text.secondary',
            }}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          fullWidth
          sx={{
            borderRadius: 3,
            height: 48,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#93ddfd',
              boxShadow: '0 0 16px rgba(125, 211, 252, 0.4)',
            },
          }}
        >
          {submitting ? 'Saving...' : initialVehicle ? 'Save Changes' : 'Add Vehicle'}
        </Button>
      </div>
    </form>
  );
}
