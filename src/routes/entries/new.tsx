import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAppStore } from '@/app/store';
import { data } from '@/data/client';
import type { Entry } from '@/data/client/types';
import { EntryForm } from '@/features/entries/components/EntryForm/EntryForm';

interface NewEntrySearchParams {
  shared?: string;
  kind?: string;
}

export const Route = createFileRoute('/entries/new')({
  validateSearch: (search: Record<string, unknown>): NewEntrySearchParams => ({
    shared: typeof search.shared === 'string' ? search.shared : undefined,
    kind: typeof search.kind === 'string' ? search.kind : undefined,
  }),
  component: NewEntryPage,
});

function NewEntryPage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const { activeVehicleId } = useAppStore();

  const handleSave = async (entryData: Partial<Entry>) => {
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      kind: entryData.kind || 'refuel',
      occurred_on: entryData.occurred_on || new Date().toISOString().slice(0, 10),
      odometer_m: entryData.odometer_m,
      amount_minor: entryData.amount_minor,
      currency: entryData.currency,
      usd_minor: entryData.usd_minor,
      business: entryData.business ?? 0,
      vendor_name: entryData.vendor_name,
      lat: entryData.lat,
      lon: entryData.lon,
      category: entryData.category,
      fuel_grade: entryData.fuel_grade,
      fuel_volume: entryData.fuel_volume,
      unit_price: entryData.unit_price,
      tank_id: entryData.tank_id,
      is_full_tank: entryData.is_full_tank,
      sub_items: entryData.sub_items,
      notes: entryData.notes,
      payment_method: entryData.payment_method,
      image_data: entryData.image_data,
    };

    await data.upsertEntry(newEntry);
    navigate({ to: '/garage' });
  };

  const handleCancel = () => {
    navigate({ to: '/garage' });
  };

  return (
    <EntryForm
      initialEntry={searchParams.kind ? ({ kind: searchParams.kind } as Entry) : null}
      onSave={handleSave}
      onCancel={handleCancel}
      submitLabel="Save Entry"
    />
  );
}
