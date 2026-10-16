import AutorenewIcon from '@mui/icons-material/Autorenew';
import LinearProgress from '@mui/material/LinearProgress';
import type { RefuelingRoutineDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

interface Props {
  routine: RefuelingRoutineDto;
  distanceUnit?: string;
  volumeUnit?: string;
}

export const RefuelingRoutineCard = ({ routine, distanceUnit = 'km' }: Props) => {
  const fullTankIndex = routine.fullTankIndexPercent ?? 100;

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <AutorenewIcon sx={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }} />
          <h4 style={styles.title}>Refueling Routine</h4>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'color-mix(in srgb, var(--mui-palette-primary-main) 15%, transparent)',
            color: 'var(--mui-palette-primary-main)',
            border:
              '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)',
          }}
        >
          {fullTankIndex}% Full-Tank Index
        </span>
      </div>

      {/* Routine 4 metrics in row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          padding: '12px 0',
          borderBottom: '1px solid var(--mui-palette-divider)',
          textAlign: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--mui-palette-text-primary)',
            }}
          >
            {routine.frequencyDays !== null ? `${routine.frequencyDays}d` : '—'}
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              color: 'var(--mui-palette-text-secondary)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            Frequency
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--mui-palette-text-primary)',
            }}
          >
            {routine.intervalKm !== null ? `${routine.intervalKm} ${distanceUnit}` : '—'}
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              color: 'var(--mui-palette-text-secondary)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            Interval
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--mui-palette-primary-main)',
            }}
          >
            {routine.currentRangeKm !== null ? `${routine.currentRangeKm} ${distanceUnit}` : '—'}
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              color: 'var(--mui-palette-text-secondary)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            Est. Range
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--mui-palette-tertiary-main)',
            }}
          >
            {routine.monthlyAverageSpend !== null ? `$${routine.monthlyAverageSpend}` : '—'}
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              color: 'var(--mui-palette-text-secondary)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            Monthly
          </div>
        </div>
      </div>

      {/* Full tank consistency progress bar */}
      <div style={{ marginTop: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            marginBottom: '6px',
          }}
        >
          <span style={{ color: 'var(--mui-palette-text-secondary)' }}>Full Tank Consistency</span>
          <span style={{ color: 'var(--mui-palette-primary-main)', fontWeight: 600 }}>
            {routine.fullTankRatioText}
          </span>
        </div>

        <LinearProgress
          variant="determinate"
          value={fullTankIndex}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'color-mix(in srgb, var(--mui-palette-text-primary) 8%, transparent)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'var(--mui-palette-primary-main)',
              borderRadius: 3,
            },
          }}
        />

        <div
          style={{
            fontSize: '0.65rem',
            color: 'var(--mui-palette-text-secondary)',
            marginTop: '8px',
            fontStyle: 'italic',
          }}
        >
          {routine.footnote}
        </div>
      </div>
    </div>
  );
};
