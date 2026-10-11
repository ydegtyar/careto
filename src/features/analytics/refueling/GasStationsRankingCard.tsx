import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SavingsIcon from '@mui/icons-material/Savings';
import type { GasStationsRankingDto } from '../../../../api/_lib/analytics/types';
import { styles } from '../shared/glacier.styles';

export interface GasStationsRankingCardProps {
  data: GasStationsRankingDto;
  volumeUnit?: string;
}

export function GasStationsRankingCard({ data, volumeUnit = 'L' }: GasStationsRankingCardProps) {
  const { stations, optimizationInsight } = data;

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <LocalGasStationIcon sx={{ fontSize: 18, color: '#7dd3fc' }} />
          <h4 style={styles.title}>Gas Stations Ranking</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
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
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: s.rank === 1 ? '#34d399' : '#94a3b8',
                    minWidth: '20px',
                  }}
                >
                  #{s.rank}
                </span>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                      {s.brand}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: isCheaper ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: isCheaper ? '#34d399' : '#f87171',
                      }}
                    >
                      {diffText}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                    {s.refuelCount} refuels • {s.totalLiters} {volumeUnit}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  ${s.totalSpend.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 500 }}>
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
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(56, 189, 248, 0.1))',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <SavingsIcon sx={{ fontSize: 20, color: '#34d399', mt: '2px' }} />
          <div style={{ fontSize: '0.75rem', color: '#e2e8f0', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700, color: '#34d399' }}>Optimization Insight: </span>
            {optimizationInsight.message}
          </div>
        </div>
      )}
    </div>
  );
}
