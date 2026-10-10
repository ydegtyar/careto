/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

// Precache assets injected by workbox
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', () => {
  // Allow pending service worker to take over immediately when commanded
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle Web Share Target POST request
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const title = (formData.get('title') as string) || undefined;
          const text = (formData.get('text') as string) || undefined;
          const shareUrl = (formData.get('url') as string) || undefined;
          const file = formData.get('receipt');

          interface SharedPayload {
            id: string;
            timestamp: number;
            title?: string;
            text?: string;
            url?: string;
            file?: File;
          }

          const payload: SharedPayload = {
            id: `share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: Date.now(),
          };
          if (title) payload.title = title;
          if (text) payload.text = text;
          if (shareUrl) payload.url = shareUrl;
          if (file && file instanceof File && file.size > 0) {
            payload.file = file;
          }

          // Open IndexedDB and store payload
          const dbReq = indexedDB.open('careto-share-target-db', 1);
          await new Promise<void>((resolve, reject) => {
            dbReq.onupgradeneeded = (e: IDBVersionChangeEvent) => {
              const db = (e.target as IDBOpenDBRequest).result;
              if (!db.objectStoreNames.contains('shared_payloads')) {
                db.createObjectStore('shared_payloads', { keyPath: 'id' });
              }
            };
            dbReq.onsuccess = (e: Event) => {
              const db = (e.target as IDBOpenDBRequest).result;
              const tx = db.transaction('shared_payloads', 'readwrite');
              const store = tx.objectStore('shared_payloads');
              store.put(payload);
              tx.oncomplete = () => resolve();
              tx.onerror = () => reject(tx.error);
            };
            dbReq.onerror = () => reject(dbReq.error);
          });
        } catch (err) {
          console.error('Failed to handle share target request in SW:', err);
        }

        // Redirect user to the new entry route with shared parameter
        return Response.redirect('/entries/new?shared=1', 303);
      })(),
    );
    return;
  }

  if (event.request.method !== 'GET') return;

  // Exclude API requests
  if (url.pathname.startsWith('/api')) return;
});

// Push notification listener
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'Careto';
    const options: NotificationOptions = {
      body: payload.body || 'New vehicle notification',
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/icons/icon-192.png',
      tag: payload.tag || 'careto-notification',
      data: {
        url: payload.url || '/reminders',
        reminderId: payload.reminderId,
      },
    };

    const nav = navigator as Navigator & {
      setAppBadge?: (contents?: number) => Promise<void>;
    };

    event.waitUntil(
      Promise.all([
        self.registration.showNotification(title, options),
        nav.setAppBadge ? nav.setAppBadge(1) : Promise.resolve(),
      ]),
    );
  } catch (err) {
    console.error('Failed to parse push event payload:', err);
    event.waitUntil(
      self.registration.showNotification('Careto Reminder', {
        body: event.data.text(),
        icon: '/icons/icon-192.png',
      }),
    );
  }
});

// Notification click listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/reminders';

  event.waitUntil(
    (async () => {
      // Clear app badge if supported
      const nav = navigator as Navigator & {
        clearAppBadge?: () => Promise<void>;
      };
      if (nav.clearAppBadge) {
        try {
          await nav.clearAppBadge();
        } catch {}
      }

      // Check if window is already open
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if ('focus' in client) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === targetUrl) {
            return client.focus();
          }
        }
      }

      // If no matching tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
