// Route: POST /api/indexnow — inaarifu Bing, Yandex, Naver, Seznam, Yep n.k. (IndexNow)
// kuhusu bidhaa mpya/zilizobadilika. Bing pia hulisha ChatGPT Search na Copilot.
//
// Njia mbili:
//  1) { "urls": [ ... ] }  -> inatuma URL hizo TU (za tovuti hii pekee). Hii ndiyo njia ya
//     haraka: admin anatuma URL ya bidhaa mpya tu mara tu inaposave.
//  2) mwili tupu {}         -> inatuma kila kitu: kurasa kuu + bidhaa 288 za awali +
//     bidhaa zote za admin + sitemap. Ni kitufe cha "📣 Arifu Bing/AI Sasa".
// Google haitumii IndexNow: inasoma sitemap (sitemap-products-live.xml hujisasisha yenyewe).
import { fetchCustomProducts, productSlug, SITE, INDEXNOW_KEY } from '../_lib/seo.js';
import { STATIC_CATALOG } from '../_lib/static-catalog.js';

// Tunajaribu mlango wa pamoja kwanza; ukikataa (429 n.k.) tunajaribu Bing moja kwa moja, kisha Yandex.
const ENDPOINTS = ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow', 'https://yandex.com/indexnow'];
const CORE = ['/', '/orodha/', '/je-ipo/', '/blog', '/sitemap.xml', '/sitemap-products-live.xml', '/llms.txt', '/catalog.json'];

function uniq(arr) { return Array.from(new Set(arr)); }

async function submit(urlList) {
  const body = JSON.stringify({ host: new URL(SITE).host, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList });
  let status = 0;
  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body });
      status = res.status; // 200/202 = imepokelewa
      if (status === 200 || status === 202) return status;
    } catch (e) { status = 0; }
  }
  return status; // hali ya jaribio la mwisho
}

export async function onRequestPost({ request }) {
  let urls = [];
  try { const b = await request.json(); if (Array.isArray(b && b.urls)) urls = b.urls; } catch (e) { /* mwili tupu = tuma kila kitu */ }
  urls = urls.filter(u => typeof u === 'string' && (u === SITE || u.startsWith(SITE + '/')));

  if (!urls.length) {
    let custom = [];
    try { custom = await fetchCustomProducts(); } catch (e) { custom = []; }
    urls = CORE.map(p => SITE + p)
      .concat(STATIC_CATALOG.map(p => SITE + p.page))
      .concat(custom.filter(p => p && p.name).map(p => `${SITE}/products/${productSlug(p)}`));
  }
  urls = uniq(urls);

  // IndexNow inaruhusu hadi URL 10,000 kwa ombi; tunagawa vipande vya 5,000 kuwa salama.
  let ok = true, last = 0;
  for (let i = 0; i < urls.length; i += 5000) {
    try { last = await submit(urls.slice(i, i + 5000)); if (last !== 200 && last !== 202) ok = false; }
    catch (e) { ok = false; last = 0; }
  }
  return new Response(JSON.stringify({ ok, status: last, submitted: urls.length }), {
    status: 200, headers: { 'Content-Type': 'application/json' } });
}
