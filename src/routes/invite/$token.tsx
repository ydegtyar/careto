import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/invite/$token')({
  component: InviteAcceptPage,
});

function InviteAcceptPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { setActiveVehicleId } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      setSuccess(true);
      if (data.vehicleId) {
        setActiveVehicleId(data.vehicleId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 20px',
        maxWidth: 420,
        margin: '0 auto',
      }}
    >
      <GlassCard
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <DirectionsCarIcon sx={{ color: 'primary.main', fontSize: 48 }} />

        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Vehicle Shared With You
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
          You have been invited to collaborate on a vehicle in Careto. Accept to synchronize
          records, maintenance schedules, and telemetry.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {success ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              marginTop: 8,
            }}
          >
            <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 40 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Invitation Accepted!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate({ to: '/garage' })}
              sx={{
                backgroundColor: 'primary.main',
                color: 'onPrimary',
                fontWeight: 700,
                mt: 1,
                px: 4,
              }}
            >
              Open Garage
            </Button>
          </div>
        ) : (
          <Button
            variant="contained"
            onClick={handleAccept}
            disabled={loading}
            fullWidth
            sx={{
              backgroundColor: 'primary.main',
              color: 'onPrimary',
              fontWeight: 700,
              mt: 2,
              py: 1.2,
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'onPrimary' }} />
            ) : (
              'Accept Invitation'
            )}
          </Button>
        )}
      </GlassCard>
    </div>
  );
}
