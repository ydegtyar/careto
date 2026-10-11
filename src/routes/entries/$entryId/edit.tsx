import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAppStore } from '@/app/store';
import { data } from '@/data/client';
import type { Entry } from '@/data/client/types';
import { EntryForm } from '@/features/entries/components/EntryForm/EntryForm';
import { entriesQueryOptions } from '@/features/garage/queries/vehicles';

export const Route = createFileRoute('/entries/$entryId/edit')({
  component: EditEntryPage,
});

function EditEntryPage() {
  const { entryId } = Route.useParams();
  const navigate = useNavigate();
  const { activeVehicleId } = useAppStore();

  const { data: entries = [], isLoading: entriesLoading } = useQuery(
    entriesQueryOptions(activeVehicleId ?? undefined),
  );

  const entry: Entry | undefined = entries.find((e) => e.id === entryId);

  const handleSave = async (updatedData: Partial<Entry>) => {
    if (!entry) return;

    const mergedEntry: Entry = {
      ...entry,
      ...updatedData,
      id: entry.id, // Preserve existing ID
    };

    await data.upsertEntry(mergedEntry);
    navigate({ to: `/entries/${entry.id}` });
  };

  const handleCancel = () => {
    navigate({ to: `/entries/${entryId}` });
  };

  if (entriesLoading) {
    return (
      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Loading entry...
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

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          padding: '16px 16px 0 16px',
          maxWidth: 720,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 600,
            pl: 0,
            '&:hover': { background: 'transparent', color: 'primary.main' },
          }}
        >
          Cancel & Return
        </Button>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
          Edit {entry.kind} Entry
        </Typography>
      </div>

      <EntryForm
        initialEntry={entry}
        onSave={handleSave}
        onCancel={handleCancel}
        submitLabel="Update Entry"
      />
    </div>
  );
}
