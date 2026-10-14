import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import type { Vehicle } from '@/data/client/types';
import type { RefuelingAnalyticsResponseDto } from '../../../../api/_lib/analytics/types';
import { KpiCard } from '../shared/KpiCard';
import { DonutCard } from '../shared/DonutCard';
import { RefuelingRoutineCard } from './RefuelingRoutineCard';
import { MonthlyExpensesCard } from './MonthlyExpensesCard';
import { LastRefuelBenchmarkCard } from './LastRefuelBenchmarkCard';
import { GasStationsRankingCard } from './GasStationsRankingCard';
import { FuelPriceTrajectoryCard } from './FuelPriceTrajectoryCard';
import { NewFuelEntryStickyCta } from './NewFuelEntryStickyCta';
import { styles } from '../shared/glacier.styles';

export interface RefuelingTabContentProps {
  data: RefuelingAnalyticsResponseDto;
  vehicle?: Vehicle;
  isLoading?: boolean;
}

export function RefuelingTabContent({ data, vehicle, isLoading }: RefuelingTabContentProps) {
  const { summary, routine, monthlyExpenses, benchmark, stations, fuelTypes, priceTrend } = data;

  const distanceUnit = vehicle?.distance_unit || 'km';
  const volumeUnit = 'L';
  const effUnit = vehicle?.efficiency_unit === 'mpg' ? 'MPG' : 'L/100km';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Summary KPI Cards (2x2) */}
      <div style={styles.grid2x2}>
        <KpiCard
          title="Total Cost"
          icon={<AttachMoneyIcon sx={{ fontSize: 18 }} />}
          value={summary.totalCost !== null ? `$${summary.totalCost.toLocaleString()}` : null}
          isLoading={isLoading}
          subMetrics={[
            { label: 'Per day', value: summary.costPerDay !== null ? `$${summary.costPerDay}` : null, highlightColor: 'cyan' },
            { label: `Per ${distanceUnit}`, value: summary.costPerKm !== null ? `$${summary.costPerKm}` : null, highlightColor: 'cyan' },
          ]}
        />

        <KpiCard
          title="Fuel Volume"
          icon={<LocalGasStationIcon sx={{ fontSize: 18 }} />}
          value={summary.totalVolumeLiters !== null ? `${summary.totalVolumeLiters.toLocaleString()}` : null}
          unit={volumeUnit}
          isLoading={isLoading}
          subMetrics={[
            { label: 'Per refuel', value: summary.volumePerRefuel !== null ? `${summary.volumePerRefuel} ${volumeUnit}` : null },
            { label: 'Per day', value: summary.volumePerDay !== null ? `${summary.volumePerDay} ${volumeUnit}` : null },
          ]}
        />

        <KpiCard
          title={`Avg Price / ${volumeUnit}`}
          icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
          value={summary.avgPricePerLiter !== null ? `$${summary.avgPricePerLiter.toFixed(2)}` : null}
          isLoading={isLoading}
          subMetrics={[
            { label: 'Min', value: summary.minPricePerLiter !== null ? `$${summary.minPricePerLiter.toFixed(2)}` : null, highlightColor: 'green' },
            { label: 'Max', value: summary.maxPricePerLiter !== null ? `$${summary.maxPricePerLiter.toFixed(2)}` : null, highlightColor: 'red' },
          ]}
        />

        <KpiCard
          title="Avg Efficiency"
          icon={<SpeedIcon sx={{ fontSize: 18 }} />}
          value={summary.avgEfficiencyL100km !== null ? `${summary.avgEfficiencyL100km.toFixed(2)}` : null}
          unit={effUnit}
          isLoading={isLoading}
          valueColor="var(--mui-palette-primary-main)"
          subMetrics={[
            { label: 'Best', value: summary.bestEfficiencyL100km !== null ? `${summary.bestEfficiencyL100km.toFixed(2)}` : null, highlightColor: 'green' },
            { label: 'Worst', value: summary.worstEfficiencyL100km !== null ? `${summary.worstEfficiencyL100km.toFixed(2)}` : null, highlightColor: 'red' },
          ]}
        />
      </div>

      {/* 2. Refueling Routine Card */}
      <RefuelingRoutineCard routine={routine} distanceUnit={distanceUnit} volumeUnit={volumeUnit} />

      {/* 3. Monthly Expenses Stacked Bar Chart */}
      <MonthlyExpensesCard data={monthlyExpenses} />

      {/* 4. Last Refuel Benchmark */}
      <LastRefuelBenchmarkCard benchmark={benchmark} efficiencyUnit={effUnit} distanceUnit={distanceUnit} />

      {/* 5. Gas Stations Ranking & Savings Insight */}
      <GasStationsRankingCard data={stations} volumeUnit={volumeUnit} />

      {/* 6. Fuel Type Allocation Donut */}
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

      {/* 7. Fuel Price Trajectory Area Chart */}
      <FuelPriceTrajectoryCard data={priceTrend} volumeUnit={volumeUnit} />

    </div>
  );
}
