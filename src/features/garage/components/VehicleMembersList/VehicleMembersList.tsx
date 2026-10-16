import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { type MemberItem, MemberRow } from '../MemberRow/MemberRow';
import { styles } from './VehicleMembersList.styles';

export interface Props {
  members: MemberItem[];
  loading?: boolean;
  onRemoveMember: (userId: string) => void;
}

export const VehicleMembersList: React.FC<Props> = ({
  members,
  loading = false,
  onRemoveMember,
}) => {
  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <div style={styles.iconWrapper}>
          <GroupOutlinedIcon sx={styles.headerIcon} />
        </div>
        <Typography variant="subtitle2" sx={styles.headerTitle}>
          Current Members ({loading ? '...' : members.length})
        </Typography>
      </div>

      {loading ? (
        <div style={styles.skeletonContainer}>
          <div style={styles.skeletonTextCol}>
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="60%" height={14} />
          </div>
          <div style={styles.skeletonActions}>
            <Skeleton variant="rounded" width={64} height={22} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="circular" width={28} height={28} />
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {members.map((member) => (
            <MemberRow key={member.userId} member={member} onRemove={onRemoveMember} />
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default VehicleMembersList;
