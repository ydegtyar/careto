import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { DeleteVehicleZone } from '@/features/garage/components/DeleteVehicleZone/DeleteVehicleZone';
import { VehicleInviteSection } from '@/features/garage/components/VehicleInviteSection/VehicleInviteSection';
import { VehicleMembersList } from '@/features/garage/components/VehicleMembersList/VehicleMembersList';
import { VehicleSpecsOverview } from '@/features/garage/components/VehicleSpecsOverview/VehicleSpecsOverview';
import { vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './VehicleDetailPage.styles';

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

  const queryClient = useQueryClient();
  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery(vehiclesQueryOptions());
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const handleUnauthorized = useCallback(() => {
    setMembers([]);
    queryClient.removeQueries({ queryKey: ['vehicles'] });
  }, [queryClient]);

  const fetchMembers = useCallback(async () => {
    if (!vehicleId) return;
    try {
      const res = await fetch(`/api/vehicles/members?vehicle_id=${vehicleId}`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as { members?: Member[] };
        setMembers(data.members || []);
      }
    } finally {
      setLoadingMembers(false);
    }
  }, [vehicleId, handleUnauthorized]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await fetch('/api/vehicles/members', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ vehicleId, targetUserId }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        fetchMembers();
      }
    } catch {
      // Ignored
    }
  };

  if (loadingVehicles) {
    return (
      <div style={styles.loadingContainer}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={styles.notFoundWrapper}>
        <GlassCard style={styles.notFoundCard}>
          <Typography variant="h6" sx={styles.notFoundTitle}>
            Vehicle Not Found
          </Typography>
          <Typography variant="body2" sx={styles.notFoundText}>
            The requested vehicle could not be found or has been deleted.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate({ to: '/garage' })}
            sx={styles.notFoundButton}
          >
            Back to Garage
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div style={styles.headerTitleGroup}>
          <IconButton
            onClick={() => navigate({ to: '/garage' })}
            sx={styles.backButton}
            aria-label="Back to Garage"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <div>
            <Typography variant="h6" sx={styles.title}>
              {vehicle.name}
            </Typography>
            <Typography variant="caption" sx={styles.subtitle}>
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
          sx={styles.editButton}
        >
          Edit
        </Button>
      </div>

      {/* Readonly Specs Overview */}
      <VehicleSpecsOverview vehicle={vehicle} />

      {/* Members List */}
      <VehicleMembersList
        members={members}
        loading={loadingMembers}
        onRemoveMember={handleRemoveMember}
      />

      {/* Vehicle Sharing Section */}
      <VehicleInviteSection vehicleId={vehicleId} onUnauthorized={handleUnauthorized} />

      {/* Danger Zone: Delete Vehicle */}
      <DeleteVehicleZone vehicleId={vehicleId} vehicleName={vehicle.name} vehicles={vehicles} />
    </div>
  );
}
