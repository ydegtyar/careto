import RouteIcon from '@mui/icons-material/Route';
import type React from 'react';
import type { Entry, Vehicle } from '@/data/client/types';
import { computeTravelDistance } from '@/features/analytics/lib/analytics-math';
import { styles } from './TravelDistanceCard.styles';

interface Props {
  entries: Entry[];
  vehicle?: Vehicle;
}

export const TravelDistanceCard: React.FC<Props> = ({ entries, vehicle }) => {
  const { distanceLogged, dailyAvg, currentOdometer, distanceUnit } = computeTravelDistance(
    entries,
    vehicle,
  );

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Travel Distance</span>
        <div style={styles.iconBadge}>
          <RouteIcon sx={{ fontSize: 20 }} />
        </div>
      </div>

      <div style={styles.metricSection}>
        <span style={styles.label}>Distance Logged</span>
        <div style={styles.valueRow}>
          <span style={styles.primaryValue}>{distanceLogged.toLocaleString()}</span>
          <span style={styles.unit}>{distanceUnit}</span>
        </div>
      </div>

      <div style={styles.subMetricsContainer}>
        <div style={styles.subMetricRow}>
          <span style={styles.subMetricLabel}>Daily avg</span>
          <span style={styles.subMetricValue}>
            {dailyAvg} {distanceUnit}/d
          </span>
        </div>
        <div style={styles.subMetricRow}>
          <span style={styles.subMetricLabel}>Odometer</span>
          <span style={styles.subMetricValue}>
            {currentOdometer.toLocaleString()} {distanceUnit}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TravelDistanceCard;
