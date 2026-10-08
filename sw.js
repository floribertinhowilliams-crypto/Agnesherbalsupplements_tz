// Agnes Herbal Supplements — Service Worker (stale-cache safe)
// Versioned cache name forces browser to drop old app shells after deploy.
const CACHE_NAME = 'ahs-cache-v65-cloudflare-fix';
const CORE_ASSETS = [
  './index.html',
  './blog.html',
  './track-order.html',
  './admin.html',
  './404.html',
  './500.html',
  './favicon.ico',
  './css/style.css',
  './css/ahs-extra.css',
  './css/homepage-v2.css',
  './css/search-v2.css',
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
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .catch(() => {})
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

// HTML / JS / CSS: network-first with cache fallback so deployment changes are
// picked up quickly and old browser caches do not keep serving stale pages.
// Images: cache-first because they change much less often and are cheaper to keep.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isDocument = url.pathname.endsWith('.html') || url.pathname === '/';
  const isStaticAsset = /\.(js|css|json|svg|png|jpg|jpeg|webp|ico|mp4)$/i.test(url.pathname);

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

  if (isDocument || /\.(js|css|json)$/i.test(url.pathname)) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./404.html')))
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
