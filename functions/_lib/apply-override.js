// Inatumia mabadiliko ya Admin (productOverrides) kwenye ukurasa TULI wa bidhaa ya awali, papo hapo,
// bila kuutengeneza upya: jina, bei, maelezo, picha ya kwanza, stock. Ukurasa tuli unabaki kiolezo
// (Manufaa, Viungo, Jinsi ya Kutumia, FAQ n.k.). Hakuna mabadiliko => rudisha null (tumia ukurasa tuli kama ulivyo).
import { SITE, escapeHtml } from './seo.js';

const unesc = s => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const jsonInner = s => JSON.stringify(String(s)).slice(1, -1);                 // ndani ya JSON-LD
const jsSafe = s => String(s).replace(/[\\'"&<>\r\n]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')); // ndani ya '...' ya JS/onclick
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const hashStr = s => { let h = 0; const t = String(s); for (let i = 0; i < t.length; i += 97) h = (h * 31 + t.charCodeAt(i)) >>> 0; return (h + t.length).toString(36); };
const replaceAll = (t, a, b) => (a && a !== b) ? t.split(a).join(b) : t;

export function patchStaticProductHtml(html, id, ov) {
  if (!ov) return null;
  const mName = /<h1>([\s\S]*?)<\/h1>/.exec(html);
  const mPrice = /"price":(\d+)/.exec(html);
  const mDesc = /<p class="desc">([\s\S]*?)<\/p>/.exec(html);
  if (!mName || !mPrice) return null;
  const oldNameEsc = mName[1], oldName = unesc(oldNameEsc), oldPrice = parseInt(mPrice[1], 10);
  const newName = (ov.name && String(ov.name).trim()) || oldName;
  const newPrice = (ov.prices && ov.prices.retail) ? Math.round(ov.prices.retail) : oldPrice;
  const newCaption = (ov.caption && String(ov.caption).trim()) || '';
  const imgs = Array.isArray(ov.images) ? ov.images.filter(Boolean) : [];
  const outOfStock = typeof ov.stock === 'number' && ov.stock <= 0;
  const changed = newName !== oldName || newPrice !== oldPrice || newCaption || imgs.length || outOfStock;
  if (!changed) return null;

  // Sehemu ya "Bidhaa Zinazohusiana" (chini) ina majina ya bidhaa NYINGINE: usiiguse.
  const cut = html.indexOf('<h2>Bidhaa Zinazohusiana</h2>');
  let h = cut > 0 ? html.slice(0, cut) : html;
  const tail = cut > 0 ? html.slice(cut) : '';
  // 1) Maelezo (caption): kwanza, kwa sababu maelezo ya zamani yana jina na bei ya zamani ndani yake.
  if (newCaption && mDesc) {
    const oldDescEsc = mDesc[1], oldDesc = unesc(oldDescEsc);
    const newDesc = newCaption.length > 158 ? newCaption.slice(0, 157).trim() + '…' : newCaption;
    h = h.replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*(")/g, (m, a, b) => a + escapeHtml(newDesc) + b);
    h = replaceAll(h, `<p class="desc">${oldDescEsc}</p>`, `<p class="desc">${escapeHtml(newCaption)}</p>`);
    h = replaceAll(h, jsonInner(oldDesc), jsonInner(newDesc));
  }
  // 2) Jina: katika JS (onclick/tracking) kwa usalama wa nukuu, kisha kila mahali pengine.
  h = h.replace(/ahsOrderNow\((\d+),'[^']*',(\d+)\)/g, (m, i, p) => `ahsOrderNow(${i},'${jsSafe(newName)}',${p})`);
  h = h.replace(/content_name:\s*'[^']*'/g, `content_name:'${jsSafe(newName)}'`);
  if (newName !== oldName) {
    h = replaceAll(h, oldNameEsc, escapeHtml(newName));
    h = replaceAll(h, oldName, jsonInner(newName));
    h = replaceAll(h, encodeURIComponent(oldName), encodeURIComponent(newName));
  }
  // 3) Bei
  if (newPrice !== oldPrice) {
    h = replaceAll(h, `Tsh ${fmt(oldPrice)}`, `Tsh ${fmt(newPrice)}`);
    h = replaceAll(h, `"price":${oldPrice}`, `"price":${newPrice}`);
    h = replaceAll(h, `content="${oldPrice}"`, `content="${newPrice}"`);
    h = h.replace(/(ahsOrderNow\(\d+,'[^']*',)\d+\)/g, `$1${newPrice})`);
    h = h.replace(/value:\s*\d+/g, `value:${newPrice}`);
  }
  // 4) Stock
  if (outOfStock) {
    h = replaceAll(h, 'https://schema.org/InStock', 'https://schema.org/OutOfStock');
    h = replaceAll(h, 'content="in stock"', 'content="out of stock"');
  }
  // 5) Picha ya kwanza (inatolewa na /img/custom/<id>/0.jpg kutoka productOverrides). ?v= inabadilika picha ikibadilika (Facebook/WhatsApp cache).
  if (imgs.length) {
    const url = `${SITE}/img/custom/${id}/0.jpg?v=${hashStr(imgs[0])}`;
    h = h.replace(new RegExp(`${SITE.replace(/[.]/g, '\\.')}/images/p\\d+\\.jpg`, 'g'), url);
    h = h.replace(/\s*<meta property="og:image:(?:width|height)" content="\d+">/g, '');
  }
  return h + tail;
}
