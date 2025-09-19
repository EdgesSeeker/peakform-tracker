// Development-freundlicher Service Worker
const CACHE_NAME = `peakform-v${Date.now()}`; // Immer neue Version
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// Keine URLs cachen in Development
const urlsToCache = isDevelopment ? [] : [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  if (isDevelopment) {
    // In Development: Sofort aktivieren, kein Caching
    self.skipWaiting();
    return;
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (isDevelopment) {
    // In Development: Immer aus dem Netzwerk laden
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache-first Strategie für Production
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  if (isDevelopment) {
    // In Development: Alle Caches löschen
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ Cache gelöscht:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  } else {
    // Production: Nur alte Caches löschen
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
  
  self.clients.claim();
});
