const CACHE_VERSION = 2;
const CACHE_NAME = `meendum-v${CACHE_VERSION}`;

// Only cache the HTML shell and icons — Vite-bundled JS/CSS have hashed
// filenames that change on each build, so they are cached on first fetch.
const SHELL_URLS = [
  '/',
  '/index.html',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', (event) => {
  // Network-first for navigation (HTML pages) so users always get updates.
  // Cache-first for static assets (JS/CSS/images) for speed.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Skip caching for non-GET requests (POST, PUT, DELETE, PATCH)
    // Cache API only supports GET/HEAD/OPTIONS
    if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
      event.respondWith(fetch(event.request));
      return;
    }

    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          });
        })
    );
  }
});
