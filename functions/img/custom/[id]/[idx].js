// Route: /img/custom/:id/:idx.jpg
// Bidhaa mpya (customProducts) huhifadhi picha zake kama "data URL" (base64)
// MOJA KWA MOJA ndani ya hati ya Firestore — si Firebase Storage (ambayo
// inahitaji mpango wa kulipa Blaze, ona js/firebase-config.js). Hilo lina maana
// picha hizo hazina URL ya kweli inayoweza kutambulika na Google/Product
// Schema. Function hii inatatua hilo BILA gharama yoyote ya ziada: inasoma
// hati ya bidhaa, inachukua picha ya nafasi husika, na kuirudisha kama picha
// halisi (bytes) yenye URL themabiti — sawa kabisa na picha za bidhaa 288 za
// awali zinavyoonekana kwa Google.
import { fetchCustomProductById } from '../../../_lib/seo.js';

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
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
