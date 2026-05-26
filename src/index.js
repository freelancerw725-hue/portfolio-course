import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const CLIENT_BUILD_ID = 'live-payu-2026-05-26';
const BUILD_ID_STORAGE_KEY = 'portfolio-course:build-id';

async function disableServiceWorkers() {
  if (typeof window === 'undefined') {
    return;
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }
}

async function bustLegacyFrontendCaches() {
  if (typeof window === 'undefined') {
    return;
  }

  const previousBuildId = window.localStorage.getItem(BUILD_ID_STORAGE_KEY);

  if (previousBuildId === CLIENT_BUILD_ID) {
    return;
  }

  try {
    if ('caches' in window) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));
    }
  } catch (error) {
    console.error('[Cache] Failed to clear legacy frontend caches.', error);
  } finally {
    window.localStorage.setItem(BUILD_ID_STORAGE_KEY, CLIENT_BUILD_ID);
  }
}

void disableServiceWorkers();
void bustLegacyFrontendCaches();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
