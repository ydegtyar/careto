import { describe, expect, it } from 'vitest';
import type { Entry, Vehicle } from '@/data/client/types';
import {
  computeBusinessDeductible,
  computeCategoryDistribution,
  computeConsumptionAnomaly,
  computeEfficiencyTelemetry,
  computeMonthlyTrends,
  computePriceVolatility,
  computeTCO,
} from './analytics-math';

const mockVehicle: Vehicle = {
  id: 'v-1',
  name: 'Tesla Model Y',
  powertrain: 'ev',
  initial_odometer_m: 10000000,
  distance_unit: 'km',
  efficiency_unit: 'kwh100km',
};

const mockEntries: Entry[] = [
  {
    id: 'e-1',
    kind: 'refuel',
    occurred_on: '2026-10-01',
    odometer_m: 12000000,
    amount_minor: 5000,
    usd_minor: 5000,
    business: 1,
  },
  {
    id: 'e-2',
    kind: 'service',
    occurred_on: '2026-10-05',
    odometer_m: 12500000,
    amount_minor: 15000,
    usd_minor: 15000,
    business: 0,
  },
];

describe('analytics-math', () => {
  it('computes TCO correctly', () => {
    const res = computeTCO(mockEntries, mockVehicle);
    expect(res.totalSpentUsd).toBe(200);
    expect(res.tcoPerKm).toBe(0.08); // 200 / 2500km
  });

  it('computes category distribution percentages', () => {
    const res = computeCategoryDistribution(mockEntries);
    const fuel = res.find((r) => r.name === 'Fuel & Energy');
    const service = res.find((r) => r.name === 'Maintenance');
    expect(fuel?.value).toBe(50);
    expect(service?.value).toBe(150);
    expect(fuel?.percentage).toBe(25);
    expect(service?.percentage).toBe(75);
  });

  it('computes monthly trends for 6 months', () => {
    const res = computeMonthlyTrends(mockEntries, 6);
    expect(res).toHaveLength(6);
  });

  it('computes efficiency telemetry', () => {
    const res = computeEfficiencyTelemetry(mockEntries, mockVehicle);
    expect(res.unit).toBe('kWh / 100km');
  });

  it('computes price volatility', () => {
    const res = computePriceVolatility(mockEntries);
    expect(res.lowest).toBeDefined();
    expect(res.highest).toBeDefined();
  });

  it('computes business deductible write-off', () => {
    const res = computeBusinessDeductible(mockEntries);
    expect(res.potentialWriteOffUsd).toBe(50);
  });

  describe('computeConsumptionAnomaly', () => {
    const iceVehicle: Vehicle = {
      id: 'v-ice',
      name: 'Golf TSI',
      powertrain: 'ice',
      initial_odometer_m: 50000000,
      distance_unit: 'km',
      efficiency_unit: 'l100km',
    };

    it('returns null if there are fewer than 3 refuels', () => {
      const entries: Entry[] = [
        {
          id: 'r-1',
          kind: 'refuel',
          occurred_on: '2026-08-01',
          odometer_m: 50000000,
          fuel_volume: 50,
        },
        {
          id: 'r-2',
          kind: 'refuel',
          occurred_on: '2026-08-10',
          odometer_m: 50500000,
          fuel_volume: 30,
        },
      ];
      expect(computeConsumptionAnomaly(entries, iceVehicle)).toBeNull();
    });

    it('returns null if consumption is within normal variation (< 15% increase)', () => {
      // baseline: 6.0 L/100km (600 km, 36L => 6.0)
      const entries: Entry[] = [
        {
          id: 'r-1',
          kind: 'refuel',
          occurred_on: '2026-08-01',
          odometer_m: 50000000,
          fuel_volume: 40,
        },
        {
          id: 'r-2',
          kind: 'refuel',
          occurred_on: '2026-08-10',
          odometer_m: 50600000,
          fuel_volume: 36, // 6.0 L/100km
        },
        {
          id: 'r-3',
          kind: 'refuel',
          occurred_on: '2026-08-20',
          odometer_m: 51200000,
          fuel_volume: 36.5, // ~6.08 L/100km (+1.3%)
        },
        {
          id: 'r-4',
          kind: 'refuel',
          occurred_on: '2026-08-30',
          odometer_m: 51800000,
          fuel_volume: 37, // ~6.17 L/100km
        },
      ];
      expect(computeConsumptionAnomaly(entries, iceVehicle)).toBeNull();
    });

    it('detects a spike when recent consumption increases by >= 15%', () => {
      // baseline: 5.0 L/100km (500 km, 25L)
      // recent: 6.5 L/100km (500 km, 32.5L) => +30% spike
      const entries: Entry[] = [
        {
          id: 'r-1',
          kind: 'refuel',
          occurred_on: '2026-08-01',
          odometer_m: 50000000,
          fuel_volume: 40,
        },
        {
          id: 'r-2',
          kind: 'refuel',
          occurred_on: '2026-08-10',
          odometer_m: 50500000,
          fuel_volume: 25, // 5.0 L/100km
        },
        {
          id: 'r-3',
          kind: 'refuel',
          occurred_on: '2026-08-20',
          odometer_m: 51000000,
          fuel_volume: 25, // 5.0 L/100km
        },
        {
          id: 'r-4',
          kind: 'refuel',
          occurred_on: '2026-08-30',
          odometer_m: 51500000,
          fuel_volume: 32.5, // 6.5 L/100km (+30% spike)
        },
      ];
      const anomaly = computeConsumptionAnomaly(entries, iceVehicle);
      expect(anomaly).not.toBeNull();
      expect(anomaly?.spikePercentage).toBe(30);
      expect(anomaly?.baselineRate).toBe(5);
      expect(anomaly?.recentRate).toBe(6.5);
      expect(anomaly?.unit).toBe('L/100km');
      expect(anomaly?.recommendations.length).toBeGreaterThan(0);
    });

    it('detects a spike for EV vehicle in kWh/100km', () => {
      // baseline: 16 kWh/100km
      // recent: 20 kWh/100km => +25% spike
      const entries: Entry[] = [
        {
          id: 'e-1',
          kind: 'charge',
          occurred_on: '2026-08-01',
          odometer_m: 10000000,
          fuel_volume: 50,
        },
        {
          id: 'e-2',
          kind: 'charge',
          occurred_on: '2026-08-08',
          odometer_m: 10200000, // 200 km
          fuel_volume: 32, // 16 kWh/100km
        },
        {
          id: 'e-3',
          kind: 'charge',
          occurred_on: '2026-08-15',
          odometer_m: 10400000, // 200 km
          fuel_volume: 32, // 16 kWh/100km
        },
        {
          id: 'e-4',
          kind: 'charge',
          occurred_on: '2026-08-22',
          odometer_m: 10600000, // 200 km
          fuel_volume: 40, // 20 kWh/100km (+25%)
        },
      ];
      const anomaly = computeConsumptionAnomaly(entries, mockVehicle);
      expect(anomaly).not.toBeNull();
      expect(anomaly?.unit).toBe('kWh/100km');
      expect(anomaly?.spikePercentage).toBe(25);
    });

    it('detects a spike for MPG vehicle when MPG drops by >= 15%', () => {
      const mpgVehicle: Vehicle = {
        id: 'v-mpg',
        name: 'Camry',
        powertrain: 'ice',
        initial_odometer_m: 10000000,
        distance_unit: 'mi',
        efficiency_unit: 'mpg',
      };

      // 100 miles = ~160,934.4 meters
      // baseline: 30 MPG
      // recent: 22 MPG => (30 - 22) / 30 = 26.7% spike in consumption
      const entries: Entry[] = [
        {
          id: 'm-1',
          kind: 'refuel',
          occurred_on: '2026-08-01',
          odometer_m: 10000000,
          fuel_volume: 37.85411784, // 10 gal
        },
        {
          id: 'm-2',
          kind: 'refuel',
          occurred_on: '2026-08-08',
          odometer_m: 10482803, // +300 miles
          fuel_volume: 37.85411784, // 10 gal => 30 MPG
        },
        {
          id: 'm-3',
          kind: 'refuel',
          occurred_on: '2026-08-15',
          odometer_m: 10965606, // +300 miles
          fuel_volume: 37.85411784, // 10 gal => 30 MPG
        },
        {
          id: 'm-4',
          kind: 'refuel',
          occurred_on: '2026-08-22',
          odometer_m: 11319662, // +220 miles
          fuel_volume: 37.85411784, // 10 gal => 22 MPG
        },
      ];
      const anomaly = computeConsumptionAnomaly(entries, mpgVehicle);
      expect(anomaly).not.toBeNull();
      expect(anomaly?.unit).toBe('MPG');
      expect(anomaly?.spikePercentage).toBeGreaterThanOrEqual(26);
    });
  });
});
