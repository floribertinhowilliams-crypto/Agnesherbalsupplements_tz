// ============================================================================
// Agnes Herbal Supplements — Tovuti Kamili (v7.2)
// Analytics & Ad Pixels — Google Analytics 4, Meta (Facebook) Pixel, TikTok Pixel
// ============================================================================
// WEKA ID ZAKO HAPA CHINI PEKEE — faili hili linatumika kwenye kila ukurasa,
// hivyo huhitaji kubadilisha chochote kwenye HTML.
//
// 1) Google Analytics 4: nenda analytics.google.com → tengeneza property
//    → "Data Streams" → Web → chukua "Measurement ID" (mfano G-ABC1234XYZ).
// 2) Meta (Facebook) Pixel: nenda business.facebook.com/events_manager
//    → tengeneza Pixel → chukua Pixel ID (namba tu, mfano 1234567890123456).
// 3) TikTok Pixel: nenda ads.tiktok.com → Assets → Events → Web Events
//    → tengeneza Pixel → chukua Pixel ID (mfano CXXXXXXXXXXXXXXXXXXX).
//
// Mpaka uweke ID halisi hapa chini (badala ya thamani za mfano), kila kitu
// kinabaki KIMEZIMWA kiotomatiki — hakuna script inayopakiwa, hakuna kosa
// litakalotokea. Sio lazima uwashe zote tatu — unaweza kuweka moja tu.
// ============================================================================

const AHS_ANALYTICS = {
  GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX',       // badilisha na Measurement ID yako
  FB_PIXEL_ID: '1680002383058460',          // Meta Pixel ID yako
  TIKTOK_PIXEL_ID: 'YOUR_TIKTOK_PIXEL_ID'   // badilisha na TikTok Pixel ID yako
};

function ahsIsPlaceholder(v) {
  return !v || v.indexOf('XXXX') !== -1 || v === 'YOUR_PIXEL_ID' || v === 'YOUR_TIKTOK_PIXEL_ID';
}

/* ---------- Google Analytics 4 ---------- */
(function initGA4() {
  const id = AHS_ANALYTICS.GA4_MEASUREMENT_ID;
  if (ahsIsPlaceholder(id)) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', id);
})();

/* ---------- Meta (Facebook) Pixel ---------- */
(function initFacebookPixel() {
  const id = AHS_ANALYTICS.FB_PIXEL_ID;
  if (ahsIsPlaceholder(id)) return;
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', id);
  fbq('track', 'PageView');
})();

/* ---------- TikTok Pixel ---------- */
(function initTikTokPixel() {
  const id = AHS_ANALYTICS.TIKTOK_PIXEL_ID;
  if (ahsIsPlaceholder(id)) return;
  !function (w, d, t) {
    w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
    ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
    ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < e.methods.length; n++) ttq.setAndDefer(e, e.methods[n]); return e };
    ttq.load = function (e, n) {
      var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = n || {};
      var o = d.createElement("script"); o.type = "text/javascript"; o.async = !0; o.src = i + "?sdkid=" + e + "&lib=" + t;
      var a = d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a)
    };
    ttq.load(id);
    ttq.page();
  }(window, document, 'ttq');
})();

/* ---------- Unified tracking helper used across app.js / blog.js / track.js ---------- */
// Usage: ahsTrackEvent('add_to_cart', { content_name: 'Detox Tea', value: 25000, currency: 'TZS' });
function ahsTrackEvent(name, data) {
  data = data || {};
  const gaMap = { view_item: 'view_item', add_to_cart: 'add_to_cart', begin_checkout: 'begin_checkout', purchase: 'purchase', generate_lead: 'generate_lead', search: 'search' };
  const fbMap = { view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', purchase: 'Purchase', generate_lead: 'Lead', search: 'Search' };
  const ttMap = { view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', purchase: 'CompletePayment', generate_lead: 'SubmitForm', search: 'Search' };
  try { if (typeof gtag === 'function') gtag('event', gaMap[name] || name, data); } catch (e) {}
  try { if (typeof fbq === 'function') fbq('track', fbMap[name] || name, data); } catch (e) {}
  try { if (typeof ttq !== 'undefined' && ttq.track) ttq.track(ttMap[name] || name, data); } catch (e) {}
}
