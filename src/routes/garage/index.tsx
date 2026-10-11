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
import { TelemetrySnapshotGrid } from '@/features/garage/components/TelemetrySnapshotGrid/TelemetrySnapshotGrid';

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

  // 2. Efficiency & Consumption Calculation for Hero Card
  // Sort entries descending by odometer (or occurred_on if odometer matches)
  const refuelEntries = entries
    .filter(
      (e) =>
        (e.kind === 'refuel' || e.kind === 'charge') &&
        e.odometer_m !== undefined &&
        (e.fuel_volume !== undefined || (e.amount_minor !== undefined && e.amount_minor > 0)),
    )
    .sort((a, b) => (b.odometer_m ?? 0) - (a.odometer_m ?? 0));

  let consumptionLPerKm: number | null = null; // Standardized L/km or kWh/km
  const isEv = activeVehicle.powertrain === 'ev';
  const efficiencyUnitSetting = activeVehicle.efficiency_unit || (isEv ? 'kwh100km' : 'l100km');

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
      }
    }
  }

  // Fallback nominal consumption if not enough refuels yet: ~6.5 L/100km or ~17 kWh/100km
  const effectiveConsumptionLPerKm =
    consumptionLPerKm ?? (isEv ? 0.17 : 0.065);

  // 3. Hero Card Approximations: Days since refuel, remaining fuel/energy %, and range
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
      <TelemetrySnapshotGrid vehicle={activeVehicle} entries={entries} />

      {/* 6. Recent Activity Feed — Hidden when empty */}
      {entries.length > 0 && <ActivityFeed entries={entries} />}
    </div>
  );
}
