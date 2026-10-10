import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EditIcon from '@mui/icons-material/Edit';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import GroupIcon from '@mui/icons-material/Group';
import ShareIcon from '@mui/icons-material/Share';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/app/store';
import { data } from '@/data/client';
import { MemberRow } from '@/features/garage/components/MemberRow/MemberRow';
import { vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/garage/vehicles/$vehicleId/')({
  component: VehicleDetailPage,
});

interface Member {
  userId: string;
  role: string;
  name?: string;
  email?: string;
  joinedAt: string;
}

function VehicleDetailPage() {
  const { vehicleId } = Route.useParams();
  const navigate = useNavigate();
  const { activeVehicleId, setActiveVehicleId } = useAppStore();

  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery(vehiclesQueryOptions());
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  // Sharing state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteVehicle = async () => {
    if (!vehicleId) return;
    setDeleting(true);
    try {
      await data.deleteVehicle(vehicleId);
      if (activeVehicleId === vehicleId) {
        const remaining = vehicles.filter((v) => v.id !== vehicleId);
        setActiveVehicleId(remaining[0]?.id ?? null);
      }
      navigate({ to: '/garage' });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const fetchMembers = useCallback(async () => {
    if (!vehicleId) return;
    try {
      const res = await fetch(`/api/vehicles/members?vehicle_id=${vehicleId}`);
      if (res.ok) {
        const data = (await res.json()) as { members?: Member[] };
        setMembers(data.members || []);
      }
    } finally {
      setLoadingMembers(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInviteUrl(null);

    try {
      const res = await fetch('/api/vehicles/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vehicleId, email, role }),
      });

      const data = (await res.json()) as { error?: string; inviteUrl?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invite');
      }

      setInviteUrl(data.inviteUrl || null);
      setEmail('');
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await fetch('/api/vehicles/members', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vehicleId, targetUserId }),
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch {
      // Ignored
    }
  };

  if (loadingVehicles) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}
      >
        <CircularProgress sx={{ color: 'primary.main' }} />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
        <GlassCard style={{ padding: 24 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Vehicle Not Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            The requested vehicle could not be found or has been deleted.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate({ to: '/garage' })}
            sx={{ mt: 2, textTransform: 'none' }}
          >
            Back to Garage
          </Button>
        </GlassCard>
      </div>
    );
  }

  const isEv = vehicle.powertrain === 'ev';
  const VehicleIcon = isEv ? ElectricCarIcon : DirectionsCarIcon;
  const capacityDisplay = vehicle.tank_ml
    ? `${vehicle.tank_ml / 1000} L`
    : vehicle.battery_wh
      ? `${vehicle.battery_wh / 1000} kWh`
      : 'N/A';

  return (
    <div
      style={{
        padding: '16px',
        maxWidth: 720,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconButton
            onClick={() => navigate({ to: '/garage' })}
            sx={{ color: 'text.primary', border: '1px solid rgba(125, 211, 252, 0.15)' }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
              {vehicle.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Vehicle details & sharing settings
            </Typography>
          </div>
        </div>

        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() =>
            navigate({ to: '/garage/vehicles/$vehicleId/edit', params: { vehicleId } })
          }
          sx={{
            backgroundColor: 'rgba(125, 211, 252, 0.12)',
            color: 'primary.main',
            border: '1px solid rgba(125, 211, 252, 0.3)',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(125, 211, 252, 0.2)',
            },
          }}
        >
          Edit
        </Button>
      </div>

      {/* Readonly Specs Overview */}
      <GlassCard style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: 'rgba(125, 211, 252, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VehicleIcon style={{ color: vehicle.color || '#7dd3fc', fontSize: 26 }} />
          </div>
          <div>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {vehicle.trim ? `${vehicle.trim} • ` : ''}Powertrain:{' '}
              {vehicle.powertrain.toUpperCase()}
            </Typography>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            paddingTop: 8,
            borderTop: '1px solid rgba(125, 211, 252, 0.1)',
          }}
        >
          <div>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              VIN
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {vehicle.vin || 'Not provided'}
            </Typography>
          </div>

          <div>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              License Plate
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {vehicle.plate || 'Not provided'}
            </Typography>
          </div>

          <div>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Capacity
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {capacityDisplay}
            </Typography>
          </div>

          <div>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Starting Odometer
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {vehicle.initial_odometer_m
                ? `${vehicle.initial_odometer_m / 1000} ${vehicle.distance_unit}`
                : '0'}
            </Typography>
          </div>

          <div>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Units
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {vehicle.distance_unit} / {vehicle.efficiency_unit}
            </Typography>
          </div>

          <div>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Fuel Grades
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {vehicle.fuel_grades && vehicle.fuel_grades.length > 0
                ? vehicle.fuel_grades.join(', ')
                : 'Default'}
            </Typography>
          </div>
        </div>
      </GlassCard>

      {/* Vehicle Sharing Section */}
      <GlassCard style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShareIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Invite New Member
          </Typography>
        </div>

        {error && <Alert severity="error">{error}</Alert>}

        <form
          onSubmit={handleCreateInvite}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="driver@gmail.com"
            required
            fullWidth
            size="small"
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
            >
              <MenuItem value="editor">Editor — Can log refuels, services, notes</MenuItem>
              <MenuItem value="viewer">Viewer — Read-only telemetry and stats</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            sx={{
              backgroundColor: 'primary.main',
              color: 'onPrimary',
              fontWeight: 700,
              textTransform: 'none',
              mt: 0.5,
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: 'onPrimary' }} />
            ) : (
              'Generate Invite Link'
            )}
          </Button>
        </form>

        {inviteUrl && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: 'rgba(125, 211, 252, 0.1)',
              border: '1px solid rgba(125, 211, 252, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Invite Link Generated (Valid for 7 Days):
            </Typography>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                readOnly
                value={inviteUrl}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#e0e8f0',
                  fontSize: '0.8rem',
                  outline: 'none',
                  textOverflow: 'ellipsis',
                }}
              />
              <IconButton size="small" onClick={handleCopy} sx={{ color: 'primary.main' }}>
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Members List */}
      <GlassCard style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GroupIcon sx={{ color: '#c8a0f0', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Current Members ({members.length})
          </Typography>
        </div>

        {loadingMembers ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <CircularProgress size={24} sx={{ color: 'primary.main' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {members.map((member) => (
              <MemberRow key={member.userId} member={member} onRemove={handleRemoveMember} />
            ))}
          </div>
        )}
      </GlassCard>

      {/* Danger Zone: Delete Vehicle */}
      <GlassCard
        style={{
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          border: '1px solid rgba(248, 113, 113, 0.3)',
          backgroundColor: 'rgba(239, 68, 68, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DeleteIcon sx={{ color: 'error.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
            Delete Vehicle
          </Typography>
        </div>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Deleting this vehicle will remove all associated fuel logs, service history, and telemetry
          forever. This action cannot be undone.
        </Typography>

        <Button
          variant="contained"
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            alignSelf: 'flex-start',
            mt: 0.5,
          }}
        >
          Delete Vehicle
        </Button>
      </GlassCard>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        slotProps={{
          paper: {
            style: {
              backgroundColor: '#0f1524',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: 16,
              padding: 8,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <WarningAmberIcon color="error" /> Delete Vehicle?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            Are you sure you want to delete <strong>{vehicle.name}</strong>?
          </DialogContentText>
          <DialogContentText sx={{ color: 'text.secondary', mt: 1, fontSize: '0.875rem' }}>
            Everything will be deleted forever and this action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteVehicle}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            {deleting ? (
              <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : (
              'Delete Permanently'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
