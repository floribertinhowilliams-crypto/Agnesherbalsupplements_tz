// Route: /img/custom/:id/:idx.jpg
// Bidhaa mpya (customProducts) huhifadhi picha zake kama "data URL" (base64)
// MOJA KWA MOJA ndani ya hati ya Firestore — si Firebase Storage (ambayo
// inahitaji mpango wa kulipa Blaze, ona js/firebase-config.js). Hilo lina maana
// picha hizo hazina URL ya kweli inayoweza kutambulika na Google/Product
// Schema. Function hii inatatua hilo BILA gharama yoyote ya ziada: inasoma
// hati ya bidhaa, inachukua picha ya nafasi husika, na kuirudisha kama picha
// halisi (bytes) yenye URL themabiti — sawa kabisa na picha za bidhaa 288 za
// awali zinavyoonekana kwa Google.
import { fetchCustomProductById, fetchOverrideById } from '../../../_lib/seo.js';

export async function onRequestGet(context) {
  const { id, idx } = context.params;
  const index = parseInt(idx, 10);
  if (isNaN(index) || index < 0) {
    return new Response('Not found', { status: 404 });
  }

  let product;
  try {
    product = await fetchCustomProductById(id);
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
  // Bidhaa 288 za awali hazipo kwenye customProducts; picha waliyobadilisha admin iko kwenye productOverrides.
  if ((!product || !Array.isArray(product.images) || !product.images.length) && /^\d+$/.test(String(id)) && Number(id) <= 287) {
    const ov = await fetchOverrideById(id);
    if (ov && Array.isArray(ov.images) && ov.images.length) product = { images: ov.images };
  }
  if (!product || !Array.isArray(product.images) || !product.images[index]) {
    return new Response('Not found', { status: 404 });
  }

  const dataUrl = product.images[index];
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) return new Response('Not found', { status: 404 });

  const mime = match[1];
  const base64 = match[2];
  let bytes;
  try {
    const binary = atob(base64);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': mime,
      // Na ?v=<alama> (URL ya ukurasa wa bidhaa) picha haibadiliki kamwe => cache ndefu; bila ?v (sitemap/katalogi) cache fupi
      // ili picha mpya ya admin ionekane ndani ya dakika, si saa nzima.
      'Cache-Control': new URL(context.request.url).searchParams.has('v') ? 'public, max-age=31536000, immutable' : 'public, max-age=60, s-maxage=60',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
