const CACHE_NAME = 'loan-book-cache-v4';
const BASE_URL = self.registration.scope.endsWith('/') ? self.registration.scope : self.registration.scope + '/';
const ASSETS = [
  BASE_URL,
  BASE_URL + 'index.html',
  BASE_URL + 'manifest.webmanifest',
  BASE_URL + 'icons/icon-192.png',
  BASE_URL + 'icons/icon-256.png',
  BASE_URL + 'icons/icon-384.png',
  BASE_URL + 'icons/icon-512.png',
  BASE_URL + 'icons/icon-mono-512.png',
  BASE_URL + 'icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match(BASE_URL + 'index.html'));
    })
  );
});

