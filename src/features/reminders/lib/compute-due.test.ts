import { describe, expect, it } from 'vitest';
import {
  addDays,
  type ComputeDueReminderInput,
  computeDue,
  diffDays,
  formatDateOnly,
  parseDateOnly,
} from './compute-due';

describe('computeDue', () => {
  describe('date utility functions', () => {
    it('parses and formats dates without UTC offset shift', () => {
      const d = parseDateOnly('2026-10-08');
      expect(formatDateOnly(d)).toBe('2026-10-08');
      expect(d.getUTCFullYear()).toBe(2026);
      expect(d.getUTCMonth()).toBe(9); // 0-indexed month
      expect(d.getUTCDate()).toBe(8);
    });

    it('correctly handles leap years when adding days across Feb 29', () => {
      // 2024 is a leap year (Feb 29 exists)
      const leapStart = parseDateOnly('2024-02-28');
      const leapPlusOne = addDays(leapStart, 1);
      expect(formatDateOnly(leapPlusOne)).toBe('2024-02-29');

      const leapPlusTwo = addDays(leapStart, 2);
      expect(formatDateOnly(leapPlusTwo)).toBe('2024-03-01');

      // 2025 is not a leap year (no Feb 29)
      const nonLeapStart = parseDateOnly('2025-02-28');
      const nonLeapPlusOne = addDays(nonLeapStart, 1);
      expect(formatDateOnly(nonLeapPlusOne)).toBe('2025-03-01');
    });

    it('computes exact diff in days', () => {
      const a = parseDateOnly('2026-10-20');
      const b = parseDateOnly('2026-10-10');
      expect(diffDays(a, b)).toBe(10);
      expect(diffDays(b, a)).toBe(-10);
    });
  });

  describe('mode: km', () => {
    const baseReminder: ComputeDueReminderInput = {
      id: 'rem-1',
      title: 'Tire Rotation',
      mode: 'km',
      interval_m: 10_000_000, // 10,000 km
      base_odometer_m: 40_000_000, // 40,000 km
      lead_m: 500_000, // 500 km
    };

    it('returns ok when current odometer is far from target', () => {
      const res = computeDue(baseReminder, {
        currentOdometerM: 45_000_000, // 45,000 km (5,000 km remaining)
        currentDate: '2026-10-08',
      });

      expect(res.status).toBe('ok');
      expect(res.remainingM).toBe(5_000_000);
      expect(res.percent).toBe(50);
      expect(res.reason).toBe('5,000 km remaining');
      expect(res.projectedDueDate).toBeNull();
    });

    it('returns upcoming when within 2 * lead_m (500 km < rem <= 1000 km)', () => {
      const res = computeDue(baseReminder, {
        currentOdometerM: 49_200_000, // 800 km remaining
        currentDate: '2026-10-08',
      });

      expect(res.status).toBe('upcoming');
      expect(res.remainingM).toBe(800_000);
      expect(res.percent).toBe(92);
    });

    it('returns due when within lead_m (<= 500 km)', () => {
      const res = computeDue(baseReminder, {
        currentOdometerM: 49_800_000, // 200 km remaining
        currentDate: '2026-10-08',
      });

      expect(res.status).toBe('due');
      expect(res.remainingM).toBe(200_000);
      expect(res.percent).toBe(98);
      expect(res.reason).toBe('200 km remaining');
    });

    it('returns overdue when current odometer exceeds target with negative remaining', () => {
      const res = computeDue(baseReminder, {
        currentOdometerM: 50_350_000, // 350 km overdue
        currentDate: '2026-10-08',
      });

      expect(res.status).toBe('overdue');
      expect(res.remainingM).toBe(-350_000);
      expect(res.percent).toBe(100);
      expect(res.reason).toBe('Overdue by 350 km');
    });

    it('projects due date when dailyUsageM is provided', () => {
      const res = computeDue(baseReminder, {
        currentOdometerM: 49_000_000, // 1,000 km remaining = 1,000,000 m
        currentDate: '2026-10-08',
        dailyUsageM: 100_000, // 100 km/day -> 10 days
      });

      expect(res.remainingM).toBe(1_000_000);
      expect(res.projectedDueDate).toBe('2026-10-18');
    });
  });

  describe('mode: time', () => {
    const baseReminder: ComputeDueReminderInput = {
      id: 'rem-2',
      title: 'Annual Brake Inspection',
      mode: 'time',
      interval_days: 365,
      base_date: '2025-10-08',
      lead_days: 14,
    };

    it('returns ok when more than 28 days remaining', () => {
      const res = computeDue(baseReminder, {
        currentOdometerM: 40_000_000,
        currentDate: '2026-08-01',
      });

      expect(res.status).toBe('ok');
      expect(res.remainingDays).toBeGreaterThan(30);
      expect(res.targetDate).toBe('2026-10-08');
    });

    it('returns upcoming when within 2 * lead_days (15 to 28 days)', () => {
      const res = computeDue(baseReminder, {
        currentOdometerM: 40_000_000,
        currentDate: '2026-09-20', // 18 days before target
      });

      expect(res.status).toBe('upcoming');
      expect(res.remainingDays).toBe(18);
    });

    it('returns due when within lead_days (<= 14 days)', () => {
      const res = computeDue(baseReminder, {
        currentOdometerM: 40_000_000,
        currentDate: '2026-10-01', // 7 days remaining
      });

      expect(res.status).toBe('due');
      expect(res.remainingDays).toBe(7);
      expect(res.reason).toBe('7 days remaining');
    });

    it('returns overdue when target date is in the past', () => {
      const res = computeDue(baseReminder, {
        currentOdometerM: 40_000_000,
        currentDate: '2026-10-12', // 4 days past
      });

      expect(res.status).toBe('overdue');
      expect(res.remainingDays).toBe(-4);
      expect(res.reason).toBe('Overdue by 4 days');
    });
  });

  describe('mode: earlier (dual-trigger)', () => {
    const dualReminder: ComputeDueReminderInput = {
      id: 'rem-3',
      title: 'Oil Change',
      mode: 'earlier',
      interval_m: 10_000_000, // 10,000 km
      base_odometer_m: 40_000_000,
      lead_m: 500_000,
      interval_days: 180, // 6 months
      base_date: '2026-05-01',
      lead_days: 14,
    };

    it('triggers overdue if distance is exceeded even if date is far off', () => {
      const res = computeDue(dualReminder, {
        currentOdometerM: 50_500_000, // distance exceeded by 500 km
        currentDate: '2026-06-01', // time is still far from target
      });

      expect(res.status).toBe('overdue');
    });

    it('triggers overdue if time is exceeded even if distance is low', () => {
      const res = computeDue(dualReminder, {
        currentOdometerM: 42_000_000, // distance is only 2,000 of 10,000 km
        currentDate: '2026-11-15', // time is past 180 days (target was late October)
      });

      expect(res.status).toBe('overdue');
    });

    it('triggers due if distance is within lead threshold', () => {
      const res = computeDue(dualReminder, {
        currentOdometerM: 49_800_000, // 200 km remaining (within 500 km lead)
        currentDate: '2026-06-01',
      });

      expect(res.status).toBe('due');
    });
  });

  describe('mode: later (dual-trigger)', () => {
    const laterReminder: ComputeDueReminderInput = {
      id: 'rem-4',
      title: 'Major Inspection',
      mode: 'later',
      interval_m: 10_000_000,
      base_odometer_m: 40_000_000,
      interval_days: 180,
      base_date: '2026-05-01',
    };

    it('remains ok if only one of the criteria has elapsed', () => {
      const res = computeDue(laterReminder, {
        currentOdometerM: 52_000_000, // distance elapsed
        currentDate: '2026-06-01', // time is still only 30 days in
      });

      expect(res.status).toBe('ok');
    });

    it('only becomes overdue once BOTH distance and time have elapsed', () => {
      const res = computeDue(laterReminder, {
        currentOdometerM: 51_000_000, // distance elapsed
        currentDate: '2026-11-15', // time elapsed
      });

      expect(res.status).toBe('overdue');
    });
  });

  describe('snoozing', () => {
    it('returns snoozed status when snoozed_until is in the future', () => {
      const reminder: ComputeDueReminderInput = {
        id: 'rem-snooze',
        title: 'Brake Fluid',
        mode: 'km',
        interval_m: 5_000_000,
        base_odometer_m: 10_000_000,
        snoozed_until: '2026-10-25',
      };

      const res = computeDue(reminder, {
        currentOdometerM: 20_000_000, // Would otherwise be overdue
        currentDate: '2026-10-08',
      });

      expect(res.status).toBe('snoozed');
      expect(res.reason).toContain('Snoozed until 2026-10-25');
    });

    it('resumes normal evaluation once snoozed_until date is reached or passed', () => {
      const reminder: ComputeDueReminderInput = {
        id: 'rem-snooze-past',
        title: 'Brake Fluid',
        mode: 'km',
        interval_m: 5_000_000,
        base_odometer_m: 10_000_000,
        snoozed_until: '2026-10-05', // in the past
      };

      const res = computeDue(reminder, {
        currentOdometerM: 20_000_000, // 5,000 km overdue
        currentDate: '2026-10-08',
      });

      expect(res.status).toBe('overdue');
    });
  });
});
