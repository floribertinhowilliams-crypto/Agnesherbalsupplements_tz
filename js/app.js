// Agnes Herbal Supplements — main application logic
// Uses only free, client-side technologies. No paid APIs. All persistence via localStorage.

/* ===================== UTIL / STORAGE HELPERS ===================== */
function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full/unavailable */ }
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
}
function fmt(n) { return 'Tsh ' + Math.round(n).toLocaleString('en-US'); }

/* ===================== STATE ===================== */
let cart = lsGet('ahs_cart', {});
let wishlist = lsGet('ahs_wishlist', []);
let compareList = lsGet('ahs_compare', []);
let recentlyViewed = lsGet('ahs_recent', []);
let currentProduct = null;
let currentQty = 1;
let invCounter = Math.floor(1000 + Math.random() * 8999);

// merge admin overrides (hidden / price edits / images / caption) if any.
// productOverrides starts from localStorage and is extended live by Firestore
// (js/firebase-config.js) whenever the admin saves changes in admin.html —
// see cloudListenProducts() call near the bottom of this file.
let productOverrides = lsGet('ahs_product_overrides', {});

// homepageSettings = mipangilio ya "🎯 Mpangilio wa Duka" (admin.html):
// (1) featuredToday — orodha ya ID za bidhaa admin alizochagua zionekane
//     MWANZONI kabisa kwenye ukurasa mkuu leo, kwa mfuatano alioupanga.
// (2) categoryOffers — { "Jina la Kundi": asilimiaYaOfa } — ofa inayotumika
//     kiotomatiki kwa BEI HALISI (rejareja na jumla) za bidhaa zote za kundi
//     hilo, kila mahali (kikapu, invoice, gridi) — si picha tu.
let homepageSettings = lsGet('ahs_homepage_settings', { featuredToday: [], categoryOffers: {} });

// CUSTOM_PRODUCTS = bidhaa mpya alizoongeza admin kwenye "➕ Ongeza Bidhaa"
// (admin.html) — hazimo kwenye js/products-data.js tuli, zinatoka Firestore
// (collection "customProducts") na kila kifaa cha mteja kinazipokea papo hapo
// bila kuhitaji sasisho la tovuti. Angalia initCloudCustomProductsSync() chini.
let CUSTOM_PRODUCTS = [];
let CUSTOM_PRODUCTS_MAP = {};

// Firestore onSnapshot mara nyingi hupiga listeners kadhaa (products,
// homepageSettings, customProducts) kwa wakati mmoja mmoja (mfano wakati
// ukurasa unapofunguliwa kwa mara ya kwanza, au wakati muunganisho
// unaporejea baada ya kukatika). Kila listener ikijiendesha yenyewe
// renderGrid()+hpRenderAll() mara moja, matokeo yake ni "full re-render"
// ya gridi nzima ya bidhaa mara 2-3 mfululizo — kazi nzito ya DOM ambayo
// husababisha "kigugumizi"/kukwama wakati wa scroll, hasa kwenye simu za
// bei nafuu. cloudRerenderNow() inaunganisha (batch) maombi hayo yote
// yanayotokea ndani ya dirisha fupi la muda kuwa "render" MOJA tu.
let _cloudRerenderTimer = null;
function cloudRerenderNow() {
  if (_cloudRerenderTimer) return;
  _cloudRerenderTimer = setTimeout(() => {
    _cloudRerenderTimer = null;
    renderGrid();
    if (typeof hpRenderAll === 'function') hpRenderAll();
    if (currentProduct) openProduct(currentProduct.id);
  }, 120);
}
function getBaseProduct(id) {
  return (PRODUCTS[id] !== undefined) ? PRODUCTS[id] : CUSTOM_PRODUCTS_MAP[id];
}
// Ofa ya kundi (categoryOffers) — asilimia halali ni 1-99, vinginevyo hakuna ofa.
function categoryOfferPct(category) {
  const map = homepageSettings && homepageSettings.categoryOffers;
  const pct = map ? map[category] : 0;
  return (typeof pct === 'number' && pct > 0 && pct < 100) ? pct : 0;
}
// Inapunguza bei kwa asilimia ya ofa, ikizungusha hadi Tsh 500 iliyo karibu
// (sawa na mtindo uliopo tayari kwenye kadi za "Flash Sale"/"Daily Deals").
function applyCategoryDeal(prices, pct) {
  const mult = (100 - pct) / 100;
  const round500 = n => Math.max(500, Math.round((n * mult) / 500) * 500);
  return { retail: round500(prices.retail), w5: round500(prices.w5), w10: round500(prices.w10) };
}
function getEffectiveProduct(id) {
  const base = getBaseProduct(id);
  if (!base) return null;
  const ov = productOverrides[id];
  const merged = !ov ? base : {
    ...base,
    name: ov.name || base.name,
    ...(ov.prices ? { prices: ov.prices } : {}),
    hidden: !!ov.hidden,
    images: (ov.images && ov.images.length) ? ov.images : base.images,
    cover: ov.cover || base.cover,
    caption: ov.caption || base.caption,
    stock: (typeof ov.stock === 'number') ? ov.stock : base.stock,
    // videoId: bidhaa za "Ongeza Bidhaa" (customProducts) zinaihifadhi moja
    // kwa moja kwenye document ya bidhaa (base.videoId); bidhaa 288 za awali
    // zinaihifadhi kwenye "ahs_product_overrides" (ov.videoId, kupitia dirisha
    // la "Hariri"). Override, ikiwepo, inashinda.
    videoId: ov.videoId || base.videoId,
    // videoClip: video HALISI (base64, imebanwa) iliyopigwa/kuchaguliwa na
    // admin kwenye "Ongeza Bidhaa" — inahifadhiwa moja kwa moja kwenye
    // document ya bidhaa, si link.
    videoClip: ov.videoClip || base.videoClip,
  };
  // Ofa ya kundi (imewekwa na admin kwenye "🎯 Mpangilio wa Duka") inatumika
  // kwa BEI HALISI ya bidhaa (rejareja + jumla), si onyesho tu — hivyo
  // kikapu/invoice/gridi zote zinatumia bei moja iliyopunguzwa moja kwa moja.
  // "origPrices" na "dealPct" zinabaki kwa ajili ya kuonyesha bei ya awali
  // ikiwa imekwaruzwa (strikethrough) kwenye kadi za bidhaa.
  const pct = categoryOfferPct(merged.category);
  if (pct > 0) {
    return { ...merged, origPrices: merged.prices, prices: applyCategoryDeal(merged.prices, pct), dealPct: pct };
  }
  return merged;
}
function allBaseProducts() {
  return CUSTOM_PRODUCTS.length ? [...PRODUCTS, ...CUSTOM_PRODUCTS] : PRODUCTS;
}
function visibleProducts() {
  return allBaseProducts().map(p => getEffectiveProduct(p.id)).filter(p => p && !p.hidden);
}
// Bidhaa alizochagua admin ("🎯 Mpangilio wa Duka" → "Bidhaa za Leo") kwa
// mfuatano aliouweka mwenyewe — hizi ndizo zinazoonekana MWANZONI kabisa
// kwenye ukurasa mkuu. Bidhaa zilizofichwa (hidden) au zilizofutwa hazitaonekana.
function featuredTodayProducts() {
  const ids = (homepageSettings && homepageSettings.featuredToday) || [];
  return ids.map(id => getEffectiveProduct(id)).filter(p => p && !p.hidden);
}

function unitPriceFor(product, qty) {
  const p = product.prices;
  if (qty >= 10) return p.w10;
  if (qty >= 5) return p.w5;
  return p.retail;
}

/* ===================== FILTER / SORT STATE ===================== */
let filterState = { search: '', category: 'all', price: 'all', sort: 'default', keywordSet: null };

function starString(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function matchesPrice(p, priceFilter) {
  const price = p.prices.retail;
  if (priceFilter === 'under45') return price < 45000;
  if (priceFilter === '45_50') return price >= 45000 && price <= 50000;
  if (priceFilter === 'over50') return price > 50000;
  return true;
}

// Utafutaji unaotumia MiniSearch (index halisi ya "full-text search" ndani ya
// kivinjari, kama injini ndogo ya Google) badala ya kuangalia bidhaa moja moja
// kwa .includes() — hii inafanya kazi haraka hata bidhaa zikifika maelfu, na
// pia inapanga matokeo kwa umuhimu (relevance), si mfuatano wa awali tu.
//
// MiniSearch inapakuliwa kutoka CDN ya nje (jsdelivr). Endapo mteja ana
// mtandao dhaifu/hafifu (jambo la kawaida) na faili hiyo ishindwe kupakia
// kabisa, `MiniSearch` inabaki "undefined" — na hapo awali buildSearchIndex()
// ilikuwa ikitupa error (ReferenceError) ambayo ilikuwa ikivunja KIMYA KIMYA
// utafutaji WOTE (dropdown na gridi kuu), hata kama neno lililotafutwa
// (mf. "Prostate") lipo dhahiri kwenye bidhaa. Sasa function hii "haiwezi
// kushindwa" — ikikwama kwa sababu yoyote inarudisha null, na kila mahali
// inapoitwa kuna fallback ya utafutaji rahisi (substring, isiyotegemea
// MiniSearch kabisa) ili matokeo yaonekane papo hapo kila wakati.
let _searchIndex = null;
let _searchIndexUnavailable = false;
function buildSearchIndex() {
  if (_searchIndex) return _searchIndex;
  if (_searchIndexUnavailable) return null;
  try {
    if (typeof MiniSearch === 'undefined') throw new Error('MiniSearch haijapakia (CDN)');
    _searchIndex = new MiniSearch({
      idField: 'id',
      fields: ['name', 'effect', 'category'],
      storeFields: ['id'],
    });
    _searchIndex.addAll(allBaseProducts());
    return _searchIndex;
  } catch (e) {
    console.warn('[search] MiniSearch haipatikani, natumia utafutaji rahisi (fallback):', e);
    _searchIndexUnavailable = true;
    return null;
  }
}

// Fallback ya utafutaji isiyotegemea MiniSearch kabisa: inalinganisha neno
// (na kila sehemu yake likiwa na maneno mengi) dhidi ya jina, faida (effect)
// na category ya kila bidhaa. Hii ndiyo inayohakikisha "Prostate" (au neno
// lolote lililopo kwenye bidhaa) LAZIMA lionekane hata MiniSearch ikishindwa.
function fallbackSearchProducts(query, list) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return list.slice();
  return list.filter(p => {
    const hay = (p.name + ' ' + p.effect + ' ' + p.category).toLowerCase();
    return words.every(w => hay.includes(w));
  });
}
function getFilteredSorted() {
  let list = visibleProducts();
  if (filterState.imageSearch && imageSearchResultIds.length) {
    const order = imageSearchResultIds;
    list = order.map(id => list.find(p => p.id === id)).filter(Boolean);
    return list;
  }
  if (filterState.keywordSet && filterState.keywordSet.length) {
    // Multi-keyword OR match — used by "Search by Symptom" / "Search by Health Goal".
    const idx = buildSearchIndex();
    if (idx) {
      const results = idx.search(filterState.keywordSet.join(' '), { prefix: true, fuzzy: 0.2, combineWith: 'OR' });
      const idSet = new Set(results.map(r => r.id));
      list = list.filter(p => idSet.has(p.id));
    } else {
      // Fallback: bidhaa yoyote inayolingana na neno LOLOTE kwenye keywordSet (OR).
      const kw = filterState.keywordSet.map(k => k.toLowerCase());
      list = list.filter(p => {
        const hay = (p.name + ' ' + p.effect + ' ' + p.category).toLowerCase();
        return kw.some(k => hay.includes(k));
      });
    }
  } else if (filterState.search.trim()) {
    const idx = buildSearchIndex();
    if (idx) {
      const results = idx.search(filterState.search.trim(), { prefix: true, fuzzy: 0.2, combineWith: 'OR' });
      const order = results.map(r => r.id);
      const byId = new Map(list.map(p => [p.id, p]));
      list = order.map(id => byId.get(id)).filter(Boolean);
    } else {
      list = fallbackSearchProducts(filterState.search.trim(), list);
    }
  }
  if (filterState.category !== 'all') list = list.filter(p => p.catSlug === filterState.category);
  if (filterState.price !== 'all') list = list.filter(p => matchesPrice(p, filterState.price));

  switch (filterState.sort) {
    case 'price_asc': list = [...list].sort((a,b) => a.prices.retail - b.prices.retail); break;
    case 'price_desc': list = [...list].sort((a,b) => b.prices.retail - a.prices.retail); break;
    case 'latest': list = [...list].sort((a,b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
    case 'bestseller': list = [...list].sort((a,b) => (b.bestseller - a.bestseller) || (b.rating - a.rating)); break;
    case 'rating': list = [...list].sort((a,b) => b.rating - a.rating); break;
    default: break;
  }
  return list;
}

/* ===================== RENDER: FILTER CONTROLS ===================== */
function renderFilterControls() {
  const catSel = document.getElementById('categorySelect');
  const priceSel = document.getElementById('priceSelect');
  const sortSel = document.getElementById('sortSelect');
  const lang = getLang();

  catSel.innerHTML = `<option value="all">${t('filter_category')}: ${t('filter_all')}</option>` +
    CATEGORIES.map(c => `<option value="${slugify(c)}">${escapeHtml(c)}</option>`).join('');
  catSel.value = filterState.category;

  priceSel.innerHTML = `
    <option value="all">${t('price_all')}</option>
    <option value="under45">${t('price_under45')}</option>
    <option value="45_50">${t('price_45_50')}</option>
    <option value="over50">${t('price_over50')}</option>`;
  priceSel.value = filterState.price;

  sortSel.innerHTML = `
    <option value="default">${t('sort_label')}: ${t('sort_default')}</option>
    <option value="price_asc">${t('sort_price_asc')}</option>
    <option value="price_desc">${t('sort_price_desc')}</option>
    <option value="latest">${t('sort_latest')}</option>
    <option value="bestseller">${t('sort_bestseller')}</option>
    <option value="rating">${t('sort_rating')}</option>`;
  sortSel.value = filterState.sort;
  renderCategoryChips();
}
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

/* ===================== GEO / AI SEARCH VISIBILITY (JSON-LD) ===================== */
// Kusudi: kila wakati renderGrid() inapojiendesha (search/filter/sort yoyote),
// tunaandika upya <script type="application/ld+json"> MOJA ndani ya <head>
// inayoeleza bidhaa zinazoonekana KWENYE GRIDI HIYO HIYO wakati huo — si
// query nyingine ya Firestore (CUSTOM_PRODUCTS tayari imeunganishwa ndani ya
// `list` kupitia allBaseProducts()/getFilteredSorted(), live kutoka kwa
// initCloudCustomProductsSync()). Hii inaepuka: (a) query za ziada za
// Firestore kila "keystroke" ya search, (b) schema "tuli" iliyokwama kwenye
// muda mmoja (ile ya awali ndani ya index.html ilikuwa na bidhaa 50 za Tea
// Series TU, milele) — badala yake AI/Google wanaona HASA kile mteja
// anachokiona wakati huo, likiwa na URL sahihi ya kila bidhaa.
const AHS_SITE = 'https://agnesherbalsupplements.com';

// Bidhaa 288 za awali (PRODUCTS[id]) zina ukurasa tuli /products/pID-jina.html
// (umeshatengenezwa mara moja — ona folder products/). Bidhaa alizoongeza
// admin baadaye (CUSTOM_PRODUCTS, kutoka Firestore) hazina faili tuli — zina
// ukurasa unaotengenezwa "on the fly" na functions/products/[slug].js kwa
// muundo /products/jina-la-bidhaa (bila kiambishi cha id, bila .html) — ona
// productSlug() ndani ya functions/_lib/seo.js, tuliyoiga hapa kwa usahihi.
function productPageUrl(p) {
  const slug = slugify(p.name) || ('bidhaa-' + p.id);
  if (PRODUCTS[p.id] !== undefined) return `${AHS_SITE}/products/p${p.id}-${slug}.html`;
  return `${AHS_SITE}/products/${slug}`;
}
function absoluteImageUrl(p) {
  const img = p.cover || (p.images && p.images[0]) || ('images/' + p.file);
  return /^https?:\/\//.test(img) ? img : `${AHS_SITE}/${String(img).replace(/^\/+/, '')}`;
}
function updateProductSchema(list) {
  const old = document.getElementById('dynamic-product-schema');
  if (old) old.remove();
  if (!list || !list.length) return;

  // Kikomo cha bidhaa 60 za kwanza za mfuatano wa sasa — inatosha kuonyesha
  // "kile kinachoonekana sasa" bila kulemea <head> ya ukurasa kwa payload
  // kubwa isiyo na maana (kurasa za bidhaa binafsi tayari zina schema yake
  // kamili — ona products/*.html na functions/products/[slug].js).
  const items = list.slice(0, 60);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": items.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "url": productPageUrl(p),
        "image": absoluteImageUrl(p),
        "description": p.effect || p.category,
        "category": p.category,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "TZS",
          "price": Math.round(p.prices.retail),
          "availability": (typeof p.stock === 'number' && p.stock <= 0)
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock"
        }
      }
    }))
  };

  const script = document.createElement('script');
  script.id = 'dynamic-product-schema';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schemaData);
  document.head.appendChild(script);
}

/* ===================== RENDER: PRODUCT GRID (with skeleton) ===================== */
function skeletonCardsHTML(n) {
  let out = '';
  for (let i = 0; i < n; i++) {
    out += `<div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-line w80"></div>
      <div class="skeleton skeleton-line w40"></div>
    </div>`;
  }
  return out;
}

function productCardHTML(p) {
  const isWished = wishlist.includes(p.id);
  const isCompared = compareList.includes(p.id);
  const badges = [];
  if (p.dealPct) badges.push(`<span class="deal-badge">-${p.dealPct}%</span>`);
  else if (p.bestseller) badges.push(`<span class="pg-badge best">🔥 Best</span>`);
  const isNew = (new Date() - new Date(p.dateAdded)) / (1000*60*60*24) < 20;
  if (!p.dealPct && isNew) badges.push(`<span class="pg-badge new">✨ New</span>`);
  if (typeof p.stock === 'number') {
    if (p.stock <= 0) badges.push(`<span class="pg-badge stock-out">Imeisha</span>`);
    else if (p.stock <= 5) badges.push(`<span class="pg-badge stock-low">Stock: ${p.stock}</span>`);
  }
  const priceHTML = p.dealPct
    ? `<span style="text-decoration:line-through; color:var(--ink-soft); font-size:.82em; margin-right:6px;">${fmt(p.origPrices.retail)}</span><em>${fmt(p.prices.retail)}</em>`
    : `<em>${fmt(p.prices.retail)}</em>`;
  return `
    <div class="pg-item reveal" data-id="${p.id}">
      <div class="pg-badges">${badges.join('')}</div>
      <div class="pg-actions">
        <div class="pg-action-btn ${isWished?'active':''}" data-wl="${p.id}" title="Wishlist">♥</div>
        <div class="pg-action-btn ${isCompared?'active':''}" data-cmp="${p.id}" title="Compare">⇄</div>
      </div>
      <div class="pg-img-wrap">
        <img data-src="${p.cover || (p.images && p.images[0]) || ('images/' + p.file)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" class="lazy-fade">
      </div>
      <div class="pg-caption">
        <div class="pg-rating">${starString(p.rating)} <span class="count">(${p.reviewCount})</span></div>
        <b>${escapeHtml(p.name)}</b><span>${escapeHtml(translateEffect(p.effect))}</span>${priceHTML}
      </div>
      <div class="pg-quickbar">
        <button type="button" class="qb-shopnow" data-qbuy="${p.id}">
          <span class="qb-shopnow-label">Shop Now</span>
          <span class="qb-shopnow-ico" aria-hidden="true">🛒</span>
        </button>
      </div>
    </div>`;
}

let lazyObserver = null;
function initLazyObserver() {
  if (lazyObserver) lazyObserver.disconnect();
  lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        lazyObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('#gallery-wrap img[data-src], #relatedGrid img[data-src], #modalRecentGrid img[data-src], #newProductsGrid img[data-src]').forEach(img => lazyObserver.observe(img));
}

let revealObserver = null;
function initRevealObserver() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
}

function renderGrid() {
  const wrap = document.getElementById('gallery-wrap');
  const list = getFilteredSorted();
  document.getElementById('resultsCount').textContent = `${list.length} / ${allBaseProducts().length} bidhaa`;
  if (list.length === 0) {
    const query = (filterState.keywordSet && filterState.keywordSet.length) ? '' : filterState.search.trim();
    wrap.innerHTML = (typeof svNoResultsGridHTML === 'function')
      ? svNoResultsGridHTML(query)
      : `<div class="sugg-empty" style="grid-column:1/-1; padding:60px 0;">${t('no_results')}</div>`;
    if (typeof svBindNoResultsEvents === 'function') svBindNoResultsEvents(wrap);
    updateProductSchema([]);
    return;
  }
  wrap.innerHTML = list.map(productCardHTML).join('');
  bindGridEvents();
  initLazyObserver();
  initRevealObserver();
  if (typeof renderNewProducts === 'function') renderNewProducts();
  updateProductSchema(list);
}

function showSkeletonThenRender() {
  const wrap = document.getElementById('gallery-wrap');
  wrap.classList.add('gallery-grid');
  wrap.innerHTML = skeletonCardsHTML(8);
  setTimeout(renderGrid, 350);
}

function bindGridEvents() {
  document.querySelectorAll('.pg-item').forEach(card => {
    const id = parseInt(card.dataset.id, 10);
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-wl],[data-cmp],[data-qcart],[data-qbuy]')) return;
      openProduct(id);
    });
  });
  document.querySelectorAll('[data-wl]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggleWishlist(parseInt(btn.dataset.wl, 10)); });
  });
  document.querySelectorAll('[data-cmp]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggleCompare(parseInt(btn.dataset.cmp, 10)); });
  });
  document.querySelectorAll('[data-qcart]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); cardAddToCart(parseInt(btn.dataset.qcart, 10)); });
  });
  document.querySelectorAll('[data-qbuy]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); cardBuyNow(parseInt(btn.dataset.qbuy, 10)); });
  });
}

// Vitufe vya haraka "🛒 Ongeza" / "⚡ Nunua" vinavyoonekana JUU YA PICHA ya
// kila bidhaa kwenye gridi (bila kuhitaji kufungua ukurasa wa bidhaa kwanza).
// Vinatumika kwenye gridi kuu, "New Products" na sehemu za homepage (Flash
// Sale/Best Sellers/n.k.) — vyote vinaita function hizi mbili moja.
function cardAddToCart(id) {
  const p = getEffectiveProduct(id);
  if (!p) return;
  if (cart[id]) cart[id].qty += 1; else cart[id] = { ...p, qty: 1 };
  lsSet('ahs_cart', cart);
  updateCartUI();
  showToast(`${escapeHtml(p.name)} imeongezwa kikapuni`);
}
function cardBuyNow(id) {
  const p = getEffectiveProduct(id);
  if (!p) return;
  if (cart[id]) cart[id].qty += 1; else cart[id] = { ...p, qty: 1 };
  lsSet('ahs_cart', cart);
  updateCartUI();
  openCart();
}

/* ===================== SEARCH + SUGGESTIONS ===================== */
function initSearch() {
  const input = document.getElementById('searchInput');
  const box = document.getElementById('searchSuggestions');
  if (!input || !box) return;

  input.addEventListener('input', () => {
    filterState.search = input.value;
    filterState.keywordSet = null;
    if (filterState.imageSearch) clearImageSearch();
    const hgReset = document.getElementById('health-goal-filter');
    if (hgReset) hgReset.value = 'all';
    renderGrid();
    if (typeof svRenderDropdown === 'function') svRenderDropdown(input, box);
  });

  input.addEventListener('focus', () => {
    if (typeof svRenderDropdown === 'function') svRenderDropdown(input, box);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (typeof svCommitSearch === 'function') svCommitSearch(input, box);
      else box.classList.remove('open');
    } else if (e.key === 'Escape') {
      if (typeof svHandleEscape === 'function') svHandleEscape(input, box);
      else box.classList.remove('open');
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.search-wrap')) return;
    if (typeof svCloseDropdown === 'function') svCloseDropdown(box);
    else box.classList.remove('open');
    input.setAttribute('aria-expanded', 'false');
  });

  if (typeof svInitDropdown === 'function') svInitDropdown(input, box);
}

/* ===================== PRODUCT MODAL ===================== */
function openProduct(id) {
  currentProduct = getEffectiveProduct(id);
  currentQty = 1;
  renderModalSlider(currentProduct);
  document.getElementById('zoomWrap').classList.remove('zoomed');
  document.getElementById('modalCat').textContent = currentProduct.category;
  document.getElementById('modalName').textContent = currentProduct.name;
  document.getElementById('modalEffect').textContent = translateEffect(currentProduct.effect);
  if (currentProduct.dealPct) {
    document.getElementById('modalPrice').innerHTML = `<span style="text-decoration:line-through; color:var(--ink-soft); font-size:.8em; margin-right:6px;">${fmt(currentProduct.origPrices.retail)}</span>${fmt(currentProduct.prices.retail)} / kipande (rejareja) <span class="deal-badge" style="position:static; display:inline-block; margin-left:6px;">-${currentProduct.dealPct}%</span>`;
  } else {
    document.getElementById('modalPrice').textContent = fmt(currentProduct.prices.retail) + ' / kipande (rejareja)';
  }
  document.getElementById('modalWholesale').textContent = `Jumla: ${fmt(currentProduct.prices.w5)} (5+) · ${fmt(currentProduct.prices.w10)} (10+)`;
  renderMoqTable(currentProduct);
  const capEl = document.getElementById('pmCaption');
  if (currentProduct.caption) { capEl.textContent = currentProduct.caption; capEl.style.display = 'block'; }
  else { capEl.style.display = 'none'; }
  document.getElementById('modalQty').textContent = currentQty;
  document.getElementById('modalRating').innerHTML = `${starString(currentProduct.rating)} <span class="count">${currentProduct.rating} (${currentProduct.reviewCount} ${t('rating_reviews')})</span>`;
  updateWishlistCompareBtns();

  renderAvailability(currentProduct);
  renderBenefits(currentProduct);
  renderTrustBadges();
  renderIngredientsUsageStorage(currentProduct);
  renderBeforeAfterProduct(currentProduct);
  renderProductVideo(currentProduct);
  renderFbt(currentProduct);
  renderProductFaq(currentProduct);
  updateStickyBuyBar(currentProduct);

  // reviews
  document.getElementById('modalScore').textContent = currentProduct.rating.toFixed(1);
  document.getElementById('modalStars').textContent = starString(currentProduct.rating);
  document.getElementById('modalReviewCount').textContent = `${currentProduct.reviewCount} ${t('rating_reviews')}`;
  renderRatingBars(currentProduct);
  const customReviews = lsGet('ahs_reviews_custom', {})[id] || [];
  const generated = getProductReviews(id, Math.min(3, currentProduct.reviewCount));
  const lang = getLang();
  const revHtml = customReviews.concat(generated).slice(0, 5).map(r => {
    const rname = r.name || '';
    const initials = rname.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
    return `
    <div class="review-item">
      <div class="rav">${initials}</div>
      <div class="rbody">
        <div class="rname">${escapeHtml(rname)}</div>
        <div class="stars">${starString(r.rating || currentProduct.rating)}</div>
        <p>${escapeHtml(pickLangText(r, lang) || r.comment || '')}</p>
      </div>
    </div>`;
  }).join('');
  document.getElementById('modalReviewsList').innerHTML = revHtml;

  // share links
  const shareText = encodeURIComponent(`${currentProduct.name} - ${fmt(currentProduct.prices.retail)} - Agnes Herbal Supplements`);
  const shareUrl = encodeURIComponent(location.href.split('#')[0] + '#product-' + id);
  document.getElementById('pShareWa').href = `https://wa.me/?text=${shareText}%20${shareUrl}`;
  document.getElementById('pShareFb').href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  document.getElementById('pShareX').href = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  document.getElementById('pShareTg').href = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;

  // related products
  const related = visibleProducts().filter(p => p.category === currentProduct.category && p.id !== id)
    .sort((a,b) => b.rating - a.rating).slice(0, 4);
  document.getElementById('relatedGrid').innerHTML = related.map(p => `
    <div class="pg-item" data-id="${p.id}" style="cursor:pointer;">
      <img data-src="${p.cover || (p.images && p.images[0]) || ('images/' + p.file)}" alt="${escapeHtml(p.name)}" loading="lazy" class="lazy-fade">
      <div class="pg-caption"><b>${escapeHtml(p.name)}</b><em>${fmt(p.prices.retail)}</em></div>
    </div>`).join('');
  document.getElementById('relatedGrid').querySelectorAll('.pg-item').forEach(el => {
    el.addEventListener('click', () => openProduct(parseInt(el.dataset.id, 10)));
  });
  initLazyObserver();

  // recently viewed (site-wide widget)
  recentlyViewed = [id, ...recentlyViewed.filter(x => x !== id)].slice(0, 12);
  lsSet('ahs_recent', recentlyViewed);
  renderRecentlyViewed();
  renderModalRecentlyViewed(id);

  document.getElementById('productOverlay').classList.add('open');
  document.getElementById('productModalBox').scrollTop = 0;
  if (typeof ahsTrackEvent === 'function') {
    ahsTrackEvent('view_item', { content_name: currentProduct.name, content_ids: [String(id)], content_type: 'product', value: currentProduct.prices.retail, currency: 'TZS' });
  }
}
function closeProduct() {
  document.getElementById('productOverlay').classList.remove('open');
  document.getElementById('stickyBuyBar').classList.remove('show');
}

/* ---------- availability ---------- */
function renderAvailability(product) {
  const el = document.getElementById('availabilityBadge');
  if (!el) return;
  const av = getAvailability(product);
  el.className = 'availability-badge ' + av.state;
  el.innerHTML = `<span class="dot"></span>${escapeHtml(av.label)}`;
}

/* ---------- benefit icon chips ---------- */
function renderBenefits(product) {
  const el = document.getElementById('benefitsRow');
  if (!el) return;
  const benefits = getProductBenefits(product);
  el.innerHTML = benefits.map(b => `<div class="benefit-chip"><span class="b-icon">${b.icon}</span><span>${escapeHtml(b.text)}</span></div>`).join('');
}

/* ---------- trust badges (static per language) ---------- */
function renderTrustBadges() {
  const el = document.getElementById('trustBadgesRow');
  if (!el) return;
  const badges = [
    { icon: '🌿', key: 'trust_genuine' },
    { icon: '🚚', key: 'trust_delivery' },
    { icon: '🔒', key: 'trust_secure' },
    { icon: '💬', key: 'trust_support' },
  ];
  el.innerHTML = badges.map(b => `<div class="trust-badge"><span class="t-icon">${b.icon}</span><span>${t(b.key)}</span></div>`).join('');
}

/* ---------- ingredients / usage / storage ---------- */
function renderIngredientsUsageStorage(product) {
  const cc = getCategoryContent(product.category);
  const lang = getLang();
  const ingredientsEl = document.getElementById('ingredientsList');
  const usageEl = document.getElementById('usageList');
  const storageEl = document.getElementById('storageList');
  const pick = (field) => field[lang] || field.sw;
  if (ingredientsEl) ingredientsEl.innerHTML = pick(cc.ingredients).map(x => `<li>${escapeHtml(x)}</li>`).join('');
  if (usageEl) usageEl.innerHTML = pick(cc.usage).map(x => `<li>${escapeHtml(x)}</li>`).join('');
  if (storageEl) storageEl.innerHTML = pick(cc.storage).map(x => `<li>${escapeHtml(x)}</li>`).join('');
}

/* ---------- before & after (only if admin configured photos for this product) ---------- */
function renderBeforeAfterProduct(product) {
  const wrap = document.getElementById('baProductWrap');
  if (!wrap) return;
  const ov = lsGet('ahs_product_overrides', {})[product.id] || {};
  if (!ov.beforeImage || !ov.afterImage) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  document.getElementById('baProductBefore').src = ov.beforeImage;
  document.getElementById('baProductAfter').src = ov.afterImage;
  initBeforeAfterSlider('baProductSlider', 'baProductAfter', 'baProductHandle');
}
function initBeforeAfterSlider(sliderId, afterId, handleId) {
  const slider = document.getElementById(sliderId);
  const after = document.getElementById(afterId);
  const handle = document.getElementById(handleId);
  if (!slider || !after || !handle || slider.dataset.baInit === '1') return;
  slider.dataset.baInit = '1';
  const setPos = (pct) => {
    const clamped = Math.max(0, Math.min(100, pct));
    after.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    handle.style.left = clamped + '%';
  };
  setPos(50);
  let dragging = false;
  const posFromEvent = (e) => {
    const rect = slider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return ((clientX - rect.left) / rect.width) * 100;
  };
  const start = (e) => { dragging = true; setPos(posFromEvent(e)); };
  const move = (e) => { if (dragging) setPos(posFromEvent(e)); };
  const end = () => { dragging = false; };
  handle.addEventListener('mousedown', start);
  slider.addEventListener('mousedown', start);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  handle.addEventListener('touchstart', start, { passive: true });
  slider.addEventListener('touchstart', start, { passive: true });
  slider.addEventListener('touchmove', move, { passive: true });
  slider.addEventListener('touchend', end);
}

/* ---------- product video (only if admin configured a YouTube ID for this product) ---------- */
function renderProductVideo(product) {
  const wrap = document.getElementById('videoProductWrap');
  const frame = document.getElementById('videoProductFrame');
  if (!wrap || !frame) return;
  // product ni tayari "effective product" (kutoka getEffectiveProduct), hivyo
  // videoClip/videoId zipo tayari zimeunganishwa kutoka overrides (bidhaa 288
  // za awali) AU moja kwa moja kwenye document ya bidhaa ("Ongeza Bidhaa").
  // videoClip (video halisi iliyopakiwa na admin) ina kipaumbele; videoId
  // (YouTube, kwa bidhaa za zamani) ni mbadala.
  if (product.videoClip) {
    wrap.style.display = '';
    frame.innerHTML = `<video src="${product.videoClip}" controls playsinline preload="metadata" style="position:absolute; inset:0; width:100%; height:100%; object-fit:contain; background:#000;"></video>`;
    return;
  }
  if (!product.videoId) { wrap.style.display = 'none'; frame.innerHTML = ''; return; }
  wrap.style.display = '';
  frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(product.videoId)}" title="${escapeHtml(product.name)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
}

/* ---------- frequently bought together ---------- */
function renderFbt(product) {
  const wrap = document.getElementById('fbtWrap');
  if (!wrap) return;
  const extra = getFrequentlyBoughtWith(product);
  if (extra.length < 2) { wrap.style.display = 'none'; wrap.innerHTML = ''; window._fbtItems = null; return; }
  wrap.style.display = '';
  const items = [product, ...extra];
  window._fbtItems = items;
  const total = items.reduce((s, p) => s + p.prices.retail, 0);
  wrap.innerHTML = `
    <h3 class="fbt-title">${t('fbt_title')}</h3>
    <div class="fbt-row">
      ${items.map((p, i) => `
        ${i > 0 ? '<span class="fbt-plus">+</span>' : ''}
        <div class="fbt-item">
          <img src="${p.cover || (p.images && p.images[0]) || ('images/' + p.file)}" alt="${escapeHtml(p.name)}" loading="lazy">
          <label class="fbt-check"><input type="checkbox" data-fbt="${p.id}" checked ${i === 0 ? 'disabled' : ''}> <span>${escapeHtml(p.name)}</span></label>
          <span class="fbt-price">${fmt(p.prices.retail)}</span>
        </div>`).join('')}
    </div>
    <div class="fbt-total-row">
      <span>${t('fbt_total')}: <b id="fbtTotal">${fmt(total)}</b></span>
      <button class="btn btn-primary" onclick="addFbtToCart()">${t('fbt_add')}</button>
    </div>`;
  wrap.querySelectorAll('[data-fbt]').forEach(cb => cb.addEventListener('change', updateFbtTotal));
}
function updateFbtTotal() {
  const items = window._fbtItems || [];
  const total = items.filter(p => {
    const cb = document.querySelector(`[data-fbt="${p.id}"]`);
    return !cb || cb.checked;
  }).reduce((s, p) => s + p.prices.retail, 0);
  const totalEl = document.getElementById('fbtTotal');
  if (totalEl) totalEl.textContent = fmt(total);
}
function addFbtToCart() {
  const items = window._fbtItems || [];
  let count = 0;
  items.forEach(p => {
    const cb = document.querySelector(`[data-fbt="${p.id}"]`);
    if (cb && !cb.checked) return;
    if (cart[p.id]) cart[p.id].qty += 1; else cart[p.id] = { ...p, qty: 1 };
    count++;
  });
  lsSet('ahs_cart', cart);
  updateCartUI();
  showToast(`${count} ${t('fbt_added')}`);
}

/* ---------- product-specific FAQ ---------- */
function renderProductFaq(product) {
  const list = document.getElementById('productFaqList');
  if (!list) return;
  const items = getProductFaq(product);
  list.innerHTML = items.map((f, i) => `
    <div class="faq-item" data-idx="${i}">
      <button class="faq-q" onclick="toggleProductFaq(${i})">${escapeHtml(f.q)} <span class="arrow">▾</span></button>
      <div class="faq-a"><div class="faq-a-inner">${escapeHtml(f.a)}</div></div>
    </div>`).join('');
}
function toggleProductFaq(i) {
  const list = document.getElementById('productFaqList');
  if (!list) return;
  const item = list.querySelector(`[data-idx="${i}"]`);
  if (item) item.classList.toggle('open');
}

/* ---------- rating distribution bars ---------- */
function renderRatingBars(product) {
  const el = document.getElementById('modalRatingBars');
  if (!el) return;
  const dist = buildRatingDistribution(product.rating, product.reviewCount);
  const max = Math.max(1, ...dist.map(d => d.count));
  el.innerHTML = dist.map(d => `
    <div class="rs-bar-row">
      <span class="rs-star-lbl">${d.star}★</span>
      <div class="rs-bar-track"><div class="rs-bar-fill" style="width:${Math.round((d.count / max) * 100)}%"></div></div>
      <span class="rs-count">${d.count}</span>
    </div>`).join('');
}

/* ---------- recently viewed rendered inside the product modal ---------- */
function renderModalRecentlyViewed(excludeId) {
  const grid = document.getElementById('modalRecentGrid');
  const wrap = document.getElementById('modalRecentWrap');
  if (!grid || !wrap) return;
  const items = recentlyViewed.filter(x => x !== excludeId).map(x => getEffectiveProduct(x)).filter(Boolean).slice(0, 8);
  if (items.length === 0) { wrap.style.display = 'none'; grid.innerHTML = ''; return; }
  wrap.style.display = '';
  grid.innerHTML = items.map(p => `
    <div class="pg-item" data-open="${p.id}" style="cursor:pointer;">
      <img data-src="${p.cover || (p.images && p.images[0]) || ('images/' + p.file)}" alt="${escapeHtml(p.name)}" loading="lazy" class="lazy-fade">
      <div class="pg-caption"><b>${escapeHtml(p.name)}</b><em>${fmt(p.prices.retail)}</em></div>
    </div>`).join('');
  grid.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openProduct(parseInt(el.dataset.open, 10))));
  initLazyObserver();
}

/* ---------- sticky mobile Add-to-Cart / Buy-Now bar ---------- */
function updateStickyBuyBar(product) {
  const bar = document.getElementById('stickyBuyBar');
  const label = document.getElementById('stickyPriceLabel');
  if (!bar || !label) return;
  label.textContent = fmt(product.prices.retail);
  if (window.innerWidth <= 768) bar.classList.add('show');
}
function buyNowCurrent() {
  if (!currentProduct) return;
  addCurrentToCart();
  // "Nunua Sasa" haipaswi kuruka moja kwa moja WhatsApp — mteja lazima
  // apitie fomu ya Jina/Simu/Mkoa kwenye Kikapu kwanza (ajaze au ahakiki
  // taarifa zake), kisha ndio abofye "Ona Invoice" au "Agiza kwa WhatsApp".
  if (typeof closeProduct === 'function') closeProduct();
  if (typeof openCart === 'function') openCart();
}

/* ---------- image zoom: desktop hover-follow magnifier ---------- */
function initImageZoom() {
  const zw = document.getElementById('zoomWrap');
  if (!zw || zw.dataset.zoomInit === '1') return;
  zw.dataset.zoomInit = '1';
  zw.addEventListener('click', () => { zw.classList.toggle('zoomed'); });
  zw.addEventListener('mousemove', (e) => {
    if (zw.classList.contains('zoomed')) return;
    const img = zw.querySelector('#pmSlideTrack img.pm-active');
    if (!img) return;
    const rect = zw.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
    zw.classList.add('hover-zoom');
  });
  zw.addEventListener('mouseleave', () => {
    zw.classList.remove('hover-zoom');
    const img = zw.querySelector('#pmSlideTrack img.pm-active');
    if (img) img.style.transformOrigin = '';
  });
}

/* ---------- swipe gallery (mobile) ---------- */
function initSwipeGallery() {
  const slider = document.getElementById('pmSlider');
  if (!slider || slider.dataset.swipeInit === '1') return;
  slider.dataset.swipeInit = '1';
  let startX = 0, startY = 0, touching = false;
  slider.addEventListener('touchstart', (e) => {
    if (!e.touches[0]) return;
    startX = e.touches[0].clientX; startY = e.touches[0].clientY; touching = true;
  }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    if (!touching) return;
    touching = false;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) pmSlide(dx < 0 ? 1 : -1);
  }, { passive: true });
}
function changeModalQty(d) { currentQty = Math.max(1, currentQty + d); document.getElementById('modalQty').textContent = currentQty; }
function addCurrentToCart() {
  if (!currentProduct) return;
  if (typeof currentProduct.stock === 'number' && currentProduct.stock <= 0) {
    showToast(t('out_of_stock', { name: currentProduct.name }));
    return;
  }
  const id = currentProduct.id;
  if (cart[id]) { cart[id].qty += currentQty; } else { cart[id] = { ...currentProduct, qty: currentQty }; }
  lsSet('ahs_cart', cart);
  updateCartUI();
  showToast(currentProduct.name + ' ' + t('added_to_cart'));
  if (typeof ahsTrackEvent === 'function') {
    ahsTrackEvent('add_to_cart', { content_name: currentProduct.name, content_ids: [String(id)], content_type: 'product', value: currentProduct.prices.retail * currentQty, currency: 'TZS' });
  }
  closeProduct();
}

/* ===================== WISHLIST ===================== */
function toggleWishlist(id) {
  const idx = wishlist.indexOf(id);
  if (idx >= 0) { wishlist.splice(idx, 1); showToast(getEffectiveProduct(id).name + ' ' + t('removed_from_wishlist')); }
  else { wishlist.push(id); showToast(getEffectiveProduct(id).name + ' ' + t('added_to_wishlist')); }
  lsSet('ahs_wishlist', wishlist);
  document.getElementById('wishlistCount').textContent = wishlist.length;
  renderGrid();
  renderWishlistPanel();
  updateWishlistCompareBtns();
}
function toggleWishlistCurrent() { if (currentProduct) toggleWishlist(currentProduct.id); }
function updateWishlistCompareBtns() {
  if (!currentProduct) return;
  document.getElementById('modalWishlistBtn').classList.toggle('active', wishlist.includes(currentProduct.id));
  document.getElementById('modalCompareBtn').classList.toggle('active', compareList.includes(currentProduct.id));
}
function openWishlist() { renderWishlistPanel(); document.getElementById('wishlistPanel').classList.add('open'); document.getElementById('wishlistScrim').classList.add('open'); }
function closeWishlist() { document.getElementById('wishlistPanel').classList.remove('open'); document.getElementById('wishlistScrim').classList.remove('open'); }
function renderWishlistPanel() {
  const body = document.getElementById('wishlistBody');
  document.getElementById('wishlistCount').textContent = wishlist.length;
  if (wishlist.length === 0) { body.innerHTML = `<div class="panel-empty">${t('empty_wishlist')}</div>`; return; }
  body.innerHTML = wishlist.map(id => {
    const p = getEffectiveProduct(id);
    return `<div class="wl-item">
      <img src="${p.cover || (p.images && p.images[0]) || ('images/' + p.file)}" data-open="${id}" alt="${escapeHtml(p.name)}">
      <div class="wl-item-info" data-open="${id}"><b>${escapeHtml(p.name)}</b><span>${fmt(p.prices.retail)}</span></div>
      <button class="wl-remove" data-remove="${id}">🗑</button>
    </div>`;
  }).join('');
  body.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => { closeWishlist(); openProduct(parseInt(el.dataset.open,10)); }));
  body.querySelectorAll('[data-remove]').forEach(el => el.addEventListener('click', () => toggleWishlist(parseInt(el.dataset.remove,10))));
}

/* ===================== COMPARE ===================== */
function toggleCompare(id) {
  const idx = compareList.indexOf(id);
  if (idx >= 0) { compareList.splice(idx, 1); }
  else {
    if (compareList.length >= 4) { showToast(t('compare_full')); return; }
    compareList.push(id);
    showToast(getEffectiveProduct(id).name + ' ' + t('added_to_compare'));
  }
  lsSet('ahs_compare', compareList);
  document.getElementById('compareCount').textContent = compareList.length;
  renderGrid();
  renderComparePanel();
  updateWishlistCompareBtns();
}
function toggleCompareCurrent() { if (currentProduct) toggleCompare(currentProduct.id); }
function openCompare() { renderComparePanel(); document.getElementById('comparePanel').classList.add('open'); document.getElementById('compareScrim').classList.add('open'); }
function closeCompare() { document.getElementById('comparePanel').classList.remove('open'); document.getElementById('compareScrim').classList.remove('open'); }
function renderComparePanel() {
  const body = document.getElementById('compareBody');
  document.getElementById('compareCount').textContent = compareList.length;
  if (compareList.length === 0) { body.innerHTML = `<div class="panel-empty">${t('empty_compare')}</div>`; return; }
  const items = compareList.map(id => getEffectiveProduct(id));
  body.innerHTML = `<table class="compare-table">
    <tr><th></th>${items.map(p => `<td><img src="${p.cover || (p.images && p.images[0]) || ('images/' + p.file)}" alt=""><br><button class="wl-remove" data-remove="${p.id}">🗑 ${t('remove')}</button></td>`).join('')}</tr>
    <tr><th>${t('view_details')}</th>${items.map(p => `<td><b>${escapeHtml(p.name)}</b></td>`).join('')}</tr>
    <tr><th>${t('category')}</th>${items.map(p => `<td>${escapeHtml(p.category)}</td>`).join('')}</tr>
    <tr><th>${t('effect')}</th>${items.map(p => `<td>${escapeHtml(translateEffect(p.effect))}</td>`).join('')}</tr>
    <tr><th>Bei (Retail)</th>${items.map(p => `<td>${fmt(p.prices.retail)}</td>`).join('')}</tr>
    <tr><th>Bei (5+)</th>${items.map(p => `<td>${fmt(p.prices.w5)}</td>`).join('')}</tr>
    <tr><th>Bei (10+)</th>${items.map(p => `<td>${fmt(p.prices.w10)}</td>`).join('')}</tr>
    <tr><th>Ukadiriaji</th>${items.map(p => `<td>${starString(p.rating)} (${p.rating})</td>`).join('')}</tr>
  </table>`;
  body.querySelectorAll('[data-remove]').forEach(el => el.addEventListener('click', () => toggleCompare(parseInt(el.dataset.remove,10))));
}

/* ===================== RECENTLY VIEWED ===================== */
function renderRecentlyViewed() {
  const wrap = document.getElementById('recentlyViewedWrap');
  if (!wrap) return;
  if (recentlyViewed.length === 0) { wrap.innerHTML = ''; return; }
  const items = recentlyViewed.map(id => getEffectiveProduct(id)).filter(Boolean).slice(0, 8);
  wrap.innerHTML = `<h3 style="color:var(--green-deep); margin:40px 0 16px; font-size:1.1rem;">${t('recently_viewed')}</h3>
    <div class="gallery-grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr));">
      ${items.map(p => `<div class="pg-item" data-open="${p.id}" style="cursor:pointer;">
        <img src="${p.cover || (p.images && p.images[0]) || ('images/' + p.file)}" alt="${escapeHtml(p.name)}" loading="lazy">
        <div class="pg-caption"><b>${escapeHtml(p.name)}</b><em>${fmt(p.prices.retail)}</em></div>
      </div>`).join('')}
    </div>`;
  wrap.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openProduct(parseInt(el.dataset.open,10))));
}

/* ===================== CART ===================== */
function computeTotals() {
  const items = Object.values(cart);
  let retailTotal = 0, grandTotal = 0;
  items.forEach(it => {
    const unit = unitPriceFor(it, it.qty);
    retailTotal += it.prices.retail * it.qty;
    grandTotal += unit * it.qty;
  });
  return { items, retailTotal, grandTotal, discount: retailTotal - grandTotal };
}
function updateCartUI() {
  const { items, retailTotal, grandTotal, discount } = computeTotals();
  const totalQty = items.reduce((s,i) => s + i.qty, 0);
  document.getElementById('navCartCount').textContent = totalQty;
  document.getElementById('fabCartCount').textContent = totalQty;
  document.getElementById('sumRetail').textContent = fmt(retailTotal);
  document.getElementById('sumDiscount').textContent = fmt(discount);
  const shipInfo = getShippingInfo();
  updateShippingUI(shipInfo);
  const shipRow = document.getElementById('sumShippingRow');
  if (shipInfo.matched && shipInfo.price > 0) {
    shipRow.style.display = '';
    document.getElementById('sumShipping').textContent = fmt(shipInfo.price);
  } else {
    shipRow.style.display = 'none';
  }
  document.getElementById('sumTotal').textContent = fmt(grandTotal + (shipInfo.matched ? shipInfo.price : 0));
  updateCheckoutButtonsState();
  const cartItemsEl = document.getElementById('cartItems');
  if (items.length === 0) {
    cartItemsEl.innerHTML = `<div class="cart-empty">${t('cart_empty')}.<br>${t('cart_empty_hint')}</div>`;
    return;
  }
  cartItemsEl.innerHTML = items.map(it => {
    const unit = unitPriceFor(it, it.qty);
    return `
    <div class="cart-item">
      <img src="${it.cover || (it.images && it.images[0]) || ('images/' + it.file)}" alt="${escapeHtml(it.name)}">
      <div class="cart-item-info">
        <b>${escapeHtml(it.name)}</b>
        <span>${fmt(unit)} x ${it.qty}</span>
      </div>
      <div class="cart-item-qty">
        <button data-qd="${it.id}">−</button>
        <span>${it.qty}</span>
        <button data-qi="${it.id}">+</button>
      </div>
      <button class="cart-remove" data-cr="${it.id}">🗑</button>
    </div>`;
  }).join('');
  cartItemsEl.querySelectorAll('[data-qd]').forEach(b => b.addEventListener('click', () => cartChangeQty(parseInt(b.dataset.qd,10), -1)));
  cartItemsEl.querySelectorAll('[data-qi]').forEach(b => b.addEventListener('click', () => cartChangeQty(parseInt(b.dataset.qi,10), 1)));
  cartItemsEl.querySelectorAll('[data-cr]').forEach(b => b.addEventListener('click', () => cartRemove(parseInt(b.dataset.cr,10))));
}
function cartChangeQty(id, d) { if (!cart[id]) return; cart[id].qty += d; if (cart[id].qty <= 0) delete cart[id]; lsSet('ahs_cart', cart); updateCartUI(); }
function cartRemove(id) { delete cart[id]; lsSet('ahs_cart', cart); updateCartUI(); }
function openCart() { document.getElementById('cartDrawer').classList.add('open'); document.getElementById('cartScrim').classList.add('open'); }
function closeCart() { document.getElementById('cartDrawer').classList.remove('open'); document.getElementById('cartScrim').classList.remove('open'); }
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

/* ===================== PAYMENT: copy account/phone number ===================== */
function copyPaymentNumber(value, btnEl) {
  const flash = () => {
    showToast(t('number_copied', { value }));
    if (btnEl) {
      const original = btnEl.textContent;
      btnEl.textContent = '✓';
      btnEl.classList.add('copied');
      setTimeout(() => { btnEl.textContent = original; btnEl.classList.remove('copied'); }, 1600);
    }
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(value).then(flash).catch(() => fallbackCopy(value, flash));
  } else {
    fallbackCopy(value, flash);
  }
}
function fallbackCopy(value, onDone) {
  try {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (onDone) onDone();
  } catch (e) {
    showToast(t('copy_failed', { value }));
  }
}

/* ===================== CUSTOMER INFO (jina/simu/mkoa) ===================== */
function getLocationType() {
  const checked = document.querySelector('input[name="custLocationType"]:checked');
  return checked ? checked.value : null; // 'dar' | 'mkoani' | null
}
function toggleLocationFields() {
  const type = getLocationType();
  const darField = document.getElementById('darAreaField');
  const mkoaniField = document.getElementById('mkoaniField');
  if (darField) darField.style.display = (type === 'dar') ? '' : 'none';
  if (mkoaniField) mkoaniField.style.display = (type === 'mkoani') ? '' : 'none';
  updateCartUI();
}
function isCustomerInfoFilled() {
  const name = (document.getElementById('cartCustName') || {}).value || '';
  const phone = (document.getElementById('cartCustPhone') || {}).value || '';
  const locationType = getLocationType();
  let location = '';
  if (locationType === 'dar') location = (document.getElementById('cartDarArea') || {}).value || '';
  else if (locationType === 'mkoani') location = (document.getElementById('cartCustRegion') || {}).value || '';
  return !!(name.trim() && phone.trim() && locationType && location.trim());
}
function updateCheckoutButtonsState() {
  const ready = isCustomerInfoFilled();
  const invBtn = document.getElementById('cartBuyInvoiceBtn');
  const waBtn = document.getElementById('cartBuyWaBtn');
  if (invBtn) invBtn.disabled = !ready;
  if (waBtn) waBtn.disabled = !ready;
}
function getCustomerInfo() {
  const nameEl = document.getElementById('cartCustName');
  const phoneEl = document.getElementById('cartCustPhone');
  const darAreaEl = document.getElementById('cartDarArea');
  const regionEl = document.getElementById('cartCustRegion');
  const name = nameEl ? nameEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const locationType = getLocationType();
  const region = locationType === 'dar' ? (darAreaEl ? darAreaEl.value.trim() : '') : (regionEl ? regionEl.value.trim() : '');
  const locationEl = locationType === 'dar' ? darAreaEl : regionEl;
  [ [nameEl,name], [phoneEl,phone] ].forEach(([el,val]) => {
    if (el) el.classList.toggle('ccf-invalid', !val);
  });
  if (locationEl) locationEl.classList.toggle('ccf-invalid', !region);
  const locToggle = document.querySelector('.ccf-toggle');
  if (locToggle) locToggle.classList.toggle('ccf-invalid', !locationType);
  if (!name || !phone || !locationType || !region) return null;
  lsSet('ahs_customer_info', { name, phone, region, locationType });
  return { name, phone, region, locationType };
}
function regionLabel(key) {
  return key.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}
function closeRegionDropdown() {
  const dd = document.getElementById('regionDropdown');
  if (dd) { dd.classList.remove('open'); dd.innerHTML = ''; }
}
function openRegionDropdown(filterText) {
  const dd = document.getElementById('regionDropdown');
  if (!dd || typeof SHIPPING_RATES === 'undefined') return;
  const norm = shippingNormalize(filterText || '');
  const keys = Object.keys(SHIPPING_RATES).sort();
  const matches = norm ? keys.filter(k => k.includes(norm)) : keys;
  if (matches.length === 0) {
    dd.innerHTML = '<div class="ccf-region-empty">Hakuna mkoa/wilaya inayolingana — bado unaweza kuandika jina, tutathibitisha bei.</div>';
  } else {
    dd.innerHTML = matches.map(k => `<div class="ccf-region-opt" data-region="${escapeHtml(k)}"><span>${escapeHtml(regionLabel(k))}</span><span class="price">Tsh ${SHIPPING_RATES[k].toLocaleString('en-US')}</span></div>`).join('');
  }
  dd.classList.add('open');
  dd.querySelectorAll('[data-region]').forEach(opt => {
    opt.addEventListener('click', () => {
      const regionEl = document.getElementById('cartCustRegion');
      if (regionEl) regionEl.value = regionLabel(opt.dataset.region);
      closeRegionDropdown();
      updateCartUI();
    });
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const regionInput = document.getElementById('cartCustRegion');
  if (!regionInput) return;
  regionInput.addEventListener('focus', () => openRegionDropdown(regionInput.value));
  regionInput.addEventListener('input', () => openRegionDropdown(regionInput.value));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#mkoaniField')) closeRegionDropdown();
  });
});

/* ===================== SHIPPING (gharama ya usafiri kwa mkoa) ===================== */
function getShippingInfo() {
  const locationType = getLocationType();
  if (locationType === 'dar') {
    const areaText = document.getElementById('cartDarArea') ? document.getElementById('cartDarArea').value.trim() : '';
    return { price: 0, matched: false, isDar: true, regionText: areaText };
  }
  if (locationType === 'mkoani') {
    const regionEl = document.getElementById('cartCustRegion');
    const regionText = regionEl ? regionEl.value.trim() : '';
    if (!regionText || typeof findShippingRate !== 'function') return { price: 0, matched: false, isDar: false, regionText };
    const found = findShippingRate(regionText);
    if (!found) return { price: 0, matched: false, isDar: false, regionText };
    return { price: found.price, matched: true, isDar: false, regionText };
  }
  return { price: 0, matched: false, isDar: false, regionText: '' };
}
function updateShippingUI(shipInfo) {
  const noteEl = document.getElementById('shippingNote');
  if (!noteEl) return;
  const locationType = getLocationType();
  if (!locationType) { noteEl.className = 'ccf-shipping-note'; noteEl.textContent = ''; return; }
  if (!shipInfo.regionText) {
    noteEl.className = 'ccf-shipping-note';
    noteEl.textContent = '';
    return;
  }
  if (shipInfo.matched) {
    noteEl.className = 'ccf-shipping-note ok';
    noteEl.innerHTML = `✅ <b>${escapeHtml(regionLabel(findShippingRate(shipInfo.regionText).region))}</b> — Tsh ${shipInfo.price.toLocaleString('en-US')}. Malipo kabla ya kutuma (mkoani unalipia kwanza).`;
    closeRegionDropdown();
  } else if (shipInfo.isDar) {
    noteEl.className = 'ccf-shipping-note danger';
    noteEl.textContent = '⚠️ Bei ya usafiri BADO HAIJAWEKWA — itathibitishwa na Agnes Herbal Store baada ya kutuma oda hii. Unalipia ukishapokea bidhaa.';
  } else {
    noteEl.className = 'ccf-shipping-note danger';
    noteEl.textContent = '⚠️ Eneo hili halijapatikana kwenye orodha yetu ya bei — gharama ya usafiri itathibitishwa na Agnes Herbal Store baada ya kutuma oda hii. Kanuni: malipo ya usafiri hufanyika kabla ya kutuma bidhaa (mkoani unalipia kwanza).';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[name="custLocationType"]').forEach(r => r.addEventListener('change', toggleLocationFields));
  const darAreaEl = document.getElementById('cartDarArea');
  if (darAreaEl) darAreaEl.addEventListener('input', updateCartUI);
  const regionEl = document.getElementById('cartCustRegion');
  if (regionEl) regionEl.addEventListener('input', updateCartUI);
  const nameEl = document.getElementById('cartCustName');
  if (nameEl) nameEl.addEventListener('input', updateCheckoutButtonsState);
  const phoneEl = document.getElementById('cartCustPhone');
  if (phoneEl) phoneEl.addEventListener('input', updateCheckoutButtonsState);
});

function prefillCustomerInfo() {
  const saved = lsGet('ahs_customer_info', null);
  if (!saved) return;
  const nameEl = document.getElementById('cartCustName');
  const phoneEl = document.getElementById('cartCustPhone');
  const darAreaEl = document.getElementById('cartDarArea');
  const regionEl = document.getElementById('cartCustRegion');
  if (nameEl && !nameEl.value) nameEl.value = saved.name || '';
  if (phoneEl && !phoneEl.value) phoneEl.value = saved.phone || '';
  if (saved.locationType) {
    const radio = document.getElementById(saved.locationType === 'dar' ? 'locDar' : 'locMkoani');
    if (radio) { radio.checked = true; toggleLocationFields(); }
  }
  if (saved.locationType === 'dar' && darAreaEl && !darAreaEl.value) darAreaEl.value = saved.region || '';
  if (saved.locationType === 'mkoani' && regionEl && !regionEl.value) regionEl.value = saved.region || '';
  updateCheckoutButtonsState();
}
document.addEventListener('DOMContentLoaded', prefillCustomerInfo);

/* ===================== INVOICE + ORDER TRACKING RECORD ===================== */
let lastOrderNo = null;
function showInvoice() {
  const { items, retailTotal, grandTotal, discount } = computeTotals();
  if (items.length === 0) { showToast(t('cart_empty')); return; }
  const customer = getCustomerInfo();
  if (!customer) {
    // Usisiruhusu invoice tupu kamwe kuonekana — fungua Kikapu ili mteja
    // aone wazi (rangi nyekundu) ni uga upi haujajazwa, badala ya "toast"
    // ndogo inayoweza kukosa kuonekana.
    if (typeof openCart === 'function') openCart();
    showToast('Jaza Jina, Simu na Mkoa kabla ya kuendelea.');
    return;
  }
  lastOrderNo = 'AHS-' + invCounter;
  document.getElementById('invNumber').textContent = 'INVOICE #' + lastOrderNo;
  document.getElementById('invOrderNo').textContent = lastOrderNo;
  const now = new Date();
  document.getElementById('invDate').textContent = 'Tarehe: ' + now.toLocaleDateString('sw-TZ');
  document.getElementById('invoiceRows').innerHTML = items.map(it => {
    const unit = unitPriceFor(it, it.qty);
    const amount = unit * it.qty;
    const disc = (it.prices.retail - unit) * it.qty;
    return `<tr>
      <td>${escapeHtml(it.name)}<br><span style="color:var(--ink-soft); font-size:.72rem;">${escapeHtml(it.category)}</span></td>
      <td class="num">${it.qty}</td>
      <td class="num">${fmt(unit)}</td>
      <td class="num">${fmt(amount)}</td>
      <td class="num">${disc>0?fmt(disc):'-'}</td>
      <td class="num"><b>${fmt(amount)}</b></td>
    </tr>`;
  }).join('');
  const shipInfo = getShippingInfo();
  const shippingCost = shipInfo.matched ? shipInfo.price : 0;
  const finalTotal = grandTotal + shippingCost;
  document.getElementById('invRetail').textContent = fmt(retailTotal);
  document.getElementById('invDiscount').textContent = fmt(discount);
  const invShipRow = document.getElementById('invShippingRow');
  if (shipInfo.matched && shippingCost > 0) {
    invShipRow.style.display = '';
    document.getElementById('invShipping').textContent = fmt(shippingCost);
    document.getElementById('invShipRegion').textContent = customer.region;
  } else {
    invShipRow.style.display = 'none';
  }
  document.getElementById('invTotal').textContent = fmt(finalTotal);
  document.getElementById('invCustName').textContent = customer.name;
  document.getElementById('invCustPhone').textContent = customer.phone;
  document.getElementById('invCustRegion').textContent = customer.region;
  document.getElementById('invShippingRuleText').textContent = shipInfo.isDar
    ? 'Dar es Salaam: unalipia ukishapokea bidhaa (malipo baada ya kupokea).'
    : 'Mikoani: malipo hufanyika kabla ya kutuma bidhaa (mkoani unalipia kwanza).';
  const warnNote = document.getElementById('invShippingWarnNote');
  const warnText = document.getElementById('invShippingWarnText');
  if (shipInfo.isDar) {
    warnNote.style.display = '';
    warnText.textContent = 'Kwa vile uko Dar es Salaam, gharama ya usafiri itathibitishwa na Agnes Herbal Store baada ya kutuma oda hii — si kabla.';
  } else if (!shipInfo.matched) {
    warnNote.style.display = '';
    warnText.textContent = 'Eneo ulilotaja halijapatikana kwenye orodha yetu ya bei — gharama ya usafiri itathibitishwa na Agnes Herbal Store baada ya kutuma oda hii.';
  } else {
    warnNote.style.display = 'none';
  }
  document.getElementById('invoiceOverlay').classList.add('open');
  closeCart();
  if (typeof ahsTrackEvent === 'function') {
    ahsTrackEvent('begin_checkout', { value: finalTotal, currency: 'TZS', content_ids: items.map(i => String(i.id)) });
  }

  // save order record for tracking + admin dashboard (only once per invoice generation)
  const orders = lsGet('ahs_orders', []);
  if (!orders.find(o => o.id === lastOrderNo)) {
    const orderRecord = { id: lastOrderNo, items: items.map(i => ({ name: i.name, qty: i.qty, unit: unitPriceFor(i, i.qty) })), total: finalTotal, date: now.toISOString(), status: 'placed', customerName: customer.name, customerPhone: customer.phone, customerRegion: customer.region, shippingCost: shippingCost };
    orders.unshift(orderRecord);
    lsSet('ahs_orders', orders);
    // Live sync to admin panel (no-op silently if Firebase isn't configured yet)
    if (typeof cloudPushOrder === 'function') cloudPushOrder(orderRecord);
    // Push notification straight to your phone/browser (no-op if OneSignal isn't configured yet)
    if (typeof sendOrderNotification === 'function') sendOrderNotification(orderRecord);
    if (typeof ahsTrackEvent === 'function') {
      ahsTrackEvent('purchase', { value: finalTotal, currency: 'TZS', transaction_id: lastOrderNo, content_ids: items.map(i => String(i.id)) });
    }
  }
}
function closeInvoice() { document.getElementById('invoiceOverlay').classList.remove('open'); }
function checkoutWhatsApp() {
  const { items, grandTotal } = computeTotals();
  if (items.length === 0) { showToast(t('cart_empty')); return; }
  const customer = getCustomerInfo();
  if (!customer) {
    if (typeof openCart === 'function') openCart();
    showToast('Jaza Jina, Simu na Mkoa kabla ya kuendelea.');
    return;
  }
  if (!lastOrderNo) showInvoice();
  const shipInfo = getShippingInfo();
  const shippingCost = shipInfo.matched ? shipInfo.price : 0;
  const finalTotal = grandTotal + shippingCost;
  // MUHIMU: tunajenga ujumbe wote kama maandishi ya kawaida (bila
  // encodeURIComponent kwa kila sehemu), kisha tunau-encode MARA MOJA TU
  // mwishoni. Hapo awali kila sehemu ndogo ilikuwa ikiencodiwa peke yake
  // huku maandishi mengine ya kudumu (mfano jina la duka lenye herufi "&")
  // yakibaki bila kuencodiwa — herufi "&" kwenye URL huvunja parameter na
  // kukatiza ujumbe kabisa kwenye WhatsApp. Njia hii mpya inazuia hilo
  // kabisa, hata kama jina/maelezo yana alama maalum (&, %, +, n.k).
  let msg = t('checkout_wa_intro');
  items.forEach((it,i) => {
    const unit = unitPriceFor(it, it.qty);
    msg += `${i+1}. ${it.name} x${it.qty} - Tsh ${Math.round(unit*it.qty).toLocaleString('en-US')}\n`;
  });
  if (shippingCost > 0) {
    msg += `\nGharama ya Usafiri (${customer.region}): Tsh ${shippingCost.toLocaleString('en-US')}\n`;
  } else if (shipInfo.isDar) {
    msg += `\n⚠️ (Bei ya usafiri BADO HAIJAWEKWA — itathibitishwa na Agnes Herbal Store baada ya oda hii)\n`;
  } else {
    msg += `\n⚠️ (Eneo hili halijapatikana kwenye orodha — bei ya usafiri itathibitishwa na Agnes Herbal Store baada ya oda hii)\n`;
  }
  msg += `\nJumla ya Kulipa: Tsh ${Math.round(finalTotal).toLocaleString('en-US')}\nNamba ya Oda: ${lastOrderNo || ''}\n\nJina langu: ${customer.name}\nNamba ya Simu: ${customer.phone}\nMahali (Mkoa): ${customer.region}`;
  if (!shipInfo.isDar) {
    msg += `\n\nKanuni: kwa oda za mikoani, malipo hufanyika kabla ya kutuma bidhaa (mkoani unalipia kwanza).`;
  } else {
    msg += `\n\nKanuni: Dar es Salaam - unalipia ukishapokea bidhaa (malipo baada ya kupokea).`;
  }
  msg += `\n\nAsante!`;
  window.open('https://wa.me/255678883675?text=' + encodeURIComponent(msg), '_blank');
  if (typeof ahsTrackEvent === 'function') {
    ahsTrackEvent('generate_lead', { value: grandTotal, currency: 'TZS', content_name: 'whatsapp_order' });
  }
  // Oda imeshatumwa kwa WhatsApp — safisha kikapu ili mteja asije akatuma
  // oda ile ile mara ya pili kwa bahati mbaya. Oda yenyewe tayari imehifadhiwa
  // (ahs_orders / Firestore) kabla ya hapa, kwenye showInvoice(), hivyo
  // haipotei — bado inaonekana kwenye "📜 Historia ya Oda".
  cart = {};
  lsSet('ahs_cart', cart);
  updateCartUI();
  lastOrderNo = null;
  closeCart();
}

/* ===================== ORDER HISTORY (kwa mteja, kifaa hiki) ===================== */
function openOrderHistory() {
  const list = document.getElementById('orderHistoryList');
  const orders = lsGet('ahs_orders', []);
  if (!orders.length) {
    list.innerHTML = `<p style="color:var(--ink-soft); font-size:.85rem; text-align:center; padding:20px 0;">Bado hujatuma oda yoyote kutoka kifaa hiki.</p>`;
  } else {
    list.innerHTML = orders.map(o => `
      <div style="border:1px solid var(--line); border-radius:12px; padding:12px 14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <b style="color:var(--green-deep); font-size:.88rem;">${escapeHtml(o.id)}</b>
          <span style="font-size:.72rem; color:var(--ink-soft);">${new Date(o.date).toLocaleDateString('sw-TZ')}</span>
        </div>
        <div style="font-size:.78rem; color:var(--ink-soft); margin-bottom:6px;">${o.items.map(it => escapeHtml(it.name) + ' ×' + it.qty).join(', ')}</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:var(--gold); font-size:.86rem;">${fmt(o.total)}</b>
          <a href="track-order.html?id=${encodeURIComponent(o.id)}" style="font-size:.76rem; color:var(--green-deep); font-weight:700;">Fuatilia Oda →</a>
        </div>
      </div>`).join('');
  }
  document.getElementById('orderHistoryOverlay').classList.add('open');
}
function closeOrderHistory() {
  document.getElementById('orderHistoryOverlay').classList.remove('open');
}

/* ===================== TESTIMONIALS ===================== */
function renderTestimonials() {
  const grid = document.getElementById('testimonialGrid');
  if (!grid) return;
  const lang = getLang();
  const picks = [REVIEW_POOL[0], REVIEW_POOL[2], REVIEW_POOL[4]];
  grid.innerHTML = picks.map(r => `
    <div class="testimonial-card reveal">
      <div class="stars">★★★★★</div>
      <p>"${escapeHtml(pickLangText(r, lang))}"</p>
      <b>— ${escapeHtml(r.name)}</b>
    </div>`).join('');
  initRevealObserver();
}

/* ===================== FAQ ===================== */
function renderFaq() {
  const list = document.getElementById('faqList');
  if (!list) return;
  const lang = getLang();
  list.innerHTML = FAQ_DATA.map((f,i) => `
    <div class="faq-item" data-i="${i}">
      <button class="faq-q"><span>${escapeHtml(f[lang+'_q'] || f.sw_q)}</span><span class="arrow">⌄</span></button>
      <div class="faq-a"><div class="faq-a-inner">${escapeHtml(f[lang+'_a'] || f.sw_a)}</div></div>
    </div>`).join('');
  list.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => item.classList.toggle('open'));
  });
}

/* ===================== BEFORE/AFTER SLIDER ===================== */
function initBeforeAfter() {
  const slider = document.getElementById('baSlider');
  const after = document.getElementById('baAfter');
  const handle = document.getElementById('baHandle');
  if (!slider) return;
  let dragging = false;
  function setPos(clientX) {
    const rect = slider.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = pct + '%';
  }
  handle.addEventListener('mousedown', () => dragging = true);
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('mousemove', (e) => { if (dragging) setPos(e.clientX); });
  slider.addEventListener('click', (e) => setPos(e.clientX));
  handle.addEventListener('touchstart', () => dragging = true, {passive:true});
  window.addEventListener('touchend', () => dragging = false);
  window.addEventListener('touchmove', (e) => { if (dragging && e.touches[0]) setPos(e.touches[0].clientX); }, {passive:true});
}

/* ===================== CONTACT FORM ===================== */
function validateField(inputEl, wrapId, validFn) {
  const wrap = document.getElementById(wrapId);
  const ok = validFn(inputEl.value.trim());
  wrap.classList.toggle('invalid', !ok);
  return ok;
}
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.querySelector('.honeypot').value) return; // bot trap
    const name = document.getElementById('cfName');
    const phone = document.getElementById('cfPhone');
    const email = document.getElementById('cfEmail');
    const message = document.getElementById('cfMessage');
    let ok = true;
    ok = validateField(name, 'f-name', v => v.length >= 2) && ok;
    ok = validateField(phone, 'f-phone', v => /^[0-9+ ]{7,20}$/.test(v)) && ok;
    ok = validateField(email, 'f-email', v => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) && ok;
    ok = validateField(message, 'f-message', v => v.length >= 5) && ok;
    if (!ok) return;
    const messages = lsGet('ahs_messages', []);
    messages.unshift({ name: escapeHtml(name.value.trim()), phone: escapeHtml(phone.value.trim()), email: escapeHtml(email.value.trim()), message: escapeHtml(message.value.trim()), date: new Date().toISOString() });
    lsSet('ahs_messages', messages);
    showToast(t('contact_success'));
    form.reset();
    if (typeof ahsTrackEvent === 'function') ahsTrackEvent('generate_lead', { content_name: 'contact_form' });
  });
}

/* ===================== NEWSLETTER ===================== */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.querySelector('.honeypot').value) return;
    const emailEl = document.getElementById('newsletterEmail');
    const email = emailEl.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast(t('invalid_email')); return; }
    const list = lsGet('ahs_newsletter', []);
    if (!list.includes(email)) list.push(email);
    lsSet('ahs_newsletter', list);
    if (typeof cloudSaveNewsletterEmail === 'function') cloudSaveNewsletterEmail(email);
    showToast(t('newsletter_success'));
    form.reset();
    if (typeof ahsTrackEvent === 'function') ahsTrackEvent('generate_lead', { content_name: 'newsletter_signup' });
  });
}

/* ===================== DARK MODE ===================== */
function applyTheme() {
  const theme = localStorage.getItem('ahs_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.innerHTML = theme === 'dark'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';
  }
}
function toggleTheme() {
  const cur = localStorage.getItem('ahs_theme') || 'light';
  localStorage.setItem('ahs_theme', cur === 'dark' ? 'light' : 'dark');
  applyTheme();
}

/* ===================== SHARE (footer / page-level) ===================== */
function initShareButtons() {
  const url = encodeURIComponent(location.href.split('#')[0]);
  const text = encodeURIComponent('Agnes Herbal Supplements — Vitamins & Supplements Dar es Salaam');
  const wa = document.getElementById('shareWa'), fb = document.getElementById('shareFb'), x = document.getElementById('shareX'), tg = document.getElementById('shareTg');
  if (wa) wa.href = `https://wa.me/?text=${text}%20${url}`;
  if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  if (x) x.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  if (tg) tg.href = `https://t.me/share/url?url=${url}&text=${text}`;
}

/* ===================== PWA INSTALL ===================== */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (!sessionStorage.getItem('ahs_install_dismissed')) {
    document.getElementById('installBanner').classList.add('show');
  }
});
function doInstall() {
  if (!deferredInstallPrompt) { dismissInstall(); return; }
  deferredInstallPrompt.prompt();
  deferredInstallPrompt = null;
  dismissInstall();
}
function dismissInstall() {
  document.getElementById('installBanner').classList.remove('show');
  sessionStorage.setItem('ahs_install_dismissed', '1');
}

/* ===================== OFFLINE BANNER ===================== */
function updateOnlineStatus() {
  const banner = document.getElementById('offlineBanner');
  if (!banner) return;
  banner.classList.toggle('show', !navigator.onLine);
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

/* ===================== SERVICE WORKER (auto-update) =====================
   Moved to js/sw-register.js (shared, included on every page: index.html,
   blog.html, track-order.html, admin.html) so ALL pages actively check for
   updates — not just index.html. Previously this lived only here, which
   meant the installed PWA app never discovered new admin.js versions when
   opened straight into admin.html. See js/sw-register.js. */

/* ===================== VIDEO SECTION (owner-configurable) ===================== */
// Add real YouTube video IDs here (the part after "v=" in a normal YouTube URL).
// Leave a slot as null to keep showing the "add your video" placeholder.
// This uses YouTube's free iframe embed — no API key or paid plan needed.
const VIDEO_EMBEDS = {
  1: null, // e.g. 'dQw4w9WgXcQ'
  2: null,
  3: null
};
function renderVideoSlots() {
  document.querySelectorAll('.video-placeholder[data-slot]').forEach(el => {
    const id = VIDEO_EMBEDS[el.dataset.slot];
    if (id) {
      el.outerHTML = `<div class="video-frame-wrap"><iframe src="https://www.youtube.com/embed/${encodeURIComponent(id)}" loading="lazy" allowfullscreen title="Agnes Herbal Supplements video"></iframe></div>`;
    }
  });
}

/* ===================== APP UPDATE PUSH (kupokea + kuthibitisha) ===================== */
// deviceId ya kudumu, ya nasibu, iliyohifadhiwa kwenye kivinjari hiki — inatumika
// TU kuthibitisha "kifaa hiki kimepokea toleo fulani la update", hakuna taarifa
// nyingine yoyote ya binafsi inayohusishwa nayo.
function ahsGetDeviceId() {
  let id = lsGet('ahs_device_id', null);
  if (!id) {
    id = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    lsSet('ahs_device_id', id);
  }
  return id;
}
/* ===================== CLOUD FEATURES: washa mara Firebase ikiwa tayari ===================== */
// Firebase sasa inapakia isiyozuia ukurasa (angalia index.html) — hivyo
// "cloudListenProducts" n.k. huenda hazipo bado wakati DOMContentLoaded
// inapopiga. initAllCloudFeatures() ni salama kuitwa mara nyingi (guard ya
// _cloudFeaturesStarted) — tunajaribu mara moja papo hapo (kwa mtandao wa
// haraka), kisha tena pindi tukio 'ahsCloudReady' likitokea (kwa mtandao wa
// taratibu, hilo laweza kutokea sekunde kadhaa baadaye).
let _cloudFeaturesStarted = false;
function initAllCloudFeatures() {
  if (_cloudFeaturesStarted) return;
  if (typeof cloudListenProducts !== 'function') return; // Firebase bado haijapakia
  _cloudFeaturesStarted = true;
  initCloudProductSync();
  initCloudCustomProductsSync();
  initCloudHomepageSettingsSync();
  initAppVersionWatch();
  initVisitorPresenceHeartbeat();
  initLiveBadge();
}
function initCloudSyncWhenReady() {
  initAllCloudFeatures();
  document.addEventListener('ahsCloudReady', initAllCloudFeatures, { once: true });
}

function initAppVersionWatch() {
  if (typeof cloudListenAppVersion !== 'function') return;
  const deviceId = ahsGetDeviceId();
  const lastAcked = lsGet('ahs_last_acked_version', null);
  cloudListenAppVersion((data) => {
    if (!data || !data.version) return;
    // Lazimisha Service Worker ikague sasa hivi (badala ya kusubiri saa moja
    // ijayo) mara tu admin anapotuma update mpya — hii ndiyo inayofanya
    // update "ifike" kwa vifaa vyote vilivyo wazi/mtandaoni haraka zaidi.
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
      navigator.serviceWorker.getRegistration().then(reg => { if (reg) reg.update(); });
    }
    if (typeof cloudAckAppVersion === 'function') {
      cloudAckAppVersion(data.version, deviceId).then(ok => {
        if (ok) lsSet('ahs_last_acked_version', data.version);
      });
    }
  });
}

/* ===================== VISITOR PRESENCE (kwa ajili ya "wangapi wapo online" admin) ===================== */
// Inatumia deviceId ile ile ya kudumu iliyoko juu (ahsGetDeviceId) — haihifadhi
// jina, eneo, wala taarifa nyingine yoyote ya binafsi, ni "kifaa hiki bado
// kipo hapa" tu, kila baada ya sekunde 25.
function initVisitorPresenceHeartbeat() {
  if (typeof cloudHeartbeatPresence !== 'function') return;
  const deviceId = ahsGetDeviceId();
  cloudHeartbeatPresence(deviceId);
  setInterval(() => cloudHeartbeatPresence(deviceId), 25000);
}

/* ===================== LANG CHANGE HOOK ===================== */
function onLangChanged() {
  renderFilterControls();
  renderGrid();
  renderTestimonials();
  renderFaq();
  updateCartUI();
  updateWishlistCompareBtns();
  renderRecentlyViewed();
  if (currentProduct) openProduct(currentProduct.id);
}

/* ===================== SCROLL TO RESULTS baada ya Chuja/Panga (fix: mteja alikuwa
   akichagua Sort/Filter/Chip lakini matokeo halisi (#gallery-wrap, chini ya Flash Sale)
   yalibaki mbali chini ya skrini — "resultsCount" pekee ndiyo iliyokuwa ikibadilika
   papo hapo juu, hivyo mteja alidhani hakuna kilichotokea mpaka a-scroll mwenyewe.
   Sasa: baada ya kila mabadiliko ya Kundi/Bei/Panga/Health-goal/Chip, ukurasa
   unateleza kiotomatiki (smooth) hadi sehemu ya "Bidhaa Zetu Zote" (matokeo halisi
   yaliyochujwa), ukizingatia urefu wa header ya sticky isifunike sehemu ya juu. ===================== */
function ahsScrollToResults() {
  const target = document.getElementById('bidhaa') || document.getElementById('gallery-wrap');
  if (!target) return;
  const header = document.getElementById('top');
  const headerH = header ? header.getBoundingClientRect().height : 0;
  const y = target.getBoundingClientRect().top + window.pageYOffset - headerH - 10;
  window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
}

/* ===================== INIT ===================== */
function initFilterEvents() {
  document.getElementById('categorySelect').addEventListener('change', (e) => {
    filterState.category = e.target.value;
    filterState.keywordSet = null;
    const hgReset = document.getElementById('health-goal-filter');
    if (hgReset) hgReset.value = 'all';
    renderGrid();
    ahsScrollToResults();
  });
  document.getElementById('priceSelect').addEventListener('change', (e) => { filterState.price = e.target.value; renderGrid(); ahsScrollToResults(); });
  document.getElementById('sortSelect').addEventListener('change', (e) => { filterState.sort = e.target.value; renderGrid(); ahsScrollToResults(); });
  // Health Goal filter (Search & Health Filters upgrade) — inatumia HEALTH_GOALS
  // iliyopo tayari kwenye js/search-v2.js (keywords zilezile zinazotumika kwenye
  // "🎯 Tafuta kwa Lengo" ndani ya search dropdown), ili kusiwe na orodha mbili
  // tofauti za keywords za jambo lilelile. Haifanyi reload ya ukurasa.
  const hgSelect = document.getElementById('health-goal-filter');
  if (hgSelect) {
    hgSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'all') {
        filterState.keywordSet = null;
      } else if (typeof HEALTH_GOALS !== 'undefined') {
        const goal = HEALTH_GOALS.find(g => g.key === val);
        filterState.keywordSet = goal ? goal.keywords.slice() : null;
      }
      filterState.search = '';
      filterState.category = 'all';
      const catSel = document.getElementById('categorySelect');
      if (catSel) catSel.value = 'all';
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';
      renderGrid();
      ahsScrollToResults();
    });
  }
}

/* ===================== MOBILE NAV DRAWER (additive UI/UX pass) ===================== */
function initNavDrawer() {
  const toggle = document.getElementById('menuToggle');
  const drawer = document.getElementById('navDrawer');
  const overlay = document.getElementById('navDrawerOverlay');
  const closeBtn = document.getElementById('navDrawerClose');
  if (!toggle || !drawer || !overlay) return;
  const open = () => { drawer.classList.add('open'); overlay.classList.add('open'); };
  const close = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); };
  toggle.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', close);
  drawer.querySelectorAll('[data-drawer-link]').forEach(a => a.addEventListener('click', close));
}

/* ===================== LIVE BADGE (header) — reuses existing meta/presence data ===================== */
function initLiveBadge() {
  if (typeof cloudListenPresence !== 'function') return;
  const badge = document.getElementById('liveBadge');
  if (!badge) return;
  cloudListenPresence((data) => {
    badge.classList.toggle('show', !!(data && data.online));
  });
}

/* ===================== CATEGORY CHIPS (mirrors #categorySelect — same filterState, additive UI) ===================== */
function renderCategoryChips() {
  const wrap = document.getElementById('categoryChips');
  if (!wrap) return;
  const chips = [`<button type="button" class="cat-chip ${filterState.category === 'all' ? 'active' : ''}" data-chip="all">${t('filter_all')}</button>`]
    .concat(CATEGORIES.map(c => {
      const slug = slugify(c);
      return `<button type="button" class="cat-chip ${filterState.category === slug ? 'active' : ''}" data-chip="${slug}">${escapeHtml(c)}</button>`;
    }));
  wrap.innerHTML = chips.join('');
  wrap.querySelectorAll('[data-chip]').forEach(btn => {
    btn.addEventListener('click', () => {
      filterState.category = btn.dataset.chip;
      filterState.keywordSet = null;
      const hgReset = document.getElementById('health-goal-filter');
      if (hgReset) hgReset.value = 'all';
      renderFilterControls();
      renderCategoryChips();
      renderGrid();
      ahsScrollToResults();
    });
  });
}

/* ===================== NEW PRODUCTS (dateAdded newest-first) — self-contained, own event scope ===================== */
function renderNewProducts() {
  const section = document.getElementById('newProductsSection');
  const grid = document.getElementById('newProductsGrid');
  if (!section || !grid) return;
  const list = allBaseProducts()
    .filter(p => p.dateAdded)
    .slice()
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 12);
  if (!list.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  grid.innerHTML = list.map(productCardHTML).join('');
  // Scoped binding — HAITUMII bindGridEvents() ya kimataifa ili kuepuka
  // vitufe kubofya mara mbili wakati renderGrid() ya orodha kuu inapoendesha
  // upya (grid hii haiiharibiwi/kuandikwa upya kila mara kama gallery-wrap).
  grid.querySelectorAll('.pg-item').forEach(card => {
    const id = parseInt(card.dataset.id, 10);
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-wl],[data-cmp],[data-qcart],[data-qbuy]')) return;
      openProduct(id);
    });
  });
  grid.querySelectorAll('[data-wl]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggleWishlist(parseInt(btn.dataset.wl, 10)); });
  });
  grid.querySelectorAll('[data-cmp]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggleCompare(parseInt(btn.dataset.cmp, 10)); });
  });
  grid.querySelectorAll('[data-qcart]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); cardAddToCart(parseInt(btn.dataset.qcart, 10)); });
  });
  grid.querySelectorAll('[data-qbuy]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); cardBuyNow(parseInt(btn.dataset.qbuy, 10)); });
  });
  if (typeof initLazyObserver === 'function') initLazyObserver();
}

/* ===================== ADMIN SECRET TAP (5x kwenye kitufe kisichoonekana) ===================== */
function initAdminSecretTap() {
  const btn = document.getElementById('headerAdminBtn');
  if (!btn) return;
  let taps = 0;
  let resetTimer = null;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    taps++;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { taps = 0; }, 3000);
    if (taps >= 5) {
      taps = 0;
      window.location.href = 'admin.html';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavDrawer();
  initAdminSecretTap();
  applyTheme();
  applyLang();
  document.getElementById('wishlistCount').textContent = wishlist.length;
  document.getElementById('compareCount').textContent = compareList.length;
  renderFilterControls();
  showSkeletonThenRender();
  initFilterEvents();
  initSearch();
  renderRecentlyViewed();
  renderTestimonials();
  renderFaq();
  initBeforeAfter();
  renderVideoSlots();
  initContactForm();
  initNewsletter();
  initShareButtons();
  updateCartUI();
  updateOnlineStatus();
  initDisplayMode();
  initImageSearch();
  initCloudSyncWhenReady();
  initImageZoom();
  initSwipeGallery();
  window.addEventListener('resize', () => { if (currentProduct) updateStickyBuyBar(currentProduct); });
});

/* ===================== IMAGE SLIDER (product modal) ===================== */
let pmImages = [];
let pmIndex = 0;
function renderModalSlider(product) {
  pmImages = (product.images && product.images.length) ? product.images.slice() : ['images/' + product.file];
  // put the chosen cover image first, if set
  if (product.cover && pmImages.includes(product.cover)) {
    pmImages = [product.cover, ...pmImages.filter(u => u !== product.cover)];
  }
  pmIndex = 0;
  const track = document.getElementById('pmSlideTrack');
  track.innerHTML = pmImages.map((src, i) => `<img src="${src}" alt="" class="${i===0?'pm-active':''}">`).join('');
  const dots = document.getElementById('pmDots');
  const multi = pmImages.length > 1;
  document.getElementById('pmPrev').style.display = multi ? 'flex' : 'none';
  document.getElementById('pmNext').style.display = multi ? 'flex' : 'none';
  dots.innerHTML = multi ? pmImages.map((_, i) => `<span class="${i===0?'active':''}" data-dot="${i}"></span>`).join('') : '';
  dots.querySelectorAll('[data-dot]').forEach(d => d.addEventListener('click', () => pmGoTo(parseInt(d.dataset.dot, 10))));
}
function pmGoTo(i) {
  pmIndex = ((i % pmImages.length) + pmImages.length) % pmImages.length;
  document.querySelectorAll('#pmSlideTrack img').forEach((img, idx) => img.classList.toggle('pm-active', idx === pmIndex));
  document.querySelectorAll('#pmDots span').forEach((d, idx) => d.classList.toggle('active', idx === pmIndex));
}
function pmSlide(dir) { pmGoTo(pmIndex + dir); }

/* ===================== WHOLESALE / MOQ TIER TABLE (Alibaba style) ===================== */
function renderMoqTable(product) {
  const p = product.prices;
  const rows = [
    { range: t('moq_range_1'), price: p.retail, moq: null },
    { range: t('moq_range_2'), price: p.w5, moq: 5 },
    { range: t('moq_range_3'), price: p.w10, moq: 10 },
  ];
  let stockNote = '';
  if (typeof product.stock === 'number') {
    if (product.stock <= 0) stockNote = `<p style="color:#d64545; font-weight:700; font-size:.8rem; margin-top:8px;">${t('stock_out_note')}</p>`;
    else if (product.stock <= 5) stockNote = `<p style="color:#8a5a00; font-weight:700; font-size:.8rem; margin-top:8px;">${t('stock_low_note', { n: product.stock })}</p>`;
  }
  document.getElementById('moqTableWrap').innerHTML = `
    <table class="moq-table">
      <thead><tr><th>Idadi</th><th>Bei/kipande</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><td>${r.range}${r.moq ? `<span class="moq-badge">MOQ ${r.moq}pcs</span>` : ''}</td><td><b>${fmt(r.price)}</b></td></tr>`).join('')}
      </tbody>
    </table>${stockNote}`;
}

/* ===================== DISPLAY MODE: PORTRAIT / LANDSCAPE ===================== */
function initDisplayMode() {
  const saved = localStorage.getItem('ahs_display_mode') || 'landscape';
  applyDisplayMode(saved);
}
function setDisplayMode(mode) {
  localStorage.setItem('ahs_display_mode', mode);
  applyDisplayMode(mode);
}
function applyDisplayMode(mode) {
  const wrap = document.getElementById('gallery-wrap');
  if (wrap) { wrap.classList.remove('mode-portrait', 'mode-landscape'); wrap.classList.add('mode-' + mode); }
  document.querySelectorAll('#displayModeToggle button').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
}

/* ===================== SEARCH BY IMAGE (real AI visual search) ===================== */
// Hii sasa inatumia AI ya kweli (TensorFlow.js + MobileNet, inayosoma "maudhui" ya
// picha, si rangi za pixel tu) — inashuka bure kutoka CDN, inafanya kazi ndani ya
// kivinjari cha mteja, hakuna gharama wala akaunti inayohitajika. Angalia js/ai-vision.js.
function getProductSignatures(onProgress) {
  return new Promise((resolve) => {
    const cached = lsGet('ahs_img_embeddings_v1', null);
    if (cached && cached.length === PRODUCTS.length) { resolve(cached); return; }
    const sigs = new Array(PRODUCTS.length);
    let loaded = 0;
    PRODUCTS.forEach((p, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const done = (vec) => {
        sigs[idx] = vec; loaded++;
        if (onProgress) onProgress(loaded, PRODUCTS.length);
        if (loaded === PRODUCTS.length) { lsSet('ahs_img_embeddings_v1', sigs); resolve(sigs); }
      };
      img.onload = () => getEmbedding(img).then(done).catch(() => done(new Array(1024).fill(0)));
      img.onerror = () => done(new Array(1024).fill(0));
      img.src = 'images/' + p.file;
    });
  });
}
function initImageSearch() {
  const btn = document.getElementById('imgSearchBtn');
  const input = document.getElementById('imgSearchInput');
  if (!btn || !input) return;
  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const banner = document.getElementById('imgSearchBanner');
    banner.style.display = 'flex';
    banner.className = 'img-search-banner';
    banner.innerHTML = `<span>🤖 ${t('searching_similar')}</span>`;
    const reader = new FileReader();
    reader.onload = async () => {
      const uploaded = new Image();
      uploaded.onload = async () => {
        try {
          const uploadedSig = await getEmbedding(uploaded);
          const sigs = await getProductSignatures((done, total) => {
            banner.innerHTML = `<span>🤖 ${t('searching_similar')} (${done}/${total})</span>`;
          });
          const ranked = PRODUCTS.map((p, idx) => ({ p, score: cosineSimilarity(uploadedSig, sigs[idx] || []) }))
            .sort((a, b) => b.score - a.score).slice(0, 12).map(r => r.p.id);
          imageSearchResultIds = ranked;
          filterState.imageSearch = true;
          renderGrid();
          banner.innerHTML = `<span>🤖 ${t('showing_similar')}</span><button onclick="clearImageSearch()">${t('close')} ✕</button>`;
        } catch (e) {
          console.warn('AI image search failed', e);
          banner.innerHTML = `<span>⚠️ ${t('ai_unavailable')}</span><button onclick="clearImageSearch()">${t('close')} ✕</button>`;
        }
      };
      uploaded.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
let imageSearchResultIds = [];
function clearImageSearch() {
  filterState.imageSearch = false;
  document.getElementById('imgSearchBanner').style.display = 'none';
  document.getElementById('imgSearchInput').value = '';
  renderGrid();
}

/* ===================== CLOUD SYNC: product overrides (images/caption/MOQ) ===================== */
function initCloudProductSync() {
  if (typeof cloudListenProducts !== 'function') return;
  cloudListenProducts((cloudMap) => {
    // merge cloud data into local overrides so getEffectiveProduct() sees it,
    // then re-render whatever is currently visible.
    Object.keys(cloudMap).forEach(id => {
      productOverrides[id] = { ...(productOverrides[id] || {}), ...cloudMap[id] };
    });
    lsSet('ahs_product_overrides', productOverrides);
    cloudRerenderNow();
  });
}

/* ===================== CLOUD SYNC: mpangilio wa duka (ofa za kundi + bidhaa za leo) ===================== */
function initCloudHomepageSettingsSync() {
  if (typeof cloudListenHomepageSettings !== 'function') return;
  cloudListenHomepageSettings((data) => {
    homepageSettings = { featuredToday: (data && data.featuredToday) || [], categoryOffers: (data && data.categoryOffers) || {} };
    lsSet('ahs_homepage_settings', homepageSettings);
    cloudRerenderNow();
  });
}

/* ===================== CLOUD SYNC: bidhaa mpya (customProducts) ===================== */
// Bidhaa alizoongeza admin kwenye tab "➕ Ongeza Bidhaa" (admin.html) zinasomwa
// papo hapo hapa na kuunganishwa na orodha kuu (PRODUCTS) ili ionekane dukani,
// kwenye utafutaji, filta za kundi, na ukurasa wa bidhaa — bila kuhitaji
// kuhariri js/products-data.js wala kutuma faili kwa mtu yeyote.
function initCloudCustomProductsSync() {
  if (typeof cloudListenCustomProducts !== 'function') return;
  // Onyesha kiashiria mara moja ili mteja ajue kuna bidhaa zaidi zinapakia
  // mtandaoni (badala ya kudhani zoezi la orodha limekwisha), kisha kificha
  // mara data ya kwanza ikifika (hata kama ni orodha tupu).
  const noteEl = document.getElementById('cloudSyncNote');
  if (noteEl && typeof AHS_CLOUD_READY !== 'undefined' && AHS_CLOUD_READY) {
    noteEl.style.display = 'block';
  }
  let firstSnapshot = true;
  cloudListenCustomProducts((list) => {
    if (firstSnapshot) {
      firstSnapshot = false;
      if (noteEl) noteEl.style.display = 'none';
    }
    CUSTOM_PRODUCTS = list;
    CUSTOM_PRODUCTS_MAP = {};
    list.forEach(p => {
      CUSTOM_PRODUCTS_MAP[p.id] = p;
      // ikiwa admin aliandika kundi jipya lisilo kwenye orodha ya awali, liongeze
      // kwenye CATEGORIES ili lionekane kwenye kichujio cha "Kundi" pia.
      if (p.category && !CATEGORIES.includes(p.category)) CATEGORIES.push(p.category);
    });
    _searchIndex = null; // lazimisha utafutaji ujengwe upya ujumuishe bidhaa mpya
    renderFilterControls();
    cloudRerenderNow();
  });
  // Usalama: hata mtandao ukiwa mbaya sana, ficha kiashiria baada ya sekunde
  // 20 kadri kisibaki milele (mteja anaweza kuendelea kutumia duka bila wasiwasi).
  setTimeout(() => { if (noteEl) noteEl.style.display = 'none'; }, 20000);
}

/* ===================== "NYUMBANI" (HOME) INARUDISHA MPANGILIO WA AWALI (additive) =====================
   Kabla: mteja akichagua Sort/Filter/Search kwenye "Our Products", kisha akabonyeza
   "Nyumbani" (logo, drawer, au bottom-nav — zote href="#top"), ukurasa ulisogea juu
   TU — Sort/Filter aliyokuwa nayo iliendelea kubaki, hivyo hakuwa na njia ya "kurudi"
   kwenye mpangilio wa admin (Recommended/New Products daima yamekuwa fasta — sehemu
   pekee inayobadilika kwa Sort/Filter ya mteja ni "Our Products").
   Sasa: kubonyeza "Nyumbani" kunafuta Search/Category/Price/Sort/ImageSearch ya mteja
   na kurudisha "Our Products" kwenye mpangilio wa asili (admin), kisha kusogea juu. */
function resetToHomeDefaults() {
  filterState.search = '';
  filterState.category = 'all';
  filterState.price = 'all';
  filterState.sort = 'default';
  filterState.keywordSet = null;
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  if (filterState.imageSearch && typeof clearImageSearch === 'function') {
    clearImageSearch(); // yenyewe inaita renderGrid()
  }
  renderFilterControls();
  renderCategoryChips();
  renderGrid();
  // Isitegemee tu \"jump\" ya asili ya kivinjari kwenda #top (baadhi ya simu/vivinjari
  // haziifanyi vizuri ikiwa event nyingine ipo kwenye anchor hiyo hiyo) — hakikisha
  // ukurasa unateleza (smooth) juu kabisa wazi kila wakati.
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href="#top"]').forEach(a => {
    a.addEventListener('click', resetToHomeDefaults);
  });
});
// Fix: mteja akiwa amechuja (mf. "Juice" tu) kisha akafungua bidhaa na kubonyeza
// kitufe cha NYUMA (back) cha simu/kivinjari kurudi kwenye ukurasa mkuu, baadhi ya
// vivinjari vinarudisha ukurasa kutoka kwenye "bfcache" bila kupitia DOMContentLoaded
// tena — mpangilio wa awali wa Chuja/Panga ulibaki ule ule uliochujwa. Sasa: tukigundua
// ukurasa umerudishwa kutoka bfcache (event.persisted), turudishe Chuja/Panga kwenye "Zote".
window.addEventListener('pageshow', (e) => {
  if (e.persisted) resetToHomeDefaults();
});

/* ===================== FILTER PANEL TOGGLE (additive) =====================
   Kitufe "⋮ Chuja / Panga" kinafungua/kufunga paneli ya Category/Bei/Panga/
   Health Problems iliyokuwa ikionekana daima kabla — sasa imefichwa kwa
   default ili kuachia nafasi zaidi kwenye skrini. */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('filterToggleBtn');
  const panel = document.getElementById('filterPanel');
  if (!btn || !panel) return;
  btn.addEventListener('click', () => {
    const isHidden = panel.hasAttribute('hidden');
    if (isHidden) { panel.removeAttribute('hidden'); btn.setAttribute('aria-expanded', 'true'); }
    else { panel.setAttribute('hidden', ''); btn.setAttribute('aria-expanded', 'false'); }
  });
});
