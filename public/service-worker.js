/**
 * @file public/service-worker.js
 * @description Service worker for the ElectIQ PWA. Handles caching of static assets
 * and provides offline fallback functionality.
 */

const CACHE_NAME = `electiq-v2-${new Date().getTime()}`;
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  // JS and CSS bundles will be added by the build process, but we can add placeholders
  // or cache them dynamically. For Vite, the names are hashed.
  // We will cache assets dynamically as they are requested.
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html' // The offline fallback page
];

// Create a simple offline fallback page
const OFFLINE_FALLBACK_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ElectIQ - Offline</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9fafb; color: #1f2937; }
    .container { text-align: center; }
    h1 { font-size: 2rem; color: #1d4ed8; }
    p { color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <h1>ElectIQ</h1>
    <p>You are currently offline.</p>
    <p>Please reconnect to the internet to continue using the full application.</p>
  </div>
</body>
</html>
`;


self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      // Cache the offline fallback page itself
      const offlinePageRequest = new Request('/offline.html');
      const offlinePageResponse = new Response(OFFLINE_FALLBACK_PAGE, {
        headers: { 'Content-Type': 'text/html' }
      });
      cache.put(offlinePageRequest, offlinePageResponse);
      
      return cache.addAll(ASSETS_TO_CACHE.filter(url => url !== '/offline.html'));
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, use a network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // For other requests (assets), use a cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // If the request is successful, cache it for future use
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
        // If both cache and network fail (e.g., for an image),
        // we don't have a generic fallback, so we just let it fail.
    })
  );
});
