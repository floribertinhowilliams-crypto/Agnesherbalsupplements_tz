// Route: /products/:slug  (inashughulikia TU bidhaa mpya za admin —
// bidhaa 288 za awali zina faili tuli .html ambazo Cloudflare Pages
// hutanguliza kabla ya Function hii kuguswa kabisa).
import { STATIC_CATALOG } from '../_lib/static-catalog.js';
import { renderProductHtml } from '../_lib/render-product.js';
import {
  fetchCustomProducts, fetchCustomProductById, productSlug, imageProxyUrl, videoProxyUrl, buildAltText,
  buildTitle, buildMetaDescription, buildStandardFaq, escapeHtml, SITE, WHATSAPP_NUMBER
} from '../_lib/seo.js';

export async function onRequestGet(context) {
  const { slug } = context.params;
  // Akiba ya ukingoni (dakika 2): bei/maelezo yakibadilishwa kwenye admin, ukurasa unasasishwa wenyewe
  // ndani ya dakika 2, bila kupakua Firestore kila ombi.
  const cache = (typeof caches !== 'undefined' && caches.default) ? caches.default : null;
  if (cache) {
    try { const hit = await cache.match(context.request); if (hit) return hit; } catch (e) { /* endelea */ }
  }

  // URL za zamani za bidhaa za admin ("100040-jina", bila "p") → muundo mpya "p100040-jina".
  if (/^1\d{5}-/.test(slug)) {
    return Response.redirect(`${SITE}/products/p${slug}`, 301);
  }

  let products;
  try {
    products = await fetchCustomProducts(true); // orodha nyepesi (bila picha za base64)
  } catch (e) {
    // Firestore haipatikani kwa muda — acha 404.html ya kawaida ishughulikie
    // badala ya kuonyesha hitilafu ya server isiyo na maana kwa Google.
    return context.next();
  }

  let product = products.find(p => p.name && productSlug(p) === slug);

  if (!product) {
    // Google/GSC bado ina URL za muundo wa ZAMANI ("p{id}-jina", bila
    // .html) kwa bidhaa ambazo muundo wao rasmi wa sasa ni tofauti —
    // badala ya 404 tu, tunaangalia kama zinalingana na bidhaa halisi na
    // tunaelekeza (301) kwenye URL sahihi ya sasa. Hii inazuia "link
    // equity" ya zamani kupotea na inasaidia mtu anayebofya matokeo ya
    // zamani ya Google asipate ukurasa usiopatikana.
    //
    // MUHIMU: hatuwezi kutumia faili la _redirects kwa hili — Cloudflare
    // Pages HAITUMII _redirects kwa maombi yanayoshughulikiwa na Function
    // (hata kama njia ya Function inalingana), kwa hiyo lazima ifanyike
    // hapa ndani.
    const m = /^p(\d+)-/.exec(slug);
    if (m) {
      const id = parseInt(m[1], 10);
      if (id <= 287) {
        // Mojawapo ya bidhaa 288 za awali — ukurasa wake rasmi ni faili tuli
        // (products/pN-jina.html), unaohudumiwa kwenye URL SAFI bila .html.
        // Tunatafuta kwa ID ili tusielekeze kwenye ukurasa usiokuwepo.
        const st = STATIC_CATALOG.find(x => x.id === id);
        if (st && st.page) return Response.redirect(`${SITE}${st.page}`, 301);
        return context.next();
      }
      // Bidhaa ya admin (Firestore) iliyoombwa kwa muundo wa zamani wenye
      // kiambishi cha ID — tafuta kwa ID halisi, kisha elekeza kwenye
      // slug SAHIHI ya sasa (bila kiambishi, bila .html — ona
      // productSlug() juu).
      const byId = products.find(p => p.name && Number(p.id) === id);
      if (byId) return Response.redirect(`${SITE}/products/${productSlug(byId)}`, 301);
    }
    return context.next();
  }

  // Pakua picha/video za bidhaa HII tu (hati yake kamili), orodha nyepesi haina hizo.
  try { const full = await fetchCustomProductById(product.id); if (full && full.name) product = Object.assign({}, product, full); } catch (e) { /* tumia toleo jepesi */ }
  const html = renderProductHtml(product, products, slug);

  const response = new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=120, s-maxage=120',
      'X-Robots-Tag': 'index, follow'
    }
  });
  if (cache && context.waitUntil) context.waitUntil(cache.put(context.request, response.clone()));
  return response;
}
