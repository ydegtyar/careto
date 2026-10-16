import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import { styles } from './MemberRow.styles';

export interface MemberItem {
  userId: string;
  name?: string;
  email?: string;
  role: string;
}

export interface Props {
  member: MemberItem;
  onRemove: (userId: string) => void;
}

export const MemberRow: React.FC<Props> = ({ member, onRemove }) => (
  <div style={styles.container}>
    <div style={styles.memberInfo}>
      <Typography variant="body2" sx={styles.memberName}>
        {member.name || member.email || 'Member'}
      </Typography>
      <Typography variant="caption" sx={styles.memberEmail}>
        {member.email || member.userId.slice(0, 8)}
      </Typography>
    </div>

    <div style={styles.actions}>
      <StatusPill
        label={member.role.toUpperCase()}
        status={member.role === 'owner' ? 'upcoming' : 'ok'}
      />
      {member.role !== 'owner' && (
        <IconButton
          size="small"
          onClick={() => onRemove(member.userId)}
          aria-label={`Remove ${member.name || member.email || 'member'}`}
          sx={styles.deleteButton}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </div>
  </div>
);
