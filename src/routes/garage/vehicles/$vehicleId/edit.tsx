import Typography from '@mui/material/Typography';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { data } from '@/data/client';
import { vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import {
  VehicleForm,
  type VehicleFormValues,
} from '@/features/vehicles/components/VehicleForm/VehicleForm';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/garage/vehicles/$vehicleId/edit')({
  component: EditVehiclePage,
});

function EditVehiclePage() {
  const { vehicleId } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const [submitting, setSubmitting] = useState(false);

  if (!vehicle) {
    return (
      <div style={{ padding: '16px', maxWidth: 480, margin: '0 auto' }}>
        <GlassCard style={{ padding: '24px 20px' }}>
          <Typography variant="body1" color="text.secondary">
            Vehicle not found.
          </Typography>
        </GlassCard>
      </div>
    );
  }

  const handleSubmit = async (values: VehicleFormValues) => {
    setSubmitting(true);
    try {
      const capacityVal = parseInt(values.capacity || '0', 10);

      await data.upsertVehicle({
        id: vehicle.id,
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
      });

      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });

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
      <VehicleForm
        initialVehicle={vehicle}
        onSubmit={handleSubmit}
        onCancel={() => router.navigate({ to: '/garage' })}
        submitting={submitting}
      />
    </div>
  );
}
