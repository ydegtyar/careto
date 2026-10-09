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
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(125, 211, 252, 0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Chip
          label={`#${idx + 1}`}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor: idx === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
            color: idx === 0 ? '#38bdf8' : 'text.primary',
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
