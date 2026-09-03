// ============================================================================
// Agnes Herbal Supplements — OneSignal Push Notifications (bure)
// ============================================================================
// Thamani hizi ni ZA WAZI (public) na ni salama kuwekwa hapa — App ID sio siri.
// Funguo ya siri (REST API Key) HAIJIWEKI HAPA — inakaa salama kwenye
// Cloudflare Worker pekee (ona cloudflare-worker/agnes-notify-worker.js).
// ============================================================================

const ONESIGNAL_APP_ID = 'PASTE_YOUR_ONESIGNAL_APP_ID';
const NOTIFY_WORKER_URL = 'PASTE_YOUR_CLOUDFLARE_WORKER_URL'; // mfano: https://agnes-notify.yourname.workers.dev
const NOTIFY_SHARED_SECRET = ''; // hiari — weka neno lile lile ulilotumia kwenye Worker (SHARED_SECRET)

function onesignalConfigured() {
  return ONESIGNAL_APP_ID && !ONESIGNAL_APP_ID.startsWith('PASTE_')
    && NOTIFY_WORKER_URL && !NOTIFY_WORKER_URL.startsWith('PASTE_');
}

/* ---------- ADMIN SIDE: jisajili kupokea push notifications ---------- */
// Ita hii kwenye admin.html pekee (siyo kwenye storefront ya mteja) — ndiyo
// "kifaa" kitakachopokea arifa za oda mpya.
function initOneSignalForAdmin() {
  if (!onesignalConfigured() || typeof OneSignal === 'undefined') return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({ appId: ONESIGNAL_APP_ID });
    OneSignal.Slidedown.promptPush(); // inauliza ruhusa ya notification kwa mtumiaji
  });
}

/* ---------- CUSTOMER SIDE: tuma arifa kupitia Worker (funguo ya siri haionekani hapa) ---------- */
function sendOrderNotification(order) {
  if (!onesignalConfigured()) return Promise.resolve(false);
  const itemsSummary = order.items.map(i => `${i.name} x${i.qty}`).join(', ');
  return fetch(NOTIFY_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: NOTIFY_SHARED_SECRET,
      title: `🛒 Oda Mpya #${order.id}`,
      message: `${itemsSummary} — Jumla: Tsh ${Math.round(order.total).toLocaleString('en-US')}`,
    }),
  }).then(r => r.ok).catch(() => false);
}
