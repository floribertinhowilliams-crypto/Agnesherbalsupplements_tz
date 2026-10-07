// Route: /catalog.json — feed ya bidhaa zote inayosomeka na mashine (ukurasa /je-ipo/, AI agents).
import { buildCatalog } from './_lib/catalog.js';
import { SITE, WHATSAPP_NUMBER } from './_lib/seo.js';

export async function onRequestGet() {
  const { items, groups } = await buildCatalog();
  const body = {
    shop: { name: 'Agnes Herbal Supplements', url: SITE, country: 'Tanzania', city: 'Dar es Salaam',
      whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`, note: 'Bidhaa isipoonekana kwenye orodha, uliza WhatsApp — tunaweza kukuagizia.' },
    generatedAt: new Date().toISOString(),
    count: items.length,
    groups: groups.map(g => ({ key: g.key, label: g.label, count: g.items.length })),
    items: items.map(i => ({ id: i.id, name: i.name, effect: i.effect, category: i.category, group: i.goal,
      priceTZS: i.price, inStock: i.inStock, url: i.url, image: i.image })),
  };
  return new Response(JSON.stringify(body), { status: 200, headers: {
    'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'public, max-age=300', 'Access-Control-Allow-Origin': '*' } });
}
