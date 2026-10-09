export interface TwoOfThreeInput {
  totalMinor?: number | null;
  volumeMl?: number | null; // milliliters
  pricePerUnitMinor?: number | null; // price per liter in minor units (e.g. cents/liter)
}

export interface TwoOfThreeResult {
  totalMinor: number;
  volumeMl: number;
  pricePerUnitMinor: number;
  computedField?: 'total' | 'volume' | 'price';
}

/**
 * Solves 2-of-3 equation: Total = (Volume in Liters) * PricePerLiter
 * Total is authoritative when all 3 are provided.
 */
export function solveTwoOfThree(input: TwoOfThreeInput): TwoOfThreeResult {
  const { totalMinor, volumeMl, pricePerUnitMinor } = input;

  // Case 1: Total and Volume provided -> compute PricePerUnit
  if (totalMinor !== undefined && totalMinor !== null && volumeMl && volumeMl > 0) {
    const volumeLiters = volumeMl / 1000;
    const computedPrice = Math.round(totalMinor / volumeLiters);
    return {
      totalMinor,
      volumeMl,
      pricePerUnitMinor: pricePerUnitMinor ?? computedPrice,
      computedField:
        pricePerUnitMinor === undefined || pricePerUnitMinor === null ? 'price' : undefined,
    };
  }

  // Case 2: Total and PricePerUnit provided -> compute Volume
  if (
    totalMinor !== undefined &&
    totalMinor !== null &&
    pricePerUnitMinor &&
    pricePerUnitMinor > 0
  ) {
    const volumeLiters = totalMinor / pricePerUnitMinor;
    const computedVolumeMl = Math.round(volumeLiters * 1000);
    return {
      totalMinor,
      volumeMl: computedVolumeMl,
      pricePerUnitMinor,
      computedField: 'volume',
    };
  }

  // Case 3: Volume and PricePerUnit provided -> compute Total
  if (volumeMl && volumeMl > 0 && pricePerUnitMinor && pricePerUnitMinor > 0) {
    const volumeLiters = volumeMl / 1000;
    const computedTotal = Math.round(volumeLiters * pricePerUnitMinor);
    return {
      totalMinor: computedTotal,
      volumeMl,
      pricePerUnitMinor,
      computedField: 'total',
    };
  }

  throw new Error('At least two of total, volume, or price per unit must be provided.');
}

export interface RefuelEfficiencyEntry {
  odometerM: number;
  volumeMl: number;
  isFullTank: boolean;
  missedFill?: boolean;
}

/**
 * Full-tank method efficiency calculation:
 * Computes L/100km between the previous full-tank refuel and the current full-tank refuel.
 * Correctly accounts for intermediate partial refuels.
 * If a refuel was missed, calculation for that segment is skipped.
 */
export function calculateFuelEfficiency(
  current: RefuelEfficiencyEntry,
  previousFullTank: RefuelEfficiencyEntry | null,
  intermediatePartials: RefuelEfficiencyEntry[] = [],
): { lPer100Km: number | null; distanceKm: number | null; totalVolumeLiters: number | null } {
  if (!previousFullTank || !current.isFullTank || current.missedFill) {
    return { lPer100Km: null, distanceKm: null, totalVolumeLiters: null };
  }

  const distanceM = current.odometerM - previousFullTank.odometerM;
  if (distanceM <= 0) {
    return { lPer100Km: null, distanceKm: null, totalVolumeLiters: null };
  }

  const distanceKm = distanceM / 1000;
  const totalVolumeMl =
    current.volumeMl + intermediatePartials.reduce((sum, p) => sum + p.volumeMl, 0);
  const totalVolumeLiters = totalVolumeMl / 1000;

  const lPer100Km = Number(((totalVolumeLiters / distanceKm) * 100).toFixed(2));

  return {
    lPer100Km,
    distanceKm: Number(distanceKm.toFixed(1)),
    totalVolumeLiters: Number(totalVolumeLiters.toFixed(2)),
  };
}

/**
 * Calculates EV consumption efficiency: kWh/100km and Wh/km.
 */
export function calculateEvEfficiency(
  energyWh: number,
  distanceM: number,
): { kwhPer100Km: number | null; whPerKm: number | null } {
  if (distanceM <= 0 || energyWh <= 0) {
    return { kwhPer100Km: null, whPerKm: null };
  }

  const distanceKm = distanceM / 1000;
  const energyKwh = energyWh / 1000;

  const kwhPer100Km = Number(((energyKwh / distanceKm) * 100).toFixed(2));
  const whPerKm = Number((energyWh / distanceKm).toFixed(1));

  return { kwhPer100Km, whPerKm };
}

/**
 * Validates odometer monotonicity: returns error message if odometer decreased.
 */
export function validateOdometerMonotonicity(
  previousOdometerM: number,
  currentOdometerM: number,
): { valid: boolean; warning?: string } {
  if (currentOdometerM < previousOdometerM) {
    const diffKm = Math.round((previousOdometerM - currentOdometerM) / 1000);
    return {
      valid: false,
      warning: `Odometer reading is lower than previous reading by ${diffKm} km. Verify the entry.`,
    };
  }
  return { valid: true };
}

/**
 * Sanity check for entered fuel volume against vehicle tank capacity.
 */
export function validateFuelVolume(
  volumeMl: number,
  tankCapacityMl?: number | null,
): { plausible: boolean; warning?: string } {
  if (!tankCapacityMl || tankCapacityMl <= 0) {
    return { plausible: true };
  }

  // Allow up to 15% expansion / filler neck volume above rated capacity
  const maxAllowableMl = tankCapacityMl * 1.15;
  if (volumeMl > maxAllowableMl) {
    const volL = (volumeMl / 1000).toFixed(1);
    const capL = (tankCapacityMl / 1000).toFixed(1);
    return {
      plausible: false,
      warning: `Entered volume (${volL} L) exceeds rated tank capacity (${capL} L) by over 15%.`,
    };
  }

  return { plausible: true };
}

/**
 * Duplicate entry detection.
 */
export function isDuplicateEntry(
  existingEntries: Array<{
    occurred_on: string;
    odometer_m?: number;
    amount_minor?: number;
    kind: string;
  }>,
  candidate: { occurred_on: string; odometer_m?: number; amount_minor?: number; kind: string },
): boolean {
  return existingEntries.some(
    (e) =>
      e.occurred_on === candidate.occurred_on &&
      e.kind === candidate.kind &&
      e.odometer_m === candidate.odometer_m &&
      e.amount_minor === candidate.amount_minor,
  );
}
