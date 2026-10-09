import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import '@/styles/global.scss';

import setupLocatorUI from '@locator/runtime';
import { registerSW } from 'virtual:pwa-register';
import { Providers } from '@/app/providers';

if (import.meta.env.DEV) {
  setupLocatorUI();
}

// Handle automatic page reload when new SW takes control (controllerchange)
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

// Register service worker with automatic update checks and cache busting
const updateSW = registerSW({
  onNeedRefresh() {
    // When a new version is available, activate it immediately
    updateSW(true);
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

// Periodically check for service worker updates (e.g. every hour)
setInterval(() => {
  updateSW();
}, 60 * 60 * 1000);

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Providers />
    </React.StrictMode>,
  );
}

// Guard reload on chunk preload error
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem('preload-error-reload')) {
    sessionStorage.setItem('preload-error-reload', 'true');
    window.location.reload();
  }
});

