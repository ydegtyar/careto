import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect, useState } from 'react';

/**
 * Custom hook for automatic PWA cache busting and update checking.
 * Checks for service worker updates periodically (every 60 mins) and on visibility change.
 * Automatically updates the service worker and reloads the client when a new build is detected.
 */
export function useAutoUpdatePWA() {
  if (!import.meta.env.PROD) {
    return { needRefresh: false, updateServiceWorker: () => {} };
  }
  const [needRefresh, setNeedRefresh] = useState(false);

  const {
    needRefresh: [needRefreshState],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedRefresh() {
      setNeedRefresh(true);
    },
    onRegisteredSW(_swUrl: string, r?: ServiceWorkerRegistration) {
      if (!r) return;

      // Periodically check for service worker update every 60 minutes
      const interval = setInterval(
        async () => {
          if (!navigator.onLine) return;
          try {
            await r.update();
          } catch {
            // Ignore network errors when checking for SW update
          }
        },
        60 * 60 * 1000,
      );

      // Check on tab visibility change (e.g., user returns to tab)
      const handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          try {
            await r.update();
          } catch {
            // Ignore network errors
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    },
    onRegisterError(error: unknown) {
      console.error('Service worker registration failed:', error);
    },
  });

  // Auto-update as soon as a new service worker version is waiting
  useEffect(() => {
    if (needRefresh || needRefreshState) {
      updateServiceWorker(true);
    }
  }, [needRefresh, needRefreshState, updateServiceWorker]);

  return {
    needRefresh: needRefresh || needRefreshState,
    updateServiceWorker: () => updateServiceWorker(true),
  };
}
