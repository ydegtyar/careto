import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
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
import { styles } from './index.styles';

export const Route = createFileRoute('/analytics/')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { activeVehicleId } = useAppStore();
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());
  const { data: rawEntries = [] } = useQuery(entriesQueryOptions(activeVehicleId ?? undefined));

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  const [timeRange, setTimeRange] = useState<TimeRangeMode>('may2025');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');

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
      <AnalyticsFilterPillsBar
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      {/* 2. True Total Cost of Ownership Card */}
      <TcoSummaryCard entries={filteredEntries} vehicle={activeVehicle} />

      {/* 3. Consumption Anomaly Detected Banner */}
      <ConsumptionAnomalyBanner />

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
        <BusinessDeductibleCard entries={filteredEntries} vehicle={activeVehicle} />
      </div>
    </div>
  );
}
