import Button from '@mui/material/Button';
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
import type { Reminder } from '@/data/client/types';

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
  const [mode, setMode] = useState<'km' | 'time' | 'earlier' | 'later'>(
    reminder?.mode ?? 'earlier',
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
        setMode(reminder?.mode ?? 'earlier');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedKind = kind === '__custom__' ? customKindInput.trim() : kind;
    const isNewCustom = kind === '__custom__' && customKindInput.trim().length > 0;

    const updatedData: Partial<Reminder> = {
      ...(reminder ? { id: reminder.id } : {}),
      title,
      kind: selectedKind || 'service',
      mode,
      interval_m: intervalKm ? parseInt(intervalKm, 10) * 1000 : undefined,
      interval_days: intervalDays ? parseInt(intervalDays, 10) : undefined,
      base_date: baseDate || undefined,
      base_odometer_m: baseOdometerKm ? parseInt(baseOdometerKm, 10) * 1000 : 0,
      est_cost_usd_minor: estCost ? Math.round(parseFloat(estCost) * 100) : undefined,
      lead_m: reminder?.lead_m ?? 500_000,
      lead_days: reminder?.lead_days ?? 14,
    };

    onSave(updatedData, isNewCustom ? customKindInput.trim() : undefined);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#0f1524',
            backgroundImage: 'none',
            border: '1px solid rgba(125, 211, 252, 0.2)',
            borderRadius: 4,
            color: '#e0e8f0',
            padding: 1,
            width: '100%',
            maxWidth: 440,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? 'Edit Maintenance Schedule' : 'Add Maintenance Schedule'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label="Task Name"
            placeholder="e.g. Engine Oil & Filter Change"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(15, 21, 36, 0.6)',
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel id="maintenance-type-label">Maintenance Type</InputLabel>
            <Select
              labelId="maintenance-type-label"
              value={kind}
              label="Maintenance Type"
              onChange={(e) => setKind(e.target.value)}
              sx={{ borderRadius: 3, backgroundColor: 'rgba(15, 21, 36, 0.6)' }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <TextField
              label="Interval (km)"
              type="number"
              value={intervalKm}
              onChange={(e) => setIntervalKm(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
            <TextField
              label="Interval (days)"
              type="number"
              value={intervalDays}
              onChange={(e) => setIntervalDays(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          </div>

          <FormControl fullWidth>
            <InputLabel id="trigger-mode-label">Trigger Rule Mode</InputLabel>
            <Select
              labelId="trigger-mode-label"
              value={mode}
              label="Trigger Rule Mode"
              onChange={(e) => setMode(e.target.value as any)}
              sx={{ borderRadius: 3, backgroundColor: 'rgba(15, 21, 36, 0.6)' }}
            >
              <MenuItem value="earlier">Whichever comes first (km or time)</MenuItem>
              <MenuItem value="later">Whichever comes later (km and time)</MenuItem>
              <MenuItem value="km">Distance only (km)</MenuItem>
              <MenuItem value="time">Time only (days)</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, mt: 1 }}>
            Baseline / Last Service Record
          </Typography>

          <div style={{ display: 'flex', gap: 12 }}>
            <TextField
              label="Last Change Date"
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
            <TextField
              label="Last Odometer (km)"
              type="number"
              value={baseOdometerKm}
              onChange={(e) => setBaseOdometerKm(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(15, 21, 36, 0.6)',
                },
              }}
            />
          </div>

          <TextField
            label="Est. Cost ($)"
            type="number"
            value={estCost}
            onChange={(e) => setEstCost(e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(15, 21, 36, 0.6)',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
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
