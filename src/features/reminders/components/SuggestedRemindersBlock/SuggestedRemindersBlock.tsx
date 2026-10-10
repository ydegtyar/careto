import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Typography from '@mui/material/Typography';
import type { Reminder, Vehicle } from '@/data/client/types';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import {
  SUGGESTED_REMINDERS_PRESETS,
  type SuggestedReminderPreset,
} from '../../data/suggestedReminders';
import { SuggestedReminderItem } from './SuggestedReminderItem';

interface Props {
  vehicle?: Vehicle | null;
  existingReminders?: Reminder[];
  onSetup: (preset: SuggestedReminderPreset) => void;
  onDismiss: (presetId: string) => void;
}

export function SuggestedRemindersBlock({
  vehicle,
  existingReminders = [],
  onSetup,
  onDismiss,
}: Props) {
  if (!vehicle) return null;

  const dismissedIds = new Set(vehicle.dismissed_suggested_reminders ?? []);

  // Filter out suggestions that:
  // 1) don't match vehicle's powertrain
  // 2) have already been dismissed forever
  // 3) match an existing reminder by title or kind
  const activeSuggestions = SUGGESTED_REMINDERS_PRESETS.filter((preset) => {
    if (!preset.powertrains.includes(vehicle.powertrain)) {
      return false;
    }
    if (dismissedIds.has(preset.id)) {
      return false;
    }
    const alreadyExists = existingReminders.some(
      (r) =>
        r.title.toLowerCase().trim() === preset.title.toLowerCase().trim() ||
        (r.kind === preset.kind && preset.interval_m && r.interval_m === preset.interval_m),
    );
    return !alreadyExists;
  });

  if (activeSuggestions.length === 0) {
    return null;
  }

  return (
    <GlassCard style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
            Suggested for {vehicle.name} ({vehicle.powertrain.toUpperCase()})
          </Typography>
        </div>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {activeSuggestions.length} recommendation{activeSuggestions.length > 1 ? 's' : ''}
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeSuggestions.map((preset) => (
          <SuggestedReminderItem
            key={preset.id}
            preset={preset}
            onSetup={onSetup}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </GlassCard>
  );
}
