import BuildIcon from '@mui/icons-material/Build';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EventIcon from '@mui/icons-material/Event';
import EvStationIcon from '@mui/icons-material/EvStation';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SpeedIcon from '@mui/icons-material/Speed';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import type React from 'react';
import type { Entry, Vehicle } from '@/data/client/types';
import { formatDatePreference, useDateFormatPreference } from '@/shared/lib/date-format-preference';
import styles from './EntryHeroCard.module.scss';
import { styles as muiStyles } from './EntryHeroCard.styles';

export interface Props {
  entry: Entry;
  vehicle?: Vehicle;
}

export const EntryHeroCard: React.FC<Props> = ({ entry, vehicle }) => {
  const [dateFormat] = useDateFormatPreference();

  const getKindBadgeInfo = () => {
    switch (entry.kind) {
      case 'refuel':
      case 'charge':
        return {
          kindClass: entry.kind,
          label: entry.kind === 'charge' ? 'EV Charge' : 'Refuel',
          icon:
            entry.kind === 'charge' ? (
              <EvStationIcon sx={{ fontSize: 15 }} />
            ) : (
              <LocalGasStationIcon sx={{ fontSize: 15 }} />
            ),
        };
      case 'service':
        return {
          kindClass: 'service',
          label: 'Service & Repair',
          icon: <BuildIcon sx={{ fontSize: 15 }} />,
        };
      case 'note':
        return {
          kindClass: 'note',
          label: 'Note & Log',
          icon: <StickyNote2Icon sx={{ fontSize: 15 }} />,
        };
      default:
        return {
          kindClass: 'expense',
          label: 'Expense',
          icon: <ReceiptLongIcon sx={{ fontSize: 15 }} />,
        };
    }
  };

  const kindInfo = getKindBadgeInfo();

  return (
    <div className={styles.heroCard}>
      {/* Ambient atmospheric background glows */}
      <div className={styles.heroGlowTop} />
      <div className={styles.heroGlowBottom} />

      <div className={styles.heroContent}>
        {/* Top Row: Category Kind Pill & Payment/Business Badges */}
        <div className={styles.heroTopRow}>
          <div className={classNames(styles.kindBadge, styles[kindInfo.kindClass])}>
            {kindInfo.icon}
            <span>{kindInfo.label}</span>
          </div>

          <div className={styles.heroTopBadges}>
            {Boolean(entry.business) && (
              <div className={styles.businessPill}>
                <BusinessCenterIcon sx={{ fontSize: 13 }} />
                <span>Business</span>
              </div>
            )}
            {entry.payment_method && (
              <div className={styles.paymentPill}>
                <CreditCardIcon sx={{ fontSize: 13 }} />
                <span>{entry.payment_method.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Magnitude Display (unless note without cost) */}
        {entry.kind !== 'note' && (
          <div>
            <Typography variant="caption" sx={muiStyles.totalSettledCaption}>
              Total Settled
            </Typography>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
                marginTop: 4,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="h4" sx={muiStyles.totalAmountText}>
                {entry.amount_minor !== undefined ? (entry.amount_minor / 100).toFixed(2) : '0.00'}{' '}
                <span className={styles.currencyText}>{entry.currency || 'EUR'}</span>
              </Typography>
              {entry.usd_minor !== undefined && entry.currency !== 'USD' && (
                <span className={styles.usdEquivPill}>
                  ≈ ${(entry.usd_minor / 100).toFixed(2)} USD
                </span>
              )}
            </div>
          </div>
        )}

        {/* Telemetry Specs Grid: Timestamp & Odometer */}
        <div
          className={styles.telemetryGrid}
          style={{
            gridTemplateColumns: entry.odometer_m !== undefined ? '1fr 1fr' : '1fr',
          }}
        >
          <div className={styles.telemetryCard}>
            <div className={styles.telemetryIconWell}>
              <EventIcon sx={{ fontSize: 17 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>
                Timestamp
              </span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--mui-palette-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {formatDatePreference(entry.occurred_on, dateFormat)}
                {entry.occurred_time && `, ${entry.occurred_time}`}
              </span>
            </div>
          </div>

          {entry.odometer_m !== undefined && (
            <div className={styles.telemetryCard}>
              <div className={classNames(styles.telemetryIconWell, styles.secondary)}>
                <SpeedIcon sx={{ fontSize: 17 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>
                  Odometer
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--mui-palette-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {(entry.odometer_m / 1000).toLocaleString()} {vehicle?.distance_unit || 'km'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryHeroCard;
