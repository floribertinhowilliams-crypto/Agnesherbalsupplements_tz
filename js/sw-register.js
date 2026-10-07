/* ===================== SERVICE WORKER (auto-update, shared) =====================
   Included on EVERY page (index.html, blog.html, track-order.html, admin.html)
   so that no matter which page the installed PWA/app opens directly into,
   it always actively checks for a newer deployment and reloads itself —
   the user never needs to manually clear cache or reinstall the app. */
if ('serviceWorker' in navigator) {
  let ahsSwRefreshing = false;

  // When a new service worker takes control, the page is now being served by
  // new code while old cached assets may still be in memory — reload once so
  // the user always lands on the latest version automatically.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (ahsSwRefreshing) return;
    ahsSwRefreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
      // Check for a newer sw.js every time the app is opened/foregrounded,
      // so an old installed app always discovers updates without the user
      // having to reinstall or manually clear anything.
      reg.update();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update();
      });
      setInterval(() => reg.update(), 60 * 60 * 1000); // hourly background check

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          // A new worker finished installing while an old one was already
          // controlling the page — activate it immediately (sw.js already
          // calls skipWaiting/clients.claim), which triggers the
          // controllerchange reload above.
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch(() => { /* offline-first still works without SW */ });
  });
}
