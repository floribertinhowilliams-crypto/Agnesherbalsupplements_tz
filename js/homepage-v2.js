// Agnes Herbal Supplements — Homepage Upgrade v2
// New homepage sections only: hero slider, flash sale, daily deals, best
// sellers, new arrivals, trending, recently added, shop by category,
// stats counter, testimonials v2, instagram gallery, back-to-top.
// Relies on globals already defined in js/app.js, js/i18n.js,
// js/products-data.js and js/content-data.js (loaded before this file).

/* ===================== SMALL LOCAL HELPERS ===================== */
function hp_fmt(n) {
  return (typeof fmt === 'function') ? fmt(n) : ('Tsh ' + Math.round(n).toLocaleString('en-US'));
}
function hp_esc(str) {
  return (typeof escapeHtml === 'function') ? escapeHtml(str) : String(str);
}
function hp_products() {
  // Respect admin overrides / hidden products if that machinery is present.
  return (typeof visibleProducts === 'function') ? visibleProducts() : PRODUCTS;
}
function hp_openProduct(id) {
  if (typeof openProduct === 'function') openProduct(id);
}

/* ===================== IMAGE SRC HELPER ===================== */
// p.cover can be either a local path (e.g. "images/xxx.jpg") OR a full
// Firebase Storage URL (e.g. "https://firebasestorage.googleapis.com/...")
// when the admin has uploaded a custom photo. Previously this code always
// stripped/re-prefixed "images/", which broke full URLs (turning them into
// "images/https://..." — a dead link) and made uploaded photos disappear
// from grids even though the product page itself displayed them fine.
function hpImgSrc(p) {
  if (p.cover) {
    return /^(https?:|data:)/i.test(p.cover) ? p.cover : 'images/' + p.cover.replace('images/', '');
  }
  // Admin-added products don't set "cover" (see js/admin.js) — the first
  // entry in "images" is the profile/cover picture everywhere else on the
  // site. Missing this fallback made every new admin-added product show a
  // blank card in Flash Sale / Best Sellers / New Arrivals / Trending,
  // even though it displayed fine on the product page and main catalog.
  if (p.images && p.images.length) {
    const img = p.images[0];
    return /^(https?:|data:)/i.test(img) ? img : 'images/' + img.replace('images/', '');
  }
  return 'images/' + p.file;
}

/* ===================== GENERIC PRODUCT CARD (matches .pg-item look) ===================== */
function hpCardHTML(p, opts) {
  opts = opts || {};
  // Ofa ya kundi iliyowekwa na admin ("🎯 Mpangilio wa Duka") tayari ipo
  // ndani ya bei halisi ya p.prices — tumia hiyo kuonyesha badge/strikethrough
  // ya kweli badala ya asilimia bandia, isipokuwa sehemu hii (mfano Flash Sale)
  // imepitisha dealPct yake yenyewe kwa makusudi.
  const dealPct = opts.dealPct || p.dealPct || 0;
  const badges = [];
  if (dealPct) badges.push(`<span class="deal-badge">-${dealPct}%</span>`);
  else if (p.bestseller) badges.push(`<span class="pg-badge best">🔥 Best</span>`);
  const isNew = (new Date() - new Date(p.dateAdded)) / (1000 * 60 * 60 * 24) < 20;
  if (!dealPct && isNew) badges.push(`<span class="pg-badge new">✨ New</span>`);

  let priceHTML = `<em>${hp_fmt(p.prices.retail)}</em>`;
  if (dealPct) {
    const was = (opts.dealPct && p.origPrices === undefined)
      ? Math.round((p.prices.retail * (100 / (100 - dealPct))) / 500) * 500
      : (p.origPrices ? p.origPrices.retail : Math.round((p.prices.retail * (100 / (100 - dealPct))) / 500) * 500);
    priceHTML = `<div class="deal-price-row"><span class="was">${hp_fmt(was)}</span><span class="now">${hp_fmt(p.prices.retail)}</span></div>`;
  }

  return `
    <div class="pg-item reveal" data-hpid="${p.id}">
      <div class="pg-badges">${badges.join('')}</div>
      <div class="pg-img-wrap">
        <img src="${hpImgSrc(p)}" alt="${hp_esc(p.name)}" loading="lazy">
      </div>
      <div class="pg-caption">
        <div class="pg-rating">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))} <span class="count">(${p.reviewCount})</span></div>
        <b>${hp_esc(p.name)}</b><span>${hp_esc(translateEffect(p.effect))}</span>
        ${priceHTML}
      </div>
      <div class="pg-quickbar">
        <button type="button" class="qb-shopnow" data-qbuy="${p.id}">
          <span class="qb-shopnow-label">Shop Now</span>
          <span class="qb-shopnow-ico" aria-hidden="true">🛒</span>
        </button>
      </div>
    </div>`;
}

function hpBindCards(container) {
  if (!container) return;
  container.querySelectorAll('[data-hpid]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-qcart],[data-qbuy]')) return;
      hp_openProduct(parseInt(card.dataset.hpid, 10));
    });
  });
  container.querySelectorAll('[data-qcart]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); if (typeof cardAddToCart === 'function') cardAddToCart(parseInt(btn.dataset.qcart, 10)); });
  });
  container.querySelectorAll('[data-qbuy]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); if (typeof cardBuyNow === 'function') cardBuyNow(parseInt(btn.dataset.qbuy, 10)); });
  });
  if (typeof initRevealObserver === 'function') initRevealObserver();
}

/* ===================== HERO SLIDER ===================== */
let hsIndex = 0;
let hsTimer = null;
function hsRender() {
  const slides = document.querySelectorAll('#hsTrack .hs-slide');
  const dotsWrap = document.getElementById('hsDots');
  if (!slides.length || !dotsWrap) return;
  if (!dotsWrap.dataset.built) {
    dotsWrap.innerHTML = Array.from(slides).map((_, i) => `<span data-i="${i}"></span>`).join('');
    dotsWrap.dataset.built = '1';
    dotsWrap.querySelectorAll('span').forEach(dot => {
      dot.addEventListener('click', () => hsGoTo(parseInt(dot.dataset.i, 10)));
    });
  }
  slides.forEach((s, i) => s.classList.toggle('active', i === hsIndex));
  dotsWrap.querySelectorAll('span').forEach((d, i) => d.classList.toggle('active', i === hsIndex));
}
function hsGoTo(i) {
  const slides = document.querySelectorAll('#hsTrack .hs-slide');
  if (!slides.length) return;
  hsIndex = (i + slides.length) % slides.length;
  hsRender();
  hsRestartAutoplay();
}
function hsMove(dir) { hsGoTo(hsIndex + dir); }
function hsRestartAutoplay() {
  if (hsTimer) clearInterval(hsTimer);
  hsTimer = setInterval(() => hsGoTo(hsIndex + 1), 5500);
}
function initHeroSlider() {
  const section = document.getElementById('heroSlider');
  if (!section) return;
  hsRender();
  hsRestartAutoplay();
  section.addEventListener('mouseenter', () => { if (hsTimer) clearInterval(hsTimer); });
  section.addEventListener('mouseleave', hsRestartAutoplay);
}

/* ===================== FEATURED TODAY (Admin curated, "🎯 Mpangilio wa Duka") ===================== */
// Bidhaa admin alizochagua ziwe za kwanza kuonekana LEO, kwa mfuatano
// alioupanga mwenyewe kwenye admin.html. Sehemu nzima inajificha kiotomatiki
// ikiwa admin hajachagua bidhaa yoyote — haiathiri mpangilio wa kawaida.
function renderFeaturedToday() {
  const section = document.getElementById('featuredToday');
  const grid = document.getElementById('featuredTodayGrid');
  if (!section || !grid) return;
  const list = (typeof featuredTodayProducts === 'function') ? featuredTodayProducts() : [];
  if (!list.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  grid.innerHTML = list.map(p => hpCardHTML(p)).join('');
  hpBindCards(grid);
}

/* ===================== FLASH SALE ===================== */
function renderFlashSale() {
  const grid = document.getElementById('flashSaleGrid');
  if (!grid) return;
  const list = hp_products().filter(p => p.bestseller).slice(0, 8);
  grid.innerHTML = list.map(p => hpCardHTML(p, { dealPct: 20 })).join('');
  hpBindCards(grid);
}
function startFlashCountdown() {
  const hrsEl = document.getElementById('fsHrs'), minEl = document.getElementById('fsMin'), secEl = document.getElementById('fsSec');
  if (!hrsEl) return;
  function tick() {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    let diff = Math.max(0, end - now);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    hrsEl.textContent = String(h).padStart(2, '0');
    minEl.textContent = String(m).padStart(2, '0');
    secEl.textContent = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

/* ===================== DAILY DEALS (rotates by day of year) ===================== */
function renderDailyDeals() {
  const grid = document.getElementById('dailyDealsGrid');
  if (!grid) return;
  const all = hp_products();
  if (!all.length) return;
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const start = dayOfYear % all.length;
  const list = [];
  for (let i = 0; i < 8; i++) list.push(all[(start + i * 7) % all.length]);
  grid.innerHTML = list.map(p => hpCardHTML(p, { dealPct: 15 })).join('');
  hpBindCards(grid);
}

/* ===================== BEST SELLERS ===================== */
function renderBestSellers() {
  const grid = document.getElementById('bestSellersGrid');
  if (!grid) return;
  const list = hp_products().filter(p => p.bestseller).sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 10);
  grid.innerHTML = list.map(p => hpCardHTML(p)).join('');
  hpBindCards(grid);
}

/* ===================== NEW ARRIVALS ===================== */
function renderNewArrivals() {
  const grid = document.getElementById('newArrivalsGrid');
  if (!grid) return;
  const list = [...hp_products()].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 10);
  grid.innerHTML = list.map(p => hpCardHTML(p)).join('');
  hpBindCards(grid);
}

/* ===================== TRENDING (by review count / rating) ===================== */
function renderTrending() {
  const grid = document.getElementById('trendingGrid');
  if (!grid) return;
  const list = [...hp_products()].sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating)).slice(0, 10);
  grid.innerHTML = list.map(p => hpCardHTML(p)).join('');
  hpBindCards(grid);
}

/* ===================== RECENTLY ADDED (horizontal strip) ===================== */
function renderRecentlyAdded() {
  const strip = document.getElementById('recentlyAddedStrip');
  if (!strip) return;
  const list = [...hp_products()].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(10, 26);
  strip.innerHTML = list.map(p => `
    <div class="ra-card" data-hpid="${p.id}">
      <img src="${p.cover || (p.images && p.images[0]) || ('images/' + p.file)}" alt="${hp_esc(p.name)}" loading="lazy">
      <div class="ra-card-body">
        <b>${hp_esc(p.name)}</b>
        <em>${hp_fmt(p.prices.retail)}</em>
        <span class="ra-date">${p.dateAdded}</span>
      </div>
    </div>`).join('');
  hpBindCards(strip);
}

/* ===================== SHOP BY CATEGORY ===================== */
function renderShopByCategory() {
  const grid = document.getElementById('shopByCategoryGrid');
  if (!grid || typeof CATEGORIES === 'undefined') return;
  const all = hp_products();
  grid.innerHTML = CATEGORIES.map(catName => {
    const slug = (typeof slugify === 'function') ? slugify(catName) : catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const items = all.filter(p => p.catSlug === slug);
    const thumb = items[0] ? (items[0].cover || ('images/' + items[0].file)) : 'assets/images/logo.png';
    return `
      <div class="cat-card" data-cat="${slug}">
        <img src="${thumb}" alt="${hp_esc(catName)}" loading="lazy">
        <div class="cat-card-body">
          <b>${hp_esc(catName)}</b>
          <span>${items.length} ${t('products_word')}</span>
        </div>
      </div>`;
  }).join('');
  grid.querySelectorAll('[data-cat]').forEach(card => {
    card.addEventListener('click', () => goToCategorySlug(card.dataset.cat));
  });
}
function goToCategorySlug(slug) {
  if (typeof filterState !== 'undefined') filterState.category = slug;
  const sel = document.getElementById('categorySelect');
  if (sel) sel.value = slug;
  if (typeof renderGrid === 'function') renderGrid();
  const target = document.getElementById('bidhaa');
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}

/* ===================== STATISTICS COUNTER (animated on scroll) ===================== */
function initStatsCounter() {
  const nums = document.querySelectorAll('.sc-num[data-target]');
  if (!nums.length) return;
  let animated = false;
  function animate() {
    if (animated) return;
    animated = true;
    nums.forEach(el => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const startTime = performance.now();
      function step(now) {
        const progress = Math.min(1, (now - startTime) / dur);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString('en-US') + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  const section = document.getElementById('statsCounter');
  if (!section) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { animate(); obs.disconnect(); } });
  }, { threshold: 0.3 });
  obs.observe(section);
}

/* ===================== TESTIMONIALS v2 ===================== */
function renderTestimonialsV2() {
  const track = document.getElementById('testimonialsV2Track');
  if (!track || typeof REVIEW_POOL === 'undefined') return;
  const lang = (typeof getLang === 'function') ? getLang() : 'sw';
  track.innerHTML = REVIEW_POOL.map(r => {
    const initials = r.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const text = pickLangText(r, lang);
    return `
      <div class="tv2-card">
        <div class="tv2-top">
          <div class="tv2-avatar">${initials}</div>
          <div>
            <div class="stars">★★★★★</div>
            <b>${hp_esc(r.name)}</b>
          </div>
        </div>
        <p>"${hp_esc(text)}"</p>
      </div>`;
  }).join('');
}

/* ===================== INSTAGRAM GALLERY ===================== */
function renderInstagramGallery() {
  const grid = document.getElementById('instagramGrid');
  if (!grid) return;
  const all = hp_products();
  if (!all.length) return;
  const igFiles = [10, 40, 55, 81, 107, 145, 200, 250, 262, 275, 20, 90].map(i => all[i % all.length]);
  const link = 'https://www.instagram.com/agnes_herb_store?igsi=MXd3dmdhamJjcXVteA==';
  grid.innerHTML = igFiles.map(p => `
    <a class="ig-item" href="${link}" target="_blank" rel="noopener" title="${hp_esc(p.name)}">
      <img src="${p.cover || (p.images && p.images[0]) || ('images/' + p.file)}" alt="${hp_esc(p.name)}" loading="lazy">
      <div class="ig-overlay">📷</div>
    </a>`).join('');
}

/* ===================== BACK TO TOP ===================== */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  });
}

/* ===================== LANG CHANGE HOOK (chained, non-destructive) ===================== */
const hp_prevOnLangChanged = (typeof onLangChanged === 'function') ? onLangChanged : null;
onLangChanged = function () {
  if (hp_prevOnLangChanged) hp_prevOnLangChanged();
  renderFeaturedToday();
  renderFlashSale();
  renderDailyDeals();
  renderBestSellers();
  renderNewArrivals();
  renderTrending();
  renderRecentlyAdded();
  renderShopByCategory();
  renderTestimonialsV2();
  renderInstagramGallery();
};

/* ===================== INIT ===================== */
function hpRenderAll() {
  renderFeaturedToday();
  renderFlashSale();
  renderDailyDeals();
  renderBestSellers();
  renderNewArrivals();
  renderTrending();
  renderRecentlyAdded();
  renderShopByCategory();
  renderInstagramGallery();
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  startFlashCountdown();
  hpRenderAll();
  initStatsCounter();
  renderTestimonialsV2();
  initBackToTop();
});
