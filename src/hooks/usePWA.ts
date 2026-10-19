import { useState, useEffect } from 'react';

export function usePWA() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect if running inside Capacitor Android native app or WebView
    const isCapacitorOrWebView =
      typeof window !== 'undefined' &&
      (
        Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()) ||
        window.location.protocol === 'capacitor:' ||
        window.location.protocol === 'ionic:' ||
        (window.location.hostname === 'localhost' && /Android|wv|WebView/i.test(navigator.userAgent))
      );

    if (isCapacitorOrWebView) {
      // In Capacitor native Android, unregister any stale Service Worker and clear CacheStorage
      // to prevent cached old index.html from causing 404s/white screen after APK updates
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => reg.unregister().catch(() => {}));
        }).catch(() => {});
      }
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key).catch(() => {}));
        }).catch(() => {});
      }
    } else {
      // Standard browser PWA environment
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
  };
}


