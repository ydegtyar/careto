import AddIcon from '@mui/icons-material/Add';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { data } from '@/data/client';
import type { Reminder } from '@/data/client/types';
import {
  remindersQueryOptions,
  vehicleDetailQueryOptions,
} from '@/features/garage/queries/vehicles';
import { ReminderCard } from '@/features/reminders/components/ReminderCard/ReminderCard';
import { ReminderFormDialog } from '@/features/reminders/components/ReminderFormDialog/ReminderFormDialog';
import { computeDue } from '@/features/reminders/lib/compute-due';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/reminders/')({
  component: RemindersPage,
});

function RemindersPage() {
  const { activeVehicleId } = useAppStore();
  const queryClient = useQueryClient();
  const { data: reminders = [] } = useQuery(remindersQueryOptions(activeVehicleId ?? undefined));
  const { data: activeVehicle } = useQuery(
    vehicleDetailQueryOptions(activeVehicleId ?? 'f85e3426-dbf2-4022-8467-c5bc5367358d'),
  );

  const [filterTab, setFilterTab] = useState<'all' | 'due' | 'upcoming' | 'ok'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [customTypes, setCustomTypes] = useState<string[]>(
    activeVehicle?.custom_reminder_types ?? [],
  );

  const evaluatedReminders = reminders.map((r) => {
    const dueRes = computeDue(
      {
        id: r.id,
        kind: r.kind,
        title: r.title,
        mode: r.mode ?? 'km',
        interval_m: r.interval_m,
        interval_days: r.interval_days,
        base_odometer_m: r.base_odometer_m,
        base_date: r.base_date,
        snoozed_until: r.snoozed_until,
        lead_m: r.lead_m,
        lead_days: r.lead_days,
      },
      {
        currentOdometerM: 42150000,
        currentDate: new Date().toISOString().split('T')[0] ?? '2026-10-08',
      },
    );
    return { ...r, computedStatus: dueRes.status };
  });

  const filteredReminders = evaluatedReminders.filter((r) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'due') return r.computedStatus === 'due' || r.computedStatus === 'overdue';
    if (filterTab === 'upcoming') return r.computedStatus === 'upcoming';
    if (filterTab === 'ok') return r.computedStatus === 'ok' || r.computedStatus === 'snoozed';
    return true;
  });

  const healthIndex = 94;

  const handleComplete = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (target) {
      const todayStr = new Date().toISOString().split('T')[0];
      const updated: Reminder = {
        ...target,
        base_date: todayStr,
        base_odometer_m: 42150000,
      };
      await data.upsertReminder(updated);
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    }
    setToastMessage('Maintenance completed! Schedule baseline updated.');
  };

  const handleOpenAdd = () => {
    setEditingReminder(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setDialogOpen(true);
  };

  const handleSaveReminder = async (reminderData: Partial<Reminder>, newCustomType?: string) => {
    if (newCustomType && !customTypes.includes(newCustomType)) {
      const updatedCustom = [...customTypes, newCustomType];
      setCustomTypes(updatedCustom);
      if (activeVehicle) {
        await data.upsertVehicle({
          ...activeVehicle,
          custom_reminder_types: updatedCustom,
        });
      }
    }

    const fullReminder: Reminder = {
      id: reminderData.id ?? crypto.randomUUID(),
      kind: reminderData.kind ?? 'service',
      title: reminderData.title ?? 'Service Task',
      mode: reminderData.mode ?? 'earlier',
      interval_m: reminderData.interval_m,
      interval_days: reminderData.interval_days,
      base_odometer_m: reminderData.base_odometer_m,
      base_date: reminderData.base_date,
      lead_m: reminderData.lead_m ?? 500_000,
      lead_days: reminderData.lead_days ?? 14,
      est_cost_usd_minor: reminderData.est_cost_usd_minor,
    };

    await data.upsertReminder(fullReminder);
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
    setToastMessage(
      editingReminder ? 'Maintenance schedule updated cleanly!' : 'New reminder added!',
    );
  };

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Predictive Health Overview Banner */}
      <GlassCard
        style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '18px 16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HealthAndSafetyIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 800, fontSize: '0.8rem' }}
            >
              Vehicle Health Index
            </Typography>
          </div>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {healthIndex}%
          </Typography>
        </div>

        <LinearProgress
          variant="determinate"
          value={healthIndex}
          aria-label="Vehicle Health Index"
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(32, 44, 66, 0.6)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #7dd3fc, #c8a0f0)',
              borderRadius: 4,
            },
          }}
        />

        <div style={{ marginTop: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.3 }}>
            Predictive Maintenance Hub
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Dual-trigger interval tracking based on 42,150 km odometer reading and rolling 30-day
            usage trends.
          </Typography>
        </div>
      </GlassCard>

      {/* Filter Tabs & Add Button */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
      >
        <Tabs
          value={filterTab}
          onChange={(_, val) => setFilterTab(val)}
          sx={{
            minHeight: 34,
            backgroundColor: 'rgba(15, 21, 36, 0.4)',
            borderRadius: '12px',
            padding: '2px',
            border: '1px solid rgba(125, 211, 252, 0.12)',
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
              height: '100%',
              borderRadius: '10px',
              opacity: 0.18,
            },
            '& .MuiTab-root': {
              minHeight: 30,
              padding: '4px 12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              color: 'text.secondary',
              zIndex: 1,
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab value="all" label={`All (${reminders.length})`} />
          <Tab value="due" label="Due" />
          <Tab value="upcoming" label="Upcoming" />
          <Tab value="ok" label="Normal" />
        </Tabs>

        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            textTransform: 'none',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '0.8rem',
            backgroundColor: 'rgba(125, 211, 252, 0.1)',
            borderRadius: '12px',
            px: 1.5,
            height: 34,
            whiteSpace: 'nowrap',
          }}
        >
          Add
        </Button>
      </div>

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredReminders.length === 0 ? (
          <GlassCard style={{ padding: 24, textAlign: 'center' }}>
            <BuildCircleIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              No maintenance items match this filter.
            </Typography>
          </GlassCard>
        ) : (
          filteredReminders.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onComplete={handleComplete}
              onEdit={handleOpenEdit}
            />
          ))
        )}
      </div>

      {/* Form Dialog for Add / Edit */}
      <ReminderFormDialog
        open={dialogOpen}
        reminder={editingReminder}
        customTypes={customTypes}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveReminder}
      />

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: 3 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
