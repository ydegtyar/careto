import type React from 'react';
import { useMemo } from 'react';
import type { Entry, Vehicle } from '@/data/client/types';
import { StatCard } from '@/shared/ui/StatCard/StatCard';
import { styles } from './TelemetrySnapshotGrid.styles';

export interface Props {
  vehicle: Vehicle;
  entries: Entry[];
}

export const TelemetrySnapshotGrid: React.FC<Props> = ({ vehicle, entries }) => {
  const telemetry = useMemo(() => {
    // 1. Latest Odometer
    const maxEntryOdo = entries.reduce(
      (max, e) => (e.odometer_m && e.odometer_m > max ? e.odometer_m : max),
      0,
    );
    const currentOdometerM = maxEntryOdo || vehicle.initial_odometer_m || 0;
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
    const thisMonthTrend =
      thisMonthEntries.length > 0 ? `${thisMonthEntries.length} entries` : 'No entries';

    // 3. Avg Cost per Distance Unit
    const totalSpentMinor = entries.reduce(
      (sum, e) => sum + (e.usd_minor ?? e.amount_minor ?? 0),
      0,
    );
    const distanceCoveredM = currentOdometerM - (vehicle.initial_odometer_m || 0);
    const distanceCoveredKm = distanceCoveredM > 0 ? distanceCoveredM / 1000 : 0;
    const avgCostPerKmDisplay =
      distanceCoveredKm > 0 && totalSpentMinor > 0
        ? `$${(totalSpentMinor / 100 / distanceCoveredKm).toFixed(2)}`
        : '$0.00';

    // 4. Efficiency & Consumption Calculation
    const refuelEntries = entries
      .filter(
        (e) =>
          (e.kind === 'refuel' || e.kind === 'charge') &&
          e.odometer_m !== undefined &&
          (e.fuel_volume !== undefined || (e.amount_minor !== undefined && e.amount_minor > 0)),
      )
      .sort((a, b) => (b.odometer_m ?? 0) - (a.odometer_m ?? 0));

    let calculatedEfficiency = '-';
    const isEv = vehicle.powertrain === 'ev';
    const efficiencyUnitSetting = vehicle.efficiency_unit || (isEv ? 'kwh100km' : 'l100km');

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
        const volumeLOrKwh = latestRefuel.fuel_volume ?? 0;

        if (volumeLOrKwh > 0) {
          if (efficiencyUnitSetting === 'mpg') {
            const miles = distanceKm / 1.609344;
            const gallons = volumeLOrKwh / 3.785411784;
            calculatedEfficiency = (miles / gallons).toFixed(1);
          } else if (vehicle.distance_unit === 'mi') {
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

    return {
      odometerDisplay,
      thisMonthSpentDisplay,
      thisMonthTrend,
      avgCostPerKmDisplay,
      calculatedEfficiency,
      efficiencyUnitLabel,
    };
  }, [vehicle, entries]);

  return (
    <div style={styles.grid}>
      <StatCard label="Odometer" value={telemetry.odometerDisplay} unit={vehicle.distance_unit} />
      <StatCard
        label="This Month"
        value={telemetry.thisMonthSpentDisplay}
        trend={telemetry.thisMonthTrend}
      />
      <StatCard
        label="Avg Cost"
        value={telemetry.avgCostPerKmDisplay}
        unit={`/${vehicle.distance_unit}`}
      />
      <StatCard
        label="Efficiency"
        value={telemetry.calculatedEfficiency}
        unit={telemetry.efficiencyUnitLabel}
      />
    </div>
  );
};

export default TelemetrySnapshotGrid;
