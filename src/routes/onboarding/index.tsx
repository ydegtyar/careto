import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import StorageIcon from '@mui/icons-material/Storage';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { data } from '@/data/client';
import { subscribeToPush } from '@/features/reminders/lib/push-client';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/onboarding/')({
  component: OnboardingPage,
});

const steps = ['Offline Storage', 'Reminders', 'First Vehicle'];

function OnboardingPage() {
  const navigate = useNavigate();
  const { setActiveVehicleId } = useAppStore();
  const [activeStep, setActiveStep] = useState(0);

  // Storage step
  const [_storagePersisted, setStoragePersisted] = useState(false);

  // Push step
  const [_pushEnabled, setPushEnabled] = useState(false);

  // Vehicle step
  const [name, setName] = useState('My Car');
  const [powertrain, setPowertrain] = useState<'ice' | 'hybrid' | 'phev' | 'ev'>('ev');
  const [odometerKm, setOdometerKm] = useState('0');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [submitting, setSubmitting] = useState(false);

  const handlePersistStorage = async () => {
    if (
      typeof navigator !== 'undefined' &&
      'storage' in navigator &&
      'persist' in navigator.storage
    ) {
      try {
        const persisted = await navigator.storage.persist();
        setStoragePersisted(persisted);
      } catch (_) {
        setStoragePersisted(true);
      }
    } else {
      setStoragePersisted(true);
    }
    setActiveStep(1);
  };

  const handleEnablePush = async () => {
    try {
      const res = await subscribeToPush();
      setPushEnabled(res.success);
    } catch (_) {
      // Continue even if rejected
    }
    setActiveStep(2);
  };

  const handleCreateFirstVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const vehicleId = crypto.randomUUID();
      const initialOdometerM = (parseFloat(odometerKm) || 0) * 1000;

      await data.upsertVehicle({
        id: vehicleId,
        name: name.trim() || 'My Car',
        powertrain,
        initial_odometer_m: initialOdometerM,
        distance_unit: distanceUnit,
        efficiency_unit: powertrain === 'ev' ? 'kwh_100km' : 'l_100km',
      });

      setActiveVehicleId(vehicleId);
      navigate({ to: '/garage' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 500,
        margin: '0 auto',
      }}
    >
      <header style={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
          Welcome to Careto
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Your offline-first vehicle expense & telemetry companion
        </Typography>
      </header>

      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{ '& .MuiStepLabel-label': { fontSize: '0.75rem' } }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Storage Persist */}
      {activeStep === 0 && (
        <GlassCard style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StorageIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <div>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Persistent Offline Storage
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Store vehicle databases directly on your device
              </Typography>
            </div>
          </div>

          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Careto uses OPFS SQLite replicas so your expenses, refuels, and maintenance records
            remain accessible even without network connectivity.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            onClick={handlePersistStorage}
            sx={{ mt: 1, py: 1.2, fontWeight: 700, borderRadius: 2 }}
          >
            Enable Persistent Storage
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={() => setActiveStep(1)}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Skip for now
          </Button>
        </GlassCard>
      )}

      {/* Step 2: Push Notifications */}
      {activeStep === 1 && (
        <GlassCard style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationsActiveIcon sx={{ color: 'secondary.main', fontSize: 32 }} />
            <div>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Smart Dual-Trigger Alerts
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Never miss an oil change or inspection
              </Typography>
            </div>
          </div>

          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Receive proactive reminders based on either distance reached or date elapsed, calculated
            automatically against your driving habits.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            onClick={handleEnablePush}
            sx={{ mt: 1, py: 1.2, fontWeight: 700, borderRadius: 2 }}
          >
            Enable Reminders
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={() => setActiveStep(2)}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Maybe later
          </Button>
        </GlassCard>
      )}

      {/* Step 3: First Vehicle */}
      {activeStep === 2 && (
        <form onSubmit={handleCreateFirstVehicle}>
          <GlassCard style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <DirectionsCarIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <div>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Add Your Vehicle
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Set up your primary vehicle profile
                </Typography>
              </div>
            </div>

            <TextField
              label="Vehicle Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              size="small"
              placeholder="e.g. Model 3, Golf GTI"
            />

            <TextField
              select
              label="Powertrain"
              value={powertrain}
              onChange={(e) => setPowertrain(e.target.value as 'ev' | 'hybrid' | 'phev' | 'ice')}
              fullWidth
              size="small"
            >
              <MenuItem value="ev">Electric (EV)</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
              <MenuItem value="phev">Plug-in Hybrid (PHEV)</MenuItem>
              <MenuItem value="ice">Gasoline / Diesel (ICE)</MenuItem>
            </TextField>

            <div style={{ display: 'flex', gap: 12 }}>
              <TextField
                label="Current Odometer"
                type="number"
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                fullWidth
                size="small"
                style={{ flex: 2 }}
              />

              <TextField
                select
                label="Unit"
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                size="small"
                style={{ flex: 1 }}
              >
                <MenuItem value="km">km</MenuItem>
                <MenuItem value="mi">mi</MenuItem>
              </TextField>
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              startIcon={<CheckCircleIcon />}
              sx={{ mt: 1, py: 1.2, fontWeight: 700, borderRadius: 2 }}
            >
              {submitting ? 'Setting up...' : 'Get Started'}
            </Button>
          </GlassCard>
        </form>
      )}
    </div>
  );
}
