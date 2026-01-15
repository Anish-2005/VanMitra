"use client";

import { useEffect, useState, useCallback } from 'react';

export default function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const refreshPage = useCallback(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    navigator.serviceWorker.getRegistration().then((reg) => {
      registration = reg; // reg is ServiceWorkerRegistration | undefined
      if (!registration) return;

      if (registration.waiting) {
        setUpdateAvailable(true);
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration?.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New controller -> reload to use it
      window.location.reload();
    });

    return () => {
      // best-effort cleanup
    };
  }, []);

  return { updateAvailable, refreshPage };
}
