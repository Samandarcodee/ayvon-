const CACHE_NAME = 'resto-manager-v2';
const OFFLINE_FALLBACK_URL = './index.html';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

const shouldSkipRequest = (request) => {
  const url = new URL(request.url);
  return request.method !== 'GET' || url.protocol.startsWith('chrome-extension');
};

const putInCache = async (request, response) => {
  if (!response || (!response.ok && response.type !== 'opaque')) {
    return;
  }
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (shouldSkipRequest(event.request)) {
    return;
  }

  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          putInCache(request, copy);
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          return cachedPage || caches.match(OFFLINE_FALLBACK_URL);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          putInCache(request, copy);
          return response;
        })
        .catch(() => {
          if (request.destination === 'document') {
            return caches.match(OFFLINE_FALLBACK_URL);
          }
          return Response.error();
        });
    })
  );
});
