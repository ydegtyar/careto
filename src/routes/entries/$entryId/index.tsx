import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EvStationIcon from '@mui/icons-material/EvStation';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SpeedIcon from '@mui/icons-material/Speed';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Loading entry details...
        </Typography>
      </div>
    );
  }

  if (!entry) {
    return (
      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Entry not found
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: '/garage' })}
          sx={{ textTransform: 'none' }}
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
          icon: entry.kind === 'charge' ? <EvStationIcon fontSize="small" /> : <LocalGasStationIcon fontSize="small" />,
          color: '#38bdf8',
          bg: 'rgba(56, 189, 248, 0.12)',
        };
      case 'service':
        return {
          label: 'Service & Repair',
          icon: <BuildIcon fontSize="small" />,
          color: '#fbbf24',
          bg: 'rgba(251, 191, 36, 0.12)',
        };
      case 'note':
        return {
          label: 'Note & Log',
          icon: <StickyNote2Icon fontSize="small" />,
          color: '#a78bfa',
          bg: 'rgba(167, 139, 250, 0.12)',
        };
      default:
        return {
          label: 'Expense',
          icon: <ReceiptLongIcon fontSize="small" />,
          color: '#34d399',
          bg: 'rgba(52, 211, 153, 0.12)',
        };
    }
  };

  const kindInfo = getKindBadgeInfo();
  const isEv = activeVehicle?.powertrain === 'ev';
  const volumeUnit = isEv ? 'kWh' : 'L';

  return (
    <div
      style={{
        padding: '16px',
        maxWidth: 720,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Top Header Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: '/garage' })}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 600,
            pl: 0,
            '&:hover': { background: 'transparent', color: 'primary.main' },
          }}
        >
          Garage
        </Button>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => navigate({ to: `/entries/${entry.id}/edit` })}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(125, 211, 252, 0.3)',
              color: 'primary.main',
            }}
          >
            Edit
          </Button>

          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Hero Financial & Status GlassCard */}
      <GlassCard
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 9999,
              backgroundColor: kindInfo.bg,
              color: kindInfo.color,
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {kindInfo.icon}
            <span>{kindInfo.label}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {Boolean(entry.business) && (
              <Chip
                icon={<BusinessCenterIcon style={{ fontSize: 14 }} />}
                label="Business"
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(125, 211, 252, 0.4)',
                  color: 'primary.main',
                  fontSize: '0.75rem',
                }}
              />
            )}
            {entry.payment_method && (
              <Chip
                icon={<PaymentIcon style={{ fontSize: 14 }} />}
                label={entry.payment_method.replace('_', ' ')}
                size="small"
                sx={{
                  textTransform: 'capitalize',
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                }}
              />
            )}
          </div>
        </div>

        {/* Amount Display (unless note) */}
        {entry.kind !== 'note' && (
          <div style={{ marginTop: 4 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Total Amount
            </Typography>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.5 }}>
                {entry.amount_minor !== undefined ? formatAmount(entry) : '—'}
              </Typography>
              {entry.usd_minor !== undefined && entry.currency !== 'USD' && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  ≈ ${(entry.usd_minor / 100).toFixed(2)} USD
                </Typography>
              )}
            </div>
          </div>
        )}

        {/* Date & Odometer Quick Strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            paddingTop: 12,
            borderTop: '1px solid rgba(125, 211, 252, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatDatePreference(entry.occurred_on, dateFormat)}
              {entry.occurred_time && ` at ${entry.occurred_time}`}
            </Typography>
          </div>

          {entry.odometer_m !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SpeedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {(entry.odometer_m / 1000).toLocaleString()} {activeVehicle?.distance_unit || 'km'}
              </Typography>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Type-Specific: Refuel Details */}
      {(entry.kind === 'refuel' || entry.kind === 'charge') && (
        <GlassCard style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 700 }}>
            Fueling Breakdown
          </Typography>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
            {entry.fuel_grade && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Fuel Grade
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {entry.fuel_grade}
                </Typography>
              </div>
            )}

            {entry.fuel_volume !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Volume
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {entry.fuel_volume} {volumeUnit}
                </Typography>
              </div>
            )}

            {entry.unit_price !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Unit Price
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {entry.currency || '€'} {entry.unit_price} / {volumeUnit}
                </Typography>
              </div>
            )}

            {entry.is_full_tank !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Tank Fill
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {entry.is_full_tank ? 'Full Tank' : 'Partial Fill'}
                </Typography>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Type-Specific: Service Items Breakdown */}
      {entry.kind === 'service' && entry.sub_items && entry.sub_items.length > 0 && (
        <GlassCard style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 700 }}>
              Service Parts & Labor ({entry.sub_items.length})
            </Typography>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entry.sub_items.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <div>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.name || 'Unnamed item'}
                  </Typography>
                  {item.partNumber && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Part #: {item.partNumber}
                    </Typography>
                  )}
                </div>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {entry.currency || '€'} {parseFloat(item.cost || '0').toFixed(2)}
                </Typography>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Type-Specific: Expense Category */}
      {entry.kind === 'expense' && entry.category && (
        <GlassCard style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 700 }}>
            Expense Category
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {entry.category}
          </Typography>
        </GlassCard>
      )}

      {/* Location & Merchant Card */}
      {(entry.vendor_name || (entry.lat !== undefined && entry.lon !== undefined)) && (
        <GlassCard style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 700 }}>
            Vendor & Location
          </Typography>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <LocationOnOutlinedIcon sx={{ color: 'primary.main', mt: 0.2 }} />
            <div style={{ flex: 1 }}>
              {entry.vendor_name && (
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {entry.vendor_name}
                </Typography>
              )}
              {entry.lat !== undefined && entry.lon !== undefined && (
                <div style={{ marginTop: 4 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Coordinates: {entry.lat.toFixed(5)}, {entry.lon.toFixed(5)}
                  </Typography>
                  <a
                    href={`https://maps.google.com/?q=${entry.lat},${entry.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: 4,
                      color: '#38bdf8',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Notes & Memo Card */}
      {entry.notes && (
        <GlassCard style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 700 }}>
            Notes & Memo
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.primary' }}>
            {entry.notes}
          </Typography>
        </GlassCard>
      )}

      {/* Attached Image / Receipt Section */}
      {entry.image_data && (
        <GlassCard style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 700 }}>
            Attached Receipt / Photo
          </Typography>

          <div
            onClick={() => setImageModalOpen(true)}
            style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              cursor: 'pointer',
              maxHeight: 280,
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(125, 211, 252, 0.15)',
            }}
          >
            <img
              src={entry.image_data}
              alt="Receipt attachment"
              style={{
                width: '100%',
                maxHeight: 280,
                objectFit: 'contain',
                transition: 'transform 0.2s ease',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: '0.75rem',
                color: '#fff',
                fontWeight: 600,
              }}
            >
              Click to enlarge
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
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              borderRadius: 4,
              overflow: 'hidden',
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Entry?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {entry.kind} entry from {entry.occurred_on}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {deleting ? 'Deleting...' : 'Delete Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
