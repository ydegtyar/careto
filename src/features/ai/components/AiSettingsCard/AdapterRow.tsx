import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

interface Props {
  id: string;
  idx: number;
  totalLength: number;
  labels: Record<string, { title: string; desc: string }>;
  onMove: (idx: number, dir: 'up' | 'down') => void;
}

export function AdapterRow({ id, idx, totalLength, labels, onMove }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderRadius: 10,
        backgroundColor: 'var(--mui-palette-surfaceContainer)',
        border: '1px solid var(--mui-palette-divider)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Chip
          label={`#${idx + 1}`}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor:
              idx === 0
                ? 'color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent)'
                : 'var(--mui-palette-surface3)',
            color: idx === 0 ? 'primary.main' : 'text.primary',
          }}
        />
        <div>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {labels[id]?.title || id}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {labels[id]?.desc}
          </Typography>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        <Button
          size="small"
          disabled={idx === 0}
          onClick={() => onMove(idx, 'up')}
          sx={{ minWidth: 32, px: 0, textTransform: 'none' }}
        >
          ↑
        </Button>
        <Button
          size="small"
          disabled={idx === totalLength - 1}
          onClick={() => onMove(idx, 'down')}
          sx={{ minWidth: 32, px: 0, textTransform: 'none' }}
        >
          ↓
        </Button>
      </div>
    </div>
  );
}
