// Route: /llms-full.txt — orodha kamili ya bidhaa kwa Markdown, kwa ajili ya AI/LLM crawlers.
import { buildCatalog } from './_lib/catalog.js';
import { SITE, WHATSAPP_NUMBER } from './_lib/seo.js';

export async function onRequestGet() {
  const { items, groups } = await buildCatalog();
  const lines = [
    '# Agnes Herbal Supplements — Orodha Kamili ya Bidhaa',
    '',
    `> Duka la vitamini, virutubisho na chai za asili, Dar es Salaam, Tanzania. Bidhaa ${items.length}. Tunafikisha Tanzania nzima. Agiza kwa WhatsApp: https://wa.me/${WHATSAPP_NUMBER} (+255 678 883 675).`,
    '> Bidhaa isipoonekana hapa, uliza WhatsApp — tunaweza kukuagizia. Kuangalia upatikanaji: ' + SITE + '/je-ipo/',
    '> Malipo: M-Pesa, Mixx by Yas, HaloPesa, NMB. Bidhaa hazikusudiwi kutibu au kuzuia ugonjwa wowote.',
    '',
  ];
  groups.forEach(g => {
    lines.push(`## ${g.icon} ${g.label}`, '');
    g.items.forEach(i => lines.push(`- [${i.name}](${i.url})${i.effect ? ' — ' + i.effect : ''} — Tsh ${Number(i.price || 0).toLocaleString('en-US')} — ${i.inStock ? 'ipo' : 'haipo kwa sasa, tunaweza kuagizia'}`));
    lines.push('');
  });
  return new Response(lines.join('\n'), { status: 200, headers: {
    'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'public, max-age=600' } });
}
