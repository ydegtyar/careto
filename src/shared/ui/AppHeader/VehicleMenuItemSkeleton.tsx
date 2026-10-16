import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import type React from 'react';

export const VehicleMenuItemSkeleton: React.FC = () => (
  <MenuItem
    disabled
    sx={{
      borderRadius: '14px',
      my: '4px',
      py: 1.2,
      px: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      cursor: 'default',
      '&.Mui-disabled': {
        opacity: 1,
      },
    }}
  >
    <Skeleton
      variant="rounded"
      width={36}
      height={36}
      sx={{ borderRadius: '10px', flexShrink: 0 }}
    />
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Skeleton variant="text" width="55%" height={16} />
      <Skeleton variant="text" width="75%" height={12} />
    </div>
    <Skeleton variant="circular" width={24} height={24} sx={{ flexShrink: 0 }} />
  </MenuItem>
);

export default VehicleMenuItemSkeleton;
