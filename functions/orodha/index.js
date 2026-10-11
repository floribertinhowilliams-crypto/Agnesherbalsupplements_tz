// Route: /orodha/ — ORODHA KAMILI ya bidhaa zote, yenye kiungo cha kila ukurasa wa bidhaa
// (za awali + mpya za admin). Hii ndiyo njia ya crawlers (Google, Bing, AI) kugundua
// kila bidhaa kupitia viungo vya kawaida, si sitemap pekee.
import { buildCatalog } from '../_lib/catalog.js';
import { escapeHtml, SITE, WHATSAPP_NUMBER } from '../_lib/seo.js';

export async function onRequestGet() {
  const { items, groups } = await buildCatalog();
  const fmt = n => 'Tsh ' + Number(n || 0).toLocaleString('en-US');
  const toc = groups.map(g => `<a href="#g-${escapeHtml(g.key)}">${g.icon} ${escapeHtml(g.label)} (${g.items.length})</a>`).join('');
  const sections = groups.map(g => `<section id="g-${escapeHtml(g.key)}">
<h2>${g.icon} ${escapeHtml(g.label)}</h2>
<ul>${g.items.map(i => `<li><a href="${escapeHtml(i.url)}">${escapeHtml(i.name)}</a>${i.effect ? ' — ' + escapeHtml(i.effect) : ''} — ${fmt(i.price)} — ${i.inStock ? 'Ipo' : 'Haipo kwa sasa (tunaweza kukuagizia)'}</li>`).join('\n')}</ul>
</section>`).join('\n');
  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Orodha Kamili ya Bidhaa - Agnes Herbal Supplements Tanzania', url: `${SITE}/orodha/`,
    mainEntity: { '@type': 'ItemList', numberOfItems: items.length,
      itemListElement: items.map((i, n) => ({ '@type': 'ListItem', position: n + 1, url: i.url, name: i.name })) },
  };
  const wa = encodeURIComponent('Habari Agnes Herbal Supplements, nataka kuuliza kama mna bidhaa: ');
  const html = `<!DOCTYPE html>
<html lang="sw"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Orodha Kamili ya Bidhaa (${items.length}) | Agnes Herbal Supplements Tanzania</title>
<meta name="description" content="Orodha kamili ya vitamini, virutubisho na chai za asili (${items.length} bidhaa) zenye bei na upatikanaji. Agiza kwa WhatsApp, tunafikisha Dar es Salaam na mikoani.">
<link rel="canonical" href="${SITE}/orodha/">
<link rel="icon" href="${SITE}/assets/icons/icon-96.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
body{font-family:Inter,system-ui,sans-serif;background:#fbf7ee;color:#1b1b1b;margin:0;line-height:1.55}
.wrap{max-width:860px;margin:0 auto;padding:20px}
h1{color:#0f4d34;font-size:1.5rem;margin:6px 0 8px}h2{color:#0f4d34;font-size:1.15rem;margin:28px 0 8px}
.toc{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.toc a{background:#fff;border:1px solid #e4dcc8;border-radius:999px;padding:6px 14px;font-size:.82rem;color:#0f4d34;text-decoration:none;font-weight:600}
ul{padding-left:18px}li{margin:6px 0;font-size:.9rem}a{color:#0f4d34}
.cta{display:inline-block;background:#25d366;color:#fff;font-weight:700;padding:10px 20px;border-radius:999px;text-decoration:none;margin:4px 6px 4px 0}
.cta.alt{background:#0f4d34}
</style></head><body><div class="wrap">
<p><a href="/">← Duka</a></p>
<h1>Orodha Kamili ya Bidhaa — Agnes Herbal Supplements Tanzania</h1>
<p>Bidhaa ${items.length} za vitamini, virutubisho, chai za asili, collagen na gummies, zimepangwa kwa kazi yake. Kila jina ni kiungo cha ukurasa wake wenye bei na maelezo. Huoni unachotafuta? <a href="/je-ipo/">Angalia kama ipo</a> au uliza WhatsApp.</p>
<a class="cta" href="https://wa.me/${WHATSAPP_NUMBER}?text=${wa}">💬 Uliza kama Ipo (WhatsApp)</a><a class="cta alt" href="/je-ipo/">🔎 Je, Ipo?</a>
<nav class="toc">${toc}</nav>
${sections}
<p style="font-size:.75rem;color:#777;margin-top:30px">Bidhaa zetu hazikusudiwi kutibu, kuponya au kuzuia ugonjwa wowote. Wasiliana na daktari kabla ya kuanza virutubisho vipya. Agnes Herbal Supplements, Dar es Salaam, Tanzania.</p>
</div></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=600' } });
}
