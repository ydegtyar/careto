import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import type { Reminder, ReminderModeType } from '@/data/client/types';

export const DEFAULT_MAINTENANCE_TYPES = [
  { id: 'service', label: 'Service & General' },
  { id: 'fluids', label: 'Fluids & Oils' },
  { id: 'tires', label: 'Tires & Rotation' },
  { id: 'brakes', label: 'Brakes & Pads' },
  { id: 'filters', label: 'Filters (Air/Cabin/Fuel)' },
  { id: 'transmission', label: 'Transmission & Drivetrain' },
  { id: 'spark_plugs', label: 'Spark Plugs & Ignition' },
  { id: 'battery', label: 'Battery & Electrical' },
  { id: 'inspection', label: 'Inspection / Tax / Insurance' },
  { id: 'timing_belt', label: 'Timing Belt / Chain' },
] as const;

export const QUICK_PRESETS = [
  {
    id: 'cabin',
    label: 'Cabin Air Filter',
    icon: 'air',
    kind: 'filters',
    intervalKm: '20000',
    intervalDays: '365',
    mode: 'earlier',
  },
  {
    id: 'tires',
    label: 'Tire Rotation',
    icon: 'rotate_right',
    kind: 'tires',
    intervalKm: '10000',
    intervalDays: '180',
    mode: 'earlier',
  },
  {
    id: 'seasonal_tires',
    label: 'Seasonal Tire Change',
    icon: 'ac_unit',
    kind: 'tires',
    intervalKm: '',
    intervalDays: '180',
    mode: 'seasonal',
  },
  {
    id: 'brake',
    label: 'Brake Inspection',
    icon: 'tune',
    kind: 'brakes',
    intervalKm: '20000',
    intervalDays: '365',
    mode: 'earlier',
  },
  {
    id: 'fluid',
    label: 'Brake Fluid Flush',
    icon: 'opacity',
    kind: 'fluids',
    intervalKm: '40000',
    intervalDays: '730',
    mode: 'earlier',
  },
  {
    id: 'hvac',
    label: 'HVAC Desiccant Bag',
    icon: 'mode_fan',
    kind: 'service',
    intervalKm: '60000',
    intervalDays: '1095',
    mode: 'earlier',
  },
] as const;

const STANDARD_KM_PRESETS = [5000, 7500, 10000, 15000, 20000, 60000, 100000];
const STANDARD_DAYS_PRESETS = [
  { label: '6 mo', days: 180 },
  { label: '1 yr', days: 365 },
  { label: '2 yrs', days: 730 },
  { label: '3 yrs', days: 1095 },
  { label: '5 yrs', days: 1825 },
];

const TRIGGER_MODES: {
  id: ReminderModeType;
  title: string;
  desc: string;
  icon: string;
  recommended?: boolean;
}[] = [
  {
    id: 'earlier',
    title: 'Dual Trigger',
    desc: 'Whichever occurs first (km or time)',
    icon: 'sync_alt',
    recommended: true,
  },
  {
    id: 'km',
    title: 'Distance Only',
    desc: 'Strictly keyed to odometer delta',
    icon: 'add_road',
  },
  {
    id: 'time',
    title: 'Duration Only',
    desc: 'Strict elapsed calendar interval',
    icon: 'calendar_month',
  },
  {
    id: 'seasonal',
    title: 'Seasonal Cycle',
    desc: 'Winter/Summer changeover dates',
    icon: 'ac_unit',
  },
];

interface Props {
  open: boolean;
  reminder?: Reminder | null;
  customTypes?: string[];
  onClose: () => void;
  onSave: (reminderData: Partial<Reminder>, newCustomType?: string) => void;
}

export function ReminderFormDialog({ open, reminder, customTypes = [], onClose, onSave }: Props) {
  const isEditing = Boolean(reminder);

  const [title, setTitle] = useState(reminder?.title ?? '');
  const [kind, setKind] = useState(reminder?.kind ?? 'service');
  const [customKindInput, setCustomKindInput] = useState('');
  const [mode, setMode] = useState<ReminderModeType>(
    (reminder?.mode as ReminderModeType) ?? 'earlier',
  );
  const [intervalKm, setIntervalKm] = useState(
    reminder?.interval_m ? String(Math.round(reminder.interval_m / 1000)) : '10000',
  );
  const [intervalDays, setIntervalDays] = useState(
    reminder?.interval_days ? String(reminder.interval_days) : '365',
  );
  const [baseDate, setBaseDate] = useState(
    reminder?.base_date ?? new Date().toISOString().split('T')[0] ?? '',
  );
  const [baseOdometerKm, setBaseOdometerKm] = useState(
    reminder?.base_odometer_m !== undefined && reminder?.base_odometer_m !== null
      ? String(Math.round(reminder.base_odometer_m / 1000))
      : '0',
  );
  const [estCost, setEstCost] = useState(
    reminder?.est_cost_usd_minor !== undefined && reminder?.est_cost_usd_minor !== null
      ? String(Math.round(reminder.est_cost_usd_minor / 100))
      : '',
  );

  // Sync state when reminder prop changes or dialog opens
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setTitle(reminder?.title ?? '');
        setKind(reminder?.kind ?? 'service');
        setCustomKindInput('');
        setMode((reminder?.mode as ReminderModeType) ?? 'earlier');
        setIntervalKm(
          reminder?.interval_m ? String(Math.round(reminder.interval_m / 1000)) : '10000',
        );
        setIntervalDays(reminder?.interval_days ? String(reminder.interval_days) : '365');
        setBaseDate(reminder?.base_date ?? new Date().toISOString().split('T')[0] ?? '');
        setBaseOdometerKm(
          reminder?.base_odometer_m !== undefined && reminder?.base_odometer_m !== null
            ? String(Math.round(reminder.base_odometer_m / 1000))
            : '0',
        );
        setEstCost(
          reminder?.est_cost_usd_minor !== undefined && reminder?.est_cost_usd_minor !== null
            ? String(Math.round(reminder.est_cost_usd_minor / 100))
            : '',
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, reminder]);

  const handleApplyPreset = (preset: (typeof QUICK_PRESETS)[number]) => {
    setTitle(preset.label);
    setKind(preset.kind);
    setMode(preset.mode as ReminderModeType);
    if (preset.intervalKm) setIntervalKm(preset.intervalKm);
    if (preset.intervalDays) setIntervalDays(preset.intervalDays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedKind = kind === '__custom__' ? customKindInput.trim() : kind;
    const isNewCustom = kind === '__custom__' && customKindInput.trim().length > 0;

    const updatedData: Partial<Reminder> = {
      ...(reminder ? { id: reminder.id } : {}),
      title,
      kind: selectedKind || 'service',
      mode,
      interval_m:
        mode !== 'time' && mode !== 'seasonal' && intervalKm
          ? parseInt(intervalKm, 10) * 1000
          : undefined,
      interval_days: mode !== 'km' && intervalDays ? parseInt(intervalDays, 10) : undefined,
      base_date: mode !== 'km' && baseDate ? baseDate : undefined,
      base_odometer_m:
        mode !== 'time' && mode !== 'seasonal' && baseOdometerKm
          ? parseInt(baseOdometerKm, 10) * 1000
          : 0,
      est_cost_usd_minor: estCost ? Math.round(parseFloat(estCost) * 100) : undefined,
      lead_m: reminder?.lead_m ?? 500_000,
      lead_days: reminder?.lead_days ?? 14,
    };

    onSave(updatedData, isNewCustom ? customKindInput.trim() : undefined);
    onClose();
  };

  const showKmFields = mode === 'earlier' || mode === 'later' || mode === 'km';
  const showDaysFields =
    mode === 'earlier' || mode === 'later' || mode === 'time' || mode === 'seasonal';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth scroll="paper">
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%', overflow: 'hidden' }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, flexShrink: 0 }}>
          {isEditing ? 'Edit Maintenance Schedule' : 'Add Maintenance Schedule'}
        </DialogTitle>
        <DialogContent dividers style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Presets */}
          <div>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'block',
                mb: 1,
              }}
            >
              Quick Presets
            </Typography>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {QUICK_PRESETS.map((preset) => (
                <Chip
                  key={preset.id}
                  label={preset.label}
                  size="small"
                  clickable
                  onClick={() => handleApplyPreset(preset)}
                  variant="outlined"
                  sx={{ borderRadius: 2, fontWeight: 500 }}
                />
              ))}
            </div>
          </div>

          {/* Section 1: Task Identity */}
          <TextField
            label="Task Name"
            placeholder="e.g. Engine Oil & Filter Change"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="maintenance-type-label">Maintenance Type</InputLabel>
            <Select
              labelId="maintenance-type-label"
              value={kind}
              label="Maintenance Type"
              onChange={(e) => setKind(e.target.value)}
            >
              {DEFAULT_MAINTENANCE_TYPES.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.label}
                </MenuItem>
              ))}
              {customTypes.map((ct) => (
                <MenuItem key={ct} value={ct}>
                  Custom: {ct}
                </MenuItem>
              ))}
              <MenuItem value="__custom__" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                + Add Custom Type...
              </MenuItem>
            </Select>
          </FormControl>

          {kind === '__custom__' && (
            <TextField
              label="New Custom Type Name"
              placeholder="e.g. Spark Plugs, Ceramic Coating, Differential"
              value={customKindInput}
              onChange={(e) => setCustomKindInput(e.target.value)}
              required
              fullWidth
            />
          )}

          {/* Section 2: Trigger Mode Grid */}
          <div>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'block',
                mb: 1,
              }}
            >
              Trigger Mode
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TRIGGER_MODES.map((item) => {
                const isSelected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: 12,
                      borderRadius: 12,
                      border: isSelected
                        ? '2px solid var(--mui-palette-primary-main, #7dd3fc)'
                        : '1px solid var(--mui-palette-divider, rgba(255, 255, 255, 0.12))',
                      backgroundColor: isSelected ? 'rgba(125, 211, 252, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: isSelected ? '#7dd3fc' : 'inherit',
                        }}
                      >
                        {item.title}
                      </span>
                      {item.recommended && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#7dd3fc',
                            backgroundColor: 'rgba(125, 211, 252, 0.15)',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          Rec
                        </span>
                      )}
                    </div>
                    <span
                      style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.3 }}
                    >
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Interval Parameters */}
          {(showKmFields || showDaysFields) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {showKmFields && (
                  <TextField
                    label="Interval (km)"
                    type="number"
                    value={intervalKm}
                    onChange={(e) => setIntervalKm(e.target.value)}
                    fullWidth
                  />
                )}
                {showDaysFields && (
                  <TextField
                    label={mode === 'seasonal' ? 'Cycle Interval (days)' : 'Interval (days)'}
                    type="number"
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(e.target.value)}
                    fullWidth
                  />
                )}
              </div>

              {showKmFields && (
                <div>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}
                  >
                    Standard Distance Presets
                  </Typography>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STANDARD_KM_PRESETS.map((preset) => {
                      const isSelected = intervalKm === String(preset);
                      return (
                        <Chip
                          key={preset}
                          label={`${preset.toLocaleString()} km`}
                          size="small"
                          clickable
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          onClick={() => setIntervalKm(String(preset))}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {showDaysFields && (
                <div>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}
                  >
                    Standard Time Presets
                  </Typography>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STANDARD_DAYS_PRESETS.map((preset) => {
                      const isSelected = intervalDays === String(preset.days);
                      return (
                        <Chip
                          key={preset.days}
                          label={`${preset.label} (${preset.days} d)`}
                          size="small"
                          clickable
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          onClick={() => setIntervalDays(String(preset.days))}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Baseline Service Anchor */}
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, mt: 1 }}>
            Baseline / Last Service Record
          </Typography>

          <div style={{ display: 'flex', gap: 12 }}>
            {showDaysFields && (
              <TextField
                label="Last Change Date"
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            )}
            {showKmFields && (
              <TextField
                label="Last Odometer (km)"
                type="number"
                value={baseOdometerKm}
                onChange={(e) => setBaseOdometerKm(e.target.value)}
                fullWidth
              />
            )}
          </div>

          <TextField
            label="Est. Cost ($)"
            type="number"
            value={estCost}
            onChange={(e) => setEstCost(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, flexShrink: 0 }}>
          <Button
            onClick={onClose}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            {isEditing ? 'Save Changes' : 'Create Reminder'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
