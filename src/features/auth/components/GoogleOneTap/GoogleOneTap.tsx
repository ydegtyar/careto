import { useEffect } from 'react';
import { oneTap } from '@/lib/auth-client';

export function GoogleOneTap() {
  useEffect(() => {
    let unmounted = false;

    async function initOneTap() {
      try {
        if (typeof window === 'undefined' || unmounted) return;

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
    };
  }, []);

  return null;
}
