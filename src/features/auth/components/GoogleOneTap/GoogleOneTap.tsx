import { useEffect } from 'react';
import { oneTap } from '@/lib/auth-client';

export function GoogleOneTap() {
  useEffect(() => {
    let unmounted = false;

    // Strict guard: Only execute when on /sign-in page
    if (typeof window === 'undefined' || !window.location.pathname.startsWith('/sign-in')) {
      return;
    }

    async function initOneTap() {
      try {
        if (unmounted || !window.location.pathname.startsWith('/sign-in')) return;

        await oneTap({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = '/garage';
            },
          },
        });
      } catch (err) {
        console.warn('Google One Tap init notice:', err);
      }
    }

    initOneTap();

    return () => {
      unmounted = true;
      // Cancel GIS prompt if present on unmount
      try {
        const win = window as Window & {
          google?: {
            accounts?: {
              id?: {
                cancel: () => void;
              };
            };
          };
        };
        if (typeof window !== 'undefined' && win.google?.accounts?.id) {
          win.google.accounts.id.cancel();
        }
      } catch {
        // Ignore cancel errors
      }
    };
  }, []);

  return null;
}
