import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { useLocation, useRouter } from '@tanstack/react-router';
import styles from './BottomNav.module.scss';

export function BottomNav() {
  const router = useRouter();
  const location = useLocation();

  const current = location.pathname.startsWith('/entries/new')
    ? '/entries/new'
    : location.pathname.startsWith('/analytics')
      ? '/analytics'
      : location.pathname.startsWith('/reminders')
        ? '/reminders'
        : location.pathname.startsWith('/settings')
          ? '/settings'
          : '/garage';

  return (
    <div className={styles.wrapper}>
      <div className={styles.topHighlight} />
      <BottomNavigation
        value={current}
        showLabels
        className={styles.root}
        onChange={(_, val: string) => {
          router.navigate({ to: val });
        }}
      >
        <BottomNavigationAction
          label="Garage"
          value="/garage"
          icon={<DirectionsCarIcon />}
          className={styles.action}
        />
        <BottomNavigationAction
          label="Reminders"
          value="/reminders"
          icon={<NotificationsIcon />}
          className={styles.action}
        />
        <BottomNavigationAction
          aria-label="Add new entry"
          value="/entries/new"
          disableRipple
          icon={
            <div className={styles.addBtn}>
              <div className={styles.addBtnGlossInner} />
              <div className={styles.addBtnGlossTop} />
              <AddIcon className={styles.addIcon} />
            </div>
          }
          className={`${styles.action} ${styles.addAction}`}
        />
        <BottomNavigationAction
          label="Analytics"
          value="/analytics"
          icon={<BarChartIcon />}
          className={styles.action}
        />
        <BottomNavigationAction
          label="Settings"
          value="/settings"
          icon={<SettingsIcon />}
          className={styles.action}
        />
      </BottomNavigation>
    </div>
  );
}
