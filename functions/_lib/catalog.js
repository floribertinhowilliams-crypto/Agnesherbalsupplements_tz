// ============================================================================
// Katalogi moja ya bidhaa ZOTE (288 za awali + mpya za admin kutoka Firestore),
// imepangwa kwa AINA (category) ya bidhaa. Inatumiwa na:
//   /orodha/          — ukurasa wa HTML wenye viungo vya bidhaa zote (kwa crawlers)
//   /catalog.json     — feed inayosomeka na mashine (AI agents)
//   /llms-full.txt    — orodha ya Markdown kwa AI/LLM
// Bidhaa mpya ukiziongeza kupitia admin zinaingia hapa zenyewe (Firestore).
// ============================================================================
import { fetchCustomProducts, productSlug, imageProxyUrl, SITE } from './seo.js';
import { STATIC_CATALOG } from './static-catalog.js';

export async function buildCatalog() {
  let custom = [];
  try { custom = await fetchCustomProducts(); } catch (e) { custom = []; }

  const staticItems = STATIC_CATALOG.map(p => ({
    id: p.id, name: p.name, effect: p.effect, category: p.category,
    price: p.price, url: SITE + p.page, image: SITE + p.image, inStock: true,
  }));
  const customItems = custom.filter(p => p && p.name).map(p => ({
    id: p.id, name: p.name, effect: p.effect || '', category: p.category || 'Nyingine',
    price: Math.round((p.prices && p.prices.retail) || 0),
    url: `${SITE}/products/${productSlug(p)}`,
    image: (Array.isArray(p.images) && p.images.length) ? imageProxyUrl(p.id, 0) : `${SITE}/assets/images/logo.png`,
    inStock: !(typeof p.stock === 'number' && p.stock <= 0),
  }));
  // Hifadhi: TU Firestore ikirudisha bidhaa sifuri (imeshindwa kwa muda), tumia catalog-snapshot.json
  // ili orodha daima ina bidhaa ZOTE zenye link. (Bidhaa zilizofutwa hazifufuki Firestore ikifanya kazi.)
  if (!customItems.length) try {
    const r = await fetch(`${SITE}/catalog-snapshot.json`);
    if (r.ok) {
      const snap = await r.json();
      (snap.items || []).forEach(i => {
        if (i && i.name && i.url) {
          customItems.push({ id: i.id, name: i.name, effect: i.effect || '', category: i.category || 'Nyingine',
            price: i.priceTZS || 0, url: i.url, image: i.image || `${SITE}/assets/images/logo.png`, inStock: i.inStock !== false });
        }
      });
    }
  } catch (e) { /* endelea bila snapshot */ }

  const items = staticItems.concat(customItems).map(p => ({ ...p, goal: p.category }));
  const order = [];
  items.forEach(i => { if (!order.includes(i.category)) order.push(i.category); });
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'nyingine';
  const groups = order.map(c => ({ key: slug(c), icon: '🌿', label: c, items: items.filter(i => i.category === c) }));
  return { items, groups, customCount: customItems.length };
}
