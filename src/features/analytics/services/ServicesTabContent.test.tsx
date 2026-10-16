import { describe, expect, it, vi } from 'vitest';
import type { ServicesAnalyticsResponseDto } from '../../../../api/_lib/analytics/types';
import { ServicesTabContent } from './ServicesTabContent';

const mockEmptyServicesData: ServicesAnalyticsResponseDto = {
  summary: {
    totalServiceCost: null,
    costPerDay: null,
    costPerKm: null,
    maintenanceRatePercent: 100,
    breakdownIncidentsCount: 0,
    serviceCadenceKm: null,
    serviceCadenceDays: null,
    sinkingFundReserve: 3800,
    sinkingFundTarget: 5000,
    sinkingFundProgressPercent: 76,
    sinkingFundLabel: '',
  },
  allocation: {
    items: [],
    partsCost: 0,
    laborCost: 0,
    totalCost: 0,
    taskCount: 0,
  },
  monthlyTrajectory: {
    points: [],
    peakMonth: null,
    peakCost: null,
  },
  componentLife: [],
  workshopEfficiency: {
    hasData: false,
    workshopName: null,
    rating: null,
    specialization: null,
    hourlyRate: null,
    benchmarkHourlyRate: null,
    diffVsBenchmarkPercent: null,
    activeGuaranteeNote: null,
  },
  costProgression: {
    points: [],
    currentOdometerKm: null,
    currentCostPerKm: null,
    fleetAvgCostPerKm: null,
    statusLabel: '',
  },
};

describe('ServicesTabContent', () => {
  it('is exported as a function component', () => {
    expect(ServicesTabContent).toBeDefined();
    expect(typeof ServicesTabContent).toBe('function');
  });

  it('renders static titles and labels for KPI cards when loading without data', () => {
    const element = ServicesTabContent({
      isLoading: true,
    });

    expect(element).toBeDefined();
    const jsonStr = JSON.stringify(element);
    expect(jsonStr).toContain('Total Service');
    expect(jsonStr).toContain('Maintenance Rate');
    expect(jsonStr).toContain('Service Cadence');
    expect(jsonStr).toContain('Sinking Fund');
    expect(jsonStr).toContain('Per day');
    expect(jsonStr).toContain('Per km');
    expect(jsonStr).toContain('Breakdowns');
    expect(jsonStr).toContain('Cadence Days');
    expect(jsonStr).toContain('Target');
  });

  it('shows empty view proposing "All Time" when records are empty for a specific period', () => {
    const onSelectAllPeriod = vi.fn();
    const element = ServicesTabContent({
      isLoading: false,
      isAllTime: false,
      onSelectAllPeriod,
      data: mockEmptyServicesData,
    });

    const jsonStr = JSON.stringify(element);
    expect(jsonStr).toContain('No service records in this period');
    expect(jsonStr).toContain('All Time');
    expect(element.props.children.props.onSelectAllPeriod).toBe(onSelectAllPeriod);
    expect(element.props.children.props.isAllTime).toBe(false);
  });

  it('shows empty view with historical absence message when isAllTime is true and no records exist', () => {
    const element = ServicesTabContent({
      isLoading: false,
      isAllTime: true,
      data: mockEmptyServicesData,
    });

    const jsonStr = JSON.stringify(element);
    expect(jsonStr).toContain('No historical service records');
    expect(jsonStr).toContain(
      'No service or maintenance entries have been logged for this vehicle yet',
    );
    expect(element.props.children.props.isAllTime).toBe(true);
  });
});
