import { describe, expect, it } from 'vitest';
import type { Entry, Vehicle } from '@/data/client/types';
import {
  computeBusinessDeductible,
  computeCategoryDistribution,
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
    expect(res.best).toBeGreaterThan(0);
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
});
