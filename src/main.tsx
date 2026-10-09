import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import '@/styles/global.scss';

import setupLocatorUI from '@locator/runtime';
import { Providers } from '@/app/providers';

if (import.meta.env.DEV) {
  setupLocatorUI();
}

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
