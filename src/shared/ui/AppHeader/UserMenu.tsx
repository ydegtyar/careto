import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { styles } from './UserMenu.styles';

export interface Props {
  // Option for minimal props or override if needed
  userName?: string;
  userEmail?: string;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
    }
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  if (email && email.trim().length > 0) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return 'CU';
}

function getStoredUser(): { name?: string; email?: string } | null {
  try {
    const sessionStr = localStorage.getItem('careta_session');
    if (sessionStr) {
      return JSON.parse(sessionStr);
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
}

export const UserMenu: React.FC<Props> = ({ userName, userEmail }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const storedUser = getStoredUser();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const displayName = userName ?? session?.user?.name ?? storedUser?.name;
  const displayEmail = userEmail ?? session?.user?.email ?? storedUser?.email;

  const initials = getInitials(displayName, displayEmail);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateSettings = () => {
    handleClose();
    router.navigate({ to: '/settings' });
  };

  const handleSignOut = () => {
    handleClose();
    localStorage.removeItem('careta_session');
    router.navigate({ to: '/sign-in' });
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} sx={{ p: 0.5 }} aria-label="User profile">
        <Avatar sx={styles.avatar}>{initials}</Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: styles.menuPaper,
          },
        }}
      >
        {(displayName || displayEmail) && (
          <div>
            <div style={styles.userInfoHeader}>
              {displayName && <div style={styles.userName}>{displayName}</div>}
              {displayEmail && <div style={styles.userEmail}>{displayEmail}</div>}
            </div>
            <Divider sx={{ borderColor: 'rgba(125, 211, 252, 0.15)', my: 0.5 }} />
          </div>
        )}

        <MenuItem onClick={handleNavigateSettings} sx={{ fontSize: '0.85rem' }}>
          <ListItemIcon>
            <SettingsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </ListItemIcon>
          Settings
        </MenuItem>

        <MenuItem onClick={handleSignOut} sx={{ fontSize: '0.85rem', color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
