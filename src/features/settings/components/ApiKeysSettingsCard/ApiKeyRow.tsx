import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

interface Props {
  apiKey: ApiKeyItem;
  onRevoke: (id: string) => void;
}

export const ApiKeyRow = ({ apiKey, onRevoke }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderRadius: 8,
        backgroundColor: 'var(--mui-palette-surfaceContainer)',
        border: '1px solid var(--mui-palette-divider)',
      }}
    >
      <div>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {apiKey.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
          {apiKey.keyPrefix}
        </Typography>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {apiKey.lastUsedAt
            ? `Used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`
            : 'Never used'}
        </Typography>
        <Button
          size="small"
          color="error"
          variant="text"
          onClick={() => onRevoke(apiKey.id)}
          sx={{ textTransform: 'none' }}
        >
          Revoke
        </Button>
      </div>
    </div>
  );
};
