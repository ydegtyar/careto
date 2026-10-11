import Button from '@mui/material/Button';
import AddCircle from '@mui/icons-material/AddCircle';
import { useNavigate } from '@tanstack/react-router';

export function NewFuelEntryStickyCta() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: 'sticky',
        bottom: '80px',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px',
        marginTop: '20px',
      }}
    >
      <Button
        variant="contained"
        fullWidth
        startIcon={<AddCircle />}
        onClick={() => navigate({ to: '/entries/new', search: { kind: 'refuel' } as any })}
        sx={{
          borderRadius: '24px',
          py: '12px',
          fontWeight: 700,
          fontSize: '0.95rem',
          textTransform: 'none',
          background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
          boxShadow: '0 8px 24px rgba(56, 189, 248, 0.45)',
          color: '#0f172a',
          '&:hover': {
            background: 'linear-gradient(135deg, #7dd3fc, #38bdf8)',
          },
        }}
      >
        New Fuel Entry
      </Button>
    </div>
  );
}
