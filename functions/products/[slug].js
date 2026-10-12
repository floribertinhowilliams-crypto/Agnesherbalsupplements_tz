// Route: /products/:slug
//
// v69 — kila bidhaa ina URL moja ya kudumu (canonical) inayofunguka moja kwa moja:
//   1) Bidhaa 288 za awali: ukurasa wake tuli (products/pN-jina.html) unahudumiwa kupitia context.next().
//      Cloudflare Pages huendesha Function KWANZA kwa njia inayolingana, kisha huangukia kwenye faili tuli
//      pale Function inapoita next(). Toleo la zamani liliwaelekeza (301) kwenye URL ile ile => mzunguko (loop).
//   2) Bidhaa za admin (Firestore): ukurasa unatengenezwa hapa.
//   3) URL za zamani (.html, slug ya jina la zamani, "100040-jina", "jina" bila p<id>) zinaelekezwa (301)
//      kwenye ukurasa SAHIHI wa bidhaa ile ile — kamwe si ukurasa mkuu, na ?src=/?utm_ vinahifadhiwa.
//   4) Bidhaa isiyokuwepo => 404 halisi (404.html), si ukurasa mkuu wala bidhaa nyingine.
//   5) Firestore ikishindwa => 503 (jaribu tena), si 404 ya uongo.
import { STATIC_CATALOG } from '../_lib/static-catalog.js';
import { renderProductHtml } from '../_lib/render-product.js';
import { patchStaticProductHtml } from '../_lib/apply-override.js';
import {
  fetchCustomProducts, fetchCustomProductById, fetchOverrideById, productSlug, slugify, SITE
} from '../_lib/seo.js';

const STATIC_BY_SLUG = new Map(STATIC_CATALOG.map(s => [s.page.replace('/products/', ''), s]));
const STATIC_BY_ID = new Map(STATIC_CATALOG.map(s => [s.id, s]));

// 404 halisi (bidhaa imefichwa/imefutwa): si ukurasa mkuu, si bidhaa nyingine.
function productGone() {
  const body = '<!DOCTYPE html><html lang="sw"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>Bidhaa Haipatikani | Agnes Herbal Supplements</title></head><body style="font-family:sans-serif;text-align:center;padding:48px 20px"><h1>Bidhaa Haipatikani</h1><p>Bidhaa hii haipatikani kwa sasa.</p><p><a href="/je-ipo/">Tafuta bidhaa</a> · <a href="/">Rudi Dukani</a></p></body></html>';
  return new Response(body, { status: 404, headers: { 'Content-Type': 'text/html; charset=UTF-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=60' } });
}

function redirectTo(path, search) {
  return new Response(null, { status: 301, headers: { Location: `${SITE}${path}${search || ''}`, 'Cache-Control': 'public, max-age=3600' } });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  let slug = context.params.slug;
  try { slug = decodeURIComponent(slug); } catch (e) { /* tumia kama ilivyo */ }
  const search = url.search; // ?src=facebook&fbclid=... lazima vihifadhiwe kwenye redirect

  // (1) Ukurasa tuli wa sasa wa bidhaa ya awali: ni kiolezo; mabadiliko ya Admin (jina/bei/maelezo/picha/stock/ficha)
  // yanawekwa juu yake papo hapo kutoka Firestore (productOverrides). Hakuna mabadiliko / Firestore imeshindwa => ukurasa tuli kama ulivyo.
  if (STATIC_BY_SLUG.has(slug)) {
    const st = STATIC_BY_SLUG.get(slug);
    const [ov, staticRes] = await Promise.all([fetchOverrideById(st.id), context.next()]);
    if (ov && ov.hidden === true) return productGone();
    if (!ov || staticRes.status !== 200) return staticRes;
    const html = await staticRes.text();
    const patched = patchStaticProductHtml(html, st.id, ov);
    return new Response(patched || html, { status: 200, headers: {
      'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=60, s-maxage=60',
      'X-Robots-Tag': 'index, follow, max-image-preview:large' } });
  }

  // (2) Maumbo ya zamani yanayojulikana. Ondoa ".html" na "/" ya mwisho kisha tafuta ukurasa wa sasa.
  const hadHtml = /\.html$/i.test(slug);
  let bare = slug.replace(/\.html$/i, '');
  if (hadHtml && STATIC_BY_SLUG.has(bare)) return redirectTo(`/products/${bare}`, search);
  if (/^1\d{5}-/.test(bare)) bare = `p${bare}`; // "100040-jina" => "p100040-jina" (ID za admin tu; "28-day-..." si ID)
  const idMatch = /^p(\d+)-/.exec(bare);
  const id = idMatch ? parseInt(idMatch[1], 10) : null;

  if (id !== null && id <= 287) {
    // Bidhaa ya awali kwa muundo wa zamani wa jina => elekeza kwa ID kwenye ukurasa wa sasa.
    const st = STATIC_BY_ID.get(id);
    if (st) return redirectTo(st.page, search);
    return context.next(); // ID haipo => 404 halisi
  }

  // (3) Bidhaa za admin: tunahitaji Firestore.
  const cache = (typeof caches !== 'undefined' && caches.default) ? caches.default : null;
  // Ufunguo wa akiba bila query (fbclid/utm hubadilika kila click; bila hili kila click ya tangazo ingepakua Firestore).
  const cacheKey = new Request(`${url.origin}${url.pathname}`, { method: 'GET' });
  if (cache && !hadHtml && bare === slug) {
    try { const hit = await cache.match(cacheKey); if (hit) return hit; } catch (e) { /* endelea */ }
  }

  let products;
  try {
    products = await fetchCustomProducts(true); // orodha nyepesi (bila picha za base64)
  } catch (e) {
    // Firestore imeshindwa: kama kuna ukurasa tuli wa bidhaa hii (products/<slug>.html), uhudumie badala ya kosa.
    try { const fallback = await context.next(); if (fallback && fallback.status !== 404) return fallback; } catch (e2) { /* endelea */ }
    return new Response('Huduma ya bidhaa haipatikani kwa muda. Jaribu tena baada ya sekunde chache.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=UTF-8', 'Retry-After': '30', 'Cache-Control': 'no-store' }
    });
  }
  const allNamed = products.filter(p => p && p.name);
  const named = allNamed.filter(p => !p.hidden); // bidhaa zilizofichwa na admin hazionekani kokote

  if (allNamed.some(p => p.hidden && productSlug(p) === bare)) return productGone();
  let product = named.find(p => productSlug(p) === bare);

  if (!product) {
    // Muundo wa zamani: p<id>-jina-la-zamani => tafuta kwa ID halisi.
    let found = id !== null ? named.find(p => Number(p.id) === id) : null;
    // Slug ya zamani isiyo na p<id> (mfano "mix-products", "ginseng-five-treasure-tea"): linganisha na jina/slug
    // bila kiambishi cha ID — ikiwa MOJA TU inalingana. Ikiwa zaidi ya moja, hatubahatishi (404).
    if (!found && id === null) {
      const strip = s => String(s).replace(/^p\d+-/, '');
      const m = named.filter(p => strip(productSlug(p)) === bare || slugify(p.name) === bare);
      if (m.length === 1) found = m[0];
    }
    if (found) {
      const target = `/products/${productSlug(found)}`;
      if (target !== url.pathname) return redirectTo(target, search);
    }
    return context.next(); // haipo => 404.html halisi (status 404)
  }

  // Ombi lilikuwa na ".html" au maumbo ya zamani ("100040-jina" bila p) => elekeza kwenye URL moja safi (canonical).
  if (slug !== productSlug(product)) return redirectTo(`/products/${productSlug(product)}`, search);

  // Pakua picha/video za bidhaa HII tu (hati yake kamili), orodha nyepesi haina hizo.
  try { const full = await fetchCustomProductById(product.id); if (full && full.name) product = Object.assign({}, product, full); } catch (e) { /* tumia toleo jepesi */ }
  const html = renderProductHtml(product, named, productSlug(product));

  const response = new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      'X-Robots-Tag': 'index, follow, max-image-preview:large'
    }
  });
  if (cache && context.waitUntil) context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export const onRequestHead = onRequestGet;
