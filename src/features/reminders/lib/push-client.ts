// Web Push registration and permission management

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function isPushSupported(): Promise<boolean> {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!(await isPushSupported())) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function subscribeToPush(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await isPushSupported())) {
      return { success: false, error: 'Push notifications not supported on this browser' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Push notification permission was denied' };
    }

    // Get public VAPID key from server
    const vapidRes = await fetch('/api/push/vapid-public-key');
    if (!vapidRes.ok) {
      throw new Error('Failed to retrieve VAPID public key');
    }
    const { publicKey } = await vapidRes.json();

    const reg = await navigator.serviceWorker.ready;
    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });

    const subJson = subscription.toJSON();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || 'en';

    // Register on backend
    const regRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: subJson.keys,
        tz,
        locale,
      }),
    });

    if (!regRes.ok) {
      const err = await regRes.json();
      throw new Error(err.error || 'Failed to save subscription on server');
    }

    return { success: true };
  } catch (err: unknown) {
    const errorObj = err as Error;
    console.error('Error subscribing to push:', err);
    return { success: false, error: errorObj.message || 'Unknown error subscribing' };
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const sub = await getPushSubscription();
    if (!sub) return true;

    // Remove from server
    await fetch('/api/push/device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });

    // Unsubscribe locally
    return await sub.unsubscribe();
  } catch (err) {
    console.error('Error unsubscribing from push:', err);
    return false;
  }
}
