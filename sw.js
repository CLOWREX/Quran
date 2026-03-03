const CACHE_NAME = 'alquran-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback ke cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET dan chrome-extension
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension')) return;

  // Audio & API requests: network only (jangan di-cache)
  if (
    event.request.url.includes('equran.id') ||
    event.request.url.includes('.mp3') ||
    event.request.url.includes('audio')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Untuk aset lain: network first, fallback cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});