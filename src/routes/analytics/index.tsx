import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useAppStore } from '@/app/store';
import {
  AnalyticsFilterPillsBar,
  type TimeRangeMode,
} from '@/features/analytics/components/AnalyticsFilterPillsBar';
import { BusinessDeductibleCard } from '@/features/analytics/components/BusinessDeductibleCard';
import { ConsumptionAnomalyBanner } from '@/features/analytics/components/ConsumptionAnomalyBanner';
import { CostDistributionCard } from '@/features/analytics/components/CostDistributionCard';
import { EfficiencyTelemetryCard } from '@/features/analytics/components/EfficiencyTelemetryCard';
import { PriceVolatilityCard } from '@/features/analytics/components/PriceVolatilityCard';
import { SpendingTrendCard } from '@/features/analytics/components/SpendingTrendCard';
import { TcoSummaryCard } from '@/features/analytics/components/TcoSummaryCard';
import { entriesQueryOptions, vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import { styles } from './-index.styles';

export interface AnalyticsSearchParams {
  timeRange?: TimeRangeMode;
  startDate?: string;
  endDate?: string;
}

const VALID_TIME_RANGES: TimeRangeMode[] = ['all', 'may2025', 'ytd', '6months', 'custom'];

export const Route = createFileRoute('/analytics/')({
  validateSearch: (search: Record<string, unknown>): AnalyticsSearchParams => {
    const rawTimeRange = typeof search.timeRange === 'string' ? search.timeRange : undefined;
    const timeRange = VALID_TIME_RANGES.includes(rawTimeRange as TimeRangeMode)
      ? (rawTimeRange as TimeRangeMode)
      : undefined;

    return {
      timeRange,
      startDate: typeof search.startDate === 'string' ? search.startDate : undefined,
      endDate: typeof search.endDate === 'string' ? search.endDate : undefined,
    };
  },
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { activeVehicleId } = useAppStore();
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());
  const { data: rawEntries = [] } = useQuery(entriesQueryOptions(activeVehicleId ?? undefined));
  const searchParams = Route.useSearch();

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  const timeRange = searchParams.timeRange ?? 'all';
  const startDate = searchParams.startDate ?? '2026-01-01';
  const endDate = searchParams.endDate ?? '2026-12-31';

  // Filter entries based on timeRange
  const filteredEntries = useMemo(() => {
    if (timeRange === 'all') {
      return rawEntries;
    }
    if (timeRange === 'ytd') {
      const currentYear = new Date().getFullYear().toString();
      return rawEntries.filter((e) => e.occurred_on?.startsWith(currentYear));
    }
    if (timeRange === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const isoStr = sixMonthsAgo.toISOString().slice(0, 10);
      return rawEntries.filter((e) => e.occurred_on && e.occurred_on >= isoStr);
    }
    if (timeRange === 'may2025') {
      return rawEntries.filter((e) => e.occurred_on?.startsWith('2025-05'));
    }
    if (timeRange === 'custom') {
      return rawEntries.filter((e) => {
        if (!e.occurred_on) return false;
        return e.occurred_on >= startDate && e.occurred_on <= endDate;
      });
    }
    return rawEntries;
  }, [rawEntries, timeRange, startDate, endDate]);

  return (
    <div style={styles.container}>
      {/* 1. Top Filter Pills Bar */}
      <AnalyticsFilterPillsBar />

      {/* 2. True Total Cost of Ownership Card */}
      <TcoSummaryCard entries={filteredEntries} vehicle={activeVehicle} />

      {/* 3. Consumption Anomaly Detected Banner */}
      <ConsumptionAnomalyBanner entries={rawEntries} vehicle={activeVehicle} />

      {/* Grid of Analytics Cards for Desktop */}
      <div style={styles.grid}>
        {/* 4. Cost Distribution Card */}
        <CostDistributionCard entries={filteredEntries} />

        {/* 5. Spending Trend Card */}
        <SpendingTrendCard entries={filteredEntries} timeRange={timeRange} />

        {/* 6. Efficiency Telemetry Card */}
        <EfficiencyTelemetryCard entries={filteredEntries} vehicle={activeVehicle} />

        {/* 7. Price Volatility Card */}
        <PriceVolatilityCard entries={filteredEntries} />

        {/* 8. Business Mileage & Tax Deductible Export Card */}
        {activeVehicle?.used_by_business && (
          <BusinessDeductibleCard entries={filteredEntries} vehicle={activeVehicle} />
        )}
      </div>
    </div>
  );
}
