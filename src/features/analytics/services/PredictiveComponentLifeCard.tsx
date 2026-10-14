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
          <PrecisionManufacturingIcon sx={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }} />
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
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-tertiary-main) 20%, transparent), color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent))',
            color: 'var(--mui-palette-tertiary-main)',
            border: '1px solid color-mix(in srgb, var(--mui-palette-tertiary-main) 30%, transparent)',
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 12 }} />
          <span>AI Forecast</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => {
          let progressColor = 'var(--mui-palette-primary-main)'; // green/cyan (OK >= 60%)
          let badgeBg = 'color-mix(in srgb, var(--mui-palette-primary-main) 15%, transparent)';
          let badgeColor = 'var(--mui-palette-primary-main)';

          if (item.status === 'due_soon') {
            progressColor = '#f59e0b'; // amber
            badgeBg = 'rgba(245, 158, 11, 0.15)';
            badgeColor = '#f59e0b';
          } else if (item.status === 'critical') {
            progressColor = '#ef4444'; // red
            badgeBg = 'rgba(239, 68, 68, 0.15)';
            badgeColor = '#ef4444';
          }

          return (
            <div
              key={item.id}
              style={{
                padding: '10px 12px',
                borderRadius: '14px',
                background: item.status === 'due_soon' ? 'rgba(245, 158, 11, 0.05)' : 'color-mix(in srgb, var(--mui-palette-background-default) 50%, transparent)',
                border: `1px solid ${item.status === 'due_soon' ? 'rgba(245, 158, 11, 0.25)' : 'var(--mui-palette-divider)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mui-palette-text-primary)' }}>
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
                  backgroundColor: 'color-mix(in srgb, var(--mui-palette-text-primary) 8%, transparent)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progressColor,
                    borderRadius: 3,
                  },
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--mui-palette-text-secondary)', marginTop: '6px' }}>
                <span>{item.reason}</span>
                <span style={{ fontWeight: 600, color: 'var(--mui-palette-text-primary)' }}>
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
