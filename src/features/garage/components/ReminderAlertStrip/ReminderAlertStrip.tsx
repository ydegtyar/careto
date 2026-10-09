import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import type { Reminder } from '@/data/client/types';
import { computeDue, type DueStatus } from '@/features/reminders/lib/compute-due';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { type StatusLevel, StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import { getStackCardStyle, styles } from './ReminderAlertStrip.styles';

interface Props {
  reminders: Reminder[];
  currentOdometerM?: number;
  currentDate?: string;
}

const STATUS_PRIORITY: Record<DueStatus, number> = {
  overdue: 4,
  due: 3,
  upcoming: 2,
  ok: 1,
  snoozed: 0,
};

export const ReminderAlertStrip: React.FC<Props> = ({
  reminders,
  currentOdometerM = 0,
  currentDate,
}) => {
  const navigate = useNavigate();

  if (!reminders || reminders.length === 0) {
    return null;
  }

  const todayStr = currentDate ?? new Date().toISOString().split('T')[0] ?? '2026-10-09';

  // Evaluate reminders and compute due result
  const evaluated = reminders.map((reminder) => {
    const dueResult = computeDue(
      {
        id: reminder.id,
        kind: reminder.kind,
        title: reminder.title,
        mode: reminder.mode ?? 'km',
        interval_m: reminder.interval_m,
        interval_days: reminder.interval_days,
        lead_m: reminder.lead_m,
        lead_days: reminder.lead_days,
      },
      {
        currentOdometerM,
        currentDate: todayStr,
      },
    );
    return { reminder, dueResult };
  });

  // Sort by priority (overdue > due > upcoming > ok) then by percent descending
  evaluated.sort((a, b) => {
    const priA = STATUS_PRIORITY[a.dueResult.status];
    const priB = STATUS_PRIORITY[b.dueResult.status];
    if (priA !== priB) {
      return priB - priA;
    }
    return b.dueResult.percent - a.dueResult.percent;
  });

  const mostImportant = evaluated[0];
  if (!mostImportant) {
    return null;
  }

  const count = evaluated.length;

  const handleClick = () => {
    navigate({ to: '/reminders' });
  };

  const pillStatus: StatusLevel =
    mostImportant.dueResult.status === 'snoozed' ? 'ok' : mostImportant.dueResult.status;

  const backgroundCards = evaluated.slice(1, 3);

  return (
    <div
      style={styles.stackWrapper}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Background stacked cards for visual depth */}
      {backgroundCards.map((_, idx) => (
        <GlassCard key={idx} style={getStackCardStyle(idx + 1, count)}>
          <div style={styles.cardInner} />
        </GlassCard>
      ))}

      {/* Primary (most important) reminder card */}
      <GlassCard style={getStackCardStyle(0, count)}>
        <div style={styles.cardInner}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {mostImportant.reminder.title}
              </Typography>
              {count > 1 && <span style={styles.badge}>+{count - 1} more</span>}
            </div>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {mostImportant.dueResult.reason}
            </Typography>
          </div>
          <StatusPill status={pillStatus} />
        </div>
      </GlassCard>
    </div>
  );
};

export default ReminderAlertStrip;
