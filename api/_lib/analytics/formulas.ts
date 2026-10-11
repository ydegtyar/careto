export interface RawRefuelRow {
  id: string;
  vehicle_id: string;
  date: string; // YYYY-MM-DD
  odometer_km: number;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  fuel_type_id: string | null;
  fuel_type_name?: string | null;
  station_id: string | null;
  station_brand?: string | null;
  station_name?: string | null;
  is_full_tank: boolean;
  tank_no: number;
}

export interface ChainedEfficiencyResult {
  avg: number | null;
  best: number | null;
  worst: number | null;
  warnings: string[];
  lastFillEfficiency: number | null;
}

/**
 * Full-tank-to-full-tank calculation:
 * For each full fill, liters added since previous full fill (including partial fills in between) / delta km * 100.
 */
export function computeChainedEfficiency(refuels: RawRefuelRow[]): ChainedEfficiencyResult {
  const sorted = [...refuels].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return a.odometer_km - b.odometer_km;
  });

  const efficiencies: number[] = [];
  const warnings: string[] = [];

  let prevFullOdometer: number | null = null;
  let accumulatedLiters = 0;
  let lastFillEfficiency: number | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i]!;

    if (prevFullOdometer !== null) {
      if (curr.odometer_km <= prevFullOdometer) {
        warnings.push(`Non-monotonic odometer on ${curr.date} (${curr.odometer_km} km vs previous ${prevFullOdometer} km)`);
        // Reset chain
        prevFullOdometer = curr.is_full_tank ? curr.odometer_km : null;
        accumulatedLiters = 0;
        continue;
      }
    }

    accumulatedLiters += curr.liters;

    if (curr.is_full_tank) {
      if (prevFullOdometer !== null) {
        const deltaKm = curr.odometer_km - prevFullOdometer;
        if (deltaKm > 0 && accumulatedLiters > 0) {
          const eff = (accumulatedLiters / deltaKm) * 100;
          efficiencies.push(eff);
          lastFillEfficiency = eff;
        }
      }
      prevFullOdometer = curr.odometer_km;
      accumulatedLiters = 0;
    }
  }

  if (efficiencies.length === 0) {
    return {
      avg: null,
      best: null,
      worst: null,
      warnings,
      lastFillEfficiency: null,
    };
  }

  const avg = efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length;
  const best = Math.min(...efficiencies); // lowest consumption is best
  const worst = Math.max(...efficiencies);

  return {
    avg: Number(avg.toFixed(2)),
    best: Number(best.toFixed(2)),
    worst: Number(worst.toFixed(2)),
    warnings,
    lastFillEfficiency: lastFillEfficiency !== null ? Number(lastFillEfficiency.toFixed(2)) : null,
  };
}

/**
 * Weighted average price per liter = SUM(total_cost) / SUM(liters)
 */
export function computeWeightedAvgPrice(refuels: Array<{ total_cost: number; liters: number }>): number | null {
  const totalCost = refuels.reduce((sum, r) => sum + r.total_cost, 0);
  const totalLiters = refuels.reduce((sum, r) => sum + r.liters, 0);
  if (totalLiters <= 0) return null;
  return Number((totalCost / totalLiters).toFixed(2));
}

/**
 * Potential savings insight:
 * SUM over refuels at non-best stations of (price_per_liter - best_stations_avg_price) * liters
 */
export function computeStationSavingsInsight(
  stationRankings: Array<{
    brand: string;
    avgPricePerLiter: number;
    refuelCount: number;
    totalLiters: number;
  }>,
  refuels: RawRefuelRow[],
  periodDays: number,
  minRefuelsForBest = 2
): {
  show: boolean;
  cheapestBrand: string;
  potentialSavingsPeriod: number;
  potentialSavingsAnnualized: number;
  comparedToBrand: string;
  message: string;
} | null {
  if (stationRankings.length < 2) {
    return null;
  }

  // Eligible "best" brands have at least minRefuelsForBest
  const eligible = stationRankings.filter((s) => s.refuelCount >= minRefuelsForBest);
  const bestBrandObj = eligible.length > 0 ? eligible[0] : stationRankings[0];
  if (!bestBrandObj) return null;

  const bestBrand = bestBrandObj.brand;
  const bestAvgPrice = bestBrandObj.avgPricePerLiter;

  let totalSavings = 0;
  let nonBestLiters = 0;

  for (const r of refuels) {
    const brand = r.station_brand || 'Other';
    if (brand !== bestBrand && r.price_per_liter > bestAvgPrice) {
      totalSavings += (r.price_per_liter - bestAvgPrice) * r.liters;
      nonBestLiters += r.liters;
    }
  }

  if (totalSavings <= 0 || nonBestLiters <= 0) {
    return null;
  }

  const annualized = periodDays > 0 ? (totalSavings / periodDays) * 365 : totalSavings;

  return {
    show: true,
    cheapestBrand: bestBrand,
    potentialSavingsPeriod: Number(totalSavings.toFixed(2)),
    potentialSavingsAnnualized: Number(annualized.toFixed(2)),
    comparedToBrand: stationRankings[stationRankings.length - 1]?.brand || 'pricier brands',
    message: `Always refueling at ${bestBrand} would save $${totalSavings.toFixed(2)} ($${annualized.toFixed(2)}/year) by avoiding higher markups.`,
  };
}

/**
 * Predictive component life % calculation:
 * used = max(km_since_last / interval_km, days_since_last / (interval_days * seasonalFactor))
 * remaining% = clamp(1 - used) * 100
 */
export function computeComponentLife(params: {
  kmSinceLast: number;
  daysSinceLast: number;
  intervalKm: number;
  intervalDays: number;
  seasonalFactor?: number;
  avgDailyKm?: number;
}): {
  remainingPercent: number;
  remainingKm: number;
  remainingDays: number;
  status: 'ok' | 'due_soon' | 'critical';
} {
  const {
    kmSinceLast,
    daysSinceLast,
    intervalKm,
    intervalDays,
    seasonalFactor = 1.0,
    avgDailyKm = 40,
  } = params;

  const adjustedIntervalDays = Math.max(1, intervalDays * seasonalFactor);
  const kmUsedFraction = intervalKm > 0 ? kmSinceLast / intervalKm : 0;
  const daysUsedFraction = daysSinceLast / adjustedIntervalDays;

  const used = Math.max(kmUsedFraction, daysUsedFraction);
  const clampedRemainingFraction = Math.max(0, Math.min(1, 1 - used));
  const remainingPercent = Math.round(clampedRemainingFraction * 100);

  const remainingKm = Math.max(0, Math.round(intervalKm - kmSinceLast));
  const remainingDays =
    avgDailyKm > 0
      ? Math.round(remainingKm / avgDailyKm)
      : Math.max(0, Math.round(adjustedIntervalDays - daysSinceLast));

  let status: 'ok' | 'due_soon' | 'critical' = 'ok';
  if (remainingPercent < 30) {
    status = 'critical';
  } else if (remainingPercent < 60) {
    status = 'due_soon';
  }

  return {
    remainingPercent,
    remainingKm,
    remainingDays,
    status,
  };
}
