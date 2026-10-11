import TuneIcon from '@mui/icons-material/Tune';
import type { RefuelBenchmarkDto } from '../../../../api/_lib/analytics/types';
import { RangeBenchmarkSlider } from '../shared/RangeBenchmarkSlider';
import { styles } from '../shared/glacier.styles';

export interface LastRefuelBenchmarkCardProps {
  benchmark: RefuelBenchmarkDto;
  efficiencyUnit?: string;
  distanceUnit?: string;
}

export function LastRefuelBenchmarkCard({
  benchmark,
  efficiencyUnit = 'L/100km',
  distanceUnit = 'km',
}: LastRefuelBenchmarkCardProps) {
  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <TuneIcon sx={{ fontSize: 18, color: '#7dd3fc' }} />
          <h4 style={styles.title}>Last Refuel Benchmark</h4>
        </div>

        {benchmark.lastRefuelOdometerKm !== null && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Tank 1 ({benchmark.lastRefuelOdometerKm.toLocaleString()} {distanceUnit})
          </span>
        )}
      </div>

      <RangeBenchmarkSlider
        label="Efficiency"
        unit={efficiencyUnit}
        currentValue={benchmark.efficiencyL100km}
        minValue={benchmark.minEfficiencyL100km}
        avgValue={benchmark.avgEfficiencyL100km}
        maxValue={benchmark.maxEfficiencyL100km}
        lowerIsBetter={true}
      />

      <RangeBenchmarkSlider
        label="Cost per Distance"
        unit={`$/${distanceUnit}`}
        currentValue={benchmark.costPerKm}
        minValue={benchmark.minCostPerKm}
        avgValue={benchmark.avgCostPerKm}
        maxValue={benchmark.maxCostPerKm}
        lowerIsBetter={true}
      />
    </div>
  );
}
