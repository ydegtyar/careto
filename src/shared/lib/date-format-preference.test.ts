import { describe, expect, it } from 'vitest';
import { formatDatePreference, formatTimePreference } from './date-format-preference';

describe('date-format-preference', () => {
  const sampleDate = new Date('2026-10-10T14:30:00Z');

  describe('formatDatePreference', () => {
    it('formats ISO correctly', () => {
      const res = formatDatePreference(sampleDate, 'ISO');
      expect(res).toMatch(/2026-10-10/);
    });

    it('formats EU correctly', () => {
      const res = formatDatePreference(sampleDate, 'EU');
      expect(res).toMatch(/10\/10\/2026/);
    });

    it('formats US correctly', () => {
      const res = formatDatePreference(sampleDate, 'US');
      expect(res).toMatch(/10\/10\/2026/);
    });

    it('formats SHORT_MONTH correctly', () => {
      const res = formatDatePreference(sampleDate, 'SHORT_MONTH');
      expect(res).toBe('10 Oct 26');
    });

    it('handles invalid date', () => {
      expect(formatDatePreference('invalid-date')).toBe('');
    });
  });

  describe('formatTimePreference', () => {
    it('formats 24H correctly', () => {
      const res = formatTimePreference(sampleDate, '24H');
      expect(res).toMatch(/\d{1,2}:\d{2}/);
    });

    it('formats 12H correctly', () => {
      const res = formatTimePreference(sampleDate, '12H');
      expect(res).toMatch(/AM|PM/i);
    });

    it('handles invalid time', () => {
      expect(formatTimePreference('invalid-date')).toBe('');
    });
  });
});
