import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import Typography from '@mui/material/Typography';
import type React from 'react';
import type { Entry } from '@/data/client/types';
import { computePriceVolatility } from '@/features/analytics/lib/analytics-math';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './PriceVolatilityCard.styles';

export interface Props {
  entries: Entry[];
}

export const PriceVolatilityCard: React.FC<Props> = ({ entries }) => {
  const priceVolatility = computePriceVolatility(entries);

  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Price Volatility
        </Typography>
        <LocalGasStationIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      </div>

      <div style={styles.list}>
        <div style={styles.item}>
          <div style={styles.itemLeft}>
            <ArrowDownwardIcon sx={{ color: '#7dd3fc', fontSize: 18 }} />
            <div>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                {priceVolatility.lowest?.station}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Lowest recorded • {priceVolatility.lowest?.date}
              </Typography>
            </div>
          </div>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#7dd3fc' }}>
            ${priceVolatility.lowest?.price.toFixed(2)} / L
          </Typography>
        </div>

        <div style={styles.item}>
          <div style={styles.itemLeft}>
            <ArrowUpwardIcon sx={{ color: '#f87171', fontSize: 18 }} />
            <div>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                {priceVolatility.highest?.station}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Highest recorded • {priceVolatility.highest?.date}
              </Typography>
            </div>
          </div>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#f87171' }}>
            ${priceVolatility.highest?.price.toFixed(2)} / L
          </Typography>
        </div>

        <div style={styles.spreadText}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
            Station delta spread:{' '}
            <strong style={{ color: '#ffffff' }}>+${priceVolatility.spread.toFixed(2)} / L</strong>
          </Typography>
        </div>
      </div>
    </GlassCard>
  );
};

export default PriceVolatilityCard;
