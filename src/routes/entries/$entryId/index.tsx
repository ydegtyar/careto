import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import classNames from 'classnames';
import { useAppStore } from '@/app/store';
import type { Entry } from '@/data/client/types';
import { AttachmentReceiptCard } from '@/features/entries/components/AttachmentReceiptCard/AttachmentReceiptCard';
import { EntryDetailHeader } from '@/features/entries/components/EntryDetailHeader/EntryDetailHeader';
import { EntryHeroCard } from '@/features/entries/components/EntryHeroCard/EntryHeroCard';
import { VendorLocationCard } from '@/features/entries/components/VendorLocationCard/VendorLocationCard';
import { entriesQueryOptions, vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import { formatAmount } from '@/shared/lib/currencies';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import styles from './EntryDetail.module.scss';

export const Route = createFileRoute('/entries/$entryId/')({
  component: EntryDetailPage,
});

function EntryDetailPage() {
  const { entryId } = Route.useParams();
  const navigate = useNavigate();
  const { activeVehicleId } = useAppStore();

  const { data: entries = [], isLoading: entriesLoading } = useQuery(
    entriesQueryOptions(activeVehicleId ?? undefined),
  );
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

  const entry: Entry | undefined = entries.find((e) => e.id === entryId);

  if (entriesLoading) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', paddingTop: 32 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading entry details...
        </Typography>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', paddingTop: 32 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Entry not found
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: '/garage' })}
          sx={{ textTransform: 'none', borderRadius: 9999, alignSelf: 'center' }}
        >
          Back to Garage
        </Button>
      </div>
    );
  }

  const isEv = activeVehicle?.powertrain === 'ev';
  const volumeUnit = isEv ? 'kWh' : 'L';

  // Check which sections have meaningful data to avoid empty containers
  const hasFuelDetails =
    (entry.kind === 'refuel' || entry.kind === 'charge') &&
    Boolean(
      entry.fuel_grade ||
        entry.fuel_volume !== undefined ||
        entry.unit_price !== undefined ||
        entry.is_full_tank !== undefined,
    );

  const hasServiceItems =
    entry.kind === 'service' && Boolean(entry.sub_items && entry.sub_items.length > 0);

  const hasExpenseCategory = entry.kind === 'expense' && Boolean(entry.category);

  const hasNotes = Boolean(entry.notes && entry.notes.trim().length > 0);

  // Sub-items calculation
  const subItemsTotal =
    entry.sub_items?.reduce((acc, it) => {
      const val = parseFloat(it.cost || '0');
      return acc + (Number.isNaN(val) ? 0 : val);
    }, 0) ?? 0;

  return (
    <div className={styles.container}>
      {/* Sub-Header / Quick Navigation & Top Actions */}
      <EntryDetailHeader entry={entry} />

      {/* Hero Expense Settlement Card */}
      <EntryHeroCard entry={entry} vehicle={activeVehicle} />

      {/* Details Grid: 1 column on mobile, 2 columns on desktop */}
      <div className={styles.detailsGrid}>
        {/* Type-Specific: Refuel / Charge Details Breakdown (Hidden if empty) */}
        {hasFuelDetails && (
          <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LocalGasStationIcon sx={{ fontSize: 17, color: 'primary.main' }} />
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
                  Fueling Breakdown
                </Typography>
              </div>
              {entry.is_full_tank !== undefined && (
                <span
                  className={classNames(
                    styles.fillStatusBadge,
                    entry.is_full_tank ? styles.full : styles.partial,
                  )}
                >
                  {entry.is_full_tank ? 'Full Tank' : 'Partial Fill'}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: 10,
              }}
            >
              {entry.fuel_grade && (
                <div className={styles.fuelStatCard}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>
                    Grade
                  </span>
                  <p
                    style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--mui-palette-text-primary)',
                    }}
                  >
                    {entry.fuel_grade}
                  </p>
                </div>
              )}

              {entry.fuel_volume !== undefined && (
                <div className={styles.fuelStatCard}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>
                    Volume
                  </span>
                  <p
                    style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--mui-palette-text-primary)',
                    }}
                  >
                    {entry.fuel_volume} {volumeUnit}
                  </p>
                </div>
              )}

              {entry.unit_price !== undefined && (
                <div className={styles.fuelStatCard}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>
                    Unit Price
                  </span>
                  <p
                    style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--mui-palette-text-primary)',
                    }}
                  >
                    {entry.currency || '€'} {entry.unit_price} / {volumeUnit}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Type-Specific: Service Parts & Labor Breakdown (Stitch Design Card) */}
        {hasServiceItems && (
          <GlassCard
            className={styles.fullWidthSpan}
            style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <span className={styles.itemsCountBadge}>
                {entry.sub_items!.length} {entry.sub_items!.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entry.sub_items!.map((item, idx) => {
                // Icon variant cycling
                const getIconForIndex = (i: number) => {
                  const rem = i % 3;
                  if (rem === 0) return <FormatPaintIcon sx={{ fontSize: 15 }} />;
                  if (rem === 1) return <OilBarrelIcon sx={{ fontSize: 15 }} />;
                  return <FilterAltIcon sx={{ fontSize: 15 }} />;
                };

                return (
                  <div key={item.id || idx} className={styles.serviceItemRow}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div className={styles.serviceItemIconWell}>{getIconForIndex(idx)}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            color: 'var(--mui-palette-text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name || 'Service line item'}
                        </span>
                        {item.partNumber && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: 'var(--mui-palette-text-secondary)',
                              marginTop: 1,
                            }}
                          >
                            Part #{item.partNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--mui-palette-text-primary)',
                        }}
                      >
                        {parseFloat(item.cost || '0').toFixed(2)} {entry.currency || 'EUR'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal Calculation Strip */}
            <div className={styles.serviceSubtotalStrip}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Items Subtotal</span>
                <span style={{ color: 'var(--mui-palette-text-primary)' }}>
                  {subItemsTotal.toFixed(2)} {entry.currency || 'EUR'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 4,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  color: 'var(--mui-palette-text-primary)',
                }}
              >
                <span style={{ color: 'var(--mui-palette-primary-main)' }}>Net Total</span>
                <span>{formatAmount(entry)}</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Type-Specific: Expense Category (Hidden if empty) */}
        {hasExpenseCategory && (
          <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
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
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'primary.main' }}
            >
              {entry.category}
            </Typography>
          </GlassCard>
        )}

        {/* Vendor & Location Card with Beacon and Maps Action (Hidden if empty) */}
        <VendorLocationCard entry={entry} />

        {/* Technician / Entry Memo Editorial Card (Hidden if empty) */}
        {hasNotes && (
          <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StickyNote2Icon sx={{ fontSize: 17, color: 'tertiary.main' }} />
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
            <div className={styles.memoBox}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  color: 'var(--mui-palette-text-primary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {entry.notes}
              </p>
            </div>
          </GlassCard>
        )}

        {/* Attached Receipt & Document Card (Hidden if empty) */}
        <AttachmentReceiptCard entry={entry} />
      </div>
    </div>
  );
}
