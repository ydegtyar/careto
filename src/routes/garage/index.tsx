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
  const { activeVehicleId } = useAppStore();

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

  // 4. Efficiency & Consumption Calculation
  // Sort entries descending by odometer (or occurred_on if odometer matches)
  const refuelEntries = entries
    .filter(
      (e) =>
        (e.kind === 'refuel' || e.kind === 'charge') &&
        e.odometer_m !== undefined &&
        (e.fuel_volume !== undefined || (e.amount_minor !== undefined && e.amount_minor > 0)),
    )
    .sort((a, b) => (b.odometer_m ?? 0) - (a.odometer_m ?? 0));

  let calculatedEfficiency: string = '-';
  let consumptionLPerKm: number | null = null; // Standardized L/km or kWh/km
  const isEv = activeVehicle.powertrain === 'ev';
  const efficiencyUnitSetting = activeVehicle.efficiency_unit || (isEv ? 'kwh100km' : 'l100km');

  // Friendly unit label mapping
  let efficiencyUnitLabel = 'L/100km';
  if (efficiencyUnitSetting === 'kwh100km' || efficiencyUnitSetting === 'kwh_100km') {
    efficiencyUnitLabel = 'kWh/100km';
  } else if (efficiencyUnitSetting === 'mpg') {
    efficiencyUnitLabel = 'MPG';
  } else if (efficiencyUnitSetting === 'l100km' || efficiencyUnitSetting === 'l_100km') {
    efficiencyUnitLabel = 'L/100km';
  } else {
    efficiencyUnitLabel = efficiencyUnitSetting;
  }

  if (refuelEntries.length >= 2 && refuelEntries[0] && refuelEntries[1]) {
    const latestRefuel = refuelEntries[0];
    const previousRefuel = refuelEntries[1];
    const deltaM = (latestRefuel.odometer_m ?? 0) - (previousRefuel.odometer_m ?? 0);

    if (deltaM > 0) {
      const distanceKm = deltaM / 1000;
      // Volume or Energy consumed during the interval (reported at the latest fill-up)
      const volumeLOrKwh = latestRefuel.fuel_volume ?? 0;

      if (volumeLOrKwh > 0) {
        consumptionLPerKm = volumeLOrKwh / distanceKm;
        if (efficiencyUnitSetting === 'mpg') {
          // 1 mile = 1.609344 km; 1 US gallon = 3.785411784 liters
          const miles = distanceKm / 1.609344;
          const gallons = volumeLOrKwh / 3.785411784;
          calculatedEfficiency = (miles / gallons).toFixed(1);
        } else {
          // Standard Metric consumption: volume per 100 km (or per 100 mi if distance_unit === 'mi')
          if (activeVehicle.distance_unit === 'mi') {
            const distanceMi = distanceKm / 1.609344;
            const per100Mi = (volumeLOrKwh / distanceMi) * 100;
            calculatedEfficiency = per100Mi.toFixed(1);
          } else {
            const per100Km = (volumeLOrKwh / distanceKm) * 100;
            calculatedEfficiency = per100Km.toFixed(1);
          }
        }
      }
    }
  }

  // Fallback nominal consumption if not enough refuels yet: ~6.5 L/100km or ~17 kWh/100km
  const effectiveConsumptionLPerKm =
    consumptionLPerKm ?? (isEv ? 0.17 : 0.065);

  // 5. Hero Card Approximations: Days since refuel, remaining fuel/energy %, and range
  const totalCapacityLOrKwh = isEv
    ? (activeVehicle.battery_wh ? activeVehicle.battery_wh / 1000 : 75)
    : (activeVehicle.tank_ml ? activeVehicle.tank_ml / 1000 : 55);

  let approxFuelPercent: number | undefined = undefined;
  let approxRange: number | undefined = undefined;
  let daysSinceRefuel: number | null = null;
  const tankPercentages: Record<string, number> = {};

  const latestRefuelEntry = refuelEntries[0];

  if (latestRefuelEntry) {
    if (latestRefuelEntry.occurred_on) {
      const lastRefuelTime = new Date(latestRefuelEntry.occurred_on).getTime();
      const nowTime = new Date().getTime();
      const diffDays = Math.max(0, Math.floor((nowTime - lastRefuelTime) / (1000 * 60 * 60 * 24)));
      daysSinceRefuel = diffDays;
    }

    const odoAtLastRefuelM = latestRefuelEntry.odometer_m ?? currentOdometerM;
    const distanceDrivenSinceRefuelKm = Math.max(0, (currentOdometerM - odoAtLastRefuelM) / 1000);

    const initialFuelAtFill = latestRefuelEntry.is_full_tank !== false
      ? totalCapacityLOrKwh
      : Math.min(totalCapacityLOrKwh, (latestRefuelEntry.fuel_volume ?? totalCapacityLOrKwh));

    const fuelConsumed = distanceDrivenSinceRefuelKm * effectiveConsumptionLPerKm;
    const remainingFuel = Math.max(0, Math.min(totalCapacityLOrKwh, initialFuelAtFill - fuelConsumed));

    approxFuelPercent = Math.min(100, Math.max(0, (remainingFuel / totalCapacityLOrKwh) * 100));

    // Range in vehicle distance_unit
    const remainingRangeKm = effectiveConsumptionLPerKm > 0 ? remainingFuel / effectiveConsumptionLPerKm : 0;
    approxRange =
      activeVehicle.distance_unit === 'mi'
        ? remainingRangeKm / 1.609344
        : remainingRangeKm;

    if (activeVehicle.tanks && activeVehicle.tanks.length > 0) {
      for (const tank of activeVehicle.tanks) {
        tankPercentages[tank.id] = approxFuelPercent;
      }
    }
  } else {
    // If no refuel entry recorded at all, approximate based on distance since vehicle initial odometer
    const distFromInitialKm = Math.max(0, (currentOdometerM - (activeVehicle.initial_odometer_m || 0)) / 1000);
    const fuelConsumed = distFromInitialKm * effectiveConsumptionLPerKm;
    const remainingFuel = Math.max(0, Math.min(totalCapacityLOrKwh, totalCapacityLOrKwh - fuelConsumed));
    approxFuelPercent = Math.min(100, Math.max(0, (remainingFuel / totalCapacityLOrKwh) * 100));

    const remainingRangeKm = effectiveConsumptionLPerKm > 0 ? remainingFuel / effectiveConsumptionLPerKm : 0;
    approxRange =
      activeVehicle.distance_unit === 'mi'
        ? remainingRangeKm / 1.609344
        : remainingRangeKm;

    if (activeVehicle.tanks && activeVehicle.tanks.length > 0) {
      for (const tank of activeVehicle.tanks) {
        tankPercentages[tank.id] = approxFuelPercent;
      }
    }
  }

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
      <VehicleHeroCard
        vehicle={activeVehicle}
        fuelOrBatteryPercent={approxFuelPercent}
        rangeKm={approxRange}
        daysSinceRefuel={daysSinceRefuel}
        tankPercentages={tankPercentages}
      />

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
          value={calculatedEfficiency}
          unit={efficiencyUnitLabel}
        />
      </div>

      {/* 6. Recent Activity Feed — Hidden when empty */}
      {entries.length > 0 && <ActivityFeed entries={entries} />}
    </div>
  );
}
