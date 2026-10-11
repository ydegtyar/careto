import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EvStationIcon from '@mui/icons-material/EvStation';
import EventIcon from '@mui/icons-material/Event';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SpeedIcon from '@mui/icons-material/Speed';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VerifiedIcon from '@mui/icons-material/Verified';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { data } from '@/data/client';
import type { Entry } from '@/data/client/types';
import { entriesQueryOptions, vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import { formatAmount } from '@/shared/lib/currencies';
import { formatDatePreference, useDateFormatPreference } from '@/shared/lib/date-format-preference';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/entries/$entryId/')({
  component: EntryDetailPage,
});

function EntryDetailPage() {
  const { entryId } = Route.useParams();
  const navigate = useNavigate();
  const { activeVehicleId } = useAppStore();
  const [dateFormat] = useDateFormatPreference();

  const { data: entries = [], isLoading: entriesLoading } = useQuery(
    entriesQueryOptions(activeVehicleId ?? undefined),
  );
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

  const entry: Entry | undefined = entries.find((e) => e.id === entryId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!entry) return;
    setDeleting(true);
    try {
      await data.deleteEntry(entry.id);
      navigate({ to: '/garage' });
    } catch (err) {
      console.error('Failed to delete entry:', err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (entriesLoading) {
    return (
      <div style={{ padding: 24, maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading entry details...
        </Typography>
      </div>
    );
  }

  if (!entry) {
    return (
      <div style={{ padding: 24, maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Entry not found
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: '/garage' })}
          sx={{ textTransform: 'none', borderRadius: 9999 }}
        >
          Back to Garage
        </Button>
      </div>
    );
  }

  const getKindBadgeInfo = () => {
    switch (entry.kind) {
      case 'refuel':
      case 'charge':
        return {
          label: entry.kind === 'charge' ? 'EV Charge' : 'Refuel',
          icon: entry.kind === 'charge' ? <EvStationIcon sx={{ fontSize: 15 }} /> : <LocalGasStationIcon sx={{ fontSize: 15 }} />,
          color: '#7dd3fc',
          bg: 'rgba(14, 77, 110, 0.45)',
        };
      case 'service':
        return {
          label: 'Service & Repair',
          icon: <BuildIcon sx={{ fontSize: 15 }} />,
          color: '#7dd3fc',
          bg: 'rgba(14, 77, 110, 0.45)',
        };
      case 'note':
        return {
          label: 'Note & Log',
          icon: <StickyNote2Icon sx={{ fontSize: 15 }} />,
          color: '#c8a0f0',
          bg: 'rgba(61, 32, 96, 0.45)',
        };
      default:
        return {
          label: 'Expense',
          icon: <ReceiptLongIcon sx={{ fontSize: 15 }} />,
          color: '#88b4cc',
          bg: 'rgba(26, 58, 78, 0.45)',
        };
    }
  };

  const kindInfo = getKindBadgeInfo();
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
    entry.kind === 'service' &&
    Boolean(entry.sub_items && entry.sub_items.length > 0);

  const hasExpenseCategory =
    entry.kind === 'expense' &&
    Boolean(entry.category);

  const hasVendorOrLocation =
    Boolean(entry.vendor_name || (entry.lat !== undefined && entry.lon !== undefined));

  const hasNotes = Boolean(entry.notes && entry.notes.trim().length > 0);
  const hasImage = Boolean(entry.image_data);

  // Sub-items calculation
  const subItemsTotal = entry.sub_items?.reduce((acc, it) => {
    const val = parseFloat(it.cost || '0');
    return acc + (Number.isNaN(val) ? 0 : val);
  }, 0) ?? 0;

  return (
    <div
      style={{
        padding: '12px 16px 36px 16px',
        maxWidth: 440,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Sub-Header / Quick Navigation & Top Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: '/garage' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 9999,
            backgroundColor: 'rgba(20, 28, 46, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(125, 211, 252, 0.1)',
            color: 'var(--mui-palette-text-primary)',
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 15, color: 'primary.main' }} />
          <span>Garage</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => navigate({ to: `/entries/${entry.id}/edit` })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 9999,
              backgroundColor: 'rgba(20, 28, 46, 0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(125, 211, 252, 0.15)',
              color: 'var(--mui-palette-text-primary)',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <EditIcon sx={{ fontSize: 15, color: 'primary.main' }} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 9999,
              backgroundColor: 'rgba(61, 20, 20, 0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 107, 107, 0.2)',
              color: '#ff6b6b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Delete entry"
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      {/* Hero Expense Settlement Card */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 20,
          backgroundColor: 'rgba(20, 28, 46, 0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(125, 211, 252, 0.12)',
          padding: 20,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Ambient atmospheric background glows */}
        <div
          style={{
            position: 'absolute',
            top: -48,
            right: -48,
            width: 140,
            height: 140,
            borderRadius: 9999,
            backgroundColor: 'rgba(125, 211, 252, 0.15)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 110,
            height: 110,
            borderRadius: 9999,
            backgroundColor: 'rgba(200, 160, 240, 0.1)',
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top Row: Category Kind Pill & Payment/Business Badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 9999,
                backgroundColor: kindInfo.bg,
                color: kindInfo.color,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {kindInfo.icon}
              <span>{kindInfo.label}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {Boolean(entry.business) && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 9999,
                    backgroundColor: 'rgba(125, 211, 252, 0.12)',
                    border: '1px solid rgba(125, 211, 252, 0.3)',
                    color: '#7dd3fc',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  <BusinessCenterIcon sx={{ fontSize: 13 }} />
                  <span>Business</span>
                </div>
              )}
              {entry.payment_method && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 9999,
                    backgroundColor: 'rgba(26, 36, 56, 0.7)',
                    border: '1px solid rgba(125, 211, 252, 0.08)',
                    color: 'var(--mui-palette-text-secondary)',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                >
                  <CreditCardIcon sx={{ fontSize: 13 }} />
                  <span>{entry.payment_method.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Magnitude Display (unless note without cost) */}
          {entry.kind !== 'note' && (
            <div>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.68rem',
                }}
              >
                Total Settled
              </Typography>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.5 }}>
                  {entry.amount_minor !== undefined ? (entry.amount_minor / 100).toFixed(2) : '0.00'}{' '}
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7dd3fc' }}>
                    {entry.currency || 'EUR'}
                  </span>
                </Typography>
                {entry.usd_minor !== undefined && entry.currency !== 'USD' && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--mui-palette-text-secondary)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      backgroundColor: 'rgba(32, 44, 66, 0.6)',
                    }}
                  >
                    ≈ ${(entry.usd_minor / 100).toFixed(2)} USD
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Telemetry Specs Grid: Timestamp & Odometer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: entry.odometer_m !== undefined ? '1fr 1fr' : '1fr',
              gap: 10,
              paddingTop: 8,
              borderTop: '1px solid rgba(125, 211, 252, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 14,
                backgroundColor: 'rgba(17, 24, 40, 0.7)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(26, 36, 56, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7dd3fc',
                  flexShrink: 0,
                }}
              >
                <EventIcon sx={{ fontSize: 17 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>Timestamp</span>
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(17, 24, 40, 0.7)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: 'rgba(26, 36, 56, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#88b4cc',
                    flexShrink: 0,
                  }}
                >
                  <SpeedIcon sx={{ fontSize: 17 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>Odometer</span>
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
                    {(entry.odometer_m / 1000).toLocaleString()} {activeVehicle?.distance_unit || 'km'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: entry.is_full_tank ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                  color: entry.is_full_tank ? '#34d399' : '#fbbf24',
                }}
              >
                {entry.is_full_tank ? 'Full Tank' : 'Partial Fill'}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
            {entry.fuel_grade && (
              <div style={{ padding: '8px 10px', borderRadius: 10, backgroundColor: 'rgba(17, 24, 40, 0.7)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>Grade</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', fontWeight: 600 }}>{entry.fuel_grade}</p>
              </div>
            )}

            {entry.fuel_volume !== undefined && (
              <div style={{ padding: '8px 10px', borderRadius: 10, backgroundColor: 'rgba(17, 24, 40, 0.7)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>Volume</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', fontWeight: 600 }}>
                  {entry.fuel_volume} {volumeUnit}
                </p>
              </div>
            )}

            {entry.unit_price !== undefined && (
              <div style={{ padding: '8px 10px', borderRadius: 10, backgroundColor: 'rgba(17, 24, 40, 0.7)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)' }}>Unit Price</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', fontWeight: 600 }}>
                  {entry.currency || '€'} {entry.unit_price} / {volumeUnit}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Type-Specific: Service Parts & Labor Breakdown (Stitch Design Card) */}
      {hasServiceItems && (
        <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 9999,
                backgroundColor: 'rgba(32, 44, 66, 0.8)',
                color: '#7dd3fc',
              }}
            >
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
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(17, 24, 40, 0.75)',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        backgroundColor: 'rgba(32, 44, 66, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#7dd3fc',
                        flexShrink: 0,
                      }}
                    >
                      {getIconForIndex(idx)}
                    </div>
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
                        <span style={{ fontSize: '0.65rem', color: 'var(--mui-palette-text-secondary)', marginTop: 1 }}>
                          Part #{item.partNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--mui-palette-text-primary)' }}>
                      {parseFloat(item.cost || '0').toFixed(2)} {entry.currency || 'EUR'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtotal Calculation Strip */}
          <div
            style={{
              paddingTop: 8,
              borderTop: '1px solid rgba(125, 211, 252, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: '0.72rem',
              color: 'var(--mui-palette-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <span style={{ color: '#7dd3fc' }}>Net Total</span>
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
          <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'primary.main' }}>
            {entry.category}
          </Typography>
        </GlassCard>
      )}

      {/* Vendor & Location Card with Beacon and Maps Action (Hidden if empty) */}
      {hasVendorOrLocation && (
        <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(26, 58, 78, 0.5)',
                  color: '#88b4cc',
                }}
              >
                Business Location
              </span>
            ) : null}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: 12,
              borderRadius: 14,
              backgroundColor: 'rgba(17, 24, 40, 0.7)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(14, 77, 110, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7dd3fc',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
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
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 12,
                backgroundColor: 'rgba(26, 36, 56, 0.6)',
                color: '#7dd3fc',
                fontSize: '0.75rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxSizing: 'border-box',
                transition: 'background-color 0.2s ease',
              }}
            >
              <span>Open in Google Maps</span>
              <OpenInNewIcon sx={{ fontSize: 14 }} />
            </a>
          )}
        </GlassCard>
      )}

      {/* Technician / Entry Memo Editorial Card (Hidden if empty) */}
      {hasNotes && (
        <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              backgroundColor: 'rgba(17, 24, 40, 0.7)',
            }}
          >
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
      {hasImage && (
        <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                Attached Receipt &amp; Work Order
              </Typography>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#7dd3fc',
                padding: '2px 8px',
                borderRadius: 9999,
                backgroundColor: 'rgba(14, 77, 110, 0.35)',
              }}
            >
              <VerifiedIcon sx={{ fontSize: 13 }} />
              <span>Attached</span>
            </div>
          </div>

          <div
            onClick={() => setImageModalOpen(true)}
            style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              cursor: 'pointer',
              padding: 12,
              backgroundColor: 'rgba(17, 24, 40, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: '1px solid rgba(125, 211, 252, 0.1)',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 56,
                height: 64,
                borderRadius: 8,
                backgroundColor: 'rgba(32, 44, 66, 0.8)',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={entry.image_data}
                alt="Receipt preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(14, 77, 110, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
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

      {/* Lightbox Modal for Full Image View */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'rgba(10, 14, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(125, 211, 252, 0.15)',
            },
          },
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 8 }}>
          <IconButton onClick={() => setImageModalOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </div>
        <div style={{ padding: '0 16px 16px 16px', display: 'flex', justifyContent: 'center' }}>
          {entry.image_data && (
            <img
              src={entry.image_data}
              alt="Receipt Full View"
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 8 }}
            />
          )}
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#0f1524',
              borderRadius: 3,
              border: '1px solid rgba(125, 211, 252, 0.1)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Entry?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete this {entry.kind} entry from {entry.occurred_on}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: 9999 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 9999 }}
          >
            {deleting ? 'Deleting...' : 'Delete Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
