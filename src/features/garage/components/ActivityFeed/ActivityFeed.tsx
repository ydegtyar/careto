import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SpeedIcon from '@mui/icons-material/Speed';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useAppStore } from '@/app/store';
import type { Entry } from '@/data/client/types';
import { computeCategoryDistribution } from '@/features/analytics/lib/analytics-math';
import { vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import styles from './ActivityFeed.module.scss';
import { ActivityItemRow } from './ActivityItemRow';
import { MonthlySummaryCard, type MonthlyStats } from './MonthlySummaryCard';

type Props = {
  entries: Entry[];
};

export type EntryRecord = Entry;

function getPreviousMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number.parseInt(yearStr || '0', 10);
  const month = Number.parseInt(monthStr || '1', 10);
  if (!year || !month) return '';

  const prevDate = new Date(year, month - 2, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
  return `${prevYear}-${prevMonth}`;
}

export const ActivityFeed = ({ entries }: Props) => {
  const navigate = useNavigate();
  const { activeVehicleId } = useAppStore();
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = a.occurred_on + (a.occurred_time ? `T${a.occurred_time}` : '');
      const dateB = b.occurred_on + (b.occurred_time ? `T${b.occurred_time}` : '');
      return dateB.localeCompare(dateA);
    });
  }, [entries]);

  // Pre-calculate consumption for refuel/charge entries relative to their previous refuel/charge
  const consumptionMap = useMemo(() => {
    const map = new Map<string, string>();
    const isEv = activeVehicle?.powertrain === 'ev';
    const effUnit = activeVehicle?.efficiency_unit || (isEv ? 'kwh100km' : 'l100km');
    const unitLabel =
      effUnit === 'kwh100km' || effUnit === 'kwh_100km'
        ? 'kWh/100km'
        : effUnit === 'mpg'
          ? 'MPG'
          : effUnit === 'l100km' || effUnit === 'l_100km'
            ? 'L/100km'
            : effUnit;

    // Filter all refuel & charge entries that have odometer reading
    const refuels = [...entries]
      .filter((e) => (e.kind === 'refuel' || e.kind === 'charge') && e.odometer_m !== undefined)
      .sort((a, b) => {
        const odoDiff = (a.odometer_m ?? 0) - (b.odometer_m ?? 0);
        if (odoDiff !== 0) return odoDiff;
        const dateA = a.occurred_on + (a.occurred_time ? `T${a.occurred_time}` : '');
        const dateB = b.occurred_on + (b.occurred_time ? `T${b.occurred_time}` : '');
        return dateA.localeCompare(dateB);
      });

    for (let i = 1; i < refuels.length; i++) {
      const current = refuels[i];
      const previous = refuels[i - 1];
      if (!current || !previous) continue;

      const deltaM = (current.odometer_m ?? 0) - (previous.odometer_m ?? 0);
      const volume = current.fuel_volume ?? 0;

      if (deltaM > 0 && volume > 0) {
        const distanceKm = deltaM / 1000;
        let formattedEff: string;
        if (effUnit === 'mpg') {
          const miles = distanceKm / 1.609344;
          const gallons = volume / 3.785411784;
          formattedEff = `${(miles / gallons).toFixed(1)} ${unitLabel}`;
        } else if (activeVehicle?.distance_unit === 'mi') {
          const distanceMi = distanceKm / 1.609344;
          const per100Mi = (volume / distanceMi) * 100;
          formattedEff = `${per100Mi.toFixed(1)} ${unitLabel}`;
        } else {
          const per100Km = (volume / distanceKm) * 100;
          formattedEff = `${per100Km.toFixed(1)} ${unitLabel}`;
        }
        map.set(current.id, formattedEff);
      }
    }

    return map;
  }, [entries, activeVehicle]);

  // Compute monthly stats for every month present in the entries
  const monthlyStatsMap = useMemo(() => {
    const isEv = activeVehicle?.powertrain === 'ev';
    const isMiles = activeVehicle?.distance_unit === 'mi';
    const distanceUnit = isMiles ? 'mi' : 'km';
    const effUnit = activeVehicle?.efficiency_unit || (isEv ? 'kwh100km' : 'l100km');
    const consumptionUnit =
      effUnit === 'kwh100km' || effUnit === 'kwh_100km'
        ? 'kWh/100km'
        : effUnit === 'mpg'
          ? 'MPG'
          : 'L/100km';

    // 1. Group entries by YYYY-MM
    const monthGroups = new Map<string, Entry[]>();
    for (const e of entries) {
      if (!e.occurred_on) continue;
      const monthKey = e.occurred_on.slice(0, 7);
      const list = monthGroups.get(monthKey) ?? [];
      list.push(e);
      monthGroups.set(monthKey, list);
    }

    // 2. Pre-sort all odometer-bearing entries chronologically to compute inter-month or within-month deltas accurately
    const odoEntries = [...entries]
      .filter((e) => typeof e.odometer_m === 'number')
      .sort((a, b) => {
        const dateA = a.occurred_on + (a.occurred_time ? `T${a.occurred_time}` : '');
        const dateB = b.occurred_on + (b.occurred_time ? `T${b.occurred_time}` : '');
        const cmp = dateA.localeCompare(dateB);
        if (cmp !== 0) return cmp;
        return (a.odometer_m ?? 0) - (b.odometer_m ?? 0);
      });

    // 3. Compute raw totals per month
    interface MonthRaw {
      monthKey: string;
      totalUsdMinor: number;
      primaryCurrency: string;
      primaryCurrencyMinor: number;
      hasPrimaryCurrency: boolean;
      mileage: number;
      avgConsumption: string;
    }

    const rawMap = new Map<string, MonthRaw>();

    for (const [monthKey, monthEntries] of monthGroups.entries()) {
      // Mileage: difference between max and min odometer in the month, or against prior odometer if only 1 entry
      let minOdoInMonth: number | null = null;
      let maxOdoInMonth: number | null = null;

      for (const e of monthEntries) {
        if (typeof e.odometer_m === 'number') {
          if (minOdoInMonth === null || e.odometer_m < minOdoInMonth) {
            minOdoInMonth = e.odometer_m;
          }
          if (maxOdoInMonth === null || e.odometer_m > maxOdoInMonth) {
            maxOdoInMonth = e.odometer_m;
          }
        }
      }

      let deltaM = 0;
      if (minOdoInMonth !== null && maxOdoInMonth !== null && maxOdoInMonth > minOdoInMonth) {
        deltaM = maxOdoInMonth - minOdoInMonth;
      } else if (maxOdoInMonth !== null) {
        // Find previous reading before this month
        const prevOdoEntry = [...odoEntries]
          .reverse()
          .find((e) => (e.occurred_on || '').slice(0, 7) < monthKey);
        if (prevOdoEntry && typeof prevOdoEntry.odometer_m === 'number' && maxOdoInMonth > prevOdoEntry.odometer_m) {
          deltaM = maxOdoInMonth - prevOdoEntry.odometer_m;
        }
      }

      const distanceKm = deltaM / 1000;
      const mileage = isMiles ? Math.round(distanceKm / 1.609344) : Math.round(distanceKm);

      // Total Cost
      let totalUsdMinor = 0;
      let primaryCurrency = '';
      let primaryCurrencyMinor = 0;
      let hasSingleCurrency = true;

      for (const e of monthEntries) {
        const amt = e.amount_minor ?? 0;
        const usdAmt = e.usd_minor ?? amt;
        totalUsdMinor += usdAmt;

        if (e.currency) {
          if (!primaryCurrency) {
            primaryCurrency = e.currency;
          } else if (primaryCurrency !== e.currency) {
            hasSingleCurrency = false;
          }
        }
        if (primaryCurrency && e.currency === primaryCurrency) {
          primaryCurrencyMinor += amt;
        }
      }

      // Average Consumption for the month
      let totalFuelVolume = 0;
      for (const e of monthEntries) {
        if ((e.kind === 'refuel' || e.kind === 'charge') && typeof e.fuel_volume === 'number') {
          totalFuelVolume += e.fuel_volume;
        }
      }

      let avgConsumption = '-';
      if (distanceKm > 0 && totalFuelVolume > 0) {
        if (effUnit === 'mpg') {
          const miles = distanceKm / 1.609344;
          const gallons = totalFuelVolume / 3.785411784;
          avgConsumption = (miles / gallons).toFixed(1);
        } else if (isMiles) {
          const distanceMi = distanceKm / 1.609344;
          avgConsumption = ((totalFuelVolume / distanceMi) * 100).toFixed(1);
        } else {
          avgConsumption = ((totalFuelVolume / distanceKm) * 100).toFixed(1);
        }
      }

      rawMap.set(monthKey, {
        monthKey,
        totalUsdMinor,
        primaryCurrency: hasSingleCurrency ? primaryCurrency : 'USD',
        primaryCurrencyMinor: hasSingleCurrency ? primaryCurrencyMinor : totalUsdMinor,
        hasPrimaryCurrency: Boolean(primaryCurrency),
        mileage,
        avgConsumption,
      });
    }

    // 4. Build finalized MonthlyStats including previous-month comparison
    const finalMap = new Map<string, MonthlyStats>();

    for (const [monthKey, raw] of rawMap.entries()) {
      const [y = '2026', m = '01'] = monthKey.split('-');
      const d = new Date(Number.parseInt(y, 10), Number.parseInt(m, 10) - 1, 1);
      const monthLabel = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      // Cost format
      let totalCostFormatted = '$0.00';
      if (raw.primaryCurrency && raw.primaryCurrencyMinor > 0) {
        totalCostFormatted = `${(raw.primaryCurrencyMinor / 100).toFixed(2)} ${raw.primaryCurrency}`;
      } else if (raw.totalUsdMinor > 0) {
        totalCostFormatted = `$${(raw.totalUsdMinor / 100).toFixed(2)}`;
      }

      // Comparison with previous month
      const prevKey = getPreviousMonthKey(monthKey);
      const prevRaw = rawMap.get(prevKey);
      let costDiffPercent: number | null = null;

      if (prevRaw && prevRaw.totalUsdMinor > 0) {
        const diff = raw.totalUsdMinor - prevRaw.totalUsdMinor;
        costDiffPercent = Math.round((diff / prevRaw.totalUsdMinor) * 100);
      } else if (prevRaw && prevRaw.totalUsdMinor === 0 && raw.totalUsdMinor > 0) {
        costDiffPercent = 100;
      }

      // Cost Category Breakdown
      const currentMonthEntries = monthGroups.get(monthKey) ?? [];
      const categoryBreakdown = computeCategoryDistribution(currentMonthEntries);

      finalMap.set(monthKey, {
        monthKey,
        monthLabel,
        mileage: raw.mileage,
        distanceUnit,
        avgConsumption: raw.avgConsumption,
        consumptionUnit,
        totalCostFormatted,
        costDiffPercent,
        categoryBreakdown,
      });
    }

    return finalMap;
  }, [entries, activeVehicle]);

  // Group sorted entries by month so each month group renders its summary card first
  const groupedByMonth = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const entry of sortedEntries) {
      const monthKey = entry.occurred_on ? entry.occurred_on.slice(0, 7) : 'other';
      const list = map.get(monthKey) ?? [];
      list.push(entry);
      map.set(monthKey, list);
    }
    return Array.from(map.entries());
  }, [sortedEntries]);

  const getIcon = (kind: string) => {
    switch (kind) {
      case 'refuel':
      case 'charge':
        return <LocalGasStationIcon sx={{ fontSize: 18 }} />;
      case 'service':
        return <BuildIcon sx={{ fontSize: 18 }} />;
      case 'odometer':
        return <SpeedIcon sx={{ fontSize: 18 }} />;
      case 'note':
        return <StickyNote2Icon sx={{ fontSize: 18 }} />;
      default:
        return <ReceiptIcon sx={{ fontSize: 18 }} />;
    }
  };

  const handleOpenDetail = (entry: Entry) => {
    navigate({ to: `/entries/${entry.id}` });
  };

  const isEv = activeVehicle?.powertrain === 'ev';
  const isMiles = activeVehicle?.distance_unit === 'mi';
  const defaultVolumeUnit = isEv ? 'kWh' : 'L';
  const defaultDistanceUnit = isMiles ? 'mi' : 'km';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Recent Activity
        </Typography>
      </div>

      <div className={styles.list}>
        {sortedEntries.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
            No recent activity recorded yet.
          </Typography>
        ) : (
          groupedByMonth.map(([monthKey, monthEntries]) => {
            const monthStats = monthlyStatsMap.get(monthKey);

            return (
              <div key={monthKey} className={styles.monthSection}>
                {monthStats && <MonthlySummaryCard stats={monthStats} />}
                {monthEntries.map((entry) => (
                  <ActivityItemRow
                    key={entry.id}
                    entry={entry}
                    consumption={consumptionMap.get(entry.id)}
                    volumeUnit={defaultVolumeUnit}
                    distanceUnit={defaultDistanceUnit}
                    onOpen={handleOpenDetail}
                    getIcon={getIcon}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

