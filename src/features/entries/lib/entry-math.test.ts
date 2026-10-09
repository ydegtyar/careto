import { describe, expect, it } from 'vitest';
import {
  calculateEvEfficiency,
  calculateFuelEfficiency,
  isDuplicateEntry,
  solveTwoOfThree,
  validateFuelVolume,
  validateOdometerMonotonicity,
} from './entry-math';

describe('entry-math', () => {
  describe('solveTwoOfThree', () => {
    it('computes price per liter when total and volume are given', () => {
      // 50 Liters (50,000 mL) for $80.00 (8,000 cents) -> $1.60/L (160 cents/L)
      const res = solveTwoOfThree({
        totalMinor: 8000,
        volumeMl: 50000,
      });

      expect(res.pricePerUnitMinor).toBe(160);
      expect(res.totalMinor).toBe(8000);
      expect(res.volumeMl).toBe(50000);
      expect(res.computedField).toBe('price');
    });

    it('computes volume when total and price are given', () => {
      // $60.00 total at $1.50/L (150 cents) -> 40 Liters (40,000 mL)
      const res = solveTwoOfThree({
        totalMinor: 6000,
        pricePerUnitMinor: 150,
      });

      expect(res.volumeMl).toBe(40000);
      expect(res.totalMinor).toBe(6000);
      expect(res.pricePerUnitMinor).toBe(150);
      expect(res.computedField).toBe('volume');
    });

    it('computes total when volume and price are given', () => {
      // 45 Liters at $1.85/L (185 cents) -> $83.25 (8325 cents)
      const res = solveTwoOfThree({
        volumeMl: 45000,
        pricePerUnitMinor: 185,
      });

      expect(res.totalMinor).toBe(8325);
      expect(res.volumeMl).toBe(45000);
      expect(res.pricePerUnitMinor).toBe(185);
      expect(res.computedField).toBe('total');
    });

    it('respects authoritative total when all three are provided', () => {
      const res = solveTwoOfThree({
        totalMinor: 8000,
        volumeMl: 50000,
        pricePerUnitMinor: 160,
      });

      expect(res.totalMinor).toBe(8000);
      expect(res.volumeMl).toBe(50000);
      expect(res.pricePerUnitMinor).toBe(160);
      expect(res.computedField).toBeUndefined();
    });

    it('throws error when fewer than two parameters are provided', () => {
      expect(() => solveTwoOfThree({ totalMinor: 5000 })).toThrow();
    });
  });

  describe('calculateFuelEfficiency', () => {
    it('calculates full-tank to full-tank efficiency accurately', () => {
      // Prev full tank at 50,000 km
      const prev = { odometerM: 50_000_000, volumeMl: 50_000, isFullTank: true };
      // Curr full tank at 50,600 km (600 km driven), filled 42 L
      const curr = { odometerM: 50_600_000, volumeMl: 42_000, isFullTank: true };

      // (42 L / 600 km) * 100 = 7.00 L/100km
      const res = calculateFuelEfficiency(curr, prev);

      expect(res.lPer100Km).toBe(7.0);
      expect(res.distanceKm).toBe(600);
      expect(res.totalVolumeLiters).toBe(42);
    });

    it('includes intermediate partial fills in full-tank calculation', () => {
      const prev = { odometerM: 50_000_000, volumeMl: 50_000, isFullTank: true };
      const partial1 = { odometerM: 50_300_000, volumeMl: 15_000, isFullTank: false };
      const curr = { odometerM: 50_800_000, volumeMl: 33_000, isFullTank: true }; // 800 km total

      // Total fuel = 15 L + 33 L = 48 L. Distance = 800 km.
      // (48 L / 800 km) * 100 = 6.00 L/100km
      const res = calculateFuelEfficiency(curr, prev, [partial1]);

      expect(res.lPer100Km).toBe(6.0);
      expect(res.distanceKm).toBe(800);
      expect(res.totalVolumeLiters).toBe(48);
    });

    it('returns null if current is not full tank or missed fill is flagged', () => {
      const prev = { odometerM: 50_000_000, volumeMl: 50_000, isFullTank: true };
      const currNotFull = { odometerM: 50_500_000, volumeMl: 20_000, isFullTank: false };
      expect(calculateFuelEfficiency(currNotFull, prev).lPer100Km).toBeNull();

      const currMissed = {
        odometerM: 50_500_000,
        volumeMl: 40_000,
        isFullTank: true,
        missedFill: true,
      };
      expect(calculateFuelEfficiency(currMissed, prev).lPer100Km).toBeNull();
    });
  });

  describe('calculateEvEfficiency', () => {
    it('computes kWh/100km and Wh/km correctly', () => {
      // 55 kWh (55,000 Wh) used over 320 km (320,000 m)
      const res = calculateEvEfficiency(55_000, 320_000);

      // (55 / 320) * 100 = 17.1875 -> 17.19 kWh/100km
      expect(res.kwhPer100Km).toBe(17.19);
      // 55,000 / 320 = 171.875 -> 171.9 Wh/km
      expect(res.whPerKm).toBe(171.9);
    });

    it('handles zero or negative distance gracefully', () => {
      expect(calculateEvEfficiency(50_000, 0).kwhPer100Km).toBeNull();
    });
  });

  describe('domain validators', () => {
    it('warns on decreasing odometer reading', () => {
      const ok = validateOdometerMonotonicity(50_000_000, 50_200_000);
      expect(ok.valid).toBe(true);

      const decreasing = validateOdometerMonotonicity(50_000_000, 49_800_000);
      expect(decreasing.valid).toBe(false);
      expect(decreasing.warning).toContain('200 km');
    });

    it('detects fuel volume exceeding 115% of tank capacity', () => {
      const tankCapacityMl = 50_000; // 50 Liters
      expect(validateFuelVolume(48_000, tankCapacityMl).plausible).toBe(true);
      expect(validateFuelVolume(55_000, tankCapacityMl).plausible).toBe(true); // 110% allowed

      const implausible = validateFuelVolume(62_000, tankCapacityMl); // 124%
      expect(implausible.plausible).toBe(false);
      expect(implausible.warning).toContain('exceeds rated tank capacity');
    });

    it('identifies exact duplicate entries', () => {
      const existing = [
        { occurred_on: '2026-10-01', odometer_m: 40_000_000, amount_minor: 5000, kind: 'refuel' },
      ];

      expect(
        isDuplicateEntry(existing, {
          occurred_on: '2026-10-01',
          odometer_m: 40_000_000,
          amount_minor: 5000,
          kind: 'refuel',
        }),
      ).toBe(true);

      expect(
        isDuplicateEntry(existing, {
          occurred_on: '2026-10-02',
          odometer_m: 40_200_000,
          amount_minor: 5000,
          kind: 'refuel',
        }),
      ).toBe(false);
    });
  });
});
