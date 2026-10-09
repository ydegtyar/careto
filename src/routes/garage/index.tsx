import CircularProgress from '@mui/material/CircularProgress';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import { useAppStore } from '@/app/store';
import { ActivityFeed } from '@/features/garage/components/ActivityFeed/ActivityFeed';
import { QuickActions } from '@/features/garage/components/QuickActions/QuickActions';
import { ReminderAlertStrip } from '@/features/garage/components/ReminderAlertStrip/ReminderAlertStrip';
import { VehicleHeroCard } from '@/features/garage/components/VehicleHeroCard/VehicleHeroCard';
import {
  entriesQueryOptions,
  remindersQueryOptions,
  vehiclesQueryOptions,
} from '@/features/garage/queries/vehicles';
import { StatCard } from '@/shared/ui/StatCard/StatCard';

const EmptyVehicleState = React.lazy(
  () => import('@/features/garage/components/EmptyVehicleState/EmptyVehicleState'),
);

export const Route = createFileRoute('/garage/')({
  component: GaragePage,
});

function GaragePage() {
  const { activeVehicleId, setActiveVehicleId } = useAppStore();

  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery(vehiclesQueryOptions());
  const { data: entries = [] } = useQuery(entriesQueryOptions(activeVehicleId ?? undefined));
  const { data: reminders = [] } = useQuery(remindersQueryOptions(activeVehicleId ?? undefined));

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  if (loadingVehicles) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}
      >
        <CircularProgress sx={{ color: 'primary.main' }} />
      </div>
    );
  }

  if (!activeVehicle) {
    return (
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '60vh',
            }}
          >
            <CircularProgress sx={{ color: 'primary.main' }} />
          </div>
        }
      >
        <EmptyVehicleState />
      </Suspense>
    );
  }

  // --- Real Telemetry Calculations ---
  // 1. Latest Odometer
  const maxEntryOdo = entries.reduce(
    (max, e) => (e.odometer_m && e.odometer_m > max ? e.odometer_m : max),
    0,
  );
  const currentOdometerM = maxEntryOdo || activeVehicle.initial_odometer_m || 0;
  const odometerDisplay = currentOdometerM > 0 ? (currentOdometerM / 1000).toLocaleString() : '0';

  // 2. This Month's Spending
  const currentYearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthEntries = entries.filter((e) => e.occurred_on?.startsWith(currentYearMonth));
  const thisMonthSpentMinor = thisMonthEntries.reduce(
    (sum, e) => sum + (e.usd_minor ?? e.amount_minor ?? 0),
    0,
  );
  const thisMonthSpentDisplay =
    thisMonthSpentMinor > 0 ? `$${(thisMonthSpentMinor / 100).toFixed(0)}` : '$0';

  // 3. Avg Cost per Distance Unit
  const totalSpentMinor = entries.reduce((sum, e) => sum + (e.usd_minor ?? e.amount_minor ?? 0), 0);
  const distanceCoveredM = currentOdometerM - (activeVehicle.initial_odometer_m || 0);
  const distanceCoveredKm = distanceCoveredM > 0 ? distanceCoveredM / 1000 : 0;
  const avgCostPerKmDisplay =
    distanceCoveredKm > 0 && totalSpentMinor > 0
      ? `$${(totalSpentMinor / 100 / distanceCoveredKm).toFixed(2)}`
      : '$0.00';

  // 4. Efficiency
  const isEv = activeVehicle.powertrain === 'ev';
  const defaultEfficiency = isEv ? '18.2' : '7.5';
  const _defaultEfficiencyUnit = isEv ? 'kWh/100km' : 'L/100km';

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 2. Vehicle Hero Card with Energy Progress */}
      <VehicleHeroCard vehicle={activeVehicle} />

      {/* 3. Reminder Alert Strip if any upcoming/due */}
      <ReminderAlertStrip reminders={reminders} currentOdometerM={currentOdometerM} />

      {/* 4. Quick Actions 4-tile row */}
      <QuickActions vehicle={activeVehicle} />

      {/* 5. Telemetry Snapshot Grid (2 cols on mobile, 4 cols on desktop) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        <StatCard label="Odometer" value={odometerDisplay} unit={activeVehicle.distance_unit} />
        <StatCard
          label="This Month"
          value={thisMonthSpentDisplay}
          trend={thisMonthEntries.length > 0 ? `${thisMonthEntries.length} entries` : 'No entries'}
        />
        <StatCard
          label="Avg Cost"
          value={avgCostPerKmDisplay}
          unit={`/${activeVehicle.distance_unit}`}
        />
        <StatCard
          label="Efficiency"
          value={defaultEfficiency}
          unit={activeVehicle.efficiency_unit === 'kwh100km' ? 'kWh/100km' : 'L/100km'}
        />
      </div>

      {/* 6. Recent Activity Feed — Hidden when empty */}
      {entries.length > 0 && <ActivityFeed entries={entries} />}
    </div>
  );
}
