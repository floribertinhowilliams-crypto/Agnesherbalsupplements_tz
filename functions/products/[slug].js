// Route: /products/:slug  (inashughulikia TU bidhaa mpya za admin —
// bidhaa 288 za awali zina faili tuli .html ambazo Cloudflare Pages
// hutanguliza kabla ya Function hii kuguswa kabisa).
import {
  fetchCustomProducts, productSlug, imageProxyUrl, videoProxyUrl, buildAltText,
  buildTitle, buildMetaDescription, escapeHtml, SITE, WHATSAPP_NUMBER
} from '../_lib/seo.js';

export async function onRequestGet(context) {
  const { slug } = context.params;

  let products;
  try {
    products = await fetchCustomProducts();
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
        // Mojawapo ya bidhaa 288 za awali — ukurasa wake rasmi ni faili
        // tuli .html (ona folda products/).
        return Response.redirect(`${SITE}/products/${slug}.html`, 301);
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

  const images = Array.isArray(product.images) ? product.images : [];
  const imgUrls = images.map((_, i) => imageProxyUrl(product.id, i));
  const primaryImg = imgUrls[0] || `${SITE}/assets/images/logo.png`;
  const title = buildTitle(product);
  const description = buildMetaDescription(product);
  const canonical = `${SITE}/products/${slug}`;
  const alt = buildAltText(product);
  const price = Math.round((product.prices && product.prices.retail) || 0);
  const inStock = !(typeof product.stock === 'number' && product.stock <= 0);
  const categoryAnchor = product.catSlug || '';
  const waText = encodeURIComponent('Habari, ninavutiwa na bidhaa: ' + product.name);

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    category: product.category || undefined,
    sku: String(product.id),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TZS',
      price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: canonical
    }
  };
  if (imgUrls.length) productLd.image = imgUrls;

  // VideoObject schema: hii ndiyo inayomwezesha Google kutambua video ya
  // bidhaa (sawa kabisa na jinsi productLd/imageProxyUrl juu inavyomwezesha
  // Google kutambua bei/picha/upatikanaji). videoClip (video halisi
  // iliyopakiwa na admin) inapewa kipaumbele; videoId (YouTube, kwa
  // bidhaa za zamani zilizohaririwa) ni mbadala.
  let videoLd = null;
  const hasLocalVideo = !!product.videoClip;
  const hasYoutubeVideo = !hasLocalVideo && !!product.videoId;
  if (hasLocalVideo || hasYoutubeVideo) {
    videoLd = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${product.name} - Video`,
      description,
      thumbnailUrl: [primaryImg],
      uploadDate: product.dateAdded ? `${product.dateAdded}T00:00:00+03:00` : undefined,
    };
    if (hasLocalVideo) {
      videoLd.contentUrl = videoProxyUrl(product.id);
    } else {
      videoLd.embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(product.videoId)}`;
    }
    // productLd.video huunganisha VideoObject na Product yenyewe kwenye
    // schema moja — hii inasaidia Google kuonyesha video kwenye matokeo ya
    // utafutaji ya bidhaa (siyo tu matokeo ya video peke yake).
    productLd.video = videoLd;
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Nyumbani', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: product.category || 'Bidhaa', item: `${SITE}/${categoryAnchor ? '#' + categoryAnchor : ''}` },
      { '@type': 'ListItem', position: 3, name: product.name, item: canonical }
    ]
  };

  const html = `<!DOCTYPE html>
<html lang="sw">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeHtml(product.name)} - Agnes Herbal Supplements">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${primaryImg}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="product">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(product.name)} - Agnes Herbal Supplements">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${primaryImg}">
<link rel="icon" href="${SITE}/assets/icons/icon-96.png">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(productLd)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
<style>
body{font-family:Inter,sans-serif;background:#fbf7ee;color:#1b1b1b;margin:0;padding:0;}
.wrap{max-width:640px;margin:0 auto;padding:20px;}
.back{display:inline-block;margin-bottom:16px;color:#0f4d34;text-decoration:none;font-weight:600;font-size:.9rem;}
.card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);}
.card img{width:100%;display:block;aspect-ratio:1/1;object-fit:cover;background:#eee;}
.card-body{padding:20px;}
h1{font-family:'Fraunces',serif;color:#0f4d34;font-size:1.4rem;margin:0 0 8px;}
.cat{font-size:.8rem;color:#c98a2c;font-weight:700;text-transform:uppercase;letter-spacing:.03em;margin-bottom:10px;}
.desc{font-size:.92rem;line-height:1.6;color:#444;margin:12px 0 18px;}
.cta{display:block;text-align:center;background:#0f4d34;color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;margin-bottom:10px;}
.cta.wa{background:#25D366;}
.crumbs{font-size:.75rem;color:#888;margin-bottom:10px;}
.crumbs a{color:#0f4d34;text-decoration:none;}
footer{text-align:center;font-size:.75rem;color:#888;padding:30px 20px;}
</style>
<script src="${SITE}/js/analytics-config.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  if (typeof ahsTrackEvent === 'function') {
    ahsTrackEvent('view_item', { content_name: ${JSON.stringify(product.name)}, content_type: 'product', value: ${price}, currency: 'TZS' });
  }
});
</script>
</head>
<body>
<div class="wrap">
<a class="back" href="/index.html">&larr; Rudi Dukani</a>
<div class="card">
<img src="${primaryImg}" alt="${escapeHtml(alt)}" loading="lazy" width="640" height="640">
${hasLocalVideo ? `<video controls playsinline preload="none" poster="${primaryImg}" style="width:100%;display:block;background:#000;"><source src="${videoProxyUrl(product.id)}" type="video/webm"></video>` : ''}
${hasYoutubeVideo ? `<div style="position:relative;aspect-ratio:16/9;background:#000;"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(product.videoId)}" title="${escapeHtml(product.name)}" style="position:absolute;inset:0;width:100%;height:100%;border:0;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : ''}
<div class="card-body">
<p class="crumbs"><a href="/index.html">Nyumbani</a> → ${product.category ? `<a href="/index.html${categoryAnchor ? '#' + categoryAnchor : ''}">${escapeHtml(product.category)}</a> → ` : ''}${escapeHtml(product.name)}</p>
<div class="cat">${escapeHtml(product.category || '')}</div>
<h1>${escapeHtml(product.name)}</h1>
<p style="font-size:1.3rem;font-weight:800;color:#0f4d34;">Tsh ${price.toLocaleString('en-US')}</p>
<p class="desc">${escapeHtml(description)}</p>
<a class="cta" href="/index.html#product-${product.id}">🛒 Ona kwenye Duka / Nunua</a>
<a class="cta wa" href="https://wa.me/${WHATSAPP_NUMBER}?text=${waText}" target="_blank" rel="noopener">💬 Uliza kwa WhatsApp</a>
<p style="font-size:.7rem;color:#999;margin-top:14px;line-height:1.5;">Bidhaa hii haikusudiwi kutibu, kuponya au kuzuia ugonjwa wowote. Si mbadala wa ushauri wa kitabibu. / This product is not intended to diagnose, treat, cure, or prevent any disease.</p>
</div>
</div>
</div>
<footer>&copy; ${new Date().getFullYear()} Agnes Herbal Supplements-Winstown,Dynee&amp; Duozi Distributor Tanzania, Dar es Salaam.</footer>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=600',
      'X-Robots-Tag': 'index, follow'
    }
  });
}
