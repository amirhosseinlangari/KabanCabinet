/**
 * Service Worker for Kaban Cabinet
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'kaban-cabinet-v1';

// Assets to cache on install
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/font.css',
  '/scripts/main.js',
  '/scripts/index.js',
  '/scripts/sw-register.js',
  '/assets/Photo/نمادک کابان.png',
  '/assets/Photo/kitchen.jpg',
  '/assets/Photo/minimalist kitchen 1.jpg',
  '/assets/Photo/کابینت mdf.jpg',
  '/assets/Photo/کابینت فلزی.jpg',
  '/assets/Photo/کابینت های گلاس.jpg',
  '/assets/Photo/کابینت ممبران.jpg',
  '/assets/Photo/کابینت نئو کلاسیک.jpg',
  '/manifest.json',
  '/404.html',
  '/weblog/index.html',
  '/weblog/css/weblog-styles.css',
  '/weblog/js/weblog.js',
  '/weblog/images/entekhab-cabinet.jpg',
  '/weblog/posts/rahnama-entekhab-cabinet.html'
];

/**
 * Service Worker Installation
 * Caches essential files for offline access
 */
self.addEventListener('install', event => {
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  // Cache all essential assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

/**
 * Service Worker Activation
 * Cleans up old caches when a new service worker is activated
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Take control of all clients as soon as activated
      return self.clients.claim();
    })
  );
});

/**
 * Fetch Event Handler
 * Strategy: Cache First, falling back to Network
 */
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from network
      return fetch(event.request)
        .then(response => {
          // Don't cache non-successful responses or external URLs
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response - one to return, one to cache
          const responseToCache = response.clone();
          
          // Add to cache for next time
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        })
        .catch(() => {
          // If both cache and network fail, serve the offline page for HTML requests
          if (event.request.headers.get('Accept')?.includes('text/html')) {
            return caches.match('/404.html');
          }
          
          // Otherwise, return a network error response
          return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
}); 