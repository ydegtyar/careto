import { describe, expect, it } from 'vitest';
import type { Entry, Vehicle } from '@/data/client/types';
import {
  computeBusinessDeductible,
  computeCategoryDistribution,
  computeClientRefuelingAnalytics,
  computeClientServicesAnalytics,
  computeConsumptionAnomaly,
  computeEfficiencyTelemetry,
  computeMonthlyTrends,
  computeOdometerProgression,
  computePriceVolatility,
  computeTCO,
  computeTravelDistance,
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

  describe('computeTravelDistance', () => {
    it('computes logged distance, daily avg, and current odometer accurately', () => {
      const vehicle: Vehicle = {
        id: 'v-1',
        name: 'Honda CR-V',
        powertrain: 'ice',
        initial_odometer_m: 54561000, // 54,561 km
        distance_unit: 'km',
        efficiency_unit: 'l100km',
      };

      const entries: Entry[] = [
        {
          id: '1',
          kind: 'refuel',
          occurred_on: '2026-05-01',
          odometer_m: 55000000,
        },
        {
          id: '2',
          kind: 'refuel',
          occurred_on: '2026-05-31',
          odometer_m: 68410000, // +13,849 km from initial
        },
      ];

      const result = computeTravelDistance(entries, vehicle);
      expect(result.distanceLogged).toBe(13849);
      expect(result.currentOdometer).toBe(68410);
      expect(result.distanceUnit).toBe('km');
      expect(result.dailyAvg).toBeGreaterThan(0);
    });

    it('handles vehicle in miles mode correctly', () => {
      const vehicle: Vehicle = {
        id: 'v-2',
        name: 'Ford F-150',
        powertrain: 'ice',
        initial_odometer_m: 16093440, // 10,000 miles (16,093.44 km)
        distance_unit: 'mi',
        efficiency_unit: 'mpg',
      };

      const entries: Entry[] = [
        {
          id: '1',
          kind: 'refuel',
          occurred_on: '2026-06-01',
          odometer_m: 24140160, // 15,000 miles (+5,000 miles)
        },
      ];

      const result = computeTravelDistance(entries, vehicle);
      expect(result.distanceLogged).toBe(5000);
      expect(result.currentOdometer).toBe(15000);
      expect(result.distanceUnit).toBe('mi');
    });
  });

  describe('computeOdometerProgression', () => {
    it('computes progression points, start, current, logged delta and milestone days', () => {
      const vehicle: Vehicle = {
        id: 'v-1',
        name: 'Honda CR-V',
        powertrain: 'ice',
        initial_odometer_m: 56800000, // 56,800 km
        distance_unit: 'km',
        efficiency_unit: 'l100km',
      };

      const entries: Entry[] = [
        {
          id: '1',
          kind: 'refuel',
          occurred_on: '2025-05-01',
          odometer_m: 56800000,
        },
        {
          id: '2',
          kind: 'service',
          occurred_on: '2025-09-01',
          odometer_m: 60000000,
        },
        {
          id: '3',
          kind: 'refuel',
          occurred_on: '2026-08-01',
          odometer_m: 68410000, // 68,410 km
        },
      ];

      const result = computeOdometerProgression(entries, vehicle);
      expect(result.startOdometer).toBe(56800);
      expect(result.currentOdometer).toBe(68410);
      expect(result.distanceLogged).toBe(11610);
      expect(result.points).toHaveLength(3);
      expect(result.points[1]?.isService).toBe(true);
      expect(result.nextMilestoneKm).toBe(70000);
      expect(result.daysToNextMilestone).toBeGreaterThan(0);
    });
  });

  describe('computeClientRefuelingAnalytics', () => {
    it('computes complete refueling analytics payload with real values from client entries', () => {
      const refuelEntries: Entry[] = [
        {
          id: 'rf-1',
          kind: 'refuel',
          occurred_on: '2026-08-01',
          odometer_m: 60000000, // 60,000 km
          amount_minor: 6500, // $65.00
          fuel_volume: 45, // 45 L
          unit_price: 144, // $1.44/L
          vendor_name: 'Shell',
          fuel_grade: 'Gasoline 95',
          is_full_tank: true,
        },
        {
          id: 'rf-2',
          kind: 'refuel',
          occurred_on: '2026-08-15',
          odometer_m: 60600000, // 60,600 km (delta = 600 km)
          amount_minor: 7000, // $70.00
          fuel_volume: 48, // 48 L -> 48 / 600 * 100 = 8.0 L/100km
          unit_price: 146,
          vendor_name: 'BP',
          fuel_grade: 'Gasoline 95',
          is_full_tank: true,
        },
      ];

      const res = computeClientRefuelingAnalytics(refuelEntries, mockVehicle);

      // Summary
      expect(res.summary.totalCost).toBe(135);
      expect(res.summary.totalVolumeLiters).toBe(93);
      expect(res.summary.avgEfficiencyL100km).toBe(8);
      expect(res.summary.bestEfficiencyL100km).toBe(8);
      expect(res.summary.worstEfficiencyL100km).toBe(8);

      // Routine
      expect(res.routine.fullTankIndexPercent).toBe(100);
      expect(res.routine.fullTankRatioText).toBe('2/2');

      // Stations
      expect(res.stations.stations.length).toBe(2);

      // Fuel types
      expect(res.fuelTypes.items.length).toBe(1);
      expect(res.fuelTypes.items[0]?.name).toBe('Gasoline 95');

      // Benchmark
      expect(res.benchmark.efficiencyL100km).toBe(8);
    });
  });

  describe('computeClientServicesAnalytics', () => {
    it('computes complete services analytics payload with real values from client entries', () => {
      const serviceEntries: Entry[] = [
        {
          id: 'srv-1',
          kind: 'service',
          occurred_on: '2026-03-10',
          odometer_m: 50000000,
          amount_minor: 12000, // $120.00
          notes: 'Oil change and filter',
          vendor_name: 'Brembo Master Auto',
          sub_items: [
            { id: 'sub-1', name: 'Engine Oil', cost: '70' },
            { id: 'sub-2', name: 'Labor', cost: '50' },
          ],
        },
        {
          id: 'srv-2',
          kind: 'service',
          occurred_on: '2026-09-15',
          odometer_m: 60000000,
          amount_minor: 35000, // $350.00
          notes: 'Brake pads replacement',
          vendor_name: 'Brembo Master Auto',
          sub_items: [
            { id: 'sub-3', name: 'Front Brake Pads', cost: '220' },
            { id: 'sub-4', name: 'Labor', cost: '130' },
          ],
        },
      ];

      const res = computeClientServicesAnalytics(serviceEntries, mockVehicle);

      // Summary
      expect(res.summary.totalServiceCost).toBe(470);
      expect(res.summary.maintenanceRatePercent).toBe(100);
      expect(res.summary.breakdownIncidentsCount).toBe(0);
      expect(res.summary.serviceCadenceKm).toBe(10000);

      // Allocation
      expect(res.allocation.taskCount).toBe(4);
      expect(res.allocation.partsCost).toBe(290);
      expect(res.allocation.laborCost).toBe(180);

      // Trajectory
      expect(res.monthlyTrajectory.points.length).toBe(2);
      expect(res.monthlyTrajectory.peakCost).toBe(350);

      // Component Life
      expect(res.componentLife.length).toBeGreaterThan(0);

      // Workshop
      expect(res.workshopEfficiency.hasData).toBe(true);
      expect(res.workshopEfficiency.workshopName).toBe('Brembo Master Auto');

      // Odometer progression
      expect(res.costProgression.points.length).toBe(2);
    });

    it('converts sub-items in non-USD currencies (like UAH) to USD in allocation', () => {
      const uahEntries: Entry[] = [
        {
          id: 'srv-uah-1',
          kind: 'service',
          occurred_on: '2026-05-10',
          currency: 'UAH',
          amount_minor: 415000, // 4150 UAH (~$100.00 USD at 41.5 rate)
          usd_minor: 10000,
          sub_items: [
            { id: 'sub-1', name: 'Oil Filter', cost: '2075' }, // 2075 UAH -> ~$50 USD
            { id: 'sub-2', name: 'Labor Service', cost: '2075' }, // 2075 UAH -> ~$50 USD
          ],
        },
      ];

      const res = computeClientServicesAnalytics(uahEntries, mockVehicle);

      expect(res.allocation.taskCount).toBe(2);
      expect(res.allocation.partsCost).toBe(50);
      expect(res.allocation.laborCost).toBe(50);
      expect(res.allocation.items[0]?.cost).toBe(50);
      expect(res.allocation.items[1]?.cost).toBe(50);
    });
  });
});
