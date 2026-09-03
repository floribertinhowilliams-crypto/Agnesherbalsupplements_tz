// Agnes Herbal Supplements — Service Worker (offline-first cache)
const CACHE_NAME = 'ahs-cache-v38';
const CORE_ASSETS = [
  './index.html',
  './blog.html',
  './track-order.html',
  './admin.html',
  './404.html',
  './favicon.ico',
  './css/style.css',
  './css/ahs-extra.css',
  './js/products-data.js',
  './js/content-data.js',
  './js/product-page-data.js',
  './js/i18n.js',
  './js/effect-i18n.js',
  './js/app.js',
  './js/sw-register.js',
  './js/homepage-v2.js',
  './js/search-v2.js',
  './js/live-notifications.js',
  './js/blog.js',
  './js/track.js',
  './js/admin.js',
  './assets/images/logo.png',
  './manifest.json'
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Cache-first for core assets & images, network-first fallback for everything else
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (url.pathname.includes('/images/') || url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      }).catch(() => cached))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      return res;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./404.html')))
  );
});
