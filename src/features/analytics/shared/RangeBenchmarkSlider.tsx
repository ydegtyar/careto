import { styles } from './glacier.styles';

export interface RangeBenchmarkSliderProps {
  label: string;
  unit?: string;
  currentValue: number | null;
  minValue: number | null;
  avgValue: number | null;
  maxValue: number | null;
  lowerIsBetter?: boolean;
}

export function RangeBenchmarkSlider({
  label,
  unit,
  currentValue,
  minValue,
  avgValue,
  maxValue,
  lowerIsBetter = true,
}: RangeBenchmarkSliderProps) {
  if (currentValue === null || minValue === null || maxValue === null || minValue >= maxValue) {
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{label}</span>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>—</span>
        </div>
      </div>
    );
  }

  const range = maxValue - minValue;
  const clampedCurrent = Math.max(minValue, Math.min(maxValue, currentValue));
  const currentPercent = Math.round(((clampedCurrent - minValue) / range) * 100);
  const avgPercent = avgValue !== null ? Math.round(((avgValue - minValue) / range) * 100) : 50;

  // Determine marker color
  let markerColor = '#38bdf8'; // neutral cyan
  if (lowerIsBetter) {
    if (currentPercent < 35) markerColor = '#34d399'; // green (low consumption/cost)
    else if (currentPercent < 70) markerColor = '#fbbf24'; // amber
    else markerColor = '#f87171'; // red (high consumption/cost)
  } else {
    if (currentPercent > 65) markerColor = '#34d399';
    else if (currentPercent > 30) markerColor = '#fbbf24';
    else markerColor = '#f87171';
  }

  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--mui-palette-text-secondary)', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: markerColor }}>
            {currentValue.toFixed(2)}
          </span>
          {unit && <span style={{ fontSize: '0.75rem', color: 'var(--mui-palette-text-secondary)' }}>{unit}</span>}
        </div>
      </div>

      {/* Progress track */}
      <div
        style={{
          position: 'relative',
          height: '6px',
          background: 'color-mix(in srgb, var(--mui-palette-text-primary) 8%, transparent)',
          borderRadius: '4px',
          margin: '12px 0 16px',
        }}
      >
        {/* Average marker notch */}
        <div
          style={{
            position: 'absolute',
            left: `${avgPercent}%`,
            top: '-3px',
            width: '2px',
            height: '12px',
            backgroundColor: 'var(--mui-palette-text-secondary)',
            transform: 'translateX(-50%)',
            zIndex: 1,
          }}
        />

        {/* Current value pin */}
        <div
          style={{
            position: 'absolute',
            left: `${currentPercent}%`,
            top: '-5px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: markerColor,
            border: '2px solid var(--mui-palette-background-paper)',
            boxShadow: `0 0 10px ${markerColor}`,
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        />
      </div>

      {/* Min / Avg / Max labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--mui-palette-text-secondary)' }}>
        <span>Min: {minValue.toFixed(2)}</span>
        <span>Avg: {avgValue?.toFixed(2) ?? '—'}</span>
        <span>Max: {maxValue.toFixed(2)}</span>
      </div>
    </div>
  );
}
