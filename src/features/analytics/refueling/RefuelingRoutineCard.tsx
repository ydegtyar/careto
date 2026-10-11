import LinearProgress from '@mui/material/LinearProgress';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import type { RefuelingRoutineDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

export interface RefuelingRoutineCardProps {
  routine: RefuelingRoutineDto;
  distanceUnit?: string;
  volumeUnit?: string;
}

export function RefuelingRoutineCard({
  routine,
  distanceUnit = 'km',
}: RefuelingRoutineCardProps) {
  const fullTankIndex = routine.fullTankIndexPercent ?? 100;

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <AutorenewIcon sx={{ fontSize: 18, color: '#7dd3fc' }} />
          <h4 style={styles.title}>Refueling Routine</h4>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#7dd3fc',
            border: '1px solid rgba(56, 189, 248, 0.3)',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            {routine.frequencyDays !== null ? `${routine.frequencyDays}d` : '—'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>
            Frequency
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            {routine.intervalKm !== null ? `${routine.intervalKm} ${distanceUnit}` : '—'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>
            Interval
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>
            {routine.currentRangeKm !== null ? `${routine.currentRangeKm} ${distanceUnit}` : '—'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>
            Est. Range
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#c8a0f0' }}>
            {routine.monthlyAverageSpend !== null ? `$${routine.monthlyAverageSpend}` : '—'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>
            Monthly
          </div>
        </div>
      </div>

      {/* Full tank consistency progress bar */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
          <span style={{ color: '#94a3b8' }}>Full Tank Consistency</span>
          <span style={{ color: '#7dd3fc', fontWeight: 600 }}>{routine.fullTankRatioText}</span>
        </div>

        <LinearProgress
          variant="determinate"
          value={fullTankIndex}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#38bdf8',
              borderRadius: 3,
            },
          }}
        />

        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
          {routine.footnote}
        </div>
      </div>
    </div>
  );
}
