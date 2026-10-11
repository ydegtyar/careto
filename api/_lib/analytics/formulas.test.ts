import { describe, expect, it } from 'vitest';
import {
  computeChainedEfficiency,
  computeComponentLife,
  computeStationSavingsInsight,
  computeWeightedAvgPrice,
  type RawRefuelRow,
} from './formulas';

describe('Analytics Pure Formulas', () => {
  describe('computeChainedEfficiency (full-to-full)', () => {
    it('returns nulls when fewer than 2 full-tank fills exist', () => {
      const singleFill: RawRefuelRow[] = [
        {
          id: '1',
          vehicle_id: 'veh1',
          date: '2026-01-01',
          odometer_km: 10000,
          liters: 45,
          price_per_liter: 1.5,
          total_cost: 67.5,
          fuel_type_id: null,
          station_id: null,
          is_full_tank: true,
          tank_no: 1,
        },
      ];
      const result = computeChainedEfficiency(singleFill);
      expect(result.avg).toBeNull();
      expect(result.best).toBeNull();
      expect(result.worst).toBeNull();
    });

    it('accurately computes efficiency across full-tank fills and intermediate partial fills', () => {
      const refuels: RawRefuelRow[] = [
        {
          id: '1',
          vehicle_id: 'veh1',
          date: '2026-01-01',
          odometer_km: 10000,
          liters: 50,
          price_per_liter: 1.5,
          total_cost: 75,
          fuel_type_id: null,
          station_id: null,
          is_full_tank: true,
          tank_no: 1,
        },
        // Partial fill of 15L at 10250 km
        {
          id: '2',
          vehicle_id: 'veh1',
          date: '2026-01-05',
          odometer_km: 10250,
          liters: 15,
          price_per_liter: 1.5,
          total_cost: 22.5,
          fuel_type_id: null,
          station_id: null,
          is_full_tank: false,
          tank_no: 1,
        },
        // Full fill of 25L at 10500 km -> Total liters consumed between full fills = 15 + 25 = 40L, delta = 500km -> 8.0 L/100km
        {
          id: '3',
          vehicle_id: 'veh1',
          date: '2026-01-10',
          odometer_km: 10500,
          liters: 25,
          price_per_liter: 1.5,
          total_cost: 37.5,
          fuel_type_id: null,
          station_id: null,
          is_full_tank: true,
          tank_no: 1,
        },
        // Next full fill: 35L at 11000 km -> delta = 500km, liters = 35L -> 7.0 L/100km
        {
          id: '4',
          vehicle_id: 'veh1',
          date: '2026-01-20',
          odometer_km: 11000,
          liters: 35,
          price_per_liter: 1.5,
          total_cost: 52.5,
          fuel_type_id: null,
          station_id: null,
          is_full_tank: true,
          tank_no: 1,
        },
      ];

      const result = computeChainedEfficiency(refuels);
      expect(result.avg).toBe(7.5); // (8.0 + 7.0) / 2
      expect(result.best).toBe(7.0);
      expect(result.worst).toBe(8.0);
      expect(result.lastFillEfficiency).toBe(7.0);
      expect(result.warnings).toHaveLength(0);
    });

    it('detects non-monotonic odometer reading, adds warning, and resets chain safely', () => {
      const badRefuels: RawRefuelRow[] = [
        {
          id: '1',
          vehicle_id: 'veh1',
          date: '2026-01-01',
          odometer_km: 10000,
          liters: 50,
          price_per_liter: 1.5,
          total_cost: 75,
          fuel_type_id: null,
          station_id: null,
          is_full_tank: true,
          tank_no: 1,
        },
        {
          id: '2',
          vehicle_id: 'veh1',
          date: '2026-01-05',
          odometer_km: 9500, // Invalid backward jump
          liters: 30,
          price_per_liter: 1.5,
          total_cost: 45,
          fuel_type_id: null,
          station_id: null,
          is_full_tank: true,
          tank_no: 1,
        },
      ];

      const result = computeChainedEfficiency(badRefuels);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.avg).toBeNull();
    });
  });

  describe('computeWeightedAvgPrice', () => {
    it('calculates weighted average price rather than simple mean', () => {
      // 10L @ $1.00 ($10) + 90L @ $2.00 ($180) -> Total $190 / 100L = $1.90
      // Simple mean would be (1.00 + 2.00) / 2 = $1.50
      const data = [
        { total_cost: 10, liters: 10 },
        { total_cost: 180, liters: 90 },
      ];
      expect(computeWeightedAvgPrice(data)).toBe(1.9);
    });

    it('handles empty refuels gracefully', () => {
      expect(computeWeightedAvgPrice([])).toBeNull();
    });
  });

  describe('computeStationSavingsInsight', () => {
    it('computes potential savings against cheapest brand correctly', () => {
      const rankings = [
        { brand: 'Shell', avgPricePerLiter: 1.5, refuelCount: 3, totalLiters: 150 },
        { brand: 'BP', avgPricePerLiter: 1.8, refuelCount: 2, totalLiters: 100 },
      ];
      const refuels: RawRefuelRow[] = [
        {
          id: '1',
          vehicle_id: 'v1',
          date: '2026-01-01',
          odometer_km: 1000,
          liters: 50,
          price_per_liter: 1.8,
          total_cost: 90,
          fuel_type_id: null,
          station_id: null,
          station_brand: 'BP',
          is_full_tank: true,
          tank_no: 1,
        },
      ];

      // Difference = (1.8 - 1.5) * 50 = $15.00
      const insight = computeStationSavingsInsight(rankings, refuels, 30);
      expect(insight).not.toBeNull();
      expect(insight?.cheapestBrand).toBe('Shell');
      expect(insight?.potentialSavingsPeriod).toBe(15);
      expect(insight?.potentialSavingsAnnualized).toBeCloseTo((15 / 30) * 365, 1);
    });

    it('returns null if fewer than 2 brands', () => {
      const rankings = [{ brand: 'Shell', avgPricePerLiter: 1.5, refuelCount: 3, totalLiters: 150 }];
      expect(computeStationSavingsInsight(rankings, [], 30)).toBeNull();
    });
  });

  describe('computeComponentLife', () => {
    it('computes remaining life percentage and status OK when wear is low', () => {
      const result = computeComponentLife({
        kmSinceLast: 2000,
        daysSinceLast: 30,
        intervalKm: 10000,
        intervalDays: 365,
      });

      // 2000/10000 = 20% used -> 80% remaining -> status: 'ok'
      expect(result.remainingPercent).toBe(80);
      expect(result.remainingKm).toBe(8000);
      expect(result.status).toBe('ok');
    });

    it('triggers due_soon when between 30% and 59% remaining', () => {
      const result = computeComponentLife({
        kmSinceLast: 6000,
        daysSinceLast: 100,
        intervalKm: 10000,
        intervalDays: 365,
      });

      // 6000/10000 = 60% used -> 40% remaining -> 'due_soon'
      expect(result.remainingPercent).toBe(40);
      expect(result.status).toBe('due_soon');
    });

    it('triggers critical when remaining is below 30%', () => {
      const result = computeComponentLife({
        kmSinceLast: 8500,
        daysSinceLast: 100,
        intervalKm: 10000,
        intervalDays: 365,
      });

      // 85% used -> 15% remaining -> 'critical'
      expect(result.remainingPercent).toBe(15);
      expect(result.status).toBe('critical');
    });

    it('applies seasonal factor to interval days', () => {
      // Normal interval 100 days. With high-pollen factor 0.5 -> adjusted to 50 days.
      // At 30 days: 30/50 = 60% used -> 40% remaining
      const result = computeComponentLife({
        kmSinceLast: 1000,
        daysSinceLast: 30,
        intervalKm: 20000,
        intervalDays: 100,
        seasonalFactor: 0.5,
      });

      expect(result.remainingPercent).toBe(40);
      expect(result.status).toBe('due_soon');
    });
  });
});
