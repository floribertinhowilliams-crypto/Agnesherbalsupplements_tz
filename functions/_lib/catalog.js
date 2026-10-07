// ============================================================================
// Katalogi moja ya bidhaa ZOTE (288 za awali + mpya za admin kutoka Firestore),
// pamoja na makundi ya kazi kama admin alivyoyapanga (majina, mfuatano,
// bidhaa alizoziweka mwenyewe). Inatumiwa na:
//   /orodha/          — ukurasa wa HTML wenye viungo vya bidhaa zote (kwa crawlers)
//   /catalog.json     — feed inayosomeka na mashine (ukurasa /je-ipo/, AI agents)
//   /llms-full.txt    — orodha ya Markdown kwa AI/LLM
// ============================================================================
import { fetchCustomProducts, productSlug, imageProxyUrl, fsDoc, FIRESTORE_BASE, SITE } from './seo.js';
import { STATIC_CATALOG } from './static-catalog.js';
import { GOAL_GROUPS, GOAL_MATCH_ORDER } from './goal-data.js';

const MATCHERS = GOAL_MATCH_ORDER.map(([k, src, flags]) => [k, new RegExp(src, flags)]);

async function fetchSettings() {
  try {
    const res = await fetch(`${FIRESTORE_BASE}/meta/homepageSettings`);
    if (!res.ok) return {};
    return fsDoc(await res.json()) || {};
  } catch (e) { return {}; }
}

function effectiveGroups(st) {
  const labels = st.goalLabels || {};
  const base = GOAL_GROUPS.map(g => {
    const o = labels[g.key] || {};
    return { key: g.key, icon: o.icon || g.icon, label: o.sw || g.sw };
  });
  const custom = (Array.isArray(st.goalCustom) ? st.goalCustom : []).filter(c => c && c.key).map(c => {
    const o = labels[c.key] || {};
    return { key: c.key, icon: o.icon || c.icon || '⭐', label: o.sw || c.sw || 'Kundi Jipya' };
  });
  const all = base.concat(custom);
  const saved = Array.isArray(st.goalOrder) ? st.goalOrder : [];
  const keys = all.map(g => g.key);
  const order = [...saved.filter(k => keys.includes(k)), ...keys.filter(k => !saved.includes(k))];
  return order.map(k => all.find(g => g.key === k));
}

function goalOf(p, groups, st) {
  const has = k => groups.some(g => g.key === k);
  const manual = (st.goalAssign || {})[String(p.id)];
  if (manual && has(manual)) return manual;
  const hay = ((p.name || '') + ' ' + (p.effect || '')).toLowerCase();
  for (const [key, re] of MATCHERS) if (re.test(hay) && has(key)) return key;
  return 'immunity';
}

export async function buildCatalog() {
  let custom = [];
  try { custom = await fetchCustomProducts(); } catch (e) { custom = []; }
  const st = await fetchSettings();
  const groups = effectiveGroups(st);

  const staticItems = STATIC_CATALOG.map(p => ({
    id: p.id, name: p.name, effect: p.effect, category: p.category,
    price: p.price, url: SITE + p.page, image: SITE + p.image, inStock: true,
  }));
  const customItems = custom.filter(p => p && p.name).map(p => ({
    id: p.id, name: p.name, effect: p.effect || '', category: p.category || '',
    price: Math.round((p.prices && p.prices.retail) || 0),
    url: `${SITE}/products/${productSlug(p)}`,
    image: (Array.isArray(p.images) && p.images.length) ? imageProxyUrl(p.id, 0) : `${SITE}/assets/images/logo.png`,
    inStock: !(typeof p.stock === 'number' && p.stock <= 0),
  }));
  // Hifadhi (fallback): TU Firestore ikirudisha bidhaa sifuri (imeshindwa), tumia catalog-snapshot.json (bidhaa zilizofutwa hazifufuki).
  // (mfano Firestore imeshindwa kwa muda) — hivyo orodha daima ina bidhaa ZOTE zenye link.
  if (!customItems.length) try {
    const have = new Set(customItems.map(i => String(i.id)));
    const r = await fetch(`${SITE}/catalog-snapshot.json`);
    if (r.ok) {
      const snap = await r.json();
      (snap.items || []).forEach(i => {
        if (i && i.name && i.url && !have.has(String(i.id))) {
          customItems.push({ id: i.id, name: i.name, effect: i.effect || '', category: i.category || '',
            price: i.priceTZS || 0, url: i.url, image: i.image || `${SITE}/assets/images/logo.png`, inStock: i.inStock !== false });
        }
      });
    }
  } catch (e) { /* endelea bila snapshot */ }
  // Bidhaa za admin zinazobadilisha jina la bidhaa ya awali hazitumiki hapa; zinakuja kupitia customProducts tu.
  const items = staticItems.concat(customItems).map(p => ({ ...p, goal: goalOf(p, groups, st) }));

  const grouped = groups
    .map(g => ({ ...g, items: items.filter(i => i.goal === g.key) }))
    .filter(g => g.items.length);
  return { items, groups: grouped, customCount: customItems.length };
}
