import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SavingsIcon from '@mui/icons-material/Savings';
import type { GasStationsRankingDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

interface Props {
  data: GasStationsRankingDto;
  volumeUnit?: string;
}

export const GasStationsRankingCard = ({ data, volumeUnit = 'L' }: Props) => {
  const { stations, optimizationInsight } = data;

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <LocalGasStationIcon sx={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }} />
          <h4 style={styles.title}>Gas Stations Ranking</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--mui-palette-text-secondary)' }}>
          {stations.length} brands
        </span>
      </div>

      {/* Station Ranking List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {stations.map((s) => {
          const isCheaper = s.priceDiffPercent <= 0;
          const diffText = `${Math.abs(s.priceDiffPercent)}% ${isCheaper ? 'cheaper' : 'pricier'}`;

          return (
            <div
              key={s.brand}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '14px',
                background:
                  'color-mix(in srgb, var(--mui-palette-background-default) 50%, transparent)',
                border: '1px solid var(--mui-palette-divider)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: s.rank === 1 ? '#10b981' : 'var(--mui-palette-text-secondary)',
                    minWidth: '20px',
                  }}
                >
                  #{s.rank}
                </span>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--mui-palette-text-primary)',
                      }}
                    >
                      {s.brand}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: isCheaper
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                        color: isCheaper ? '#10b981' : '#ef4444',
                      }}
                    >
                      {diffText}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--mui-palette-text-secondary)',
                      marginTop: '2px',
                    }}
                  >
                    {s.refuelCount} refuels • {s.totalLiters} {volumeUnit}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--mui-palette-text-primary)',
                  }}
                >
                  ${s.totalSpend.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--mui-palette-primary-main)',
                    fontWeight: 500,
                  }}
                >
                  ${s.avgPricePerLiter.toFixed(2)}/{volumeUnit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optimization Insight Banner */}
      {optimizationInsight?.show && (
        <div
          style={{
            marginTop: '14px',
            padding: '12px 14px',
            borderRadius: '14px',
            background:
              'linear-gradient(135deg, rgba(16, 185, 129, 0.1), color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <SavingsIcon sx={{ fontSize: 20, color: '#10b981', mt: '2px' }} />
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--mui-palette-text-primary)',
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontWeight: 700, color: '#10b981' }}>Optimization Insight: </span>
            {optimizationInsight.message}
          </div>
        </div>
      )}
    </div>
  );
};
