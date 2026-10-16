import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { Vehicle } from '@/data/client/types';
import type { RefuelingAnalyticsResponseDto } from '../../../../api/_lib/analytics/types';
import { AnalyticsEmptyState } from '../shared/AnalyticsEmptyState';
import { DonutCard } from '../shared/DonutCard';
import { styles } from '../shared/glacier.styles';
import { KpiCard } from '../shared/KpiCard';
import { FuelPriceTrajectoryCard } from './FuelPriceTrajectoryCard';
import { GasStationsRankingCard } from './GasStationsRankingCard';
import { LastRefuelBenchmarkCard } from './LastRefuelBenchmarkCard';
import { MonthlyExpensesCard } from './MonthlyExpensesCard';
import { RefuelingRoutineCard } from './RefuelingRoutineCard';

interface Props {
  data?: RefuelingAnalyticsResponseDto;
  vehicle?: Vehicle;
  isLoading?: boolean;
  isAllTime?: boolean;
  onSelectAllPeriod?: () => void;
}

export const RefuelingTabContent = ({
  data,
  vehicle,
  isLoading,
  isAllTime = false,
  onSelectAllPeriod,
}: Props) => {
  const summary = data?.summary;
  const routine = data?.routine;
  const monthlyExpenses = data?.monthlyExpenses;
  const benchmark = data?.benchmark;
  const stations = data?.stations;
  const fuelTypes = data?.fuelTypes;
  const priceTrend = data?.priceTrend;

  const distanceUnit = vehicle?.distance_unit || 'km';
  const volumeUnit = 'L';
  const effUnit = vehicle?.efficiency_unit === 'mpg' ? 'MPG' : 'L/100km';
  const isKpiLoading = Boolean(isLoading || !data);

  const hasRecords = Boolean(
    summary && (summary.totalCost !== null || summary.totalVolumeLiters !== null),
  );

  if (!isKpiLoading && !hasRecords) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        <AnalyticsEmptyState
          icon={<LocalGasStationIcon sx={{ fontSize: 32 }} />}
          title={
            isAllTime ? 'No historical refueling records' : 'No refueling records in this period'
          }
          description={
            isAllTime
              ? 'No refueling entries have been logged for this vehicle yet. Once you add your first fuel entry, comprehensive telemetry, cost breakdowns, and consumption insights will appear here.'
              : 'There are no refueling records for the selected date range. Switch to "All Time" to view all historical fuel entries for this vehicle.'
          }
          isAllTime={isAllTime}
          onSelectAllPeriod={onSelectAllPeriod}
          accentColor="var(--mui-palette-primary-main)"
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Summary KPI Cards (2x2) */}
      <div style={styles.grid2x2}>
        <KpiCard
          title="Total Cost"
          icon={<AttachMoneyIcon sx={{ fontSize: 18 }} />}
          value={summary?.totalCost != null ? `$${summary.totalCost.toLocaleString()}` : null}
          isLoading={isKpiLoading}
          subMetrics={[
            {
              label: 'Per day',
              value: summary?.costPerDay != null ? `$${summary.costPerDay}` : null,
              highlightColor: 'cyan',
            },
            {
              label: `Per ${distanceUnit}`,
              value: summary?.costPerKm != null ? `$${summary.costPerKm}` : null,
              highlightColor: 'cyan',
            },
          ]}
        />

        <KpiCard
          title="Fuel Volume"
          icon={<LocalGasStationIcon sx={{ fontSize: 18 }} />}
          value={
            summary?.totalVolumeLiters != null
              ? `${summary.totalVolumeLiters.toLocaleString()}`
              : null
          }
          unit={volumeUnit}
          isLoading={isKpiLoading}
          subMetrics={[
            {
              label: 'Per refuel',
              value:
                summary?.volumePerRefuel != null
                  ? `${summary.volumePerRefuel} ${volumeUnit}`
                  : null,
            },
            {
              label: 'Per day',
              value: summary?.volumePerDay != null ? `${summary.volumePerDay} ${volumeUnit}` : null,
            },
          ]}
        />

        <KpiCard
          title={`Avg Price / ${volumeUnit}`}
          icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
          value={
            summary?.avgPricePerLiter != null ? `$${summary.avgPricePerLiter.toFixed(2)}` : null
          }
          isLoading={isKpiLoading}
          subMetrics={[
            {
              label: 'Min',
              value:
                summary?.minPricePerLiter != null
                  ? `$${summary.minPricePerLiter.toFixed(2)}`
                  : null,
              highlightColor: 'green',
            },
            {
              label: 'Max',
              value:
                summary?.maxPricePerLiter != null
                  ? `$${summary.maxPricePerLiter.toFixed(2)}`
                  : null,
              highlightColor: 'red',
            },
          ]}
        />

        <KpiCard
          title="Avg Efficiency"
          icon={<SpeedIcon sx={{ fontSize: 18 }} />}
          value={
            summary?.avgEfficiencyL100km != null
              ? `${summary.avgEfficiencyL100km.toFixed(2)}`
              : null
          }
          unit={effUnit}
          isLoading={isKpiLoading}
          valueColor="var(--mui-palette-primary-main)"
          subMetrics={[
            {
              label: 'Best',
              value:
                summary?.bestEfficiencyL100km != null
                  ? `${summary.bestEfficiencyL100km.toFixed(2)}`
                  : null,
              highlightColor: 'green',
            },
            {
              label: 'Worst',
              value:
                summary?.worstEfficiencyL100km != null
                  ? `${summary.worstEfficiencyL100km.toFixed(2)}`
                  : null,
              highlightColor: 'red',
            },
          ]}
        />
      </div>

      {/* 2. Refueling Routine Card */}
      {routine && (
        <RefuelingRoutineCard
          routine={routine}
          distanceUnit={distanceUnit}
          volumeUnit={volumeUnit}
        />
      )}

      {/* 3. Monthly Expenses Stacked Bar Chart */}
      {monthlyExpenses && <MonthlyExpensesCard data={monthlyExpenses} />}

      {/* 4. Last Refuel Benchmark */}
      {benchmark && (
        <LastRefuelBenchmarkCard
          benchmark={benchmark}
          efficiencyUnit={effUnit}
          distanceUnit={distanceUnit}
        />
      )}

      {/* 5. Gas Stations Ranking & Savings Insight */}
      {stations && <GasStationsRankingCard data={stations} volumeUnit={volumeUnit} />}

      {/* 6. Fuel Type Allocation Donut */}
      {fuelTypes && (
        <DonutCard
          title="Fuel Type Allocation"
          centerText={`${fuelTypes.totalLiters} ${volumeUnit}`}
          centerSubText="Total Volume"
          items={fuelTypes.items.map((i) => ({
            name: i.name,
            value: i.totalLiters,
            color: i.color,
            sharePercent: i.sharePercent,
            subLabel: `$${i.totalCost} • ${i.totalLiters} ${volumeUnit}`,
          }))}
        />
      )}

      {/* 7. Fuel Price Trajectory Area Chart */}
      {priceTrend && <FuelPriceTrajectoryCard data={priceTrend} volumeUnit={volumeUnit} />}
    </div>
  );
};
