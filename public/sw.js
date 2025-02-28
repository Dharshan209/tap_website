// Service Worker for TAP App
const CACHE_NAME = 'tap-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/social-preview.jpg',
  '/offline.html',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-first with cache fallback for HTML
// Cache-first with network fallback for assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip cross-origin requests and API requests
  if (!url.origin.includes(self.location.origin) || url.pathname.startsWith('/api/')) {
    return;
  }
  
  // For HTML requests (navigation) - Network first, then cache, then offline page
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Try to get from cache
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache, return offline page
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // For assets (images, CSS, JS) - Cache first, then network
  if (request.method === 'GET' && 
      (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/))) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            // Fetch updated version in background
            fetch(request)
              .then(response => {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(request, response.clone()));
              })
              .catch(() => {});
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(request)
            .then(response => {
              // Cache the response
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, responseClone));
              return response;
            });
        })
    );
    return;
  }
  
  // Default fetch behavior for everything else
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});