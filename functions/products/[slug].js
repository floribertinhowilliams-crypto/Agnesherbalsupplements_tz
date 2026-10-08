// Route: /products/:slug  (inashughulikia TU bidhaa mpya za admin —
// bidhaa 288 za awali zina faili tuli .html ambazo Cloudflare Pages
// hutanguliza kabla ya Function hii kuguswa kabisa).
import { STATIC_CATALOG } from '../_lib/static-catalog.js';
import {
  fetchCustomProducts, productSlug, imageProxyUrl, videoProxyUrl, buildAltText,
  buildTitle, buildMetaDescription, buildStandardFaq, escapeHtml, SITE, WHATSAPP_NUMBER
} from '../_lib/seo.js';

export async function onRequestGet(context) {
  const { slug } = context.params;

  // URL za zamani za bidhaa za admin ("100040-jina", bila "p") → muundo mpya "p100040-jina".
  if (/^1\d{5}-/.test(slug)) {
    return Response.redirect(`${SITE}/products/p${slug}`, 301);
  }

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
  // Manufaa na FAQ — HII inaonekana TU kama admin ameziweka mwenyewe
  // (Admin → Hariri Bidhaa → Mipangilio ya SEO). Hakuna manufaa au maswali
  // yanayobuniwa kiotomatiki hapa.
  const benefits = Array.isArray(product.benefits) ? product.benefits.filter(Boolean).slice(0, 5) : [];
  const adminFaq = Array.isArray(product.faq) ? product.faq.filter(f => f && f.q && f.a).slice(0, 8) : [];
  const faqList = adminFaq.concat(buildStandardFaq(product)).slice(0, 10);
  // Bidhaa zinazohusiana: kundi lile lile kwanza, kisha nyingine — kila ukurasa uelekeze kwenye kurasa zingine.
  const sameCat = products.filter(o => o.id !== product.id && o.name && o.category === product.category);
  const others = products.filter(o => o.id !== product.id && o.name && o.category !== product.category);
  const related = sameCat.concat(others).slice(0, 4);

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    category: product.category || undefined,
    brand: { '@type': 'Brand', name: 'Agnes Herbal Supplements' },
    sku: String(product.id),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TZS',
      eligibleRegion: ['TZ', 'KE', 'UG', 'RW', 'BI'].map(c => ({ '@type': 'Country', name: c })),
      seller: { '@type': 'Organization', name: 'Agnes Herbal Supplements', url: SITE + '/' },
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

  const faqLd = faqList.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  } : null;

  const html = `<!DOCTYPE html>
<html lang="sw">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="sw-TZ" href="${canonical}">
<link rel="alternate" hreflang="sw-KE" href="${canonical}">
<link rel="alternate" hreflang="sw-UG" href="${canonical}">
<link rel="alternate" hreflang="en-TZ" href="${canonical}">
<link rel="alternate" hreflang="en-KE" href="${canonical}">
<link rel="alternate" hreflang="en-UG" href="${canonical}">
<link rel="alternate" hreflang="en-RW" href="${canonical}">
<link rel="alternate" hreflang="en-BI" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta name="geo.region" content="TZ">
<meta name="geo.placename" content="Dar es Salaam, Tanzania">
<meta name="geo.position" content="-6.7924;39.2083">
<meta name="ICBM" content="-6.7924, 39.2083">
<meta name="target" content="Tanzania, Kenya, Uganda, Rwanda, Burundi">
<meta property="og:locale" content="sw_TZ">
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
${faqLd ? `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>` : ''}
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
.benefits{margin:14px 0;padding:0;list-style:none;}
.benefits li{font-size:.88rem;color:#333;padding:6px 0 6px 26px;position:relative;}
.benefits li::before{content:"✓";position:absolute;left:0;color:#0f4d34;font-weight:800;}
.faq-block{margin-top:18px;}
.faq-block h2{font-family:'Fraunces',serif;color:#0f4d34;font-size:1.05rem;margin:0 0 10px;}
.faq-item{margin-bottom:12px;}
.faq-item .q{font-weight:700;font-size:.88rem;color:#1b1b1b;margin-bottom:3px;}
.faq-item .a{font-size:.85rem;color:#444;margin:0;}
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
<style>
.order-now-box{margin-bottom:10px;}
.qty-stepper{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:10px;background:#f4f0e4;border-radius:12px;padding:8px;}
.qty-stepper button{width:34px;height:34px;border-radius:8px;border:none;background:#0f4d34;color:#fff;font-size:1.1rem;font-weight:800;cursor:pointer;}
.qty-stepper span{font-size:1.05rem;font-weight:800;min-width:22px;text-align:center;}
.cta.order-now{background:#c98a2c;font-size:1.05rem;box-shadow:0 4px 14px rgba(201,138,44,.35);}
</style>
<script src="${SITE}/js/order-now.js"></script>
</head>
<body>
<div class="wrap">
<a class="back" href="/">&larr; Rudi Dukani</a>
<div class="card">
<img src="${primaryImg}" alt="${escapeHtml(alt)}" loading="lazy" width="640" height="640">
${hasLocalVideo ? `<video controls playsinline preload="none" poster="${primaryImg}" style="width:100%;display:block;background:#000;"><source src="${videoProxyUrl(product.id)}" type="video/webm"></video>` : ''}
${hasYoutubeVideo ? `<div style="position:relative;aspect-ratio:16/9;background:#000;"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(product.videoId)}" title="${escapeHtml(product.name)}" style="position:absolute;inset:0;width:100%;height:100%;border:0;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : ''}
<div class="card-body">
<p class="crumbs"><a href="/">Nyumbani</a> → ${product.category ? `<a href="/${categoryAnchor ? '#' + categoryAnchor : ''}">${escapeHtml(product.category)}</a> → ` : ''}${escapeHtml(product.name)}</p>
<div class="cat">${escapeHtml(product.category || '')}</div>
<h1>${escapeHtml(product.name)}</h1>
<p style="font-size:1.3rem;font-weight:800;color:#0f4d34;">Tsh ${price.toLocaleString('en-US')}</p>
<p class="desc">${escapeHtml(description)}</p>
${benefits.length ? `<ul class="benefits">${benefits.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
<div class="order-now-box"><div class="qty-stepper"><button type="button" onclick="ahsChangeOrderQty(-1)" aria-label="Punguza idadi">&minus;</button><span id="orderNowQty">1</span><button type="button" onclick="ahsChangeOrderQty(1)" aria-label="Ongeza idadi">+</button></div><a class="cta order-now" href="#" onclick="ahsOrderNow(${Number(product.id)},${escapeHtml(JSON.stringify(product.name))},${price});return false;">🛒 ORDER NOW</a></div>
<a class="cta" href="/#product-${product.id}">🛒 Ona kwenye Duka / Nunua</a>
<a class="cta wa" href="https://wa.me/${WHATSAPP_NUMBER}?text=${waText}" target="_blank" rel="noopener">💬 Uliza kwa WhatsApp</a>
<p style="font-size:.7rem;color:#999;margin-top:14px;line-height:1.5;">Bidhaa hii haikusudiwi kutibu, kuponya au kuzuia ugonjwa wowote. Si mbadala wa ushauri wa kitabibu. / This product is not intended to diagnose, treat, cure, or prevent any disease.</p>
${faqList.length ? `<div class="faq-block"><h2>Maswali Kuhusu Bidhaa Hii</h2>${faqList.map(f => `<div class="faq-item"><div class="q">${escapeHtml(f.q)}</div><p class="a">${escapeHtml(f.a)}</p></div>`).join('')}</div>` : ''}
${related.length ? `<div class="faq-block"><h2>Bidhaa Zinazohusiana</h2>${related.map(o => `<a class="rel-item" style="display:block;padding:10px 12px;background:#f7f4ea;border-radius:10px;color:#0f4d34;text-decoration:none;font-size:.85rem;font-weight:600;margin-bottom:8px;" href="/products/${productSlug(o)}">${escapeHtml(o.name)}</a>`).join('')}</div>` : ''}
</div>
</div>
</div>
<footer>&copy; ${new Date().getFullYear()} Agnes Herbal Supplements-Winstown,Dynee&amp; Duozi Distributor Tanzania, Dar es Salaam.</footer>
<script>(function(){try{var ua=navigator.userAgent||"";if(/bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|gpt|claude|perplexity|facebookexternalhit|whatsapp|telegram|twitterbot|linkedin|preview|lighthouse/i.test(ua)||/[?&]stay=1/.test(location.search))return;var a=document.querySelector('a.cta[href^="/#product-"]');if(a)location.replace(a.getAttribute("href"));}catch(e){}})();</script>
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
