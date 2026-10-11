export interface AnalyticsFilterParams {
  vehicleId: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  preset?: '1M' | '3M' | '6M' | '1Y' | 'all';
}

// ----------------------------------------------------
// Refueling Analytics DTOs
// ----------------------------------------------------

export interface RefuelingKpiSummaryDto {
  totalCost: number | null;
  costPerDay: number | null;
  costPerKm: number | null;
  totalVolumeLiters: number | null;
  volumePerRefuel: number | null;
  volumePerDay: number | null;
  avgPricePerLiter: number | null;
  minPricePerLiter: number | null;
  maxPricePerLiter: number | null;
  avgEfficiencyL100km: number | null;
  bestEfficiencyL100km: number | null;
  worstEfficiencyL100km: number | null;
  warnings: string[];
}

export interface RefuelingRoutineDto {
  frequencyDays: number | null;
  intervalKm: number | null;
  currentRangeKm: number | null;
  monthlyAverageSpend: number | null;
  fullTankIndexPercent: number | null;
  fullTankRatioText: string; // e.g. "24/24"
  footnote: string;
}

export interface MonthlyFuelExpenseBarDto {
  month: string; // "YYYY-MM" or "09/25"
  totalCost: number;
  byFuelType: Array<{
    fuelTypeId: string;
    fuelTypeName: string;
    cost: number;
  }>;
}

export interface RefuelBenchmarkDto {
  lastRefuelOdometerKm: number | null;
  efficiencyL100km: number | null;
  minEfficiencyL100km: number | null;
  avgEfficiencyL100km: number | null;
  maxEfficiencyL100km: number | null;
  costPerKm: number | null;
  minCostPerKm: number | null;
  avgCostPerKm: number | null;
  maxCostPerKm: number | null;
}

export interface GasStationRankingItemDto {
  rank: number;
  stationId: string;
  brand: string;
  name: string;
  avgPricePerLiter: number;
  priceDiffPercent: number; // negative is cheaper (green), positive pricier (red)
  refuelCount: number;
  totalLiters: number;
  totalSpend: number;
}

export interface GasStationsRankingDto {
  stations: GasStationRankingItemDto[];
  optimizationInsight: {
    show: boolean;
    cheapestBrand: string;
    potentialSavingsPeriod: number;
    potentialSavingsAnnualized: number;
    comparedToBrand: string;
    message: string;
  } | null;
}

export interface FuelTypeAllocationItemDto {
  fuelTypeId: string;
  name: string;
  totalCost: number;
  totalLiters: number;
  sharePercent: number;
  color: string;
}

export interface FuelTypeAllocationDto {
  totalLiters: number;
  items: FuelTypeAllocationItemDto[];
}

export interface PriceTrajectoryPointDto {
  month: string;
  byFuelType: Record<string, number>; // fuelTypeId -> avgPrice
  overallAvgPrice: number;
}

export interface FuelPriceTrajectoryDto {
  points: PriceTrajectoryPointDto[];
  fuelTypes: Array<{ id: string; name: string }>;
  overallWeightedAvgPrice: number | null;
  changePercentOverPeriod: number | null;
}

export interface RefuelingAnalyticsResponseDto {
  summary: RefuelingKpiSummaryDto;
  routine: RefuelingRoutineDto;
  monthlyExpenses: MonthlyFuelExpenseBarDto[];
  benchmark: RefuelBenchmarkDto;
  stations: GasStationsRankingDto;
  fuelTypes: FuelTypeAllocationDto;
  priceTrend: FuelPriceTrajectoryDto;
}

// ----------------------------------------------------
// Services Analytics DTOs
// ----------------------------------------------------

export interface ServicesKpiSummaryDto {
  totalServiceCost: number | null;
  costPerDay: number | null;
  costPerKm: number | null;
  maintenanceRatePercent: number | null;
  breakdownIncidentsCount: number;
  serviceCadenceKm: number | null;
  serviceCadenceDays: number | null;
  sinkingFundReserve: number | null;
  sinkingFundTarget: number | null;
  sinkingFundProgressPercent: number | null;
  sinkingFundLabel: string | null;
}

export interface ServiceItemAllocationDto {
  name: string;
  category: string;
  cost: number;
  sharePercent: number;
  color: string;
}

export interface PartsLaborAllocationDto {
  taskCount: number;
  totalCost: number;
  partsCost: number;
  laborCost: number;
  items: ServiceItemAllocationDto[];
}

export interface MonthlyServiceTrajectoryPointDto {
  month: string;
  totalCost: number;
  isPeak: boolean;
}

export interface MonthlyServiceTrajectoryDto {
  points: MonthlyServiceTrajectoryPointDto[];
  peakMonth: string | null;
  peakCost: number | null;
}

export type ComponentStatus = 'ok' | 'due_soon' | 'critical';

export interface PredictiveComponentLifeItemDto {
  id: string;
  component: string;
  remainingPercent: number; // 0..100
  remainingKm: number;
  remainingDays: number;
  status: ComponentStatus;
  reason: string;
  isAiForecast: boolean;
  icon?: string;
}

export interface WorkshopEfficiencyDto {
  hasData: boolean;
  workshopName: string | null;
  rating: number | null;
  specialization: string | null;
  hourlyRate: number | null;
  benchmarkHourlyRate: number | null;
  diffVsBenchmarkPercent: number | null; // e.g. -7%
  activeGuaranteeNote: string | null;
}

export interface OdometerCostPointDto {
  odometerKm: number;
  costPerKm: number;
  isServicePoint: boolean;
  date?: string;
}

export interface OdometerCostProgressionDto {
  points: OdometerCostPointDto[];
  currentOdometerKm: number | null;
  currentCostPerKm: number | null;
  fleetAvgCostPerKm: number | null;
  statusLabel: string; // e.g. "Optimal Status"
}

export interface ServicesAnalyticsResponseDto {
  summary: ServicesKpiSummaryDto;
  allocation: PartsLaborAllocationDto;
  monthlyTrajectory: MonthlyServiceTrajectoryDto;
  componentLife: PredictiveComponentLifeItemDto[];
  workshopEfficiency: WorkshopEfficiencyDto;
  costProgression: OdometerCostProgressionDto;
}
