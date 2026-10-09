export type ReminderMode = 'km' | 'time' | 'earlier' | 'later';
export type DueStatus = 'ok' | 'upcoming' | 'due' | 'overdue' | 'snoozed';

export interface ComputeDueReminderInput {
  id: string;
  kind?: string;
  title?: string;
  mode: ReminderMode;
  interval_m?: number | null;
  interval_days?: number | null;
  base_odometer_m?: number | null;
  base_date?: string | null; // ISO YYYY-MM-DD
  lead_m?: number | null;
  lead_days?: number | null;
  snoozed_until?: string | null; // ISO YYYY-MM-DD
}

export interface ComputeDueContext {
  currentOdometerM: number;
  currentDate: string | Date; // ISO YYYY-MM-DD or Date
  dailyUsageM?: number | null; // meters per day
}

export interface ComputeDueResult {
  status: DueStatus;
  remainingM: number | null;
  remainingDays: number | null;
  percent: number; // 0 to 100 (or higher if overdue)
  targetOdometerM: number | null;
  targetDate: string | null; // YYYY-MM-DD
  projectedDueDate: string | null; // YYYY-MM-DD
  reason: string;
}

// Helper to normalize Date / string into UTC date without time skew
export function parseDateOnly(d: string | Date): Date {
  if (typeof d === 'string') {
    const parts = d.split('T')[0]?.split('-');
    if (parts && parts.length === 3) {
      const year = parseInt(parts[0] ?? '1970', 10);
      const month = parseInt(parts[1] ?? '1', 10) - 1;
      const day = parseInt(parts[2] ?? '1', 10);
      return new Date(Date.UTC(year, month, day));
    }
  }
  const date = new Date(d);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function formatDateOnly(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(d: Date, days: number): Date {
  const result = new Date(d.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function diffDays(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  return Math.round((a.getTime() - b.getTime()) / msPerDay);
}

const STATUS_PRIORITY: Record<DueStatus, number> = {
  overdue: 4,
  due: 3,
  upcoming: 2,
  ok: 1,
  snoozed: 0,
};

export function computeDue(
  reminder: ComputeDueReminderInput,
  context: ComputeDueContext,
): ComputeDueResult {
  const curDate = parseDateOnly(context.currentDate);
  const leadM = reminder.lead_m ?? 500_000; // default 500 km
  const leadDays = reminder.lead_days ?? 14; // default 14 days

  // Check snooze first
  if (reminder.snoozed_until) {
    const snoozeDate = parseDateOnly(reminder.snoozed_until);
    if (snoozeDate.getTime() > curDate.getTime()) {
      return {
        status: 'snoozed',
        remainingM: null,
        remainingDays: diffDays(snoozeDate, curDate),
        percent: 0,
        targetOdometerM: null,
        targetDate: formatDateOnly(snoozeDate),
        projectedDueDate: null,
        reason: `Snoozed until ${formatDateOnly(snoozeDate)}`,
      };
    }
  }

  // --- Compute KM trigger ---
  let kmStatus: DueStatus = 'ok';
  let remainingM: number | null = null;
  let targetOdoM: number | null = null;
  let kmPercent = 0;
  let projectedDueDateFromKm: string | null = null;

  if (reminder.interval_m && reminder.interval_m > 0) {
    const baseOdo = reminder.base_odometer_m ?? 0;
    targetOdoM = baseOdo + reminder.interval_m;
    remainingM = targetOdoM - context.currentOdometerM;

    const progressM = context.currentOdometerM - baseOdo;
    kmPercent = Math.max(0, Math.min(100, Math.round((progressM / reminder.interval_m) * 100)));

    if (remainingM <= 0) {
      kmStatus = 'overdue';
    } else if (remainingM <= leadM) {
      kmStatus = 'due';
    } else if (remainingM <= leadM * 2) {
      kmStatus = 'upcoming';
    } else {
      kmStatus = 'ok';
    }

    if (context.dailyUsageM && context.dailyUsageM > 0) {
      const daysUntilDue = Math.round(remainingM / context.dailyUsageM);
      const proj = addDays(curDate, daysUntilDue);
      projectedDueDateFromKm = formatDateOnly(proj);
    }
  }

  // --- Compute Time trigger ---
  let timeStatus: DueStatus = 'ok';
  let remainingDays: number | null = null;
  let targetDateStr: string | null = null;
  let timePercent = 0;

  if (reminder.interval_days && reminder.interval_days > 0) {
    const baseDate = reminder.base_date ? parseDateOnly(reminder.base_date) : curDate;
    const targetDateObj = addDays(baseDate, reminder.interval_days);
    targetDateStr = formatDateOnly(targetDateObj);
    remainingDays = diffDays(targetDateObj, curDate);

    const progressDays = reminder.interval_days - remainingDays;
    timePercent = Math.max(
      0,
      Math.min(100, Math.round((progressDays / reminder.interval_days) * 100)),
    );

    if (remainingDays <= 0) {
      timeStatus = 'overdue';
    } else if (remainingDays <= leadDays) {
      timeStatus = 'due';
    } else if (remainingDays <= leadDays * 2) {
      timeStatus = 'upcoming';
    } else {
      timeStatus = 'ok';
    }
  }

  // --- Evaluate Mode ---
  let finalStatus: DueStatus = 'ok';
  let finalPercent = 0;
  let reason = '';
  let finalProjectedDate = projectedDueDateFromKm ?? targetDateStr;

  switch (reminder.mode) {
    case 'km': {
      finalStatus = kmStatus;
      finalPercent = kmPercent;
      if (remainingM !== null) {
        const kmVal = Math.round(Math.abs(remainingM) / 1000);
        if (remainingM <= 0) {
          reason = `Overdue by ${kmVal.toLocaleString()} km`;
        } else {
          reason = `${kmVal.toLocaleString()} km remaining`;
        }
      } else {
        reason = 'No distance interval configured';
      }
      break;
    }

    case 'time': {
      finalStatus = timeStatus;
      finalPercent = timePercent;
      finalProjectedDate = targetDateStr;
      if (remainingDays !== null) {
        if (remainingDays <= 0) {
          reason = `Overdue by ${Math.abs(remainingDays)} day${Math.abs(remainingDays) === 1 ? '' : 's'}`;
        } else {
          reason = `${remainingDays} day${remainingDays === 1 ? '' : 's'} remaining`;
        }
      } else {
        reason = 'No time interval configured';
      }
      break;
    }

    case 'earlier': {
      // Whichever comes first -> highest urgency wins
      const kmPri = STATUS_PRIORITY[kmStatus];
      const timePri = STATUS_PRIORITY[timeStatus];

      if (kmPri >= timePri) {
        finalStatus = kmStatus;
      } else {
        finalStatus = timeStatus;
      }
      finalPercent = Math.max(kmPercent, timePercent);

      // Reason: report the more urgent or closest threshold
      if (finalStatus === 'overdue') {
        const parts: string[] = [];
        if (remainingM !== null && remainingM <= 0)
          parts.push(`${Math.round(Math.abs(remainingM) / 1000)} km`);
        if (remainingDays !== null && remainingDays <= 0)
          parts.push(`${Math.abs(remainingDays)} days`);
        reason = `Overdue by ${parts.join(' / ')}`;
      } else if (remainingM !== null && remainingDays !== null) {
        const kmVal = Math.round(remainingM / 1000);
        reason = `${kmVal.toLocaleString()} km or ${remainingDays}d remaining`;
      } else if (remainingM !== null) {
        reason = `${Math.round(remainingM / 1000).toLocaleString()} km remaining`;
      } else if (remainingDays !== null) {
        reason = `${remainingDays} days remaining`;
      } else {
        reason = 'Interval not configured';
      }
      break;
    }

    case 'later': {
      // Whichever comes last -> lowest urgency condition must be satisfied
      // Both triggers must elapse for it to be overdue
      const kmPri = STATUS_PRIORITY[kmStatus];
      const timePri = STATUS_PRIORITY[timeStatus];

      if (kmPri <= timePri) {
        finalStatus = kmStatus;
      } else {
        finalStatus = timeStatus;
      }
      finalPercent = Math.min(kmPercent, timePercent);

      if (finalStatus === 'overdue') {
        reason = 'All interval thresholds exceeded';
      } else if (remainingM !== null && remainingDays !== null) {
        const kmVal = Math.round(remainingM / 1000);
        reason = `Later of ${kmVal.toLocaleString()} km and ${remainingDays}d`;
      } else {
        reason = 'Interval not configured';
      }
      break;
    }
  }

  return {
    status: finalStatus,
    remainingM,
    remainingDays,
    percent: finalPercent,
    targetOdometerM: targetOdoM,
    targetDate: targetDateStr,
    projectedDueDate: finalProjectedDate,
    reason,
  };
}
