// Agnes Herbal Supplements — Search Upgrade v2
// Adds: live search suggestions (richer), category search, voice search,
// search history, trending searches, popular searches, search by symptom,
// search by health goal, and rich "no results" suggestions.
//
// This file only adds NEW globals (data + engine + rendering helpers) and
// wires voice search on its own. The actual <input> event wiring
// (input/focus/keydown/outside-click) lives in js/app.js's initSearch(),
// which calls into the functions below defensively (typeof checks), the
// same pattern already used between js/app.js and js/homepage-v2.js.
//
// Relies on globals already defined in js/app.js, js/i18n.js and
// js/products-data.js (all loaded before this file).

/* ===================== DATA: SYMPTOMS & HEALTH GOALS ===================== */
// Keyword lists are matched (case-insensitive, substring OR) against each
// product's "name + effect + category" — the same fields the normal text
// search already uses. Add more keywords here if new product lines are
// added later and a topic stops finding matches.
const SYMPTOMS = [
  { key: 'bowel', icon: '🚽', label: { sw: 'Kuvimbiwa / Tumbo', en: 'Constipation / Stomach' }, keywords: ['bowel', 'constipat', 'colon', 'hemorrhoid', 'stomach', 'gut', 'ulcer', 'digest'] },
  { key: 'sleep', icon: '😴', label: { sw: 'Kukosa Usingizi', en: 'Insomnia / Poor Sleep' }, keywords: ['sleep', 'insomnia', 'calm', 'relax', 'bedtime'] },
  { key: 'overweight', icon: '⚖️', label: { sw: 'Uzito Kupindukia', en: 'Being Overweight' }, keywords: ['weight loss', 'loss weight', 'fat burning', 'slim', 'tummy'] },
  { key: 'bp', icon: '❤️', label: { sw: 'Shinikizo la Damu', en: 'High Blood Pressure' }, keywords: ['blood pressure', 'hypertension', 'cardiovascular', 'blood vessel'] },
  { key: 'sugar', icon: '🩸', label: { sw: 'Kisukari', en: 'Diabetes / Blood Sugar' }, keywords: ['blood sugar', 'diabet', 'glucose', 'uric acid'] },
  { key: 'skin', icon: '✨', label: { sw: 'Chunusi na Tatizo la Ngozi', en: 'Acne & Skin Problems' }, keywords: ['acne', 'skin whit', 'skin health', 'complexion'] },
  { key: 'fatigue', icon: '🔋', label: { sw: 'Uchovu / Kukosa Nguvu', en: 'Fatigue / Low Energy' }, keywords: ['fatigue', 'energy', 'vitality', 'endurance'] },
  { key: 'joint', icon: '🦴', label: { sw: 'Maumivu ya Viungo', en: 'Joint & Bone Pain' }, keywords: ['joint', 'arthritis', 'bone', 'rheumat'] },
  { key: 'liver', icon: '🫀', label: { sw: 'Matatizo ya Ini', en: 'Liver Problems' }, keywords: ['liver'] },
  { key: 'male', icon: '💪', label: { sw: 'Nguvu za Kiume', en: "Men's Performance" }, keywords: ['tonify', 'tonifying kidney', 'kidney tonif', 'aphrodisiac', 'performance', 'male'] },
  { key: 'fertility', icon: '🤰', label: { sw: 'Ugumba / Utasa', en: 'Fertility Issues' }, keywords: ['fertility', 'pregnan', 'reproduct', 'womb'] },
  { key: 'menopause', icon: '🌸', label: { sw: 'Kukoma Hedhi (PMS)', en: 'Menopause / PMS' }, keywords: ['menopaus', 'pms', 'hormone'] },
  { key: 'smoking', icon: '🚭', label: { sw: 'Tabia ya Kuvuta Sigara', en: 'Smoking Habit' }, keywords: ['smok'] },
  { key: 'prostate', icon: '🔬', label: { sw: 'Tatizo la Kibofu (Prostate)', en: 'Prostate Issues' }, keywords: ['prostate'] },
  { key: 'kidney', icon: '🫘', label: { sw: 'Matatizo ya Figo', en: 'Kidney Problems' }, keywords: ['kidney'] },
  { key: 'eye', icon: '👁️', label: { sw: 'Matatizo ya Macho', en: 'Eye Problems' }, keywords: ['eye'] },
];

const HEALTH_GOALS = [
  { key: 'weightloss', icon: '⚖️', label: { sw: 'Kupunguza Uzito', en: 'Weight Loss' }, keywords: ['weight loss', 'loss weight', 'fat burning', 'slim', 'tummy', 'detox'] },
  { key: 'weightgain', icon: '💪', label: { sw: 'Kuongeza Uzito / Misuli', en: 'Weight Gain / Muscle' }, keywords: ['weight gain', 'muscle', 'weight gainer'] },
  { key: 'skinglow', icon: '🌟', label: { sw: "Ngozi Kung'aa", en: 'Glowing Skin' }, keywords: ['skin whit', 'glow', 'collagen', 'glutathione', 'whitening', 'brighten'] },
  { key: 'curves', icon: '🍑', label: { sw: 'Maumbo ya Mwili', en: 'Body Curves' }, keywords: ['buttock', 'butt', 'breast', 'curve', 'hip'] },
  { key: 'immunity', icon: '🛡️', label: { sw: 'Kinga ya Mwili', en: 'Immunity Boost' }, keywords: ['immun'] },
  { key: 'fertility', icon: '👶', label: { sw: 'Afya ya Uzazi', en: 'Reproductive Health' }, keywords: ['fertility', 'pregnan', 'womb', 'reproduct'] },
  { key: 'vitality', icon: '🔥', label: { sw: 'Nguvu na Hamu', en: 'Vitality & Libido' }, keywords: ['tonify', 'tonifying kidney', 'libido', 'aphrodisiac', 'performance', 'power energy'] },
  { key: 'sleep', icon: '🌙', label: { sw: 'Kulala Vizuri', en: 'Better Sleep' }, keywords: ['sleep', 'calm', 'relax'] },
  { key: 'hair', icon: '💇', label: { sw: 'Nywele Nzuri', en: 'Healthy Hair' }, keywords: ['hair'] },
  { key: 'height', icon: '📏', label: { sw: 'Kuongeza Kimo', en: 'Height Growth' }, keywords: ['height'] },
  { key: 'detox', icon: '🌿', label: { sw: 'Kusafisha Mwili (Detox)', en: 'Detox & Cleansing' }, keywords: ['detox', 'toxin', 'cleanse'] },
  { key: 'heart', icon: '❤️‍🩹', label: { sw: 'Afya ya Moyo', en: 'Heart Health' }, keywords: ['cardiovascular', 'blood pressure', 'blood vessel', 'heart'] },
];

// Swahili slang → the English word actually used in the catalog, so typing
// a local/colloquial word still finds the right category (Category Search).
const CATEGORY_SYNONYMS = {
  chai: 'tea', majani: 'tea', poda: 'powder', unga: 'powder',
  vidonge: 'tablet', kidonge: 'tablet', kapsuli: 'capsule', kapsuro: 'capsule',
  pipi: 'candy', gamu: 'gummies', gam: 'gummies', jeli: 'jelly',
  matone: 'drops', tone: 'drops', kiraka: 'patch', plasta: 'patch',
};

function searchLabel(entry, lang) {
  if (!entry || !entry.label) return '';
  return entry.label[lang] || entry.label.en || entry.label.sw || '';
}

/* ===================== ENGINE: matching helpers ===================== */
function svProductHay(p) { return (p.name + ' ' + p.effect + ' ' + p.category).toLowerCase(); }

function svMatchingCategories(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const expanded = [q];
  Object.keys(CATEGORY_SYNONYMS).forEach(sw => { if (q.includes(sw)) expanded.push(CATEGORY_SYNONYMS[sw]); });
  return CATEGORIES.filter(c => expanded.some(e => c.toLowerCase().includes(e))).slice(0, 3);
}

function svHighlight(text, query) {
  if (!query) return escapeHtml(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escapeHtml(text);
  const pre = text.slice(0, idx), mid = text.slice(idx, idx + query.length), post = text.slice(idx + query.length);
  return `${escapeHtml(pre)}<mark>${escapeHtml(mid)}</mark>${escapeHtml(post)}`;
}

/* ===================== ENGINE: fuzzy "did you mean" ===================== */
function svLevenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

const SV_STOPWORDS = new Set(['and', 'the', 'for', 'with', 'series', 'tea', 'tablet', 'tablets', 'capsule', 'capsules',
  'gummies', 'gummy', 'powder', 'softgel', 'candy', 'jelly', 'drops', 'patch', 'day', 'days', 'plus', 'extra',
  'herbal', 'natural', 'support', 'health', 'ya', 'za', 'na', 'kwa', 'la']);

let _svVocabCache = null;
function svGetVocab() {
  if (_svVocabCache) return _svVocabCache;
  const phrases = new Set();
  CATEGORIES.forEach(c => phrases.add(c));
  (typeof allBaseProducts === 'function' ? allBaseProducts() : PRODUCTS).forEach(p => { phrases.add(p.effect); phrases.add(p.name); });
  HEALTH_GOALS.forEach(g => { phrases.add(g.label.sw); phrases.add(g.label.en); });
  SYMPTOMS.forEach(s => { phrases.add(s.label.sw); phrases.add(s.label.en); });
  const words = new Map();
  phrases.forEach(ph => {
    ph.toLowerCase().split(/[^a-z0-9']+/i).forEach(w => {
      if (w.length < 4 || SV_STOPWORDS.has(w)) return;
      if (!words.has(w)) words.set(w, new Set());
      words.get(w).add(ph);
    });
  });
  _svVocabCache = words;
  return words;
}

function svDidYouMean(query, maxSuggestions) {
  maxSuggestions = maxSuggestions || 3;
  const qWords = query.toLowerCase().split(/[^a-z0-9']+/i).filter(w => w.length >= 3);
  if (!qWords.length) return [];
  const vocab = svGetVocab();
  const seenPhrase = new Set();
  const scored = [];
  vocab.forEach((phraseSet, word) => {
    let best = Infinity;
    qWords.forEach(qw => {
      if (qw === word) { best = 0; return; }
      const d = svLevenshtein(qw, word);
      const norm = d / Math.max(qw.length, word.length);
      if (norm < best) best = norm;
    });
    if (best > 0 && best <= 0.34) {
      phraseSet.forEach(ph => { if (!seenPhrase.has(ph)) { seenPhrase.add(ph); scored.push({ phrase: ph, dist: best }); } });
    }
  });
  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, maxSuggestions).map(s => s.phrase);
}

/* ===================== TRENDING / POPULAR ===================== */
function svGetTrendingProducts(n) {
  n = n || 6;
  const all = visibleProducts();
  let pool = all.filter(p => p.bestseller);
  if (!pool.length) pool = all;
  const sorted = [...pool].sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
  const seenEffect = new Set();
  const deduped = [];
  sorted.forEach(p => {
    const key = p.effect.toLowerCase();
    if (seenEffect.has(key)) return;
    seenEffect.add(key);
    deduped.push(p);
  });
  if (!deduped.length) return [];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const offset = dayOfYear % deduped.length;
  return deduped.slice(offset).concat(deduped.slice(0, offset)).slice(0, n);
}

function svGetUsage() { return lsGet('ahs_search_usage', {}); }
function svBumpUsage(goalKey) {
  const usage = svGetUsage();
  usage[goalKey] = (usage[goalKey] || 0) + 1;
  lsSet('ahs_search_usage', usage);
}
function svGetPopularTopics(n) {
  n = n || 6;
  const usage = svGetUsage();
  const list = visibleProducts();
  const scored = HEALTH_GOALS.map(g => {
    const catalogHits = list.filter(p => g.keywords.some(k => svProductHay(p).includes(k))).length;
    const usageHits = usage[g.key] || 0;
    return Object.assign({}, g, { score: catalogHits + usageHits * 5 });
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n);
}

/* ===================== SEARCH HISTORY (localStorage) ===================== */
function svGetHistory() { return lsGet('ahs_search_history', []); }
function svSaveHistory(type, query, payload) {
  if (!query || !query.trim()) return;
  let hist = svGetHistory();
  hist = hist.filter(h => !(h.type === type && h.query === query));
  hist.unshift({ type: type, query: query, payload: payload || null, ts: Date.now() });
  if (hist.length > 8) hist = hist.slice(0, 8);
  lsSet('ahs_search_history', hist);
}
function svRemoveHistory(idx) {
  const hist = svGetHistory();
  hist.splice(idx, 1);
  lsSet('ahs_search_history', hist);
}
function svClearHistory() { lsSet('ahs_search_history', []); }

/* ===================== APPLY ACTIONS (shared by dropdown, grid, history) ===================== */
function svApplyTextSearch(phrase, input) {
  filterState.search = phrase;
  filterState.keywordSet = null;
  input.value = phrase;
  renderGrid();
  svSaveHistory('text', phrase, null);
}
function svApplyKeywordSearch(keywords, label, kind, input) {
  filterState.keywordSet = keywords.slice();
  filterState.search = '';
  filterState.category = 'all';
  const catSel = document.getElementById('categorySelect');
  if (catSel) catSel.value = 'all';
  input.value = label;
  renderGrid();
  svSaveHistory(kind, label, keywords.slice());
}
function svApplyCategory(slug, label, input) {
  filterState.category = slug;
  filterState.search = '';
  filterState.keywordSet = null;
  input.value = '';
  const catSel = document.getElementById('categorySelect');
  if (catSel) catSel.value = slug;
  renderGrid();
  svSaveHistory('category', label, slug);
}
function svRunHistoryEntry(entry, input) {
  if (entry.type === 'text') {
    svApplyTextSearch(entry.query, input);
  } else if (entry.type === 'symptom' || entry.type === 'goal') {
    svApplyKeywordSearch(entry.payload || [], entry.query, entry.type, input);
  } else if (entry.type === 'category') {
    svApplyCategory(entry.payload, entry.query, input);
  }
}

/* ===================== DROPDOWN RENDERING (states) ===================== */
let svExploreMode = null; // null | 'symptom' | 'goal'

function svCloseDropdown(box) {
  box.classList.remove('open');
  svExploreMode = null;
}

function svIdleHTML() {
  const hist = svGetHistory();
  const lang = getLang();
  let html = '';
  if (hist.length) {
    html += `<div class="sugg-section">
      <div class="sugg-section-head"><span>🕘 ${escapeHtml(t('recent_searches'))}</span><button type="button" class="sugg-clear-all" data-sv-action="hist-clear">${escapeHtml(t('clear_all'))}</button></div>
      <div class="sugg-chip-row">${hist.map((h, i) => `
        <span class="sugg-chip hist-chip" data-sv-action="hist-run" data-sv-idx="${i}">${escapeHtml(h.query)}<button type="button" class="chip-x" data-sv-action="hist-remove" data-sv-idx="${i}" aria-label="${escapeHtml(t('remove'))}">✕</button></span>
      `).join('')}</div>
    </div>`;
  }
  const trending = svGetTrendingProducts(6);
  if (trending.length) {
    html += `<div class="sugg-section">
      <div class="sugg-section-head"><span>🔥 ${escapeHtml(t('trending_searches'))}</span></div>
      <div class="sugg-chip-row">${trending.map(p => `<button type="button" class="sugg-chip trend-chip" data-sv-action="trend-open" data-sv-id="${p.id}">🔥 ${escapeHtml(p.name)}</button>`).join('')}</div>
    </div>`;
  }
  const popular = svGetPopularTopics(6);
  if (popular.length) {
    html += `<div class="sugg-section">
      <div class="sugg-section-head"><span>⭐ ${escapeHtml(t('popular_searches'))}</span></div>
      <div class="sugg-chip-row">${popular.map(g => `<button type="button" class="sugg-chip pop-chip" data-sv-action="topic-run" data-sv-kind="goal" data-sv-key="${g.key}">${g.icon} ${escapeHtml(searchLabel(g, lang))}</button>`).join('')}</div>
    </div>`;
  }
  html += `<div class="sugg-explore-links">
      <button type="button" class="sugg-explore-btn" data-sv-action="explore-open" data-sv-kind="symptom">🩺 ${escapeHtml(t('search_by_symptom'))}</button>
      <button type="button" class="sugg-explore-btn" data-sv-action="explore-open" data-sv-kind="goal">🎯 ${escapeHtml(t('search_by_goal'))}</button>
    </div>`;
  return html;
}

function svExploreHTML(kind) {
  const lang = getLang();
  const pool = kind === 'symptom' ? SYMPTOMS : HEALTH_GOALS;
  const titleKey = kind === 'symptom' ? 'search_by_symptom' : 'search_by_goal';
  const list = visibleProducts();
  const chips = pool.map(item => {
    const count = list.filter(p => item.keywords.some(k => svProductHay(p).includes(k))).length;
    return `<button type="button" class="sugg-chip explore-chip" data-sv-action="topic-run" data-sv-kind="${kind}" data-sv-key="${item.key}">${item.icon} ${escapeHtml(searchLabel(item, lang))} <span class="chip-count">${count}</span></button>`;
  }).join('');
  return `<div class="sugg-section-head with-back">
      <button type="button" class="sugg-back-btn" data-sv-action="explore-back">← ${escapeHtml(t('back'))}</button>
      <span>${kind === 'symptom' ? '🩺' : '🎯'} ${escapeHtml(t(titleKey))}</span>
    </div>
    <div class="sugg-chip-row wrap-chips">${chips}</div>`;
}

function svNoMatchHTML(query) {
  const dym = svDidYouMean(query, 3);
  const popular = svGetPopularTopics(4);
  const lang = getLang();
  const waText = encodeURIComponent(t('whatsapp_query_specific', { query }));
  let html = `<div class="sugg-empty-rich">
    <div class="sugg-empty-title">😕 ${escapeHtml(t('no_results'))}</div>`;
  if (dym.length) {
    html += `<div class="sugg-dym-row"><span>${escapeHtml(t('did_you_mean'))}</span> ${dym.map(ph => `<button type="button" class="sugg-chip dym-chip" data-sv-action="dym-run" data-sv-phrase="${escapeHtml(ph)}">${escapeHtml(ph)}</button>`).join('')}</div>`;
  }
  if (popular.length) {
    html += `<div class="sugg-chip-row">${popular.map(g => `<button type="button" class="sugg-chip pop-chip" data-sv-action="topic-run" data-sv-kind="goal" data-sv-key="${g.key}">${g.icon} ${escapeHtml(searchLabel(g, lang))}</button>`).join('')}</div>`;
  }
  html += `<div class="sugg-explore-links">
      <button type="button" class="sugg-explore-btn" data-sv-action="explore-open" data-sv-kind="symptom">🩺 ${escapeHtml(t('search_by_symptom'))}</button>
      <button type="button" class="sugg-explore-btn" data-sv-action="explore-open" data-sv-kind="goal">🎯 ${escapeHtml(t('search_by_goal'))}</button>
    </div>
    <a class="sugg-whatsapp-cta" href="https://wa.me/255678883675?text=${waText}" target="_blank" rel="noopener">💬 ${escapeHtml(t('ask_whatsapp_search'))}</a>
  </div>`;
  return html;
}

function svRenderDropdown(input, box) {
  const query = input.value.trim();
  input.setAttribute('aria-expanded', 'true');

  if (query.length === 0) {
    box.classList.add('open');
    box.innerHTML = svExploreMode ? svExploreHTML(svExploreMode) : svIdleHTML();
    return;
  }
  if (query.length < 2) { box.classList.remove('open'); return; }

  svExploreMode = null;
  box.classList.add('open');
  const q = query.toLowerCase();
  const idx = (typeof buildSearchIndex === 'function') ? buildSearchIndex() : null;
  const matches = idx
    ? idx.search(query, { prefix: true, fuzzy: 0.2, combineWith: 'OR' }).slice(0, 6)
        .map(r => visibleProducts().find(p => p.id === r.id)).filter(Boolean)
    : visibleProducts().filter(p => (p.name + ' ' + p.effect).toLowerCase().includes(q)).slice(0, 6);
  const catMatches = svMatchingCategories(query);

  let html = '';
  if (catMatches.length) {
    html += `<div class="sugg-section">
      <div class="sugg-section-head"><span>📁 ${escapeHtml(t('jump_to_category'))}</span></div>
      <div class="sugg-chip-row">${catMatches.map(c => `<button type="button" class="sugg-chip cat-chip" data-sv-action="cat-run" data-sv-slug="${slugify(c)}" data-sv-label="${escapeHtml(c)}">📁 ${escapeHtml(c)}</button>`).join('')}</div>
    </div>`;
  }
  if (matches.length === 0) {
    html += svNoMatchHTML(query);
  } else {
    html += `<div class="sugg-section sugg-products">` + matches.map(p => `
      <div class="sugg-item" data-sv-action="product-open" data-sv-id="${p.id}">
        <img src="images/${p.file}" alt="" loading="lazy">
        <div class="sugg-item-body">
          <b>${svHighlight(p.name, query)}</b>
          <span class="sugg-item-effect">${escapeHtml(translateEffect(p.effect))}</span>
          <span class="sugg-item-meta"><span class="sugg-stars">${starString(p.rating)}</span> ${fmt(p.prices.retail)}</span>
        </div>
      </div>`).join('') + `</div>`;
  }
  box.innerHTML = html;
}

function svCommitSearch(input, box) {
  const q = input.value.trim();
  if (q.length >= 2 && !(filterState.keywordSet && filterState.keywordSet.length)) {
    svSaveHistory('text', q, null);
  }
  svCloseDropdown(box);
  input.blur();
}
function svHandleEscape(input, box) {
  svCloseDropdown(box);
  input.blur();
}

/* ===================== DELEGATED CLICK HANDLING (dropdown) ===================== */
function svInitDropdown(input, box) {
  box.addEventListener('click', (e) => {
    const el = e.target.closest('[data-sv-action]');
    if (!el) return;
    const action = el.dataset.svAction;

    if (action === 'hist-remove') {
      e.stopPropagation();
      svRemoveHistory(parseInt(el.dataset.svIdx, 10));
      svRenderDropdown(input, box);
      return;
    }
    if (action === 'hist-clear') {
      svClearHistory();
      svRenderDropdown(input, box);
      return;
    }
    if (action === 'hist-run') {
      const entry = svGetHistory()[parseInt(el.dataset.svIdx, 10)];
      if (entry) svRunHistoryEntry(entry, input);
      svCloseDropdown(box);
      input.blur();
      return;
    }
    if (action === 'explore-open') {
      svExploreMode = el.dataset.svKind;
      svRenderDropdown(input, box);
      return;
    }
    if (action === 'explore-back') {
      svExploreMode = null;
      svRenderDropdown(input, box);
      return;
    }
    if (action === 'topic-run') {
      const pool = el.dataset.svKind === 'symptom' ? SYMPTOMS : HEALTH_GOALS;
      const topic = pool.find(x => x.key === el.dataset.svKey);
      if (topic) {
        svApplyKeywordSearch(topic.keywords, topic.icon + ' ' + searchLabel(topic, getLang()), el.dataset.svKind, input);
        if (el.dataset.svKind === 'goal') svBumpUsage(topic.key);
      }
      svCloseDropdown(box);
      input.blur();
      return;
    }
    if (action === 'trend-open') {
      svCloseDropdown(box);
      input.blur();
      openProduct(parseInt(el.dataset.svId, 10));
      return;
    }
    if (action === 'cat-run') {
      svApplyCategory(el.dataset.svSlug, el.dataset.svLabel, input);
      svCloseDropdown(box);
      input.blur();
      return;
    }
    if (action === 'product-open') {
      svSaveHistory('text', input.value.trim(), null);
      svCloseDropdown(box);
      input.blur();
      openProduct(parseInt(el.dataset.svId, 10));
      return;
    }
    if (action === 'dym-run') {
      svApplyTextSearch(el.dataset.svPhrase, input);
      svCloseDropdown(box);
      input.blur();
      return;
    }
  });
}

/* ===================== NO-RESULTS BLOCK FOR THE MAIN PRODUCT GRID ===================== */
function svNoResultsGridHTML(query) {
  const dym = query ? svDidYouMean(query, 3) : [];
  const popular = svGetPopularTopics(6);
  const lang = getLang();
  const waText = encodeURIComponent(query
    ? t('whatsapp_query_specific', { query })
    : t('whatsapp_query_generic'));
  let html = `<div class="no-results-grid">
    <div class="sugg-empty-title">😕 ${escapeHtml(t('no_results'))}</div>
    <p class="no-results-help">${escapeHtml(t('no_results_help'))}</p>`;
  if (dym.length) {
    html += `<div class="sugg-dym-row"><span>${escapeHtml(t('did_you_mean'))}</span> ${dym.map(ph => `<button type="button" class="sugg-chip dym-chip" data-sv-grid-action="dym-run" data-sv-phrase="${escapeHtml(ph)}">${escapeHtml(ph)}</button>`).join('')}</div>`;
  }
  if (popular.length) {
    html += `<div class="sugg-chip-row centered">${popular.map(g => `<button type="button" class="sugg-chip pop-chip" data-sv-grid-action="topic-run" data-sv-kind="goal" data-sv-key="${g.key}">${g.icon} ${escapeHtml(searchLabel(g, lang))}</button>`).join('')}</div>`;
  }
  html += `<div class="sugg-explore-links centered">
      <button type="button" class="sugg-explore-btn" data-sv-grid-action="explore-open" data-sv-kind="symptom">🩺 ${escapeHtml(t('search_by_symptom'))}</button>
      <button type="button" class="sugg-explore-btn" data-sv-grid-action="explore-open" data-sv-kind="goal">🎯 ${escapeHtml(t('search_by_goal'))}</button>
    </div>
    <a class="sugg-whatsapp-cta" href="https://wa.me/255678883675?text=${waText}" target="_blank" rel="noopener">💬 ${escapeHtml(t('ask_whatsapp_search'))}</a>
  </div>`;
  return html;
}

function svBindNoResultsEvents(wrap) {
  wrap.querySelectorAll('[data-sv-grid-action]').forEach(el => {
    el.addEventListener('click', () => {
      const input = document.getElementById('searchInput');
      const box = document.getElementById('searchSuggestions');
      const action = el.dataset.svGridAction;
      if (!input) return;
      if (action === 'dym-run') {
        svApplyTextSearch(el.dataset.svPhrase, input);
      } else if (action === 'topic-run') {
        const g = HEALTH_GOALS.find(x => x.key === el.dataset.svKey);
        if (g) { svApplyKeywordSearch(g.keywords, g.icon + ' ' + searchLabel(g, getLang()), 'goal', input); svBumpUsage(g.key); }
      } else if (action === 'explore-open') {
        svExploreMode = el.dataset.svKind;
        input.value = '';
        input.focus();
        if (box) svRenderDropdown(input, box);
      }
    });
  });
}

/* ===================== VOICE SEARCH ===================== */
function svLangToBCP47(lang) {
  return { sw: 'sw-TZ', en: 'en-US', fr: 'fr-FR', rn: 'rn-BI', rw: 'rw-RW' }[lang] || 'sw-TZ';
}
function svInitVoiceSearch() {
  const btn = document.getElementById('voiceSearchBtn');
  const input = document.getElementById('searchInput');
  if (!btn || !input) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    btn.classList.add('unsupported');
    btn.addEventListener('click', () => showToast(t('voice_not_supported')));
    return;
  }
  const recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  let listening = false;

  btn.addEventListener('click', () => {
    if (listening) { recognition.stop(); return; }
    recognition.lang = svLangToBCP47(getLang());
    try { recognition.start(); } catch (e) { /* recognition already active — ignore */ }
  });
  recognition.onstart = () => { listening = true; btn.classList.add('listening'); showToast(t('voice_listening')); };
  recognition.onend = () => { listening = false; btn.classList.remove('listening'); };
  recognition.onerror = () => { listening = false; btn.classList.remove('listening'); showToast(t('voice_error')); };
  recognition.onresult = (e) => {
    const transcript = ((e.results[0] && e.results[0][0] && e.results[0][0].transcript) || '').trim();
    if (!transcript) return;
    svApplyTextSearch(transcript, input);
    const box = document.getElementById('searchSuggestions');
    if (box) svCloseDropdown(box);
    input.blur();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  svInitVoiceSearch();
});
