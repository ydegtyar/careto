import { describe, expect, it, vi } from 'vitest';
import { RefuelingTabContent } from './RefuelingTabContent';

describe('RefuelingTabContent', () => {
  it('is exported as a function component', () => {
    expect(RefuelingTabContent).toBeDefined();
    expect(typeof RefuelingTabContent).toBe('function');
  });

  it('renders static titles and labels for KPI cards when loading without data', () => {
    const element = RefuelingTabContent({
      isLoading: true,
    });

    expect(element).toBeDefined();
    const jsonStr = JSON.stringify(element);
    expect(jsonStr).toContain('Total Cost');
    expect(jsonStr).toContain('Fuel Volume');
    expect(jsonStr).toContain('Avg Price / L');
    expect(jsonStr).toContain('Avg Efficiency');
    expect(jsonStr).toContain('Per day');
    expect(jsonStr).toContain('Per km');
    expect(jsonStr).toContain('Per refuel');
    expect(jsonStr).toContain('Best');
    expect(jsonStr).toContain('Worst');
  });

  it('shows empty view proposing "All Time" when records are empty for a specific period', () => {
    const onSelectAllPeriod = vi.fn();
    const element = RefuelingTabContent({
      isLoading: false,
      isAllTime: false,
      onSelectAllPeriod,
      data: {
        summary: {
          totalCost: null,
          costPerDay: null,
          costPerKm: null,
          totalVolumeLiters: null,
          volumePerRefuel: null,
          volumePerDay: null,
          avgPricePerLiter: null,
          minPricePerLiter: null,
          maxPricePerLiter: null,
          avgEfficiencyL100km: null,
          bestEfficiencyL100km: null,
          worstEfficiencyL100km: null,
          warnings: [],
        },
        routine: {
          frequencyDays: null,
          intervalKm: null,
          currentRangeKm: null,
          monthlyAverageSpend: null,
          fullTankIndexPercent: null,
          fullTankRatioText: '0/0',
          footnote: '',
        },
        monthlyExpenses: [],
        benchmark: {
          lastRefuelOdometerKm: null,
          efficiencyL100km: null,
          minEfficiencyL100km: null,
          avgEfficiencyL100km: null,
          maxEfficiencyL100km: null,
          costPerKm: null,
          minCostPerKm: null,
          avgCostPerKm: null,
          maxCostPerKm: null,
        },
        stations: { stations: [], optimizationInsight: null },
        fuelTypes: { totalLiters: 0, items: [] },
        priceTrend: {
          points: [],
          fuelTypes: [],
          overallWeightedAvgPrice: null,
          changePercentOverPeriod: null,
        },
      },
    });

    const jsonStr = JSON.stringify(element);
    expect(jsonStr).toContain('No refueling records in this period');
    expect(jsonStr).toContain('All Time');
    expect(element.props.children.props.onSelectAllPeriod).toBe(onSelectAllPeriod);
    expect(element.props.children.props.isAllTime).toBe(false);
  });

  it('shows empty view with historical absence message when isAllTime is true and no records exist', () => {
    const element = RefuelingTabContent({
      isLoading: false,
      isAllTime: true,
      data: {
        summary: {
          totalCost: null,
          costPerDay: null,
          costPerKm: null,
          totalVolumeLiters: null,
          volumePerRefuel: null,
          volumePerDay: null,
          avgPricePerLiter: null,
          minPricePerLiter: null,
          maxPricePerLiter: null,
          avgEfficiencyL100km: null,
          bestEfficiencyL100km: null,
          worstEfficiencyL100km: null,
          warnings: [],
        },
        routine: {
          frequencyDays: null,
          intervalKm: null,
          currentRangeKm: null,
          monthlyAverageSpend: null,
          fullTankIndexPercent: null,
          fullTankRatioText: '0/0',
          footnote: '',
        },
        monthlyExpenses: [],
        benchmark: {
          lastRefuelOdometerKm: null,
          efficiencyL100km: null,
          minEfficiencyL100km: null,
          avgEfficiencyL100km: null,
          maxEfficiencyL100km: null,
          costPerKm: null,
          minCostPerKm: null,
          avgCostPerKm: null,
          maxCostPerKm: null,
        },
        stations: { stations: [], optimizationInsight: null },
        fuelTypes: { totalLiters: 0, items: [] },
        priceTrend: {
          points: [],
          fuelTypes: [],
          overallWeightedAvgPrice: null,
          changePercentOverPeriod: null,
        },
      },
    });

    const jsonStr = JSON.stringify(element);
    expect(jsonStr).toContain('No historical refueling records');
    expect(jsonStr).toContain('No refueling entries have been logged for this vehicle yet');
    expect(element.props.children.props.isAllTime).toBe(true);
  });
});
