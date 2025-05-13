const CACHE_NAME = 'kaban-cabinet-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/font.css',
  '/scripts/main.js',
  '/scripts/index.js',
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

// Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Service Worker Activation - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache Strategy: Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses or those from external URLs
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response - one to return, one to cache
          const responseToCache = response.clone();
          
          // Add to cache for next time
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        })
        .catch(() => {
          // If both cache and network fail, serve the offline page for HTML requests
          if (event.request.headers.get('Accept').includes('text/html')) {
            return caches.match('/404.html');
          }
          
          // Otherwise, just return the error
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
}); 