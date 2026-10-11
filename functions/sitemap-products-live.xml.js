// Route: /sitemap-products-live.xml
// sitemap.xml (faili tuli) inaendelea kuorodhesha bidhaa 288 za awali bila
// kuguswa. Sitemap hii ya PILI inaorodhesha PEKEE bidhaa mpya alizoongeza
// admin (customProducts), moja kwa moja kutoka Firestore — bidhaa mpya
// ikiongezwa/kufutwa, sitemap hii inajisasisha yenyewe bila hatua yoyote
// ya ziada. Zote mbili zimetajwa kwenye robots.txt.
import { fetchCustomProducts, productSlug, imageProxyUrl, videoProxyUrl, buildAltText, buildMetaDescription, escapeXml, SITE } from './_lib/seo.js';

export async function onRequestGet() {
  let products = [];
  try {
    products = await fetchCustomProducts();
  } catch (e) {
    products = [];
  }

  const urls = products
    .filter(p => p.name)
    .map(p => {
      const loc = `${SITE}/products/${productSlug(p)}`;
      const lastmod = /^\d{4}-\d{2}-\d{2}$/.test(p.dateAdded || '') ? p.dateAdded : new Date().toISOString().slice(0, 10);
      const thumb = (Array.isArray(p.images) && p.images.length) ? imageProxyUrl(p.id, 0) : `${SITE}/assets/images/logo.png`;
      const hasLocalVideo = !!p.videoClip;
      const hasYoutubeVideo = !hasLocalVideo && !!p.videoId;
      // "video:video" (Google Video Sitemap extension) inasaidia Google
      // kutambua video ya bidhaa mahsusi — sawa na jinsi <url> ya kawaida
      // inavyosaidia Google kutambua ukurasa wa bidhaa wenyewe.
      const videoBlock = (hasLocalVideo || hasYoutubeVideo) ? `
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumb)}</video:thumbnail_loc>
      <video:title>${escapeXml(p.name)}</video:title>
      <video:description>${escapeXml(buildMetaDescription(p))}</video:description>
      ${hasLocalVideo ? `<video:content_loc>${escapeXml(videoProxyUrl(p.id))}</video:content_loc>` : `<video:player_loc>https://www.youtube-nocookie.com/embed/${escapeXml(p.videoId)}</video:player_loc>`}
      <video:publication_date>${lastmod}T00:00:00+03:00</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>` : '';
      return `  <url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority>${videoBlock}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${urls}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=1800'
    }
  });
}
