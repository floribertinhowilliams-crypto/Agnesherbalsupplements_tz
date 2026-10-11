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
  const thinkingEl = addAiBubble('assistant', t('ai_chat_thinking'), true);

  aiChatBusy = true;
  document.getElementById('aiChatSendBtn').disabled = true;
  try {
    const compactCatalog = PRODUCTS.map(p => ({ id: p.id, name: p.name, effect: p.effect, category: p.category }));
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
      <img src="images/${escapeHtml(p.file)}" alt="${escapeHtml(p.name)}" loading="lazy">
      <div class="ai-chat-product-mini-name">${escapeHtml(p.name)}</div>
      <div class="ai-chat-product-mini-price">${escapeHtml(fmt(p.prices.retail))}</div>
    `;
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
