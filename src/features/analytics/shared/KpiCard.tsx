import type { CSSProperties, ReactNode } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { styles } from './glacier.styles';

export interface KpiCardProps {
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

export function KpiCard({
  title,
  icon,
  value,
  unit,
  subMetrics,
  isLoading,
  valueColor = '#ffffff',
  onClick,
}: KpiCardProps) {
  const cardStyle: CSSProperties = {
    ...styles.glassCard,
    padding: '16px',
    cursor: onClick ? 'pointer' : 'default',
  };

  if (isLoading) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
          <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
        </div>
        <Skeleton variant="text" width={100} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Skeleton variant="text" width={120} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mt: 1 }} />
      </div>
    );
  }

  const formattedValue = value !== null && value !== undefined ? value : '—';

  return (
    <div style={cardStyle} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </Typography>
        {icon && <div style={{ color: '#7dd3fc', opacity: 0.85 }}>{icon}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.35rem', fontWeight: 700, color: valueColor, letterSpacing: '-0.5px' }}>
          {formattedValue}
        </span>
        {unit && (
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {subMetrics && subMetrics.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {subMetrics.map((sm, i) => {
            const smVal = sm.value !== null && sm.value !== undefined ? sm.value : '—';
            let color = '#94a3b8';
            if (sm.highlightColor === 'cyan') color = '#7dd3fc';
            if (sm.highlightColor === 'purple') color = '#c8a0f0';
            if (sm.highlightColor === 'green') color = '#34d399';
            if (sm.highlightColor === 'amber') color = '#fbbf24';
            if (sm.highlightColor === 'red') color = '#f87171';

            return (
              <div key={i} style={styles.subMetricText}>
                <span>{sm.label}</span>
                <span style={{ color, fontWeight: 600 }}>{smVal}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
