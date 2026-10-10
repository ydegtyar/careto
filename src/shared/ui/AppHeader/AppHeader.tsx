import NotificationsIcon from '@mui/icons-material/Notifications';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useAppStore } from '@/app/store';
import { remindersQueryOptions, vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import { computeDue } from '@/features/reminders/lib/compute-due';
import { CaretoLogo } from '@/shared/ui/CaretoLogo/CaretoLogo';
import styles from './AppHeader.module.scss';
import { CarSelectorDropdown } from './CarSelectorDropdown';
import { UserMenu } from './UserMenu';

export function AppHeader() {
  const router = useRouter();
  const { activeVehicleId } = useAppStore();

  const { data: vehicles = [], isLoading } = useQuery(vehiclesQueryOptions());
  const { data: reminders = [] } = useQuery(remindersQueryOptions(activeVehicleId ?? undefined));

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  const pendingRemindersCount = reminders.filter((r) => {
    const res = computeDue(
      {
        id: r.id,
        kind: r.kind,
        title: r.title,
        mode: r.mode ?? 'km',
        interval_m: r.interval_m,
        interval_days: r.interval_days,
        lead_m: r.lead_m,
        lead_days: r.lead_days,
      },
      {
        currentOdometerM: 42150000,
        currentDate: new Date().toISOString().split('T')[0] ?? '2026-10-08',
      },
    );
    return res.status === 'due' || res.status === 'overdue';
  }).length;

  return (
    <AppBar position="fixed" elevation={0} className={styles.root}>
      <Toolbar
        className={styles.toolbar}
        sx={{
          maxWidth: 1024,
          width: '100%',
          mx: 'auto',
          boxSizing: 'border-box',
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Left: App Logo */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'inherit',
            }}
            onClick={() => router.navigate({ to: '/garage' })}
            aria-label="Go to Garage"
          >
            <CaretoLogo size={36} animated={true} />
          </button>
        </div>
        {/* Center: Car Selector Dropdown */}
        <CarSelectorDropdown
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          isLoading={isLoading}
        />

        {/* Right: Notifications & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Notification Center Icon */}
          <IconButton
            size="small"
            onClick={() => router.navigate({ to: '/reminders' })}
            sx={{ color: 'text.secondary', p: 1 }}
            aria-label="Notification Center"
          >
            <Badge badgeContent={pendingRemindersCount} color="error">
              <NotificationsIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          {/* User Profile Avatar / Menu */}
          <UserMenu />
        </div>
      </Toolbar>
    </AppBar>
  );
}
