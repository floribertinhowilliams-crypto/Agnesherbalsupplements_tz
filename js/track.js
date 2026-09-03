// Agnes Herbal Supplements — order tracking (client-side simulation only)
// NOTE: This reads order records saved in *this browser's* localStorage when an
// invoice was generated on the main site. There is no real backend/database,
// so tracking only works on the same device/browser that placed the order.

function lsGetT(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}

const STAGE_KEYS = [
  { key: 'placed', label: 'track_placed', hours: 0 },
  { key: 'confirmed', label: 'track_confirmed', hours: 2 },
  { key: 'packed', label: 'track_packed', hours: 24 },
  { key: 'shipped', label: 'track_shipped', hours: 48 },
  { key: 'delivered', label: 'track_delivered', hours: 96 }
];

let trackUnsub = null;
let lastOrderShown = null;    // remembers the order currently on screen so we can
let lastOrderWasLive = false; // re-render it instantly if the user switches language

function trackOrder() {
  const input = document.getElementById('orderInput').value.trim().toUpperCase();
  const resultEl = document.getElementById('trackResult');
  if (trackUnsub) { trackUnsub(); trackUnsub = null; }
  if (!input) { resultEl.innerHTML = ''; lastOrderShown = null; return; }
  const orderId = input.startsWith('AHS-') ? input : 'AHS-' + input.replace(/[^0-9]/g, '');
  const orders = lsGetT('ahs_orders', []);
  const localOrder = orders.find(o => o.id.toUpperCase() === orderId);

  // Live mode: if Firebase is configured, subscribe to the order doc so the
  // status updates in real time as the admin changes it — even if this order
  // was placed on a different device than the one checking the status here.
  if (typeof cloudListenOneOrder === 'function' && typeof AHS_CLOUD_READY !== 'undefined' && AHS_CLOUD_READY) {
    trackUnsub = cloudListenOneOrder(orderId, (order) => renderTrackResult(order, true));
    // show something immediately while we wait for the cloud snapshot
    if (localOrder && !document.getElementById('trackResult').innerHTML) renderTrackResult(localOrder, false);
    return;
  }

  if (!localOrder) {
    lastOrderShown = null;
    resultEl.innerHTML = `<div class="panel-empty" style="padding:24px 0;">
      ${escapeHtmlT(t('track_not_found_device'))}
    </div>`;
    return;
  }
  renderTrackResult(localOrder, false);
}

function renderTrackResult(order, isLive) {
  const resultEl = document.getElementById('trackResult');
  lastOrderShown = order || null;
  lastOrderWasLive = !!isLive;
  if (!order) {
    resultEl.innerHTML = `<div class="panel-empty" style="padding:24px 0;">
      ${escapeHtmlT(t('track_not_found'))}
    </div>`;
    return;
  }
  const lang = (typeof getLang === 'function') ? getLang() : 'sw';
  const locale = (typeof getLocale === 'function') ? getLocale(lang) : 'sw-TZ';
  const hoursElapsed = (Date.now() - new Date(order.date).getTime()) / (1000 * 60 * 60);
  const statusIdx = order.status ? STAGE_KEYS.findIndex(s => s.key === order.status) : -1;
  let html = `<div style="margin-top:20px;">
    ${isLive ? `<div class="track-live-pill"><span class="dot"></span>${escapeHtmlT(t('track_live_status'))}</div>` : ''}
    <b>${escapeHtmlT(t('track_order_label'))} #${escapeHtmlT(order.id)}</b>
    <div style="font-size:.82rem; color:var(--ink-soft); margin-bottom:6px;">${new Date(order.date).toLocaleString(locale)}</div>
    <div style="font-size:.9rem; margin-bottom:6px;">${escapeHtmlT(t('track_total_label'))}: Tsh ${Math.round(order.total).toLocaleString('en-US')}</div>
  </div>
  <div class="timeline">`;
  STAGE_KEYS.forEach((stage, i) => {
    // If admin has set a real status (statusIdx >= 0), use that as the source of
    // truth; otherwise fall back to the old time-elapsed simulation.
    const done = statusIdx >= 0 ? i <= statusIdx : hoursElapsed >= stage.hours;
    html += `<div class="timeline-item ${done?'done':''}">
      <div class="timeline-dot">${done?'✓':''}</div>
      <div class="timeline-body">
        <b>${escapeHtmlT(t(stage.label))}</b>
        <span>${escapeHtmlT(done ? t('track_completed') : t('track_pending'))}</span>
      </div>
    </div>`;
  });
  html += '</div>';
  resultEl.innerHTML = html;
}

// Called from track-order.html's onLangChanged() so a result already on screen
// switches language instantly instead of staying frozen in the old language.
function rerenderTrackResult() {
  if (document.getElementById('orderInput')?.value.trim()) {
    renderTrackResult(lastOrderShown, lastOrderWasLive);
  }
}

function escapeHtmlT(str) { return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

// Ikiwa ukurasa umefunguliwa kupitia kiungo chenye ?id=AHS-xxxx (mfano kutoka
// "📜 Historia ya Oda" kwenye duka kuu), jaza namba hiyo moja kwa moja na
// anzisha ufuatiliaji bila mteja kulazimika kuandika tena.
document.addEventListener('DOMContentLoaded', () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');
    const inputEl = document.getElementById('orderInput');
    if (idFromUrl && inputEl) {
      inputEl.value = idFromUrl;
      trackOrder();
    }
  } catch (e) { /* ignore */ }
});

document.getElementById('orderInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') trackOrder(); });
