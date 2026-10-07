// Agnes Herbal Supplements — "ORDER NOW" button kwa product landing pages
// (/products/*.html). Ukurasa mmoja = bidhaa moja, hivyo tunatumia variable
// moja ya idadi (quantity) kwa ukurasa mzima.
var ahsOrderNowQty = 1;

function ahsChangeOrderQty(delta) {
  ahsOrderNowQty = Math.max(1, ahsOrderNowQty + delta);
  var el = document.getElementById('orderNowQty');
  if (el) el.textContent = ahsOrderNowQty;
}

// Chanzo cha ziara (Facebook/Instagram/TikTok Ad) huja kama ?src=facebook (au
// ?utm_source=...) kwenye link ya Ad inayoelekeza kwenye ukurasa huu wa
// bidhaa. Tunakisoma hapa na kukisukuma (forward) kwenye index.html ili
// oda ya mwisho ihifadhi chanzo sahihi cha mauzo (ripoti ya Ad).
function ahsDetectSource() {
  try {
    var params = new URLSearchParams(window.location.search);
    return params.get('src') || params.get('utm_source') || '';
  } catch (e) { return ''; }
}

function ahsOrderNow(id, name, price) {
  if (typeof ahsTrackEvent === 'function') {
    ahsTrackEvent('add_to_cart', { content_name: name, content_type: 'product', value: price * ahsOrderNowQty, currency: 'TZS' });
  }
  var src = ahsDetectSource();
  var url = '/?orderNow=' + encodeURIComponent(id) + '&qty=' + encodeURIComponent(ahsOrderNowQty);
  if (src) url += '&src=' + encodeURIComponent(src);
  window.location.href = url;
}
