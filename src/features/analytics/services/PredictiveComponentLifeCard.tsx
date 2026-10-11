import LinearProgress from '@mui/material/LinearProgress';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { PredictiveComponentLifeItemDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

export interface PredictiveComponentLifeCardProps {
  items: PredictiveComponentLifeItemDto[];
  distanceUnit?: string;
}

export function PredictiveComponentLifeCard({
  items,
  distanceUnit = 'km',
}: PredictiveComponentLifeCardProps) {
  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <PrecisionManufacturingIcon sx={{ fontSize: 18, color: '#7dd3fc' }} />
          <h4 style={styles.title}>Predictive Component Life</h4>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.2), rgba(56, 189, 248, 0.2))',
            color: '#c8a0f0',
            border: '1px solid rgba(192, 132, 252, 0.3)',
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 12 }} />
          <span>AI Forecast</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => {
          let progressColor = '#38bdf8'; // green/cyan (OK >= 60%)
          let badgeBg = 'rgba(56, 189, 248, 0.15)';
          let badgeColor = '#7dd3fc';

          if (item.status === 'due_soon') {
            progressColor = '#fbbf24'; // amber
            badgeBg = 'rgba(251, 191, 36, 0.15)';
            badgeColor = '#fbbf24';
          } else if (item.status === 'critical') {
            progressColor = '#f87171'; // red
            badgeBg = 'rgba(248, 113, 113, 0.15)';
            badgeColor = '#f87171';
          }

          return (
            <div
              key={item.id}
              style={{
                padding: '10px 12px',
                borderRadius: '14px',
                background: item.status === 'due_soon' ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${item.status === 'due_soon' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    {item.component}
                  </span>
                  {item.status === 'due_soon' && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: badgeBg,
                        color: badgeColor,
                        textTransform: 'uppercase',
                      }}
                    >
                      Due Soon
                    </span>
                  )}
                </div>

                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: progressColor }}>
                  {item.remainingPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <LinearProgress
                variant="determinate"
                value={item.remainingPercent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progressColor,
                    borderRadius: 3,
                  },
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                <span>{item.reason}</span>
                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                  ~{item.remainingKm.toLocaleString()} {distanceUnit} or {item.remainingDays} days left
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
