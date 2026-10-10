import AddTaskIcon from '@mui/icons-material/AddTask';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { SuggestedReminderPreset } from '../../data/suggestedReminders';

interface SuggestedReminderItemProps {
  preset: SuggestedReminderPreset;
  onSetup: (preset: SuggestedReminderPreset) => void;
  onDismiss: (presetId: string) => void;
}

export function SuggestedReminderItem({ preset, onSetup, onDismiss }: SuggestedReminderItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '12px',
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {preset.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {preset.description}
        </Typography>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddTaskIcon fontSize="small" />}
          onClick={() => onSetup(preset)}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.2,
            whiteSpace: 'nowrap',
          }}
        >
          Setup
        </Button>
        <IconButton
          size="small"
          onClick={() => onDismiss(preset.id)}
          title="Dismiss suggestion forever"
          aria-label={`Dismiss ${preset.title} suggestion forever`}
          sx={{ color: 'text.secondary', opacity: 0.7, '&:hover': { opacity: 1 } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}
