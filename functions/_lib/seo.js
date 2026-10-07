// ============================================================================
// Agnes Herbal Supplements — SEO helpers zinazotumiwa na Cloudflare Pages
// Functions (functions/products/[slug].js, functions/img/custom/[id]/[idx].js,
// functions/sitemap-products-live.xml.js).
//
// KUSUDI: bidhaa 288 za awali zina kurasa tuli za SEO (products/pX-jina.html)
// zilizotengenezwa mara moja. Bidhaa MPYA anazoongeza admin kwenye "➕ Ongeza
// Bidhaa" huhifadhiwa Firestore (customProducts) TU — hazina ukurasa wa SEO
// wala picha zenye URL ya kweli (picha zake zimehifadhiwa kama base64 ndani
// ya hati ya Firestore, si Firebase Storage, kwa sababu Storage inahitaji
// mpango wa kulipa Blaze — ona js/firebase-config.js).
//
// Functions hizi zinasoma moja kwa moja kutoka Firestore REST API (bila
// funguo ya siri — collection hii ni "read: if true" kwenye firestore.rules,
// yaani tayari ni ya wazi kwa umma) na:
//   1) kutengeneza ukurasa kamili wa SEO wa kila bidhaa mpya papo kwa papo
//      (bila kuhitaji "build step" yoyote — Cloudflare Pages Functions
//      zinaendesha wakati ombi linapofika, ndani ya zip ile ile ya deploy),
//   2) kutoa picha za bidhaa hizo kama URL za kweli zinazoweza kutambulika
//      na Google (badala ya base64 iliyofichwa ndani ya JSON),
//   3) kutengeneza sitemap ya pili yenye orodha ya bidhaa hizi zote mpya.
// ============================================================================

export const PROJECT_ID = 'agnes-1-console';
export const SITE = 'https://agnesherbalsupplements.com';
export const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
export const WHATSAPP_NUMBER = '255678883675';
// IndexNow (Bing, Yandex...): faili la ufunguo liko kwenye mzizi wa tovuti: /<ufunguo>.txt
export const INDEXNOW_KEY = 'bc647de973740d7df77bf5fd9c824709';

export function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

export function escapeXml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]));
}

// ---------------------------------------------------------------------------
// Firestore REST API inarudisha kila thamani ikiwa imefungwa kwa aina yake
// (mfano {"stringValue":"Womb Tea"}). Hii inaibadilisha kuwa JS ya kawaida.
// ---------------------------------------------------------------------------
function fsValue(v) {
  if (v == null) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fsValue);
  if ('mapValue' in v) return fsDoc({ fields: (v.mapValue && v.mapValue.fields) || {} });
  return null;
}
export function fsDoc(doc) {
  const out = {};
  const fields = (doc && doc.fields) || {};
  for (const k in fields) out[k] = fsValue(fields[k]);
  return out;
}

// Inasoma productOverrides ZOTE (admin.html → "Hariri Bidhaa": jina/bei/
// caption/picha zinazobadilishwa BAADA ya bidhaa kuundwa). Kabla ya
// marekebisho haya, SSR ya Google ilikuwa inasoma customProducts TU — hivyo
// mabadiliko ya admin (mfano jina jipya fupi kwa ajili ya Google) hayakuwa
// yakimfikia Google kamwe, japo yalionekana dukani kwa mteja mara moja.
async function fetchAllOverrides() {
  const map = {};
  let pageToken = '';
  for (let i = 0; i < 10; i++) {
    const url = `${FIRESTORE_BASE}/productOverrides?pageSize=300${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const data = await res.json();
    (data.documents || []).forEach(d => { map[d.name.split('/').pop()] = fsDoc(d); });
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return map;
}
function mergeOverride(product, ov) {
  if (!ov) return product;
  return {
    ...product,
    name: ov.name || product.name,
    caption: ov.caption || product.caption,
    cover: ov.cover || product.cover,
    images: (ov.images && ov.images.length) ? ov.images : product.images,
    videoClip: ov.videoClip || product.videoClip,
    videoId: ov.videoId || product.videoId,
    seoTitle: ov.seoTitle || product.seoTitle,
    metaDescription: ov.metaDescription || product.metaDescription,
    imageAlt: ov.imageAlt || product.imageAlt,
    slug: ov.slug || product.slug,
    benefits: (ov.benefits && ov.benefits.length) ? ov.benefits : product.benefits,
    faq: (ov.faq && ov.faq.length) ? ov.faq : product.faq,
  };
}

// Inasoma customProducts ZOTE (kurasa nyingi ikihitajika), kisha inaunganisha
// (merge) na productOverrides ya kila bidhaa — ili jina/picha/caption ULIYOBADILISHA
// kwenye admin BAADA ya kuunda bidhaa ionekane kwa Google 100%, sio dukani tu.
export async function fetchCustomProducts() {
  let all = [];
  let pageToken = '';
  for (let i = 0; i < 10; i++) {
    const url = `${FIRESTORE_BASE}/customProducts?pageSize=300${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const data = await res.json();
    const docs = (data.documents || []).map(d => {
      const obj = fsDoc(d);
      obj._docId = d.name.split('/').pop();
      return obj;
    });
    all = all.concat(docs);
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return mergeAllOverrides(all);
}
async function mergeAllOverrides(all) {
  let overrides = {};
  try { overrides = await fetchAllOverrides(); } catch (e) { /* SSR isiharibike ikiwa hii pekee itashindikana */ }
  return all.map(p => mergeOverride(p, overrides[p._docId] || overrides[String(p.id)]));
}

export async function fetchCustomProductById(id) {
  const res = await fetch(`${FIRESTORE_BASE}/customProducts/${encodeURIComponent(String(id))}`);
  if (!res.ok) return null;
  const doc = await res.json();
  if (!doc || !doc.fields) return null;
  const obj = fsDoc(doc);
  obj._docId = String(id);
  let ov = null;
  try {
    const ovRes = await fetch(`${FIRESTORE_BASE}/productOverrides/${encodeURIComponent(String(id))}`);
    if (ovRes.ok) ov = fsDoc(await ovRes.json());
  } catch (e) { /* endelea bila override ikiwa fetch hii itashindikana */ }
  return mergeOverride(obj, ov);
}

export function productSlug(p) {
  // Muundo mmoja kwa bidhaa ZOTE: p<namba>-<jina>  (mfano p0-28-day-slimming-tea).
  // Slug ya admin inayoanza na namba (mfano "100100-fertility-combo") inapewa "p" mbele.
  const custom = slugify(p.slug || '');
  if (custom) return /^\d+-/.test(custom) ? `p${custom}` : custom;
  const byName = slugify(p.name);
  return byName ? `p${p.id}-${byName}` : `bidhaa-${p.id}`;
}

export function imageProxyUrl(productId, index) {
  return `${SITE}/img/custom/${productId}/${index}.jpg`;
}

// Video HALISI (videoClip) admin aliyopakia kwenye "Ongeza Bidhaa" imehifadhiwa
// kama base64 ndani ya hati ya Firestore (sawa na picha — hakuna Storage ya
// kulipa). Sawa na imageProxyUrl juu, hii inatoa URL ya kweli inayoweza
// kutambulika/kupakuliwa na Google kupitia functions/video/custom/[id].js.
export function videoProxyUrl(productId) {
  return `${SITE}/video/custom/${productId}.webm`;
}

// ALT text: Jina + Kazi/Faida (ikiwa tofauti na jina) + "Tanzania" — sawa na
// mfumo unaotumika kwenye bidhaa 288 za awali. Alama kama "–" na "&"
// zinasafishwa, na maneno yanayorudiwa (mfano jina na kazi zikiwa na neno
// moja) yanaondolewa ili isiwe ni "keyword stuffing".
export function buildAltText(p) {
  if (p.imageAlt && p.imageAlt.trim()) return p.imageAlt.trim().slice(0, 160);
  const clean = s => String(s || '').replace(/[–—]/g, ' ').replace(/&/g, 'na').replace(/\s+/g, ' ').trim();
  const name = clean(p.name);
  const effect = clean(p.effect);
  const parts = [name];
  if (effect && effect.toLowerCase() !== name.toLowerCase()) parts.push(effect);
  parts.push('Tanzania');

  const seen = new Set();
  const words = [];
  parts.join(' ').split(' ').forEach(w => {
    const key = w.toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    words.push(w);
  });
  return words.join(' ').slice(0, 160);
}

export function buildTitle(p) {
  if (p.seoTitle && p.seoTitle.trim()) return p.seoTitle.trim();
  return `${p.name} | Agnes Herbal Supplements Tanzania`;
}

// Meta description: admin override kwanza (ikiwa ipo), kisha caption ya
// admin (imefupishwa), la sivyo muundo ule ule unaotumika kwenye kurasa
// 288 za awali.
export function buildMetaDescription(p) {
  if (p.metaDescription && p.metaDescription.trim()) {
    const custom = p.metaDescription.trim();
    return custom.length > 158 ? custom.slice(0, 157).trim() + '…' : custom;
  }
  let base = (p.caption && p.caption.trim())
    ? p.caption.trim()
    : `${p.name} - ${p.effect || p.category} - ${p.category}.`;
  if (!/agnes herbal/i.test(base)) {
    base += ' Bidhaa ya asili kutoka Agnes Herbal Supplements, Tanzania.';
  }
  base = base.replace(/\s+/g, ' ').trim();
  return base.length > 158 ? base.slice(0, 157).trim() + '…' : base;
}


// Maswali ya kawaida ya duka (sera za duka, si madai ya kiafya) — yanatumika kwenye kila ukurasa wa bidhaa,
// sawa na kurasa tuli. Maswali ya admin (Mipangilio ya SEO) yanatangulia yakiwepo.
export function buildStandardFaq(p) {
  const name = p.name;
  const pr = p.prices || {};
  const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const items = [
    [`Naagizaje ${name}?`, `Bofya "ORDER NOW" kwenye ukurasa huu, au tuandikie WhatsApp +255 678 883 675. Tunakufikishia Dar es Salaam, mikoani, na pia Kenya, Uganda na Burundi.`]
  ];
  if (pr.w5 && pr.w10 && pr.retail) {
    items.push([`Bei ya jumla (wholesale) ya ${name} ni ngapi?`, `Rejareja ni Tsh ${fmt(pr.retail)}. Ukinunua vipande 5 au zaidi ni Tsh ${fmt(pr.w5)} kwa kimoja, na vipande 10 au zaidi ni Tsh ${fmt(pr.w10)} kwa kimoja.`]);
  }
  items.push(['Nawezaje kulipa?', 'Tunapokea M-Pesa, Mixx by Yas, HaloPesa na NMB. Maelezo kamili yako kwenye ukurasa wa Uwasilishaji na Malipo.']);
  items.push(['Naweza kuuliza kabla ya kuagiza?', 'Ndiyo. Tuandikie WhatsApp +255 678 883 675 na tutakujibu kuhusu matumizi, upatikanaji na usafirishaji.']);
  return items.map(([q, a]) => ({ q, a }));
}
