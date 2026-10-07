// Agnes Herbal Supplements — blog listing & article view (single page, hash-based)

function escapeHtmlB(str) { return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

function renderBlogList() {
  const lang = getLang();
  const grid = document.getElementById('blogGrid');
  grid.innerHTML = ARTICLES_DATA.map(a => `
    <div class="blog-card" data-slug="${a.slug}">
      <img src="${a.img}" alt="${escapeHtmlB(lang==='en'?a.en_title:a.sw_title)}" loading="lazy">
      <div class="blog-card-body">
        <div class="date">${new Date(a.date).toLocaleDateString((typeof getLocale==='function'?getLocale(lang):'sw-TZ'), {year:'numeric', month:'long', day:'numeric'})}</div>
        <h3>${escapeHtmlB(lang==='en'?a.en_title:a.sw_title)}</h3>
        <p>${escapeHtmlB(lang==='en'?a.en_excerpt:a.sw_excerpt)}</p>
      </div>
    </div>`).join('');
  grid.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('click', () => { location.hash = card.dataset.slug; });
  });
}

function renderArticle(slug) {
  const lang = getLang();
  const a = ARTICLES_DATA.find(x => x.slug === slug);
  if (!a) { showList(); return; }
  document.getElementById('articleContent').innerHTML = `
    <img src="${a.img}" alt="${escapeHtmlB(lang==='en'?a.en_title:a.sw_title)}">
    <h1>${escapeHtmlB(lang==='en'?a.en_title:a.sw_title)}</h1>
    <div class="meta">${new Date(a.date).toLocaleDateString((typeof getLocale==='function'?getLocale(lang):'sw-TZ'), {year:'numeric', month:'long', day:'numeric'})} · Agnes Herbal Supplements</div>
    <div class="body-text">${escapeHtmlB(lang==='en'?a.en_body:a.sw_body)}</div>
    <div class="share-row" style="margin-top:26px;">
      <span class="lbl" data-i18n="share_label">Shiriki:</span>
      <a class="share-btn wa" href="https://wa.me/?text=${encodeURIComponent((lang==='en'?a.en_title:a.sw_title))}%20${encodeURIComponent(location.href)}" target="_blank" rel="noopener">W</a>
      <a class="share-btn fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">f</a>
      <a class="share-btn x" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">X</a>
      <a class="share-btn tg" href="https://t.me/share/url?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">T</a>
    </div>`;
  document.title = (lang==='en'?a.en_title:a.sw_title) + ' | Agnes Herbal Supplements';
  document.querySelector('section:first-of-type').style.display = 'none';
  document.getElementById('articleView').style.display = 'block';
  window.scrollTo(0,0);
}

function showList() {
  document.querySelector('section:first-of-type').style.display = 'block';
  document.getElementById('articleView').style.display = 'none';
  location.hash = '';
}

function handleRoute() {
  const slug = location.hash.replace('#','');
  if (slug) renderArticle(slug); else showList();
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  applyLang();
  renderBlogList();
  handleRoute();
  document.getElementById('backToList').addEventListener('click', (e) => { e.preventDefault(); showList(); });
  window.addEventListener('hashchange', handleRoute);
});
