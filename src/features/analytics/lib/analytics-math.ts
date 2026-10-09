import type { Entry, Vehicle } from '@/data/client/types';

export interface TcoSummary {
  totalSpentUsd: number;
  tcoPerKm: number;
  monthTotalUsd: number;
  depreciationUsd: number;
  fuelUsd: number;
  insuranceUsd: number;
  maintenanceUsd: number;
  parkingUsd: number;
}

export interface CostCategorySlice {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrendItem {
  month: string;
  fuel: number;
  service: number;
  admin: number;
}

export interface EfficiencyTelemetry {
  best: number | null;
  avg: number | null;
  worst: number | null;
  unit: string;
}

export interface PriceVolatility {
  lowest?: { price: number; station: string; date: string };
  highest?: { price: number; station: string; date: string };
  spread: number;
}

export interface BusinessDeductible {
  distanceKm: number;
  potentialWriteOffUsd: number;
}

export interface AnomalyAlert {
  id: string;
  type: 'spike' | 'savings';
  title: string;
  description: string;
  recommendation: string;
  severity: 'warning' | 'info';
}

export function computeTCO(entries: Entry[], vehicle?: Vehicle): TcoSummary {
  let totalSpentMinor = 0;
  let fuelMinor = 0;
  let maintenanceMinor = 0;
  let insuranceMinor = 0;
  let parkingMinor = 0;

  const currentYearMonth = new Date().toISOString().slice(0, 7);
  let monthTotalMinor = 0;

  for (const entry of entries) {
    const amt = entry.usd_minor ?? entry.amount_minor ?? 0;
    totalSpentMinor += amt;

    if (entry.occurred_on?.startsWith(currentYearMonth)) {
      monthTotalMinor += amt;
    }

    if (entry.kind === 'refuel' || entry.kind === 'charge' || entry.category_id === 'fuel') {
      fuelMinor += amt;
    } else if (
      entry.kind === 'service' ||
      entry.category_id === 'service' ||
      entry.category_id === 'maintenance'
    ) {
      maintenanceMinor += amt;
    } else if (
      entry.category_id === 'insurance' ||
      entry.category_id === 'tax' ||
      entry.category_id === 'admin'
    ) {
      insuranceMinor += amt;
    } else if (entry.category_id === 'parking' || entry.category_id === 'tolls') {
      parkingMinor += amt;
    } else {
      fuelMinor += amt;
    }
  }

  const maxOdoM = entries.reduce(
    (max, e) => (e.odometer_m && e.odometer_m > max ? e.odometer_m : max),
    0,
  );
  const initialOdoM = vehicle?.initial_odometer_m ?? 0;
  const distanceCoveredKm = maxOdoM > initialOdoM ? (maxOdoM - initialOdoM) / 1000 : 0;

  const totalSpentUsd = totalSpentMinor / 100;
  const tcoPerKm =
    distanceCoveredKm > 0 && totalSpentUsd > 0 ? totalSpentUsd / distanceCoveredKm : 0;
  const monthTotalUsd = monthTotalMinor / 100;

  const depreciationUsd = 0;
  const fuelUsd = fuelMinor / 100;
  const insuranceUsd = insuranceMinor / 100;
  const maintenanceUsd = maintenanceMinor / 100;
  const parkingUsd = parkingMinor / 100;

  return {
    totalSpentUsd,
    tcoPerKm,
    monthTotalUsd,
    depreciationUsd,
    fuelUsd,
    insuranceUsd,
    maintenanceUsd,
    parkingUsd,
  };
}

export function computeCategoryDistribution(entries: Entry[]): CostCategorySlice[] {
  let fuelMinor = 0;
  let serviceMinor = 0;
  let insuranceMinor = 0;
  let parkingMinor = 0;

  for (const entry of entries) {
    const amt = entry.usd_minor ?? entry.amount_minor ?? 0;
    if (entry.kind === 'refuel' || entry.kind === 'charge' || entry.category_id === 'fuel') {
      fuelMinor += amt;
    } else if (
      entry.kind === 'service' ||
      entry.category_id === 'service' ||
      entry.category_id === 'maintenance'
    ) {
      serviceMinor += amt;
    } else if (
      entry.category_id === 'insurance' ||
      entry.category_id === 'tax' ||
      entry.category_id === 'admin'
    ) {
      insuranceMinor += amt;
    } else {
      parkingMinor += amt;
    }
  }

  const totalMinor = fuelMinor + serviceMinor + insuranceMinor + parkingMinor;
  if (totalMinor === 0) {
    return [];
  }

  const fuelVal = fuelMinor / 100;
  const serviceVal = serviceMinor / 100;
  const insuranceVal = insuranceMinor / 100;
  const parkingVal = parkingMinor / 100;

  return [
    {
      name: 'Fuel & Energy',
      value: fuelVal,
      percentage: Math.round((fuelMinor / totalMinor) * 100),
      color: '#7dd3fc',
    },
    {
      name: 'Maintenance',
      value: serviceVal,
      percentage: Math.round((serviceMinor / totalMinor) * 100),
      color: '#c8a0f0',
    },
    {
      name: 'Insurance & Tax',
      value: insuranceVal,
      percentage: Math.round((insuranceMinor / totalMinor) * 100),
      color: '#88b4cc',
    },
    {
      name: 'Parking & Tolls',
      value: parkingVal,
      percentage: Math.round((parkingMinor / totalMinor) * 100),
      color: '#fbbf24',
    },
  ];
}

export function computeMonthlyTrends(entries: Entry[], numMonths = 6): MonthlyTrendItem[] {
  const result: MonthlyTrendItem[] = [];
  const now = new Date();

  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
    const monthLabel = d.toLocaleString('en-US', { month: 'short' });

    let fuel = 0;
    let service = 0;
    let admin = 0;

    for (const e of entries) {
      if (e.occurred_on?.startsWith(monthKey)) {
        const amt = (e.usd_minor ?? e.amount_minor ?? 0) / 100;
        if (e.kind === 'refuel' || e.kind === 'charge' || e.category_id === 'fuel') {
          fuel += amt;
        } else if (e.kind === 'service' || e.category_id === 'service') {
          service += amt;
        } else {
          admin += amt;
        }
      }
    }

    result.push({
      month: monthLabel,
      fuel: Math.round(fuel),
      service: Math.round(service),
      admin: Math.round(admin),
    });
  }

  return result;
}

export function computeEfficiencyTelemetry(
  entries: Entry[],
  vehicle?: Vehicle,
): EfficiencyTelemetry {
  const isEv = vehicle?.powertrain === 'ev';
  const unit = isEv ? 'kWh / 100km' : 'L / 100km';

  // Calculate efficiency from refuel/charge entries
  const rates: number[] = [];
  const sorted = [...entries].sort((a, b) => (b.odometer_m ?? 0) - (a.odometer_m ?? 0));

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const prev = sorted[i + 1];

    if (
      current &&
      prev &&
      current.odometer_m &&
      prev.odometer_m &&
      current.odometer_m > prev.odometer_m
    ) {
      const distKm = (current.odometer_m - prev.odometer_m) / 1000;
      const amount = (current.amount_minor ?? 0) / 100;
      if (distKm > 0 && amount > 0) {
        const rate = (amount / distKm) * 100;
        rates.push(rate);
      }
    }
  }

  if (rates.length === 0) {
    return {
      best: null,
      avg: null,
      worst: null,
      unit,
    };
  }

  const best = Math.min(...rates);
  const worst = Math.max(...rates);
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;

  return {
    best: Number(best.toFixed(1)),
    avg: Number(avg.toFixed(1)),
    worst: Number(worst.toFixed(1)),
    unit,
  };
}

export function computePriceVolatility(entries: Entry[]): PriceVolatility {
  const refuels = entries.filter((e) => e.kind === 'refuel' || e.kind === 'charge');

  if (refuels.length === 0) {
    return {
      spread: 0,
    };
  }

  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let lowestEntry: Entry | null = null;
  let highestEntry: Entry | null = null;

  for (const r of refuels) {
    const amtUsd = (r.usd_minor ?? r.amount_minor ?? 0) / 100;
    // Assuming volume if available or estimated price per unit
    const price = amtUsd;
    if (price > 0) {
      if (price < minPrice) {
        minPrice = price;
        lowestEntry = r;
      }
      if (price > maxPrice) {
        maxPrice = price;
        highestEntry = r;
      }
    }
  }

  if (minPrice === Infinity || !lowestEntry || !highestEntry) {
    return {
      spread: 0,
    };
  }

  return {
    lowest: {
      price: Number(minPrice.toFixed(2)),
      station: lowestEntry.category_id || 'Gas Station',
      date: lowestEntry.occurred_on,
    },
    highest: {
      price: Number(maxPrice.toFixed(2)),
      station: highestEntry.category_id || 'Gas Station',
      date: highestEntry.occurred_on,
    },
    spread: Number((maxPrice - minPrice).toFixed(2)),
  };
}

export function computeBusinessDeductible(entries: Entry[]): BusinessDeductible {
  const businessEntries = entries.filter((e) => e.business === 1);
  const totalMinor = businessEntries.reduce(
    (sum, e) => sum + (e.usd_minor ?? e.amount_minor ?? 0),
    0,
  );

  let distanceKm = 0;
  // Estimate distance covered in business entries if odometer recorded
  for (const e of businessEntries) {
    if (e.odometer_m) {
      distanceKm += 50; // default estimated distance per entry if not chained
    }
  }

  const potentialWriteOffUsd = totalMinor / 100;

  return {
    distanceKm,
    potentialWriteOffUsd: Number(potentialWriteOffUsd.toFixed(2)),
  };
}
