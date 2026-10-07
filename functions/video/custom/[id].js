// Route: /video/custom/:id.webm
// Video HALISI (videoClip) admin aliyopakia kwenye "➕ Ongeza Bidhaa" imehifadhiwa
// kama "data URL" (base64) MOJA KWA MOJA ndani ya hati ya Firestore — sawa na
// picha (ona functions/img/custom/[id]/[idx].js), si Firebase Storage. Hilo
// lina maana video hiyo haina URL ya kweli inayoweza kutambuliwa na Google
// (VideoObject schema inahitaji "contentUrl" ya kweli, si base64 iliyofichwa
// ndani ya JSON). Function hii inatatua hilo BILA gharama yoyote ya ziada:
// inasoma hati ya bidhaa, inachukua videoClip, na kuirudisha kama faili halisi
// (bytes) yenye URL themabiti — sawa kabisa na jinsi picha za bidhaa
// zinavyoonekana kwa Google.
import { fetchCustomProductById } from '../../_lib/seo.js';

function decodeBase64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function onRequestGet(context) {
  const idParam = context.params.id; // mfano "289.webm"
  const id = String(idParam).replace(/\.webm$/i, '');

  let product;
  try {
    product = await fetchCustomProductById(id);
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
  if (!product || !product.videoClip) {
    return new Response('Not found', { status: 404 });
  }

  const match = /^data:(video\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(product.videoClip);
  if (!match) return new Response('Not found', { status: 404 });

  const mime = match[1];
  let bytes;
  try {
    bytes = decodeBase64ToBytes(match[2]);
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }

  // Support ya "Range" requests: browsers (na Googlebot) huomba video kipande
  // kipande badala ya faili nzima kwa mara moja — bila hii, video haichezi
  // vizuri kwenye baadhi ya vifaa.
  const range = context.request.headers.get('Range');
  const total = bytes.length;
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? parseInt(m[1], 10) : 0;
    let end = m && m[2] ? parseInt(m[2], 10) : total - 1;
    if (isNaN(start) || start < 0) start = 0;
    if (isNaN(end) || end >= total) end = total - 1;
    if (start > end) start = 0;
    const chunk = bytes.slice(start, end + 1);
    return new Response(chunk, {
      status: 206,
      headers: {
        'Content-Type': mime,
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunk.length),
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(total),
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
