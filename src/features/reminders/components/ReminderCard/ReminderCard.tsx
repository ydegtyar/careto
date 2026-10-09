import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import type { Reminder } from '@/data/client/types';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { type StatusLevel, StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import { computeDue } from '../../lib/compute-due';
import styles from './ReminderCard.module.scss';

interface Props {
  reminder: Reminder;
  currentOdometerM?: number;
  currentDate?: string;
  onComplete?: (id: string) => void;
  onEdit?: (reminder: Reminder) => void;
}

export function ReminderCard({
  reminder,
  currentOdometerM = 42150000,
  currentDate,
  onComplete,
  onEdit,
}: Props) {
  const dueResult = computeDue(
    {
      id: reminder.id,
      kind: reminder.kind,
      title: reminder.title,
      mode: reminder.mode ?? 'km',
      interval_m: reminder.interval_m,
      interval_days: reminder.interval_days,
      base_odometer_m: reminder.base_odometer_m,
      base_date: reminder.base_date,
      snoozed_until: reminder.snoozed_until,
      lead_m: reminder.lead_m,
      lead_days: reminder.lead_days,
    },
    {
      currentOdometerM,
      currentDate: currentDate ?? new Date().toISOString().split('T')[0] ?? '2026-10-08',
    },
  );

  const pillStatus: StatusLevel = dueResult.status === 'snoozed' ? 'ok' : dueResult.status;
  const pillLabel = dueResult.status === 'snoozed' ? 'Snoozed' : undefined;

  return (
    <GlassCard
      className={styles.card}
      onClick={() => onEdit?.(reminder)}
      style={{ cursor: onEdit ? 'pointer' : 'default' }}
    >
      <div className={styles.topRow}>
        <div>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {reminder.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textTransform: 'capitalize' }}
          >
            {reminder.kind} · {dueResult.reason}
          </Typography>
          {reminder.base_date && (
            <Typography
              variant="caption"
              component="div"
              sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.2 }}
            >
              Last done: {reminder.base_date}
              {reminder.base_odometer_m
                ? ` (${Math.round(reminder.base_odometer_m / 1000).toLocaleString()} km)`
                : ''}
            </Typography>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusPill status={pillStatus} label={pillLabel} />
          {onEdit && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(reminder);
              }}
              sx={{ color: 'text.secondary', p: 0.5 }}
              aria-label="Edit reminder"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressLabels}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Remaining
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: dueResult.status === 'overdue' ? 'error.main' : 'primary.main',
            }}
          >
            {dueResult.remainingM !== null
              ? `${Math.round(dueResult.remainingM / 1000).toLocaleString()} km`
              : dueResult.remainingDays !== null
                ? `${dueResult.remainingDays} days`
                : dueResult.reason}
          </Typography>
        </div>
        <LinearProgress
          variant="determinate"
          aria-label={`${reminder.title} progress`}
          value={dueResult.percent}
          color={
            dueResult.status === 'overdue'
              ? 'error'
              : dueResult.status === 'due'
                ? 'warning'
                : 'primary'
          }
          className={styles.progressBar}
        />
      </div>

      <div className={styles.footer}>
        {reminder.est_cost_usd_minor && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Est. ${(reminder.est_cost_usd_minor / 100).toFixed(0)}
          </Typography>
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<CheckCircleIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onComplete?.(reminder.id);
          }}
          className={styles.completeBtn}
        >
          Complete
        </Button>
      </div>
    </GlassCard>
  );
}
