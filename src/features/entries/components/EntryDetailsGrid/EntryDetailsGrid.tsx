import DeleteIcon from '@mui/icons-material/Delete';
import EvStationIcon from '@mui/icons-material/EvStation';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VerifiedIcon from '@mui/icons-material/Verified';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type React from 'react';
import type { Entry } from '@/data/client/types';
import { formatAmount } from '@/shared/lib/currencies';
import { useAccountFuelGrades } from '@/shared/lib/fuel-grades';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './EntryDetailsGrid.styles';
import entryDetailStyles from '@/routes/entries/$entryId/EntryDetail.module.scss';

export interface Props {
  entry: Entry;
  volumeUnit?: string;
  onOpenImage?: () => void;
  onRequestDeleteAttachment?: () => void;
}

export const EntryDetailsGrid: React.FC<Props> = ({
  entry,
  volumeUnit = 'L',
  onOpenImage,
  onRequestDeleteAttachment,
}) => {
  const { allGrades } = useAccountFuelGrades();

  // Helper to format raw grade id into pretty label
  const getPrettyFuelGrade = (gradeId?: string): string => {
    if (!gradeId) return '';
    const match = allGrades.find((g) => g.id === gradeId);
    return match ? match.label : gradeId;
  };

  const hasFuelDetails =
    (entry.kind === 'refuel' || entry.kind === 'charge') &&
    Boolean(
      entry.fuel_grade ||
      entry.fuel_volume !== undefined ||
      entry.unit_price !== undefined ||
      entry.is_full_tank !== undefined,
    );

  const hasServiceItems =
    entry.kind === 'service' &&
    Boolean(entry.sub_items && entry.sub_items.length > 0);

  const hasExpenseCategory =
    entry.kind === 'expense' &&
    Boolean(entry.category);

  const hasVendorOrLocation =
    Boolean(entry.vendor_name || (entry.lat !== undefined && entry.lon !== undefined));

  const hasNotes = Boolean(entry.notes && entry.notes.trim().length > 0);
  const hasImage = Boolean(entry.image_data);

  const subItemsTotal =
    entry.sub_items?.reduce((acc, it) => {
      const val = parseFloat(it.cost || '0');
      return acc + (Number.isNaN(val) ? 0 : val);
    }, 0) ?? 0;

  const isCharge = entry.kind === 'charge';
  const prettyGrade = getPrettyFuelGrade(entry.fuel_grade);

  return (
    <div className={entryDetailStyles.detailsGrid}>
      {/* Type-Specific: Refuel / Charge Details Breakdown (Hidden if empty) */}
      {hasFuelDetails && (
        <GlassCard style={styles.card}>
          <div style={styles.headerRow}>
            <div style={styles.headerLeft}>
              {isCharge ? (
                <EvStationIcon sx={{ fontSize: 17, color: 'primary.main' }} />
              ) : (
                <LocalGasStationIcon sx={{ fontSize: 17, color: 'primary.main' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '0.72rem',
                }}
              >
                {isCharge ? 'Charging Breakdown' : 'Fueling Breakdown'}
              </Typography>
            </div>
            {entry.is_full_tank !== undefined && (
              <span style={styles.fullTankPill(entry.is_full_tank)}>
                {entry.is_full_tank ? 'Full Tank' : 'Partial Fill'}
              </span>
            )}
          </div>

          <div style={styles.fuelStatsGrid}>
            {entry.fuel_grade && (
              <div style={styles.statBox}>
                <span style={styles.statLabel}>
                  {isCharge ? 'Charge Type' : 'Fuel Grade'}
                </span>
                <p style={styles.statValue}>
                  {prettyGrade}
                </p>
              </div>
            )}

            {entry.fuel_volume !== undefined && (
              <div style={styles.statBox}>
                <span style={styles.statLabel}>
                  {isCharge ? 'Energy' : 'Volume'}
                </span>
                <p style={styles.statValue}>
                  {entry.fuel_volume} {volumeUnit}
                </p>
              </div>
            )}

            {entry.unit_price !== undefined && (
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Unit Price</span>
                <p style={styles.statValue}>
                  {entry.currency || '€'} {entry.unit_price} / {volumeUnit}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Type-Specific: Service Parts & Labor Breakdown */}
      {hasServiceItems && (
        <GlassCard className={entryDetailStyles.fullWidthSpan} style={styles.card}>
          <div style={styles.headerRow}>
            <div style={styles.headerLeft}>
              <ReceiptLongIcon sx={{ fontSize: 17, color: 'primary.main' }} />
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '0.72rem',
                }}
              >
                Parts &amp; Labor Breakdown
              </Typography>
            </div>
            <span style={styles.countBadge}>
              {entry.sub_items!.length} {entry.sub_items!.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div style={styles.serviceList}>
            {entry.sub_items!.map((item, idx) => {
              const getIconForIndex = (i: number) => {
                const rem = i % 3;
                if (rem === 0) return <FormatPaintIcon sx={{ fontSize: 15 }} />;
                if (rem === 1) return <OilBarrelIcon sx={{ fontSize: 15 }} />;
                return <FilterAltIcon sx={{ fontSize: 15 }} />;
              };

              return (
                <div key={item.id || idx} style={styles.serviceItemRow}>
                  <div style={styles.serviceItemLeft}>
                    <div style={styles.serviceItemIconWrapper}>
                      {getIconForIndex(idx)}
                    </div>
                    <div style={styles.serviceItemInfo}>
                      <span style={styles.serviceItemTitle}>
                        {item.name || 'Service line item'}
                      </span>
                      {item.partNumber && (
                        <span style={styles.serviceItemPartNum}>
                          Part #{item.partNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={styles.serviceItemCostWrapper}>
                    <span style={styles.serviceItemCost}>
                      {parseFloat(item.cost || '0').toFixed(2)} {entry.currency || 'EUR'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtotal Calculation Strip */}
          <div style={styles.subtotalStrip}>
            <div style={styles.subtotalRow}>
              <span>Items Subtotal</span>
              <span style={{ color: 'var(--mui-palette-text-primary)' }}>
                {subItemsTotal.toFixed(2)} {entry.currency || 'EUR'}
              </span>
            </div>
            <div style={styles.netTotalRow}>
              <span style={{ color: '#7dd3fc' }}>Net Total</span>
              <span>{formatAmount(entry)}</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Type-Specific: Expense Category (Hidden if empty) */}
      {hasExpenseCategory && (
        <GlassCard style={{ ...styles.card, gap: 6 }}>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '0.72rem',
            }}
          >
            Expense Category
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'primary.main' }}>
            {entry.category}
          </Typography>
        </GlassCard>
      )}

      {/* Vendor & Location Card with Beacon and Maps Action (Hidden if empty) */}
      {hasVendorOrLocation && (
        <GlassCard style={styles.card}>
          <div style={styles.headerRow}>
            <div style={styles.headerLeft}>
              <StorefrontIcon sx={{ fontSize: 17, color: 'primary.main' }} />
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '0.72rem',
                }}
              >
                Vendor &amp; Location
              </Typography>
            </div>
            {entry.business ? (
              <span style={styles.businessBadge}>
                Business Location
              </span>
            ) : null}
          </div>

          <div style={styles.vendorBeaconBox}>
            <div style={styles.vendorBeaconIcon}>
              <LocationOnIcon sx={{ fontSize: 18 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              {entry.vendor_name && (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mui-palette-text-primary)' }}>
                  {entry.vendor_name}
                </span>
              )}
              {entry.lat !== undefined && entry.lon !== undefined && (
                <span style={{ fontSize: '0.72rem', color: 'var(--mui-palette-text-secondary)', marginTop: 2 }}>
                  {entry.lat.toFixed(5)}, {entry.lon.toFixed(5)}
                </span>
              )}
            </div>
          </div>

          {entry.lat !== undefined && entry.lon !== undefined && (
            <a
              href={`https://maps.google.com/?q=${entry.lat},${entry.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.mapsLink}
            >
              <span>Open in Google Maps</span>
              <OpenInNewIcon sx={{ fontSize: 14 }} />
            </a>
          )}
        </GlassCard>
      )}

      {/* Technician / Entry Memo Editorial Card (Hidden if empty) */}
      {hasNotes && (
        <GlassCard style={{ ...styles.card, gap: 10 }}>
          <div style={styles.headerLeft}>
            <StickyNote2Icon sx={{ fontSize: 17, color: '#c8a0f0' }} />
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '0.72rem',
              }}
            >
              Technician &amp; Driver Memo
            </Typography>
          </div>
          <div style={styles.memoContainer}>
            <p style={styles.memoText}>
              {entry.notes}
            </p>
          </div>
        </GlassCard>
      )}

      {/* Attached Receipt & Document Card (Hidden if empty) */}
      {hasImage && (
        <GlassCard style={styles.card}>
          <div style={styles.headerRow}>
            <div style={styles.headerLeft}>
              <ReceiptLongIcon sx={{ fontSize: 17, color: 'primary.main' }} />
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '0.72rem',
                }}
              >
                Attached Receipt &amp; Work Order
              </Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={styles.attachmentBadge}>
                <VerifiedIcon sx={{ fontSize: 13 }} />
                <span>Attached</span>
              </div>
              {onRequestDeleteAttachment && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDeleteAttachment();
                  }}
                  title="Remove attachment"
                  sx={styles.attachmentRemoveButton}
                >
                  <DeleteIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
            </div>
          </div>

          <div
            onClick={onOpenImage}
            style={styles.attachmentCardInteractive}
          >
            <div style={styles.attachmentThumbnailBox}>
              <img
                src={entry.image_data}
                alt="Receipt preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />
              <div style={styles.attachmentZoomOverlay}>
                <ZoomInIcon sx={{ fontSize: 18, color: '#7dd3fc' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
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
                Receipt Document
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--mui-palette-text-secondary)', marginTop: 2 }}>
                WebP Image • Attached Media
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.72rem',
                  color: '#7dd3fc',
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                View Fullscreen
                <OpenInNewIcon sx={{ fontSize: 12 }} />
              </span>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default EntryDetailsGrid;
