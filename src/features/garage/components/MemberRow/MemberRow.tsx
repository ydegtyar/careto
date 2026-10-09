import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';

export interface MemberItem {
  userId: string;
  name?: string;
  email?: string;
  role: string;
}

interface Props {
  member: MemberItem;
  onRemove: (userId: string) => void;
}

export function MemberRow({ member, onRemove }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: 8,
        backgroundColor: 'rgba(15, 21, 36, 0.5)',
        border: '1px solid rgba(125, 211, 252, 0.08)',
      }}
    >
      <div>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {member.name || member.email || 'Member'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {member.email || member.userId.slice(0, 8)}
        </Typography>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusPill
          label={member.role.toUpperCase()}
          status={member.role === 'owner' ? 'upcoming' : 'ok'}
        />
        {member.role !== 'owner' && (
          <IconButton
            size="small"
            onClick={() => onRemove(member.userId)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </div>
    </div>
  );
}
