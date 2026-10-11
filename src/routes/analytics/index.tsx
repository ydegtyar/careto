import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useAppStore } from '@/app/store';
import { entriesQueryOptions, vehiclesQueryOptions } from '@/features/garage/queries/vehicles';

// Shared Components
import { AnalyticsTabs, type AnalyticsTab } from '@/features/analytics/shared/AnalyticsTabs';
import { PeriodFilter, type PeriodPreset } from '@/features/analytics/shared/PeriodFilter';
import { VehicleHeaderCard } from '@/features/analytics/shared/VehicleHeaderCard';

// Hooks
import {
  useRefuelingAnalytics,
  useServicesAnalytics,
} from '@/features/analytics/hooks/useAnalyticsQueries';

// Tabs
import { RefuelingTabContent } from '@/features/analytics/refueling/RefuelingTabContent';
import { ServicesTabContent } from '@/features/analytics/services/ServicesTabContent';

// General Tab Cards
import { TcoSummaryCard } from '@/features/analytics/components/TcoSummaryCard';
import { ConsumptionAnomalyBanner } from '@/features/analytics/components/ConsumptionAnomalyBanner';
import { CostDistributionCard } from '@/features/analytics/components/CostDistributionCard';
import { SpendingTrendCard } from '@/features/analytics/components/SpendingTrendCard';
import { EfficiencyTelemetryCard } from '@/features/analytics/components/EfficiencyTelemetryCard';
import { PriceVolatilityCard } from '@/features/analytics/components/PriceVolatilityCard';
import { BusinessDeductibleCard } from '@/features/analytics/components/BusinessDeductibleCard';
import { TravelDistanceCard } from '@/features/analytics/components/TravelDistanceCard';
import { OdometerProgressionCard } from '@/features/analytics/components/OdometerProgressionCard';
import {
  computeClientRefuelingAnalytics,
  computeClientServicesAnalytics,
} from '@/features/analytics/lib/analytics-math';

import { styles } from './-index.styles';

export interface AnalyticsSearchParams {
  tab?: AnalyticsTab;
  preset?: PeriodPreset;
  from?: string;
  to?: string;
  timeRange?: string;
}

const VALID_TABS: AnalyticsTab[] = ['general', 'refueling', 'services'];
const VALID_PRESETS: PeriodPreset[] = ['1M', '3M', '6M', '1Y', 'all', 'custom'];

export const Route = createFileRoute('/analytics/')({
  validateSearch: (search: Record<string, unknown>): AnalyticsSearchParams => {
    const rawTab = typeof search.tab === 'string' ? search.tab : undefined;
    const tab = VALID_TABS.includes(rawTab as AnalyticsTab) ? (rawTab as AnalyticsTab) : undefined;

    const rawPreset = typeof search.preset === 'string' ? search.preset : undefined;
    const preset = VALID_PRESETS.includes(rawPreset as PeriodPreset) ? (rawPreset as PeriodPreset) : undefined;

    const from = typeof search.from === 'string' ? search.from : undefined;
    const to = typeof search.to === 'string' ? search.to : undefined;

    return {
      tab,
      preset,
      from,
      to,
      timeRange: typeof search.timeRange === 'string' ? search.timeRange : undefined,
    };
  },
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { activeVehicleId } = useAppStore();
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());
  const { data: rawEntries = [] } = useQuery(entriesQueryOptions(activeVehicleId ?? undefined));
  const searchParams = Route.useSearch();
  const navigate = useNavigate();

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];
  const vehicleId = activeVehicle?.id || '';

  // Tab state: default to 'refueling' per spec
  const currentTab: AnalyticsTab = searchParams.tab ?? 'refueling';

  // Preset state: Refueling default = 'all', Services default = '6M'
  const defaultPreset: PeriodPreset = currentTab === 'services' ? '6M' : 'all';
  const currentPreset: PeriodPreset = searchParams.preset ?? defaultPreset;

  const fromDate = searchParams.from;
  const toDate = searchParams.to;

  const handleTabChange = (nextTab: AnalyticsTab) => {
    const nextPreset = nextTab === 'services' ? '6M' : 'all';
    navigate({
      search: ((prev: AnalyticsSearchParams) => ({
        ...prev,
        tab: nextTab,
        preset: prev.preset ?? nextPreset,
      })) as any,
    });
  };

  const handlePeriodChange = (preset: PeriodPreset, from?: string, to?: string) => {
    navigate({
      search: ((prev: AnalyticsSearchParams) => ({
        ...prev,
        preset,
        from,
        to,
      })) as any,
    });
  };

  // Queries for server analytics
  const refuelingQuery = useRefuelingAnalytics({
    vehicleId,
    from: fromDate,
    to: toDate,
    preset: currentPreset === 'custom' ? undefined : (currentPreset as any),
  });

  const servicesQuery = useServicesAnalytics({
    vehicleId,
    from: fromDate,
    to: toDate,
    preset: currentPreset === 'custom' ? undefined : (currentPreset as any),
  });

  // Filter local entries for General tab
  const filteredEntries = useMemo(() => {
    if (!fromDate && !toDate) return rawEntries;
    return rawEntries.filter((e) => {
      if (!e.occurred_on) return false;
      if (fromDate && e.occurred_on < fromDate) return false;
      if (toDate && e.occurred_on > toDate) return false;
      return true;
    });
  }, [rawEntries, fromDate, toDate]);

  // Derive effective refueling analytics data (prefer server calculation, fallback to client calculation)
  const effectiveRefuelingData = useMemo(() => {
    if (refuelingQuery.data && refuelingQuery.data.summary.totalCost !== null) {
      return refuelingQuery.data;
    }
    return computeClientRefuelingAnalytics(filteredEntries, activeVehicle, rawEntries);
  }, [refuelingQuery.data, filteredEntries, activeVehicle, rawEntries]);

  // Derive effective services analytics data (prefer server calculation, fallback to client calculation)
  const effectiveServicesData = useMemo(() => {
    if (servicesQuery.data && servicesQuery.data.summary.totalServiceCost !== null) {
      return servicesQuery.data;
    }
    return computeClientServicesAnalytics(filteredEntries, activeVehicle, rawEntries);
  }, [servicesQuery.data, filteredEntries, activeVehicle, rawEntries]);

  return (
    <div style={styles.container}>
      {/* 2. Tabs Switcher: General | Refueling | Services | Expenses */}
      <AnalyticsTabs currentTab={currentTab} onChange={handleTabChange} />

      {/* 3. Period Filter (1M, 3M, 6M, 1Y, All Time, Custom) */}
      <PeriodFilter
        currentPreset={currentPreset}
        from={fromDate}
        to={toDate}
        onChange={handlePeriodChange}
      />

      {/* 4. Tab Views */}
      {currentTab === 'refueling' && (
        <>
          {refuelingQuery.isLoading && !effectiveRefuelingData ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <CircularProgress sx={{ color: '#38bdf8' }} />
            </div>
          ) : (
            <RefuelingTabContent
              data={effectiveRefuelingData}
              vehicle={activeVehicle}
              isLoading={refuelingQuery.isFetching}
            />
          )}
        </>
      )}

      {currentTab === 'services' && (
        <>
          {servicesQuery.isLoading && !effectiveServicesData ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <CircularProgress sx={{ color: '#c8a0f0' }} />
            </div>
          ) : (
            <ServicesTabContent
              data={effectiveServicesData}
              vehicle={activeVehicle}
              isLoading={servicesQuery.isFetching}
            />
          )}
        </>
      )}

      {(currentTab === 'general') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          <TcoSummaryCard entries={filteredEntries} vehicle={activeVehicle} />
          <ConsumptionAnomalyBanner entries={rawEntries} vehicle={activeVehicle} />

          <div style={styles.grid}>
            <TravelDistanceCard entries={filteredEntries} vehicle={activeVehicle} />
            <CostDistributionCard entries={filteredEntries} />
            <SpendingTrendCard entries={filteredEntries} timeRange={currentPreset === 'all' ? 'all' : '6months'} />
            <EfficiencyTelemetryCard entries={filteredEntries} vehicle={activeVehicle} />
            <PriceVolatilityCard entries={filteredEntries} />
            {activeVehicle?.used_by_business && (
              <BusinessDeductibleCard entries={filteredEntries} vehicle={activeVehicle} />
            )}
            <OdometerProgressionCard entries={filteredEntries} vehicle={activeVehicle} />
          </div>
        </div>
      )}
    </div>
  );
}
