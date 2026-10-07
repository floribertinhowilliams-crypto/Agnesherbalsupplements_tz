// ============================================================================
// Agnes Herbal Supplements
// AI Shopping Assistant — chatbot inayotafuta bidhaa NDANI YA DUKA hili pekee.
// ============================================================================
// Mteja anaandika tatizo lake (mfano: "nina shida ya kulala"), na AI
// inapendekeza bidhaa kutoka kwenye orodha halisi ya PRODUCTS (products-data.js)
// TU — kamwe haitafuti wala kubuni kitu nje ya mfumo huu. Hakuna sign-in,
// hakuna akaunti inayohitajika kwa mteja — ni bure kabisa.
// ============================================================================

let aiChatHistory = []; // { role: 'user'|'assistant', content } — muktadha wa mazungumzo
let aiChatOpen = false;
let aiChatBusy = false;

document.addEventListener('DOMContentLoaded', initAiAssistant);

function initAiAssistant() {
  if (typeof aiAssistantConfigured !== 'function' || !aiAssistantConfigured()) {
    console.info('[AI Assistant] Haijawashwa — weka AI_WORKER_URL kwenye js/ai-config.js (ona cloudflare-worker/agnes-ai-worker.js kwa maelekezo).');
    return;
  }
  if (typeof PRODUCTS === 'undefined') return;

  // Kitufe kinawekwa NDANI ya search bar (#searchWrap), karibu na 🎤/📷.
  const searchWrap = document.getElementById('searchWrap');

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.id = 'aiChatFab';
  fab.className = 'ai-chat-btn';
  fab.title = t('ai_chat_fab');
  fab.setAttribute('aria-label', t('ai_chat_fab'));
  fab.setAttribute('aria-expanded', 'false');
  fab.textContent = '✨';

  if (searchWrap) {
    searchWrap.appendChild(fab);
  } else {
    fab.style.position = 'fixed'; fab.style.top = '78px'; fab.style.right = '16px'; fab.style.zIndex = 150;
    document.body.appendChild(fab);
  }

  // Jopo la mazungumzo linafunguka kama MODAL ya katikati yenye giza nyuma
  // (kama invoice/cart overlay zilizopo), sio kufunika content bila taarifa.
  const scrim = document.createElement('div');
  scrim.id = 'aiChatScrim';
  scrim.className = 'ai-chat-scrim';
  scrim.innerHTML = `
    <div id="aiChatPanel" class="ai-chat-panel">
      <div class="ai-chat-header">
        <div>
          <div class="ai-chat-title">${escapeHtml(t('ai_chat_title'))}</div>
          <div class="ai-chat-subtitle">${escapeHtml(t('ai_chat_subtitle'))}</div>
        </div>
        <button id="aiChatClose" class="ai-chat-close" aria-label="${escapeHtml(t('ai_chat_close'))}">✕</button>
      </div>
      <div id="aiChatBody" class="ai-chat-body"></div>
      <div class="ai-chat-disclaimer">${escapeHtml(t('ai_chat_disclaimer'))}</div>
      <form id="aiChatForm" class="ai-chat-input-row">
        <input id="aiChatInput" class="ai-chat-input" type="text" maxlength="300"
               placeholder="${escapeHtml(t('ai_chat_placeholder'))}" autocomplete="off">
        <button type="submit" class="ai-chat-send" id="aiChatSendBtn">${escapeHtml(t('ai_chat_send'))}</button>
      </form>
    </div>
  `;
  document.body.appendChild(scrim);

  fab.addEventListener('click', toggleAiChat);
  document.getElementById('aiChatClose').addEventListener('click', toggleAiChat);
  document.getElementById('aiChatForm').addEventListener('submit', onAiChatSubmit);
  // Kubonyeza nje ya dirisha (kwenye giza) hufunga jopo pia
  scrim.addEventListener('click', (e) => { if (e.target === scrim) toggleAiChat(); });
}

function toggleAiChat() {
  aiChatOpen = !aiChatOpen;
  const scrim = document.getElementById('aiChatScrim');
  const fab = document.getElementById('aiChatFab');
  scrim.classList.toggle('open', aiChatOpen);
  fab.setAttribute('aria-expanded', String(aiChatOpen));
  if (aiChatOpen) {
    // Tumia idadi ya "bubbles" zilizopo mwilini mwa mazungumzo kuamua kama
    // tayari tumeshaonyesha ujumbe wa mwanzo — hii inazuia ujumbe "Habari!"
    // kujirudia kila mara dirisha linapofunguliwa (bila kutegemea
    // aiChatHistory, ambayo huongezwa TU baada ya mteja kutuma swali lake).
    const body = document.getElementById('aiChatBody');
    if (body && !body.children.length) addAiBubble('assistant', t('ai_chat_intro'));
    document.getElementById('aiChatInput').focus();
  }
}

async function onAiChatSubmit(e) {
  e.preventDefault();
  if (aiChatBusy) return;
  const input = document.getElementById('aiChatInput');
  const query = input.value.trim();
  if (!query) return;
  input.value = '';

  addAiBubble('user', query);
  aiChatHistory.push({ role: 'user', content: query });

  // Mteja akiomba LINK/URL ya bidhaa: tunampa moja kwa moja kutoka kwenye katalogi (bidhaa zote, za awali + za admin),
  // bila kutegemea AI — hivyo kila bidhaa ina link na inapatikana kila wakati.
  const linkReply = aiHandleLinkRequest(query);
  if (linkReply) {
    aiChatHistory.push({ role: 'assistant', content: linkReply.text });
    return;
  }
  const thinkingEl = addAiBubble('assistant', t('ai_chat_thinking'), true);

  aiChatBusy = true;
  document.getElementById('aiChatSendBtn').disabled = true;
  try {
    const compactCatalog = aiAllProducts().map(p => ({ id: p.id, name: p.name, effect: p.effect, category: p.category, url: productPageUrl(p) }));
    const data = await aiWorkerCall({
      action: 'find',
      lang: getLang(),
      query,
      history: aiChatHistory.slice(-8),
      products: compactCatalog,
    });
    thinkingEl.remove();
    const replyText = data.reply || t('ai_chat_no_match');
    addAiBubble('assistant', replyText);
    aiChatHistory.push({ role: 'assistant', content: replyText });
    if (Array.isArray(data.product_ids) && data.product_ids.length) {
      renderAiProductMatches(data.product_ids);
    }
    if (aiWantsLink(query) || !Array.isArray(data.product_ids) || !data.product_ids.length) {
      // Ikiwa AI ilitaja bidhaa kwa jina, tambatisha link zake.
      const named = aiFindProducts(replyText, 3, true);
      if (named.length && aiWantsLink(query)) addAiLinkBubble(aiLinkIntro(named.length), named);
    }
  } catch (err) {
    console.warn('[AI Assistant] find failed', err);
    thinkingEl.remove();
    addAiBubble('assistant', t('ai_chat_error'));
  } finally {
    aiChatBusy = false;
    document.getElementById('aiChatSendBtn').disabled = false;
  }
}

function addAiBubble(role, text, isTemp) {
  const body = document.getElementById('aiChatBody');
  const el = document.createElement('div');
  el.className = 'ai-chat-msg ' + (role === 'user' ? 'ai-chat-msg-user' : 'ai-chat-msg-bot') + (isTemp ? ' ai-chat-msg-temp' : '');
  el.textContent = text;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
  return el;
}

function renderAiProductMatches(ids) {
  const body = document.getElementById('aiChatBody');
  const row = document.createElement('div');
  row.className = 'ai-chat-matches';
  ids.forEach(id => {
    const p = (typeof getEffectiveProduct === 'function') ? getEffectiveProduct(id) : PRODUCTS.find(x => x.id === id);
    if (!p) return;
    const card = document.createElement('div');
    card.className = 'ai-chat-product-mini';
    card.innerHTML = `
      <img src="${escapeHtml(p.file ? 'images/' + p.file : absoluteImageUrl(p))}" alt="${escapeHtml(p.name)}" loading="lazy">
      <div class="ai-chat-product-mini-name">${escapeHtml(p.name)}</div>
      <div class="ai-chat-product-mini-price">${escapeHtml(fmt(p.prices.retail))}</div>
      <a class="ai-chat-product-mini-link" href="${escapeHtml(productPageUrl(p))}" target="_blank" rel="noopener" style="display:block;font-size:.7rem;margin-top:4px;color:#0f4d34;font-weight:700;">🔗 Link</a>
    `;
    card.querySelector('a').addEventListener('click', (ev) => ev.stopPropagation());
    card.addEventListener('click', () => {
      openProduct(id);
      toggleAiChat();
    });
    row.appendChild(card);
  });
  if (row.children.length) {
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }
}


// ============================================================================
// LINK YA BIDHAA — kila bidhaa (288 za awali + za admin) ina URL yake; mteja akiomba anapewa.
// ============================================================================
function aiAllProducts() {
  return (typeof visibleProducts === 'function') ? visibleProducts() : PRODUCTS;
}
function aiWantsLink(q) {
  return /\b(link|linki|url|kiungo|viungo|anwani|website|tovuti|lien|enlace)\b/i.test(q);
}
function aiLinkIntro(n) {
  const sw = getLang() === 'sw';
  return sw ? (n > 1 ? 'Hizi ndizo link za bidhaa (bonyeza kufungua, au nakili):' : 'Hii ndiyo link ya bidhaa (bonyeza kufungua, au nakili):')
            : (n > 1 ? 'Here are the product links (tap to open, or copy):' : 'Here is the product link (tap to open, or copy):');
}
const AI_STOP = new Set(['link','linki','url','kiungo','viungo','anwani','ya','za','la','wa','bidhaa','nipe','naomba','ninaomba','nitumie','tuma','tumia','tafadhali','please','the','of','for','send','me','give','product','products','a','an','is','my','hii','hiyo','ile','kwa','na','ni','au','kuhusu','nataka','want','need','get','share','shiriki','weka','ipo','link:']);
function aiTokens(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9\s]+/g, ' ').split(/\s+/).filter(w => w && !AI_STOP.has(w));
}
// Tafuta bidhaa kwa jina (fuzzy). inText=true: tafuta majina kamili ndani ya maandishi marefu (jibu la AI).
function aiFindProducts(query, max, inText) {
  const list = aiAllProducts();
  const q = String(query || '').toLowerCase();
  const qNorm = ' ' + q.replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
  if (inText) {
    return list.filter(p => qNorm.includes(' ' + String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() + ' ')).slice(0, max);
  }
  const qt = aiTokens(q);
  // Namba ya bidhaa (mfano "p114" au "id 114")
  const idm = /\bp?(\d{1,6})\b/.exec(q);
  const scored = list.map(p => {
    const nt = aiTokens(p.name);
    if (!nt.length || !qt.length) return { p, score: 0 };
    const hit = qt.filter(w => nt.includes(w) || nt.some(n => n.length > 3 && w.length > 3 && (n.startsWith(w) || w.startsWith(n)))).length;
    const cover = hit / Math.max(qt.length, 1);       // sehemu ya maneno ya mteja iliyopatikana
    const prec = hit / nt.length;                      // sehemu ya jina la bidhaa iliyotajwa
    let score = cover * 0.6 + prec * 0.4;
    if (qNorm.includes(' ' + String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() + ' ')) score += 1 + nt.length * 0.3; // jina kamili limetajwa (refu kushinda fupi)
    if (idm && String(p.id) === idm[1] && qt.length <= 1) score += 2;
    return { p, score };
  }).filter(x => x.score >= 0.55).sort((a, b) => b.score - a.score);
  if (!scored.length) return [];
  const top = scored[0].score;
  return scored.filter(x => x.score >= top - 0.25).slice(0, max).map(x => x.p);
}
function addAiLinkBubble(intro, products) {
  const body = document.getElementById('aiChatBody');
  const el = document.createElement('div');
  el.className = 'ai-chat-msg ai-chat-msg-bot';
  el.appendChild(document.createTextNode(intro));
  products.forEach(p => {
    const url = productPageUrl(p);
    const row = document.createElement('div');
    row.style.cssText = 'margin-top:8px;word-break:break-all;';
    const name = document.createElement('strong'); name.textContent = p.name + ' — ' + fmt(p.prices.retail);
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = url;
    a.style.cssText = 'display:block;color:#0f4d34;text-decoration:underline;';
    const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = getLang() === 'sw' ? '📋 Nakili link' : '📋 Copy link';
    copy.style.cssText = 'margin-top:4px;border:1px solid #0f4d34;background:#fff;color:#0f4d34;border-radius:999px;padding:3px 10px;font-size:.72rem;font-weight:700;cursor:pointer;';
    copy.addEventListener('click', () => {
      const done = () => { copy.textContent = getLang() === 'sw' ? '✓ Imenakiliwa' : '✓ Copied'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done); else done();
    });
    row.appendChild(name); row.appendChild(a); row.appendChild(copy);
    el.appendChild(row);
  });
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
  return el;
}
// Inarudisha {text} ikiwa ombi lilikuwa la link na limeshajibiwa; vinginevyo null (AI ishughulikie).
function aiHandleLinkRequest(query) {
  if (!aiWantsLink(query)) return null;
  const sw = getLang() === 'sw';
  const found = aiFindProducts(query, 3, false);
  if (found.length) {
    const intro = aiLinkIntro(found.length);
    addAiLinkBubble(intro, found);
    return { text: intro + ' ' + found.map(p => p.name + ': ' + productPageUrl(p)).join(' | ') };
  }
  // Hakuna jina maalum: orodha kamili yenye link za bidhaa zote.
  const all = 'https://agnesherbalsupplements.com/orodha/';
  const msg = sw ? `Sijapata bidhaa hiyo kwa jina. Andika jina la bidhaa (mfano "link ya 28 Day Slimming Tea"), au fungua orodha kamili yenye link za bidhaa zote: ${all}`
                 : `I couldn't match that product by name. Type the product name (e.g. "link for 28 Day Slimming Tea"), or open the full list with every product link: ${all}`;
  addAiBubble('assistant', msg);
  return { text: msg };
}
