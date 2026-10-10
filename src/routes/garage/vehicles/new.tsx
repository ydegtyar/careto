import Typography from '@mui/material/Typography';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { data } from '@/data/client';
import {
  VehicleForm,
  type VehicleFormValues,
} from '@/features/vehicles/components/VehicleForm/VehicleForm';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/garage/vehicles/new')({
  component: AddVehiclePage,
});

function AddVehiclePage() {
  const router = useRouter();
  const { setActiveVehicleId } = useAppStore();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: VehicleFormValues) => {
    setSubmitting(true);
    try {
      const id = crypto.randomUUID();
      const capacityVal = parseInt(values.capacity || '0', 10);

      await data.upsertVehicle({
        id,
        name: values.name || `${values.make} ${values.model}`,
        make: values.make,
        model: values.model,
        year: parseInt(values.year, 10),
        trim: values.trim || undefined,
        plate: values.plate || undefined,
        vin: values.vin || undefined,
        color: values.color,
        powertrain: values.powertrain,
        tank_ml: values.powertrain === 'ev' ? undefined : capacityVal * 1000,
        battery_wh:
          values.powertrain === 'ev' || values.powertrain === 'phev'
            ? capacityVal * 1000
            : undefined,
        initial_odometer_m: Math.round(parseFloat(values.initialOdometerKm || '0') * 1000),
        tanks: values.tanks,
        fuel_grades: values.fuelGrades,
        distance_unit: values.distanceUnit,
        efficiency_unit: values.efficiencyUnit,
        used_by_business: values.usedByBusiness ?? false,
      });

      setActiveVehicleId(id);
      router.navigate({ to: '/garage' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        maxWidth: 720,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <GlassCard
        style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <div>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -0.4 }}>
            Add New Vehicle
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Configure vehicle specs, powertrain energy, color swatch, and starting telemetry
          </Typography>
        </div>

        <VehicleForm
          onSubmit={handleSubmit}
          onCancel={() => router.navigate({ to: '/garage' })}
          submitting={submitting}
        />
      </GlassCard>
    </div>
  );
}
