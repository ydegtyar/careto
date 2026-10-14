import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import StorefrontIcon from '@mui/icons-material/Storefront';
import type { WorkshopEfficiencyDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

export interface WorkshopEfficiencyCardProps {
  data: WorkshopEfficiencyDto;
}

export function WorkshopEfficiencyCard({ data }: WorkshopEfficiencyCardProps) {
  if (!data.hasData || !data.workshopName) {
    return (
      <div style={styles.glassCard}>
        <div style={styles.headerRow}>
          <div style={styles.titleGroup}>
            <StorefrontIcon sx={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }} />
            <h4 style={styles.title}>Workshop Efficiency</h4>
          </div>
        </div>
        <div style={{ color: 'var(--mui-palette-text-secondary)', fontSize: '0.85rem' }}>No workshop data for this period.</div>
      </div>
    );
  }

  const isUnder = data.diffVsBenchmarkPercent !== null && data.diffVsBenchmarkPercent < 0;
  const diffLabel = data.diffVsBenchmarkPercent !== null
    ? `${Math.abs(data.diffVsBenchmarkPercent)}% ${isUnder ? 'Under' : 'Over'} Benchmark`
    : 'Benchmark rate';

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <StorefrontIcon sx={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }} />
          <h4 style={styles.title}>Workshop Efficiency</h4>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            background: isUnder ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isUnder ? '#10b981' : '#ef4444',
            border: `1px solid ${isUnder ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          {diffLabel}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          borderRadius: '16px',
          background: 'color-mix(in srgb, var(--mui-palette-background-default) 50%, transparent)',
          border: '1px solid var(--mui-palette-divider)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--mui-palette-text-primary)' }}>
              {data.workshopName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>
              <StarIcon sx={{ fontSize: 14 }} />
              <span>{data.rating?.toFixed(1) ?? '5.0'}</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--mui-palette-text-secondary)', marginTop: '2px' }}>
            {data.specialization}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--mui-palette-primary-main)', marginTop: '6px' }}>
            Rate: <strong style={{ color: 'var(--mui-palette-text-primary)' }}>${data.hourlyRate}/hr</strong> • Avg Reg: ${data.benchmarkHourlyRate}/hr
          </div>
        </div>
      </div>

      {data.activeGuaranteeNote && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            fontSize: '0.75rem',
            color: '#c8a0f0',
          }}
        >
          <VerifiedIcon sx={{ fontSize: 16 }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Active Guarantee: {data.activeGuaranteeNote}
          </span>
        </div>
      )}
    </div>
  );
}
