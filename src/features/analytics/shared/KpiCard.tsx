import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type { CSSProperties, ReactNode } from 'react';
import { styles } from './glacier.styles';

export interface Props {
  title: string;
  icon?: ReactNode;
  value: string | number | null;
  unit?: string;
  subMetrics?: Array<{
    label: string;
    value: string | number | null;
    highlightColor?: 'cyan' | 'purple' | 'green' | 'amber' | 'red';
  }>;
  isLoading?: boolean;
  valueColor?: string;
  onClick?: () => void;
}

export const KpiCard = ({
  title,
  icon,
  value,
  unit,
  subMetrics,
  isLoading,
  valueColor = 'var(--mui-palette-text-primary)',
  onClick,
}: Props) => {
  const cardStyle: CSSProperties = {
    ...styles.glassCard,
    padding: '16px',
    cursor: onClick ? 'pointer' : 'default',
  };

  const formattedValue = value !== null && value !== undefined ? value : '—';

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--mui-palette-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </Typography>
        {icon && (
          <div style={{ color: 'var(--mui-palette-primary-main)', opacity: 0.9 }}>{icon}</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
        {isLoading ? (
          <Skeleton
            variant="rounded"
            width={72}
            height={26}
            sx={{
              bgcolor: 'color-mix(in srgb, var(--mui-palette-text-primary) 10%, transparent)',
              borderRadius: '4px',
            }}
          />
        ) : (
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: valueColor,
              letterSpacing: '-0.5px',
            }}
          >
            {formattedValue}
          </span>
        )}
        {unit && (
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--mui-palette-text-secondary)',
              fontWeight: 500,
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {subMetrics && subMetrics.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--mui-palette-divider)',
            paddingTop: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {subMetrics.map((sm, i) => {
            const smVal = sm.value !== null && sm.value !== undefined ? sm.value : '—';
            let color = 'var(--mui-palette-text-secondary)';
            if (sm.highlightColor === 'cyan') color = 'var(--mui-palette-primary-main)';
            if (sm.highlightColor === 'purple') color = 'var(--mui-palette-tertiary-main)';
            if (sm.highlightColor === 'green') color = '#10b981';
            if (sm.highlightColor === 'amber') color = '#f59e0b';
            if (sm.highlightColor === 'red') color = '#ef4444';

            return (
              <div key={i} style={styles.subMetricText}>
                <span>{sm.label}</span>
                {isLoading ? (
                  <Skeleton
                    variant="rounded"
                    width={44}
                    height={14}
                    sx={{
                      bgcolor:
                        'color-mix(in srgb, var(--mui-palette-text-primary) 10%, transparent)',
                      borderRadius: '3px',
                    }}
                  />
                ) : (
                  <span style={{ color, fontWeight: 600 }}>{smVal}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
