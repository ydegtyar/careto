import Button from '@mui/material/Button';
import BuildCircle from '@mui/icons-material/BuildCircle';
import { useNavigate } from '@tanstack/react-router';

export function LogServiceStickyCta() {
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
        startIcon={<BuildCircle />}
        onClick={() => navigate({ to: '/entries/new', search: { kind: 'service' } as any })}
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
        Log New Service or Parts
      </Button>
    </div>
  );
}
