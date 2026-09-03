// Agnes Herbal Supplements — Admin Dashboard
// SECURITY NOTE: This is a client-side-only demo admin panel suitable for a
// small single-owner shop using free hosting. The password check happens in
// the browser, so it is NOT secure against a technical attacker who reads the
// page source — it only deters casual/curious visitors. For real multi-user
// security you would need a server-side login backed by a database, which
// requires paid/hosted infrastructure beyond the scope of this "free tools
// only" build. Do not store sensitive data (e.g. real customer payment info)
// in this panel.

function lsGetA(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
function lsSetA(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
function escapeHtmlA(str) { return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function fmtA(n) { return 'Tsh ' + Math.round(n).toLocaleString('en-US'); }

const ADMIN_PASS_KEY = 'ahs_admin_pass';
function getAdminPass() { return localStorage.getItem(ADMIN_PASS_KEY) || 'agnes2026'; }

// ahsCloudAdminOK ni KWELI TU baada ya cloudSignIn() kufanikiwa kikamilifu.
// Hii ndiyo dalili pekee ya kuaminika kama mabadiliko ya bei/picha/caption
// ya bidhaa zilizopo tayari ("Hariri") YATAFIKA kwa wateja — kama ni FALSE,
// Firestore Rules zitakataa uhifadhi kimya kimya (permission-denied) hata
// kama ukurasa wa admin unaonekana kufanya kazi kawaida.
let ahsCloudAdminOK = false;

function renderCloudAdminBanner() {
  const el = document.getElementById('cloudAdminBanner');
  if (!el) return;
  if (typeof AHS_CLOUD_READY === 'undefined' || !AHS_CLOUD_READY) {
    el.style.display = 'block';
    el.style.background = '#f0efe8';
    el.style.color = 'var(--ink-soft)';
    el.textContent = '🔴 Firebase haijaunganishwa. Mabadiliko yanabaki kwenye kivinjari hiki TU.';
  } else if (ahsCloudAdminOK) {
    el.style.display = 'block';
    el.style.background = '#e4f3ea';
    el.style.color = 'var(--green-deep)';
    el.textContent = '🟢 Umeingia kama Admin wa Cloud — mabadiliko yote yanafika kwa wateja moja kwa moja.';
  } else {
    el.style.display = 'block';
    el.style.background = '#fbe6e6';
    el.style.color = '#b23a3a';
    el.textContent = '⚠️ HUJAINGIA kama Admin wa Cloud! Oda mpya (orders) na mabadiliko ya bei/picha/caption ya bidhaa HAYATAONEKANA kwako — Firestore inazificha kwa usalama kwa mtu asiye-admin. Toka (🚪) kisha Ingia tena ukijaza Barua pepe (Email) na Password SAHIHI ya Firebase (siyo nenosiri la kawaida la admin tu).';
  }
}

function tryLogin() {
  const val = document.getElementById('adminPass').value;
  const email = document.getElementById('adminEmail').value.trim();
  const statusEl = document.getElementById('loginStatus');
  if (val !== getAdminPass()) {
    alert('Nenosiri si sahihi. Jaribu tena.');
    return;
  }
  sessionStorage.setItem('ahs_admin_session', '1');
  // Ikiwa Firebase Auth imewekwa, ingia rasmi ili Firestore Security Rules
  // zikutambue kama admin wa kweli (vinginevyo utaona bidhaa/oda za
  // localStorage tu, bila sync ya live).
  if (typeof AHS_CLOUD_READY !== 'undefined' && AHS_CLOUD_READY && typeof cloudSignIn === 'function' && email) {
    statusEl.textContent = 'Inaingia kwenye Firebase...';
    cloudSignIn(email, val).then(() => {
      ahsCloudAdminOK = true;
      statusEl.textContent = '';
      showDashboard();
    }).catch(err => {
      ahsCloudAdminOK = false;
      statusEl.textContent = '⚠️ Umeingia lakini SIYO kwenye Firebase (' + err.message + '). Utaona data ya kivinjari hiki tu, si sync ya live.';
      showDashboard();
    });
  } else {
    ahsCloudAdminOK = false;
    showDashboard();
  }
}
function adminLogout() {
  sessionStorage.removeItem('ahs_admin_session');
  ahsCloudAdminOK = false;
  if (typeof cloudSignOut === 'function') cloudSignOut();
  document.getElementById('adminShell').style.display = 'none';
  document.getElementById('loginBox').style.display = 'block';
}
function showDashboard() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('adminShell').style.display = 'grid';
  // Kila sehemu inajitegemea kabisa: kama moja itakwama kwa hitilafu yoyote,
  // zilizobaki (mfano Mpangilio wa Duka) bado zitaonekana na kufanya kazi.
  const steps = [
    ['renderDashboard', renderDashboard],
    ['renderProductsTab', renderProductsTab],
    ['renderAddProductTab', renderAddProductTab],
    ['renderOrdersTab', renderOrdersTab],
    ['renderMessagesTab', renderMessagesTab],
    ['renderNewsletterTab', renderNewsletterTab],
    ['renderReviewsTab', renderReviewsTab],
    ['renderMpangilioTab', renderMpangilioTab],
    ['initPresenceUI', initPresenceUI],
    ['initAdminOrderSync', initAdminOrderSync],
    ['initAdminProductSync', initAdminProductSync],
    ['initAdminCustomProductsSync', initAdminCustomProductsSync],
    ['initAdminHomepageSettingsSync', initAdminHomepageSettingsSync],
    ['renderCloudAdminBanner', renderCloudAdminBanner]
  ];
  steps.forEach(([name, fn]) => {
    try { fn(); } catch (err) { console.error('[Admin] ' + name + ' imeshindwa:', err); }
  });
  if (typeof initOneSignalForAdmin === 'function') {
    try { initOneSignalForAdmin(); } catch (err) { console.error('[Admin] initOneSignalForAdmin imeshindwa:', err); }
  }
}

/* ===================== TABS ===================== */
const ADMIN_TAB_RENDERERS = {
  dashboard: () => renderDashboard(),
  products: () => renderProductsTab(),
  addproduct: () => renderAddProductTab(),
  orders: () => renderOrdersTab(),
  messages: () => renderMessagesTab(),
  newsletter: () => renderNewsletterTab(),
  reviews: () => renderReviewsTab(),
  mpangilio: () => renderMpangilioTab()
};
document.querySelectorAll('.admin-sidebar button[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-sidebar button[data-tab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    const tabEl = document.getElementById('tab-' + btn.dataset.tab);
    // Refresh hii tab-content sasa hivi kila ibofywapo, ili isibaki tupu
    // hata kama render ya awali (wakati wa kuingia) ilikwama kwa hitilafu.
    const renderFn = ADMIN_TAB_RENDERERS[btn.dataset.tab];
    if (renderFn) { try { renderFn(); } catch (err) { console.error('[Admin] Kuonyesha tab kumeshindwa:', err); } }
    tabEl.style.display = 'block';
    // Simu: hakikisha kitufe kilichobofywa kinaonekana kikamilifu kwenye
    // mstari wa vitufe unaotelezeka kando (self-adjust badala ya kubaki nje ya screen).
    btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    document.querySelector('.admin-main')?.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* ===================== DASHBOARD ===================== */
function renderDashboard() {
  const orders = lsGetA('ahs_orders', []);
  const messages = lsGetA('ahs_messages', []);
  const newsletter = lsGetA('ahs_newsletter', []);
  const overrides = lsGetA('ahs_product_overrides', {});
  const hiddenCount = Object.values(overrides).filter(o => o.hidden).length;
  const totalRevenue = orders.reduce((s,o) => s + (o.total||0), 0);

  const cloudOn = (typeof AHS_CLOUD_READY !== 'undefined') && AHS_CLOUD_READY;
  const authedUser = (typeof cloudCurrentUser === 'function') ? cloudCurrentUser() : null;
  let cloudStatusHtml;
  if (!cloudOn) {
    cloudStatusHtml = `<span class="cloud-status local">⚠️ Hali ya localStorage pekee — weka Firebase kwenye js/firebase-config.js ili oda ziunganishwe live</span>`;
  } else if (authedUser) {
    cloudStatusHtml = `<span class="cloud-status ready">☁️ Sync ya live imewashwa (Firebase) — umeingia kama ${escapeHtmlA(authedUser.email)}</span>`;
  } else {
    cloudStatusHtml = `<span class="cloud-status local">⚠️ Firebase ipo lakini HUJAINGIA rasmi (Auth) — ingia tena ukiweka Email sahihi ili uweze kuhifadhi/kubadilisha bidhaa na oda kwenye wingu.</span>`;
  }
  document.getElementById('tab-dashboard').innerHTML = `
    <h2 style="color:var(--green-deep); margin-bottom:20px; font-family:'Fraunces',serif;">Muhtasari (Dashboard)</h2>
    ${cloudStatusHtml}
    <div class="presence-toggle">
      <span class="presence-dot" id="presenceDot"></span>
      <span id="presenceLabel">Niko Mtandaoni</span>
      <input type="checkbox" id="presenceCheckbox" style="margin-left:6px; width:18px; height:18px;" onchange="togglePresence(this.checked)">
    </div>
    <div class="admin-stats">
      <div class="stat-card"><b>${allAdminProducts().length - hiddenCount}</b><span>Bidhaa Zinazoonekana</span></div>
      <div class="stat-card"><b>${orders.length}</b><span>Jumla ya Oda</span></div>
      <div class="stat-card"><b>${fmtA(totalRevenue)}</b><span>Mapato Yaliyorekodiwa</span></div>
      <div class="stat-card"><b>${messages.length}</b><span>Ujumbe wa Wateja</span></div>
    </div>
    <div style="margin-top:20px; border:1px solid var(--line); border-radius:14px; padding:18px 20px; max-width:640px;">
      <h3 style="color:var(--green-deep); font-size:1rem; margin-bottom:8px;">📦 Export Bidhaa Zote (kwa SEO/Sitemap)</h3>
      <p style="font-size:.8rem; color:var(--ink-soft); margin-bottom:12px;">
        Inapakua faili moja (JSON) lenye bidhaa zote za sasa — za awali (288) pamoja na zote ulizoongeza mwenyewe kupitia "Ongeza Bidhaa". Tumia faili hili kutuma kwa msaidizi wako wa kiufundi wakati wowote unapohitaji kusasisha sitemap.xml au kurasa za bidhaa binafsi.
      </p>
      <button class="btn btn-primary" onclick="exportAllProductsJSON()">⬇️ Pakua Bidhaa Zote (JSON)</button>
      <p style="font-size:.75rem; color:var(--ink-soft); margin-top:8px;">Jumla ya bidhaa kwa sasa: <b>${allAdminProducts().length}</b></p>
    </div>
    <div style="margin-top:20px; border:1px solid var(--line); border-radius:14px; padding:18px 20px; max-width:640px;">
      <h3 style="color:var(--green-deep); font-size:1rem; margin-bottom:8px;">🟢 Wateja Wangapi Wapo Online</h3>
      <p style="font-size:.8rem; color:var(--ink-soft); margin-bottom:12px;">
        Inahesabu vivinjari vilivyofungua duka (index.html) katika dakika iliyopita. ${cloudOn ? '' : '⚠️ Inahitaji Firebase iwe imewekwa (angalia ujumbe hapo juu).'}
      </p>
      <button class="btn btn-primary" id="onlineCountBtn" onclick="refreshOnlineVisitorCount()" ${cloudOn ? '' : 'disabled'}>🔄 Angalia Wangapi Wapo Online</button>
      <p id="onlineCountResult" style="font-size:1.1rem; font-weight:800; color:var(--green-deep); margin-top:12px;"></p>
    </div>
    <p style="font-size:.85rem; color:var(--ink-soft); max-width:640px;">
      Takwimu hizi zinatokana na data iliyohifadhiwa kwenye kivinjari hiki (localStorage). Kwa uzoefu wa admin unaofanya kazi kwenye vifaa vyote, ungehitaji database ya kweli ya seva (backend) — jambo linalohitaji huduma ya wingu inayolipiwa au seva yako mwenyewe.
    </p>
    <div style="margin-top:24px; border:1px solid var(--line); border-radius:14px; padding:18px 20px; max-width:640px;">
      <h3 style="color:var(--green-deep); font-size:1rem; margin-bottom:8px;">📢 Tuma Update kwa Vifaa Vyote</h3>
      <p style="font-size:.8rem; color:var(--ink-soft); margin-bottom:12px;">
        Ukishamaliza kuongeza/kubadilisha bidhaa na umeshaipakia site mpya Netlify, bofya hapa chini.
        Vifaa vyote vilivyo WAZI na MTANDAONI wakati huo huo vitaanza kupokea update papo hapo.
        Vifaa vilivyozimwa au visivyo na mtandao (mfano mkoani) vitathibitisha
        mara tu vitakaporudi mtandaoni — kaunta hapa chini inaongezeka live, siyo lazima ionyeshe 100% papo hapo.
      </p>
      <button class="btn btn-primary" id="pushUpdateBtn" onclick="pushAppUpdate()">📢 Tuma Update Sasa</button>
      <p id="pushUpdateStatus" style="font-size:.82rem; font-weight:700; margin-top:12px; display:none;"></p>
    </div>`;
  initAppUpdatePushUI();
}
let appUpdateAckUnsub = null;
function initAppUpdatePushUI() {
  if (typeof cloudListenAppVersion !== 'function') return;
  cloudListenAppVersion((data) => {
    if (!data || !data.version) return;
    const statusEl = document.getElementById('pushUpdateStatus');
    if (!statusEl) return;
    statusEl.style.display = 'block';
    statusEl.style.color = 'var(--ink-soft)';
    statusEl.textContent = '⏳ Inasubiri vifaa vithibitishe...';
    if (appUpdateAckUnsub) appUpdateAckUnsub();
    if (typeof cloudListenAckCount === 'function') {
      appUpdateAckUnsub = cloudListenAckCount(data.version, (count) => {
        const el = document.getElementById('pushUpdateStatus');
        if (!el) return;
        el.style.color = 'var(--green-deep)';
        el.textContent = count > 0
          ? `✅ Update imefika — vifaa ${count} vimeshathibitisha kupokea (idadi inaongezeka live wakati vingine vinarudi mtandaoni).`
          : '⏳ Bado hakuna kifaa kilichothibitisha — subiri kidogo au hakikisha wateja wana mtandao.';
      });
    }
  });
}
async function pushAppUpdate() {
  const btn = document.getElementById('pushUpdateBtn');
  const statusEl = document.getElementById('pushUpdateStatus');
  if (typeof AHS_CLOUD_READY === 'undefined' || !AHS_CLOUD_READY) {
    alert('Firebase haijaunganishwa kwenye kifaa hiki — huwezi kutuma update ya live.');
    return;
  }
  if (!ahsCloudAdminOK) {
    alert('Hujaingia kama Admin wa Cloud — toka (🚪) kisha ingia tena kwa Email/Password sahihi ya Firebase kabla ya kutuma update.');
    return;
  }
  btn.disabled = true; btn.textContent = 'Inatuma...';
  const version = await cloudPushAppUpdate();
  btn.disabled = false; btn.textContent = '📢 Tuma Update Sasa';
  if (!version) {
    statusEl.style.display = 'block';
    statusEl.style.color = '#b23a3a';
    statusEl.textContent = '❌ Imeshindikana kutuma update. Jaribu tena.';
    return;
  }
  statusEl.style.display = 'block';
  statusEl.style.color = 'var(--ink-soft)';
  statusEl.textContent = '✅ Ombi la update limetumwa — inasubiri vifaa vithibitishe...';
}

/* ===================== PRODUCTS TAB ===================== */
let adminCustomProducts = [];
let adminCustomProductsMap = {};
function getBaseProductA(id) {
  return (PRODUCTS[id] !== undefined) ? PRODUCTS[id] : adminCustomProductsMap[id];
}
function allAdminProducts() { return adminCustomProducts.length ? [...PRODUCTS, ...adminCustomProducts] : PRODUCTS; }

/* ===================== EXPORT BIDHAA ZOTE (kwa SEO/Sitemap) ===================== */
function exportAllProductsJSON() {
  try {
    const list = allAdminProducts();
    if (!list || !list.length) {
      alert('Hakuna bidhaa zilizopatikana kupakua. Jaribu tena baada ya bidhaa kupakiwa (subiri sekunde chache kisha bofya tena).');
      return;
    }
    const payload = {
      exported_at: new Date().toISOString(),
      total_products: list.length,
      products: list
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `agnes-products-export-${dateStr}.json`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    alert(`✅ Imekamilika!\n\nBidhaa ${list.length} zimepakuliwa kwenye faili:\n${filename}\n\nAngalia folder ya "Downloads" kwenye simu yako. Kama huoni faili, angalia notification bar juu, au menu ya vivinjari (⋮ → Downloads).`);
  } catch (e) {
    alert('❌ Imeshindwa kupakua faili: ' + e.message + '\n\nJaribu tena, au tumia Chrome badala ya browser nyingine.');
  }
}

function renderProductsTab(filter) {
  const overrides = lsGetA('ahs_product_overrides', {});
  const q = (filter || '').toLowerCase();
  const list = allAdminProducts().filter(p => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  const rows = list.slice(0, 100).map(p => {
    const ov = overrides[p.id] || {};
    const isCustom = !!adminCustomProductsMap[p.id];
    const hidden = !!ov.hidden;
    const retail = ov.prices ? ov.prices.retail : p.prices.retail;
    const stock = (typeof ov.stock === 'number') ? ov.stock : null;
    const stockDisplay = stock === null ? '<span style="color:var(--ink-soft);">—</span>'
      : stock <= 0 ? `<span class="pg-badge stock-out" style="position:static;">Imeisha</span>`
      : stock <= 5 ? `<span class="pg-badge stock-low" style="position:static;">${stock}</span>`
      : stock;
    const thumbSrc = ov.cover || (ov.images && ov.images.length ? ov.images[0] : null)
      || p.cover || (p.images && p.images.length ? p.images[0] : null) || ('images/' + p.file);
    return `<tr>
      <td><img src="${thumbSrc}" alt=""></td>
      <td>${escapeHtmlA(p.name)}${isCustom ? ' <span class="admin-badge done" style="font-size:.65rem;">mpya</span>' : ''}</td>
      <td>${escapeHtmlA(p.category)}</td>
      <td><input type="number" value="${retail}" data-price="${p.id}" style="width:90px; padding:4px 6px; border-radius:6px; border:1px solid var(--line);"></td>
      <td>${stockDisplay}</td>
      <td><span class="admin-badge ${hidden?'pending':'done'}">${hidden?'Imefichwa':'Inaonekana'}</span></td>
      <td style="white-space:nowrap;">
        <button class="admin-danger" data-toggle="${p.id}">${hidden?'Onyesha':'Ficha'}</button>
        <button class="order-confirm-btn" data-edit="${p.id}">🖼 Hariri</button>
        ${isCustom ? `<button class="admin-danger" data-delcustom="${p.id}">🗑 Futa Kabisa</button>` : ''}
      </td>
    </tr>`;
  }).join('');
  const searchEl = document.getElementById('productSearch');
  const hadFocus = document.activeElement === searchEl;
  const caretPos = hadFocus ? searchEl.selectionStart : null;

  document.getElementById('tab-products').innerHTML = `
    <h2 style="color:var(--green-deep); margin-bottom:16px; font-family:'Fraunces',serif;">Bidhaa (${allAdminProducts().length})</h2>
    <input type="text" class="admin-search" id="productSearch" placeholder="Tafuta bidhaa..." value="${escapeHtmlA(filter||'')}">
    <p style="font-size:.78rem; color:var(--ink-soft); margin:10px 0;">Onyesha/ficha bidhaa dukani, au badilisha bei ya rejareja. Mabadiliko yanahifadhiwa kwenye kivinjari hiki na yataonekana kwenye tovuti kuu papo hapo. Bidhaa zenye lebo "mpya" ndizo ulizoongeza kwenye "➕ Ongeza Bidhaa" — "Futa Kabisa" kwazo huondoa milele (siyo kuficha tu).</p>
    <div style="overflow:auto;"><table class="admin-table">
      <thead><tr><th></th><th>Jina</th><th>Kundi</th><th>Bei (Retail)</th><th>Stock</th><th>Hali</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p style="font-size:.75rem; color:var(--ink-soft); margin-top:10px;">Inaonyesha bidhaa 100 za kwanza zinazolingana. Tafuta ili kupunguza matokeo.</p>`;

  // Re-rendering the whole tab (above) destroys and recreates the search
  // input on every keystroke. Without restoring focus + cursor position,
  // the field loses focus after each character, forcing the admin to
  // click back in for every letter typed or deleted. Restore it here.
  const newSearchEl = document.getElementById('productSearch');
  if (hadFocus && newSearchEl) {
    newSearchEl.focus();
    newSearchEl.setSelectionRange(caretPos, caretPos);
  }

  newSearchEl.addEventListener('input', (e) => renderProductsTab(e.target.value));
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.toggle, 10);
      const ov = lsGetA('ahs_product_overrides', {});
      ov[id] = ov[id] || {};
      ov[id].hidden = !ov[id].hidden;
      lsSetA('ahs_product_overrides', ov);
      renderProductsTab(document.getElementById('productSearch').value);
      renderDashboard();
    });
  });
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openPeditOverlay(parseInt(btn.dataset.edit, 10)));
  });
  document.querySelectorAll('[data-delcustom]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Una uhakika unataka kufuta bidhaa hii KABISA? Haitaweza kurudishwa.')) return;
      if (typeof cloudDeleteCustomProduct === 'function') cloudDeleteCustomProduct(btn.dataset.delcustom);
    });
  });
  document.querySelectorAll('[data-price]').forEach(input => {
    input.addEventListener('change', () => {
      const id = parseInt(input.dataset.price, 10);
      const base = getBaseProductA(id);
      const newRetail = parseInt(input.value, 10) || base.prices.retail;
      const ov = lsGetA('ahs_product_overrides', {});
      ov[id] = ov[id] || {};
      ov[id].prices = { retail: newRetail, w5: Math.round(newRetail*0.66), w10: Math.round(newRetail*0.55) };
      lsSetA('ahs_product_overrides', ov);
    });
  });
}

/* ===================== ONGEZA BIDHAA TAB (bidhaa mpya, moja kwa moja) ===================== */
// Hii inaruhusu admin kuongeza bidhaa MPYA kabisa (siyo kuhariri iliyopo)
// bila kugusa js/products-data.js wala kutuma faili kwa mtu — bidhaa
// inahifadhiwa kwenye Firestore (collection "customProducts") na inaonekana
// dukani (index.html) kwa wateja wote papo hapo.
let unsubscribeCustomProducts = null;
let apNewImages = []; // data URLs za picha zilizochaguliwa kwa bidhaa inayoongezwa
let apNewVideo = null; // data URL (base64, imebanwa) ya video HIARI ya bidhaa inayoongezwa
const AP_MAX_IMAGES = 5;

function slugifyA(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

function renderAddProductTab() {
  const cloudOn = (typeof AHS_CLOUD_READY !== 'undefined' && AHS_CLOUD_READY);
  const signedIn = cloudOn && typeof cloudCurrentUser === 'function' && !!cloudCurrentUser();
  const catOptions = CATEGORIES.map(c => `<option value="${escapeHtmlA(c)}">${escapeHtmlA(c)}</option>`).join('');

  document.getElementById('tab-addproduct').innerHTML = `
    <h2 style="color:var(--green-deep); margin-bottom:6px; font-family:'Fraunces',serif;">➕ Ongeza Bidhaa Mpya</h2>
    <p style="font-size:.78rem; color:var(--ink-soft); margin-bottom:16px;">
      ${cloudOn
        ? 'Bidhaa utakayoongeza hapa itapewa namba inayofuata (mfano 288, 289...) na itaonekana kwenye tab "🛒 Bidhaa" pamoja na zote zilizopo — hapo ndipo utakapoweza kubadilisha bei/picha au kuifuta baadaye.'
        : '⚠️ Firebase haijawekwa kwenye tovuti hii: bidhaa haitaweza kuhifadhiwa hadi Firebase iunganishwe (ona README.md, sehemu ya "Kuwasha Firebase").'}
    </p>
    ${cloudOn && !signedIn ? `<div style="background:#fdecea; border:1px solid #f0b4ae; border-radius:10px; padding:12px 14px; margin-bottom:16px; font-size:.8rem; color:#7a2a24;">
      ⚠️ <b>Hujaingia kama Admin wa kweli wa Firebase</b> — kuhifadhi bidhaa mpya KUTASHINDIKANA (ruhusa imekataliwa) mpaka uingie kwa usahihi.
      Toka (🚪 Toka) kisha Ingia tena kwa kujaza <b>EMAIL halisi</b> (ile uliyosajili kwenye Firebase Console → Authentication → Users) na password inayolingana nayo kabisa —
      siyo tu password ya ukurasa wa Admin.
    </div>` : ''}
    <form id="addProductForm" style="max-width:560px; display:flex; flex-direction:column; gap:12px;">
      <label>Jina la Bidhaa *<br>
        <input type="text" id="apName" required style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line);"></label>
      <label>Kundi *<br>
        <select id="apCategory" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line);">
          ${catOptions}
          <option value="__new__">➕ Kundi Jipya...</option>
        </select></label>
      <input type="text" id="apCategoryNew" placeholder="Andika jina la kundi jipya" style="display:none; width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line);">
      <label>Kazi / Faida ya Bidhaa<br>
        <input type="text" id="apEffect" placeholder="mfano: Kupunguza uzito" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line);"></label>
      <div style="display:flex; gap:10px;">
        <label style="flex:1;">Bei ya Rejareja (Tsh) *<br>
          <input type="number" id="apRetail" required min="0" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line);"></label>
        <label style="flex:1;">Jumla 5+ (Tsh)<br>
          <input type="number" id="apW5" min="0" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line);"></label>
        <label style="flex:1;">Jumla 10+ (Tsh)<br>
          <input type="number" id="apW10" min="0" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line);"></label>
      </div>
      <label>Maelezo ya Bidhaa (hiari)<br>
        <textarea id="apCaption" rows="3" maxlength="900" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line);"></textarea></label>
      <label>Idadi ya Stock (hiari — acha wazi usipotaka kufuatilia)<br>
        <input type="number" id="apStock" min="0" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line);"></label>
      <label>🎥 Video ya Bidhaa (hiari — kama Alibaba)</label>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <button type="button" id="apVideoCameraBtn" class="btn btn-ghost">🎥 Piga Video</button>
        <button type="button" id="apVideoGalleryBtn" class="btn btn-ghost">🎬 Chagua Video</button>
        <span id="apVideoNote" style="font-size:.72rem; color:var(--ink-soft);">Hiari — hadi sekunde 40. Ukiwa huna mda, ruka hii; bidhaa itahifadhiwa bila video.</span>
      </div>
      <input type="file" id="apVideoCameraInput" accept="video/*" capture="environment" style="display:none;">
      <input type="file" id="apVideoFileInput" accept="video/*" style="display:none;">
      <p id="apVideoStatus" style="display:none; font-size:.78rem; color:var(--ink-soft); margin:0;"></p>
      <div id="apVideoPreviewWrap" style="display:none; align-items:center; gap:10px;">
        <video id="apVideoPreview" muted playsinline controls style="width:160px; border-radius:10px; background:#000;"></video>
        <button type="button" id="apVideoRemoveBtn" class="btn btn-ghost" style="font-size:.75rem;">✕ Ondoa Video</button>
      </div>
      <label style="margin-bottom:0;">Picha za Bidhaa * (hadi ${AP_MAX_IMAGES})</label>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <button type="button" id="apCameraBtn" class="btn btn-ghost">📷 Piga Picha</button>
        <button type="button" id="apGalleryBtn" class="btn btn-ghost">🖼️ Chagua kwenye Picha</button>
        <span id="apPhotoCount" style="font-size:.78rem; color:var(--ink-soft); font-weight:700;">Picha: 0/${AP_MAX_IMAGES}</span>
      </div>
      <input type="file" id="apCameraInput" accept="image/*" capture="environment" style="display:none;">
      <input type="file" id="apFileInput" accept="image/*" multiple style="display:none;">
      <input type="file" id="apReplaceInput" accept="image/*" style="display:none;">
      <p id="apCameraDenied" style="display:none; font-size:.75rem; color:#b23a3a; margin:0;">Ruhusa ya kamera imekataliwa. Unaweza kuruhusu kamera kwenye mipangilio ya browser yako, au tumia "🖼️ Chagua kwenye Picha".</p>
      <div id="apProgressWrap" style="display:none; height:6px; background:var(--line); border-radius:4px; overflow:hidden;">
        <div id="apProgressBar" style="height:100%; width:0%; background:var(--green-deep); transition:width .2s;"></div>
      </div>
      <div id="apThumbs" style="display:flex; gap:10px; flex-wrap:wrap;"></div>
      <div id="apSeoPreview" style="border:1px solid var(--line); border-radius:10px; padding:12px 14px; background:#fff;">
        <p style="font-size:.72rem; font-weight:700; color:var(--ink-soft); text-transform:uppercase; letter-spacing:.03em; margin:0 0 8px;">🔍 Google Search Preview (SEO ya kiotomatiki)</p>
        <div style="font-size:.85rem; color:#1a0dab; margin-bottom:2px; line-height:1.3;" id="apSeoTitle">—</div>
        <div style="font-size:.75rem; color:#006621; margin-bottom:4px;" id="apSeoUrl">agnesherbalsupplements.com/products/—</div>
        <div style="font-size:.8rem; color:#545454; line-height:1.4;" id="apSeoDesc">—</div>
      </div>
      <button type="submit" class="btn btn-primary" style="align-self:flex-start;" ${cloudOn ? '' : 'disabled'}>💾 Hifadhi Bidhaa</button>
      <p id="apStatus" style="font-size:.8rem; color:var(--ink-soft);"></p>
    </form>`;

  apNewImages = [];
  apNewVideo = null;
  document.getElementById('apCategory').addEventListener('change', (e) => {
    document.getElementById('apCategoryNew').style.display = (e.target.value === '__new__') ? 'block' : 'none';
    updateApSeoPreview();
  });
  document.getElementById('apRetail').addEventListener('input', (e) => {
    const r = parseInt(e.target.value, 10) || 0;
    document.getElementById('apW5').value = Math.round(r * 0.66);
    document.getElementById('apW10').value = Math.round(r * 0.55);
  });
  ['apName', 'apCategoryNew', 'apEffect', 'apCaption'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateApSeoPreview);
  });
  updateApSeoPreview();
  document.getElementById('apCameraBtn').addEventListener('click', () => {
    if (apNewImages.length >= AP_MAX_IMAGES) return;
    document.getElementById('apCameraDenied').style.display = 'none';
    document.getElementById('apCameraInput').click();
  });
  document.getElementById('apGalleryBtn').addEventListener('click', () => {
    if (apNewImages.length >= AP_MAX_IMAGES) return;
    document.getElementById('apFileInput').click();
  });
  document.getElementById('apCameraInput').addEventListener('change', handleApFileSelect);
  document.getElementById('apFileInput').addEventListener('change', handleApFileSelect);
  document.getElementById('apReplaceInput').addEventListener('change', handleApReplaceSelect);
  document.getElementById('apVideoCameraBtn').addEventListener('click', () => document.getElementById('apVideoCameraInput').click());
  document.getElementById('apVideoGalleryBtn').addEventListener('click', () => document.getElementById('apVideoFileInput').click());
  document.getElementById('apVideoCameraInput').addEventListener('change', handleApVideoSelect);
  document.getElementById('apVideoFileInput').addEventListener('change', handleApVideoSelect);
  document.getElementById('apVideoRemoveBtn').addEventListener('click', () => {
    apNewVideo = null;
    document.getElementById('apVideoPreviewWrap').style.display = 'none';
    document.getElementById('apVideoStatus').style.display = 'none';
  });
  document.getElementById('addProductForm').addEventListener('submit', handleAddProductSubmit);
  renderApThumbs();
}

// Video ni HIARI kabisa — hakuna sehemu ya code hii inayoruhusu kikwazo cha
// video kuzuia "Hifadhi Bidhaa". Ikiwa video ni kubwa mno hata baada ya
// kubana, au kifaa cha admin hakitegemezi kubana video (browser ya zamani),
// tunaonyesha ujumbe TU na kuruka video — bidhaa bado inaendelea kuhifadhiwa
// kwa picha zake pekee, kama kawaida.
const AP_VIDEO_TARGET_BYTES = 300 * 1024;   // ~300KB baada ya kubana (base64)
const AP_VIDEO_MAX_SECONDS = 40;            // klipu ya sekunde 40 — bitrate inapunguzwa ili itoshee
// Ukomo wa jumla wa hati ya Firestore ni 1MB (1,048,576 bytes). Tunaacha
// nafasi ya usalama (~98KB) kwa maandishi mengine ya bidhaa (jina, bei,
// maelezo) — picha na video (zikiwepo zote mbili) lazima zitoshee ndani ya hii.
const AP_TOTAL_SAFE_BYTES = 950 * 1024;
async function handleApVideoSelect(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const statusEl = document.getElementById('apVideoStatus');
  statusEl.style.display = 'block';
  statusEl.style.color = 'var(--ink-soft)';
  statusEl.textContent = '⏳ Inabana video (hii inaweza kuchukua sekunde chache)...';
  try {
    const dataUrl = await compressVideoFile(file, AP_VIDEO_MAX_SECONDS, AP_VIDEO_TARGET_BYTES);
    apNewVideo = dataUrl;
    const prev = document.getElementById('apVideoPreview');
    prev.src = dataUrl;
    document.getElementById('apVideoPreviewWrap').style.display = 'flex';
    statusEl.style.color = 'var(--green-deep)';
    statusEl.textContent = `✅ Video tayari (~${Math.round(dataUrl.length / 1024)}KB).`;
  } catch (err) {
    console.warn('compressVideoFile failed — bidhaa itaendelea kuhifadhiwa bila video', err);
    apNewVideo = null;
    document.getElementById('apVideoPreviewWrap').style.display = 'none';
    statusEl.style.color = '#b23a3a';
    statusEl.textContent = '⚠️ Imeshindikana kubana video hii (labda ni kubwa mno au kifaa/browser hii haitegemezwi). Bidhaa itaendelea kuhifadhiwa VIZURI bila video — jaribu video nyingine baadaye ukipenda.';
  }
}

// Inabana video kwa: (1) kupunguza urefu wa muda hadi maxSeconds, (2) kupunguza
// ukubwa wa picha (360px upana), (3) bitrate ya chini — kisha kuirudisha kama
// data-URL (base64) ili iweze kuhifadhiwa moja kwa moja kwenye Firestore sawa
// na picha (hakuna Firebase Storage/malipo yanayohitajika). Inatupa error
// ikiwa MediaRecorder haitegemezwi au matokeo bado ni makubwa mno — kamwe
// haitupi error inayozuia fomu nzima, caller ndiye anayeamua kuruka video.
function compressVideoFile(file, maxSeconds, targetBytes) {
  return new Promise((resolve, reject) => {
    if (typeof MediaRecorder === 'undefined') { reject(new Error('MediaRecorder haipo')); return; }
    const srcUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.src = srcUrl;
    video.onerror = () => { URL.revokeObjectURL(srcUrl); reject(new Error('Video haisomeki')); };
    video.onloadedmetadata = () => {
      const clipSeconds = Math.min(maxSeconds, video.duration || maxSeconds);
      const scale = Math.min(1, 360 / (video.videoWidth || 360));
      const w = Math.max(2, Math.round((video.videoWidth || 360) * scale));
      const h = Math.max(2, Math.round((video.videoHeight || 640) * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      const fps = clipSeconds > 15 ? 10 : 15; // klipu ndefu zaidi = fremu chache zaidi, ili ibaki ndogo
      const stream = canvas.captureStream(fps);
      let mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      // Bitrate inahesabiwa kutoka targetBytes/clipSeconds ili klipu ndefu
      // (mfano sekunde 40) isizidi ukubwa unaotakiwa — imefungwa kati ya
      // 40kbps (chini kabisa inayosomeka) na 300kbps (juu kabisa).
      const bitrate = Math.min(300000, Math.max(40000, Math.floor((targetBytes * 8) / clipSeconds)));
      let rec;
      try { rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate }); }
      catch (err) { URL.revokeObjectURL(srcUrl); reject(err); return; }
      const chunks = [];
      rec.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunks.push(ev.data); };
      rec.onstop = () => {
        URL.revokeObjectURL(srcUrl);
        const blob = new Blob(chunks, { type: mimeType });
        if (!blob.size) { reject(new Error('Video tupu baada ya kubana')); return; }
        if (blob.size > targetBytes * 2.2) { reject(new Error('Video bado ni kubwa mno baada ya kubana')); return; }
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(new Error('Imeshindikana kusoma video iliyobanwa'));
        fr.readAsDataURL(blob);
      };
      let drawTimer = null;
      const stopAll = () => {
        if (drawTimer) clearInterval(drawTimer);
        try { video.pause(); } catch (_) {}
        if (rec.state !== 'inactive') rec.stop();
      };
      video.onended = stopAll;
      video.ontimeupdate = () => { if (video.currentTime >= clipSeconds) stopAll(); };
      rec.start();
      drawTimer = setInterval(() => { try { ctx.drawImage(video, 0, 0, w, h); } catch (_) {} }, Math.round(1000 / fps));
      video.play().catch((err) => { URL.revokeObjectURL(srcUrl); reject(err); });
      // Kinga: usisubiri milele kama video ni ndefu/mkorogo wa kifaa unachelewa.
      setTimeout(stopAll, (clipSeconds + 2) * 1000);
    };
  });
}

// Baadhi ya simu (hasa iPhone/Safari za zamani) hazitegemezi capture="environment"
// vizuri — hii inagundua kama window ilipoteza fokasi (kamera ikafunguliwa) kisha
// ikarudi bila faili (== ruhusa imekataliwa au mtumiaji amesitisha), na kuonyesha
// ujumbe rafiki badala ya kunyamaza kimya.
function watchApCameraDenial(inputEl) {
  let cameraWasOpened = false;
  const onBlur = () => { cameraWasOpened = true; };
  window.addEventListener('blur', onBlur, { once: true });
  setTimeout(() => {
    window.removeEventListener('blur', onBlur);
    if (cameraWasOpened && (!inputEl.files || !inputEl.files.length)) {
      document.getElementById('apCameraDenied').style.display = 'block';
    }
  }, 1200);
}

// Google Search Preview inayosasishwa moja kwa moja admin anapoandika —
// muundo huu ni ULE ULE unaotumika na Cloudflare Function (functions/products/
// [slug].js) inayotengeneza ukurasa halisi wa SEO bidhaa itakapohifadhiwa.
function updateApSeoPreview() {
  const titleEl = document.getElementById('apSeoTitle');
  if (!titleEl) return;
  const name = (document.getElementById('apName').value || '').trim();
  const catSel = document.getElementById('apCategory').value;
  const category = catSel === '__new__' ? (document.getElementById('apCategoryNew').value || '').trim() : catSel;
  const effect = (document.getElementById('apEffect').value || '').trim();
  const caption = (document.getElementById('apCaption').value || '').trim();
  const slug = name ? slugifyA(name) : '';

  document.getElementById('apSeoTitle').textContent = name ? `${name} | Agnes Herbal Supplements Tanzania` : '—';
  document.getElementById('apSeoUrl').textContent = 'agnesherbalsupplements.com/products/' + (slug || '—');

  let desc = caption || (name ? `${name} - ${effect || category || ''} - ${category || ''}.` : '');
  if (desc && !/agnes herbal/i.test(desc)) desc += ' Bidhaa ya asili kutoka Agnes Herbal Supplements, Tanzania.';
  document.getElementById('apSeoDesc').textContent = desc ? (desc.length > 158 ? desc.slice(0, 157).trim() + '…' : desc) : '—';
}

async function handleApFileSelect(e) {
  const isCamera = e.target.id === 'apCameraInput';
  const files = Array.from(e.target.files || []).slice(0, AP_MAX_IMAGES - apNewImages.length);
  if (!files.length) {
    if (isCamera) watchApCameraDenial(e.target);
    return;
  }
  document.getElementById('apCameraDenied').style.display = 'none';
  const progWrap = document.getElementById('apProgressWrap');
  const progBar = document.getElementById('apProgressBar');
  progWrap.style.display = 'block';
  for (let i = 0; i < files.length; i++) {
    progBar.style.width = Math.round((i / files.length) * 100) + '%';
    // Picha ndogo zaidi kuliko za "Hariri" (800px / ~70KB badala ya 900px/110KB)
    // kwa sababu bidhaa mpya mara nyingi ina picha 3-5 kwa wakati mmoja, na
    // Firestore ina ukomo wa 1MB kwa hati MOJA — lazima ziingie zote salama.
    const compressed = await compressImageFile(files[i], 800, 70 * 1024);
    const dataUrl = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(compressed); });
    apNewImages.push(dataUrl);
  }
  progBar.style.width = '100%';
  setTimeout(() => { progWrap.style.display = 'none'; progBar.style.width = '0%'; }, 300);
  renderApThumbs();
  e.target.value = '';
}

// Inabadilisha picha MOJA katika nafasi fulani (kwa "Piga Upya" au "Badilisha"),
// bila kuathiri picha nyingine wala mpangilio wa Profaili.
function triggerApReplace(index, source) {
  const input = document.getElementById('apReplaceInput');
  input.dataset.targetIndex = String(index);
  if (source === 'camera') input.setAttribute('capture', 'environment');
  else input.removeAttribute('capture');
  document.getElementById('apCameraDenied').style.display = 'none';
  input.click();
}

async function handleApReplaceSelect(e) {
  const file = (e.target.files || [])[0];
  const idx = parseInt(e.target.dataset.targetIndex, 10);
  const wasCamera = e.target.hasAttribute('capture');
  if (!file) {
    if (wasCamera) watchApCameraDenial(e.target);
    e.target.value = '';
    return;
  }
  if (isNaN(idx) || idx < 0 || idx >= apNewImages.length) { e.target.value = ''; return; }
  const compressed = await compressImageFile(file, 800, 70 * 1024);
  const dataUrl = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(compressed); });
  apNewImages[idx] = dataUrl;
  e.target.value = '';
  renderApThumbs();
}

// Ukomo wa Firestore ni 1MB (1,048,576 bytes) kwa hati moja. Tunaacha nafasi
// ya usalama (~150KB) kwa maandishi mengine ya bidhaa (jina, bei, maelezo).
const AP_SAFE_BUDGET_BYTES = 880 * 1024;
function apImagesTotalBytes() { return apNewImages.reduce((sum, url) => sum + url.length, 0); }
function renderApThumbs() {
  const totalKb = Math.round(apImagesTotalBytes() / 1024);
  const overBudget = apImagesTotalBytes() > AP_SAFE_BUDGET_BYTES;
  document.getElementById('apThumbs').innerHTML = apNewImages.map((url, i) => `
    <div class="ap-photocard ${i===0?'is-cover':''}">
      <div class="ap-thumb-img">
        <img src="${url}" alt="">
        ${i===0 ? '<span class="pedit-cover-badge">Profaili</span>' : ''}
      </div>
      <div class="ap-photo-actions">
        ${i!==0 ? `<button type="button" class="ap-primary" data-setprimary="${i}" title="Weka kama Profaili">★</button>` : ''}
        <button type="button" data-retake="${i}" title="Piga Picha Upya">🔁📷</button>
        <button type="button" data-replace="${i}" title="Badilisha na Nyingine">🖼️</button>
        <button type="button" class="ap-del" data-delapimg="${i}" title="Futa">✕</button>
      </div>
    </div>`).join('') +
    (apNewImages.length ? `<p style="width:100%; font-size:.75rem; color:${overBudget ? '#b23a3a' : 'var(--ink-soft)'}; margin-top:4px;">
      Ukubwa wa picha: ~${totalKb}KB ${overBudget ? '— kubwa mno! Futa picha 1 au zaidi kabla ya kuhifadhi.' : ''}</p>` : '');

  const countEl = document.getElementById('apPhotoCount');
  if (countEl) countEl.textContent = `Picha: ${apNewImages.length}/${AP_MAX_IMAGES}`;
  const atMax = apNewImages.length >= AP_MAX_IMAGES;
  const cameraBtn = document.getElementById('apCameraBtn');
  const galleryBtn = document.getElementById('apGalleryBtn');
  if (cameraBtn) { cameraBtn.disabled = atMax; cameraBtn.style.opacity = atMax ? .5 : 1; cameraBtn.style.cursor = atMax ? 'not-allowed' : 'pointer'; }
  if (galleryBtn) { galleryBtn.disabled = atMax; galleryBtn.style.opacity = atMax ? .5 : 1; galleryBtn.style.cursor = atMax ? 'not-allowed' : 'pointer'; }

  document.querySelectorAll('[data-delapimg]').forEach(b => b.addEventListener('click', () => {
    apNewImages.splice(parseInt(b.dataset.delapimg, 10), 1);
    renderApThumbs();
  }));
  document.querySelectorAll('[data-setprimary]').forEach(b => b.addEventListener('click', () => {
    const i = parseInt(b.dataset.setprimary, 10);
    const [img] = apNewImages.splice(i, 1);
    apNewImages.unshift(img);
    renderApThumbs();
  }));
  document.querySelectorAll('[data-retake]').forEach(b => b.addEventListener('click', () => triggerApReplace(parseInt(b.dataset.retake, 10), 'camera')));
  document.querySelectorAll('[data-replace]').forEach(b => b.addEventListener('click', () => triggerApReplace(parseInt(b.dataset.replace, 10), 'gallery')));
}

async function handleAddProductSubmit(e) {
  e.preventDefault();
  const statusEl = document.getElementById('apStatus');
  const name = document.getElementById('apName').value.trim();
  let category = document.getElementById('apCategory').value;
  if (category === '__new__') category = document.getElementById('apCategoryNew').value.trim();
  const effect = document.getElementById('apEffect').value.trim();
  const retail = parseInt(document.getElementById('apRetail').value, 10);
  const w5 = parseInt(document.getElementById('apW5').value, 10) || Math.round(retail * 0.66);
  const w10 = parseInt(document.getElementById('apW10').value, 10) || Math.round(retail * 0.55);
  const caption = document.getElementById('apCaption').value.trim();
  const stockRaw = document.getElementById('apStock').value;
  const stock = stockRaw !== '' ? parseInt(stockRaw, 10) : null;

  if (!name || !category || !retail || !apNewImages.length) {
    statusEl.textContent = '⚠️ Jaza Jina, Kundi, Bei ya Rejareja, na weka angalau picha moja.';
    statusEl.style.color = '#b23a3a';
    return;
  }
  if (apImagesTotalBytes() > AP_SAFE_BUDGET_BYTES) {
    statusEl.textContent = '⚠️ Picha ni kubwa mno kwa pamoja. Futa picha 1 au zaidi (angalia ukubwa ulioandikwa chini ya picha) kisha jaribu tena.';
    statusEl.style.color = '#b23a3a';
    return;
  }
  // Video ni HIARI kabisa. Ikiwa ipo lakini pamoja na picha inavuka ukomo wa
  // salama wa hati ya Firestore (1MB), TUNAIONDOA video TU (siyo kuzuia
  // kuhifadhi bidhaa) — bidhaa inaendelea kuhifadhiwa na picha zake zote.
  let videoToSave = apNewVideo;
  if (videoToSave && (apImagesTotalBytes() + videoToSave.length) > AP_TOTAL_SAFE_BYTES) {
    videoToSave = null;
  }
  if (typeof cloudNextProductId !== 'function' || typeof AHS_CLOUD_READY === 'undefined' || !AHS_CLOUD_READY) {
    statusEl.textContent = '⚠️ Firebase haijaunganishwa — bidhaa haiwezi kuhifadhiwa moja kwa moja bado.';
    statusEl.style.color = '#b23a3a';
    return;
  }
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  statusEl.style.color = 'var(--ink-soft)';
  statusEl.textContent = '⏳ Inahifadhi...';
  try {
    const id = await cloudNextProductId();
    const product = {
      id, name, category, effect: effect || category, catSlug: slugifyA(category),
      prefix: 'CUSTOM',
      prices: { retail, w5, w10 },
      // Hatuhifadhi "cover" kama nakala tofauti ya picha ya kwanza — hilo
      // lingerudufisha data na kuongeza uwezekano wa kuvuka ukomo wa 1MB wa
      // Firestore. Picha ya kwanza kwenye "images" ndiyo inayotumika kama
      // profaili kila mahali kwenye tovuti (angalia getEffectiveProduct/
      // productCardHTML kwenye js/app.js).
      images: apNewImages,
      rating: 4.5, reviewCount: 0, bestseller: false,
      dateAdded: new Date().toISOString().slice(0, 10),
      // Firestore haikubali thamani "undefined" — tunaongeza funguo hizi mbili
      // TU ikiwa admin aliwajaza (badala ya kuziweka "undefined"). "videoClip"
      // ni video HALISI iliyopigwa/kuchaguliwa na admin (kama picha), siyo link.
      ...(caption ? { caption } : {}),
      ...((stock !== null && !isNaN(stock)) ? { stock } : {}),
      ...(videoToSave ? { videoClip: videoToSave } : {}),
    };
    if (apNewVideo && !videoToSave) {
      statusEl.textContent = 'ℹ️ Video ilikuwa kubwa mno pamoja na picha — bidhaa inahifadhiwa BILA video (picha zote zipo salama). Unaweza kuongeza video ndogo zaidi baadaye kwa kubofya "Hariri".';
    }
    const ok = await cloudSaveNewProduct(product);
    if (ok) {
      statusEl.style.color = 'var(--green-deep)';
      statusEl.textContent = `✅ Bidhaa "${name}" imeongezwa (namba ${id}) — inaonekana dukani sasa hivi. Itaonekana pia kwenye tab "🛒 Bidhaa" hapo juu, pamoja na zote nyingine.`;
      e.target.reset();
      apNewImages = [];
      apNewVideo = null;
      document.getElementById('apVideoPreviewWrap').style.display = 'none';
      document.getElementById('apVideoStatus').style.display = 'none';
      document.getElementById('apThumbs').innerHTML = '';
      document.getElementById('apCategoryNew').style.display = 'none';
      updateApSeoPreview();
    } else {
      statusEl.style.color = '#b23a3a';
      statusEl.textContent = '❌ Imeshindikana kuhifadhi (haijulikani sababu). Jaribu tena.';
    }
  } catch (err) {
    console.warn('handleAddProductSubmit', err);
    const code = err && err.code;
    const msg = String((err && err.message) || '');
    statusEl.style.color = '#b23a3a';
    if (code === 'permission-denied') {
      statusEl.textContent = '❌ Umezuiwa (permission-denied): hujaingia kama "Admin wa kweli" wa Firebase. Toka (🚪) kisha Ingia tena ukijaza EMAIL yako halisi ya Firebase pamoja na password inayolingana kabisa na ile uliyoisajili kwenye Firebase Console → Authentication → Users. Nenosiri la ukurasa wa Admin peke yake HALITOSHI.';
    } else if (/longer than|exceeds|too large|invalid-argument/i.test(msg)) {
      statusEl.textContent = '❌ Picha ni kubwa mno kwa hati moja ya Firestore (ukomo 1MB). Futa picha 1-2 kisha jaribu tena.';
    } else {
      statusEl.textContent = '❌ Hitilafu imetokea: ' + (msg || 'haijulikani') + '. Jaribu tena.';
    }
  } finally {
    submitBtn.disabled = false;
  }
}

function initAdminCustomProductsSync() {
  if (typeof cloudListenCustomProducts !== 'function') return;
  if (unsubscribeCustomProducts) unsubscribeCustomProducts();
  unsubscribeCustomProducts = cloudListenCustomProducts((list) => {
    adminCustomProducts = list;
    adminCustomProductsMap = {};
    list.forEach(p => {
      adminCustomProductsMap[p.id] = p;
      if (p.category && !CATEGORIES.includes(p.category)) CATEGORIES.push(p.category);
    });
    if (document.getElementById('tab-addproduct').style.display !== 'none') renderAddProductTab();
    if (document.getElementById('tab-products').style.display !== 'none') {
      renderProductsTab(document.getElementById('productSearch')?.value);
    }
    renderDashboard();
  });
}

/* ===================== ORDERS TAB ===================== */
const ORDER_STAGES = [
  { key: 'placed', label: 'Imepokelewa' },
  { key: 'confirmed', label: 'Imethibitishwa' },
  { key: 'packed', label: 'Imefungashwa' },
  { key: 'shipped', label: 'Imesafirishwa' },
  { key: 'delivered', label: 'Imewasilishwa' },
];
let seenOrderIds = new Set(lsGetA('ahs_seen_orders', []));

function mergeOrders(localOrders, cloudOrders) {
  const map = {};
  localOrders.forEach(o => map[o.id] = o);
  cloudOrders.forEach(o => map[o.id] = { ...map[o.id], ...o }); // cloud is source of truth when present
  return Object.values(map).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderOrdersTab(cloudOrders) {
  const localOrders = lsGetA('ahs_orders', []);
  const orders = cloudOrders ? mergeOrders(localOrders, cloudOrders) : localOrders;
  const newCount = orders.filter(o => !seenOrderIds.has(o.id)).length;
  updateOrderBadge(newCount);

  const rows = orders.map(o => {
    const status = o.status || 'placed';
    const isNew = !seenOrderIds.has(o.id);
    const custName = o.customerName ? escapeHtmlA(o.customerName) : '<span style="color:var(--ink-soft);">—</span>';
    const custPhone = o.customerPhone ? `<a href="tel:${escapeHtmlA(o.customerPhone)}" style="color:var(--green-deep); font-weight:600;">${escapeHtmlA(o.customerPhone)}</a>` : '<span style="color:var(--ink-soft);">—</span>';
    const custRegion = o.customerRegion ? escapeHtmlA(o.customerRegion) : '<span style="color:var(--ink-soft);">—</span>';
    const shipCost = o.shippingCost ? fmtA(o.shippingCost) : '<span style="color:var(--ink-soft);">Itathibitishwa</span>';
    return `<tr class="${isNew ? 'order-row-new' : ''}">
    <td><b>${escapeHtmlA(o.id)}</b>${isNew ? ' 🆕' : ''}</td>
    <td>${new Date(o.date).toLocaleString('sw-TZ')}</td>
    <td>${custName}</td>
    <td>${custPhone}</td>
    <td>${custRegion}</td>
    <td>${shipCost}</td>
    <td>${o.items.map(i => escapeHtmlA(i.name) + ' x' + i.qty).join(', ')}</td>
    <td>${fmtA(o.total)}</td>
    <td>
      <select class="order-status-select" data-status-for="${escapeHtmlA(o.id)}">
        ${ORDER_STAGES.map(s => `<option value="${s.key}" ${s.key===status?'selected':''}>${s.label}</option>`).join('')}
      </select>
    </td>
    <td>${status === 'placed' ? `<button class="order-confirm-btn" data-confirm="${escapeHtmlA(o.id)}">Thibitisha</button>` : '✅'}</td>
  </tr>`;
  }).join('');

  document.getElementById('tab-orders').innerHTML = `
    <h2 style="color:var(--green-deep); margin-bottom:16px; font-family:'Fraunces',serif;">Oda (${orders.length}) ${newCount ? `<span class="order-notif-badge" style="position:static;">${newCount} mpya</span>` : ''}</h2>
    <p style="font-size:.78rem; color:var(--ink-soft); margin-bottom:10px;">Badilisha hali ya oda hapa chini — mteja ataona hali hiyo papo hapo kwenye ukurasa wake wa "Fuatilia Oda" (ikiwa Firebase imewekwa). Safu ya "Usafiri" inaonyesha gharama ya usafiri kwa mkoa wa mteja (kiotomatiki kutoka orodha ya bei ya USIRI) — "Jijini" maana yake ni Dar es Salaam. Kanuni: kwa oda za mikoani, malipo hufanyika kabla ya kutuma bidhaa.</p>
    ${orders.length===0 ? '<p style="color:var(--ink-soft);">Bado hakuna oda iliyorekodiwa.</p>' : `
    <div style="overflow:auto;"><table class="admin-table">
      <thead><tr><th>Namba</th><th>Tarehe</th><th>Jina la Mteja</th><th>Simu</th><th>Mkoa</th><th>Usafiri</th><th>Bidhaa</th><th>Jumla</th><th>Hali</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`}`;

  document.querySelectorAll('[data-confirm]').forEach(btn => {
    btn.addEventListener('click', () => setOrderStatus(btn.dataset.confirm, 'confirmed'));
  });
  document.querySelectorAll('[data-status-for]').forEach(sel => {
    sel.addEventListener('change', () => setOrderStatus(sel.dataset.statusFor, sel.value));
  });

  // mark all currently-shown orders as "seen" once rendered
  orders.forEach(o => seenOrderIds.add(o.id));
  lsSetA('ahs_seen_orders', Array.from(seenOrderIds));
}

function setOrderStatus(orderId, status) {
  const orders = lsGetA('ahs_orders', []);
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx > -1) { orders[idx].status = status; lsSetA('ahs_orders', orders); }
  if (typeof cloudUpdateOrderStatus === 'function') cloudUpdateOrderStatus(orderId, status);
  renderOrdersTab(lastCloudOrders);
  renderDashboard();
}

function updateOrderBadge(count) {
  const badge = document.getElementById('orderNotifBadge');
  if (!badge) return;
  if (count > 0) { badge.textContent = count > 99 ? '99+' : String(count); badge.style.display = 'flex'; }
  else { badge.style.display = 'none'; }
}

/* ---------- live cloud order listener ---------- */
let lastCloudOrders = null;
let unsubscribeOrders = null;
function initAdminOrderSync() {
  if (typeof cloudListenOrders !== 'function') return;
  if (unsubscribeOrders) unsubscribeOrders();
  unsubscribeOrders = cloudListenOrders((orders) => {
    const hadNew = lastCloudOrders && orders.some(o => !lastCloudOrders.find(x => x.id === o.id));
    lastCloudOrders = orders;
    if (hadNew) playNotifSound();
    renderOrdersTab(orders);
    renderDashboard();
  });
}
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.value = 0.15;
    o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 220);
  } catch (e) { /* audio not available, ignore */ }
}

/* ===================== WATEJA WALIO ONLINE (kitufe cha dashboard) ===================== */
function refreshOnlineVisitorCount() {
  const btn = document.getElementById('onlineCountBtn');
  const resultEl = document.getElementById('onlineCountResult');
  if (!resultEl) return;
  if (typeof cloudCountOnlineVisitors !== 'function' || !(typeof AHS_CLOUD_READY !== 'undefined' && AHS_CLOUD_READY)) {
    resultEl.textContent = '⚠️ Firebase haijaunganishwa bado.';
    return;
  }
  if (btn) btn.disabled = true;
  resultEl.textContent = 'Inahesabu...';
  cloudCountOnlineVisitors(60).then(count => {
    resultEl.textContent = `👥 Watu ${count} wapo online sasa hivi`;
    if (btn) btn.disabled = false;
  }).catch(() => {
    resultEl.textContent = '⚠️ Imeshindwa kupata idadi. Jaribu tena.';
    if (btn) btn.disabled = false;
  });
}

/* ===================== ADMIN ONLINE PRESENCE ===================== */
function togglePresence(online) {
  lsSetA('ahs_admin_online', online);
  if (typeof cloudSetPresence === 'function') cloudSetPresence(online);
  const dot = document.getElementById('presenceDot');
  if (dot) dot.classList.toggle('online', online);
}
function initPresenceUI() {
  const saved = lsGetA('ahs_admin_online', true);
  const checkbox = document.getElementById('presenceCheckbox');
  if (checkbox) checkbox.checked = saved;
  togglePresence(saved);
  window.addEventListener('beforeunload', () => { if (typeof cloudSetPresence === 'function') cloudSetPresence(false); });
}

/* ===================== MESSAGES TAB ===================== */
function renderMessagesTab() {
  const messages = lsGetA('ahs_messages', []);
  const rows = messages.map((m,i) => `<tr>
    <td>${escapeHtmlA(m.name)}</td>
    <td>${escapeHtmlA(m.phone)}</td>
    <td>${escapeHtmlA(m.email||'-')}</td>
    <td style="max-width:300px;">${escapeHtmlA(m.message)}</td>
    <td>${new Date(m.date).toLocaleDateString('sw-TZ')}</td>
    <td><button class="admin-danger" data-delmsg="${i}">🗑</button></td>
  </tr>`).join('');
  document.getElementById('tab-messages').innerHTML = `
    <h2 style="color:var(--green-deep); margin-bottom:16px; font-family:'Fraunces',serif;">Ujumbe wa Wateja (${messages.length})</h2>
    ${messages.length===0 ? '<p style="color:var(--ink-soft);">Bado hakuna ujumbe.</p>' : `
    <div style="overflow:auto;"><table class="admin-table">
      <thead><tr><th>Jina</th><th>Simu</th><th>Barua Pepe</th><th>Ujumbe</th><th>Tarehe</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`}`;
  document.querySelectorAll('[data-delmsg]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.delmsg, 10);
      const list = lsGetA('ahs_messages', []);
      list.splice(idx, 1);
      lsSetA('ahs_messages', list);
      renderMessagesTab();
      renderDashboard();
    });
  });
}

/* ===================== NEWSLETTER TAB ===================== */
async function renderNewsletterTab() {
  const tab = document.getElementById('tab-newsletter');
  tab.innerHTML = `<p style="color:var(--ink-soft);">🤖 Inapakia orodha halisi kutoka Firestore...</p>`;
  let emails = [];
  if (typeof cloudListNewsletter === 'function') {
    const cloudRows = await cloudListNewsletter();
    emails = cloudRows.map(r => r.email);
  }
  // Fallback: pia jumuisha zilizohifadhiwa kwenye kifaa hiki tu (mfano kama
  // ziliongezwa kabla ya sasisho hili, au kama Firestore haipatikani sasa hivi).
  const local = lsGetA('ahs_newsletter', []);
  local.forEach(e => { if (!emails.includes(e)) emails.push(e); });
  document.getElementById('tab-newsletter').innerHTML = `
    <h2 style="color:var(--green-deep); margin-bottom:16px; font-family:'Fraunces',serif;">Wanaojiandikisha Jarida (${emails.length})</h2>
    ${emails.length===0 ? '<p style="color:var(--ink-soft);">Bado hakuna barua pepe zilizosajiliwa.</p>' : `
    <div style="overflow:auto;"><table class="admin-table">
      <thead><tr><th>#</th><th>Barua Pepe</th></tr></thead>
      <tbody>${emails.map((e,i)=>`<tr><td>${i+1}</td><td>${escapeHtmlA(e)}</td></tr>`).join('')}</tbody>
    </table></div>
    <button class="btn btn-ghost" style="margin-top:14px;" onclick="exportNewsletterCSV()">⬇️ Pakua CSV</button>`}`;
  window._ahsNewsletterEmails = emails;
}
function exportNewsletterCSV() {
  const list = window._ahsNewsletterEmails || lsGetA('ahs_newsletter', []);
  const csv = 'email\n' + list.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'agnes-newsletter-subscribers.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ===================== REVIEWS TAB ===================== */
function renderReviewsTab() {
  const reviews = lsGetA('ahs_reviews_custom', {});
  const entries = Object.entries(reviews);
  document.getElementById('tab-reviews').innerHTML = `
    <h2 style="color:var(--green-deep); margin-bottom:16px; font-family:'Fraunces',serif;">Ongeza Maoni ya Mteja</h2>
    <div style="max-width:480px; display:grid; gap:10px; margin-bottom:24px;">
      <input type="number" id="revProductId" placeholder="ID ya Bidhaa (0-${allAdminProducts().length-1})" style="padding:10px; border-radius:8px; border:1px solid var(--line);">
      <input type="text" id="revName" placeholder="Jina la Mteja" style="padding:10px; border-radius:8px; border:1px solid var(--line);">
      <select id="revRating" style="padding:10px; border-radius:8px; border:1px solid var(--line);">
        <option value="5">★★★★★ (5)</option><option value="4">★★★★☆ (4)</option><option value="3">★★★☆☆ (3)</option>
      </select>
      <textarea id="revComment" placeholder="Maoni ya mteja..." rows="3" style="padding:10px; border-radius:8px; border:1px solid var(--line);"></textarea>
      <button class="btn btn-primary" onclick="addCustomReview()">Ongeza Maoni</button>
    </div>
    <h3 style="margin-bottom:10px;">Maoni Yaliyoongezwa (${entries.reduce((s,[,v])=>s+v.length,0)})</h3>
    <div style="overflow:auto;"><table class="admin-table">
      <thead><tr><th>ID ya Bidhaa</th><th>Jina</th><th>Ukadiriaji</th><th>Maoni</th><th></th></tr></thead>
      <tbody>${entries.flatMap(([id, list]) => list.map((r, i) => `<tr>
        <td>${id} — ${escapeHtmlA(getBaseProductA(id) ? getBaseProductA(id).name : '')}</td>
        <td>${escapeHtmlA(r.name)}</td><td>${'★'.repeat(r.rating)}</td><td>${escapeHtmlA(r.comment)}</td>
        <td><button class="admin-danger" data-delrev="${id}:${i}">🗑</button></td>
      </tr>`)).join('')}</tbody>
    </table></div>`;
  document.querySelectorAll('[data-delrev]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [id, i] = btn.dataset.delrev.split(':');
      const revs = lsGetA('ahs_reviews_custom', {});
      revs[id].splice(parseInt(i,10), 1);
      lsSetA('ahs_reviews_custom', revs);
      renderReviewsTab();
    });
  });
}
function addCustomReview() {
  const id = document.getElementById('revProductId').value;
  const name = document.getElementById('revName').value.trim();
  const rating = parseInt(document.getElementById('revRating').value, 10);
  const comment = document.getElementById('revComment').value.trim();
  if (id === '' || !getBaseProductA(id) || !name || !comment) { alert('Jaza taarifa zote sahihi.'); return; }
  const revs = lsGetA('ahs_reviews_custom', {});
  revs[id] = revs[id] || [];
  revs[id].unshift({ name, rating, comment, sw: comment, en: comment, date: new Date().toISOString() });
  lsSetA('ahs_reviews_custom', revs);
  renderReviewsTab();
}

/* ===================== PRODUCT EDIT PANEL: images, cover, caption, MOQ ===================== */
let peditProductId = null;
let peditImages = [];   // array of image URLs (data-URLs if local-only, Storage URLs if cloud)
let peditCover = null;

function openPeditOverlay(id) {
  peditProductId = id;
  const p = getBaseProductA(id);
  const ov = lsGetA('ahs_product_overrides', {})[id] || {};
  peditImages = ov.images && ov.images.length ? ov.images.slice()
    : (p.images && p.images.length ? p.images.slice() : ['images/' + p.file]);
  peditCover = ov.cover || p.cover || peditImages[0];
  document.getElementById('peditTitle').textContent = 'Hariri: ' + p.name;
  const peditNameEl = document.getElementById('peditName');
  peditNameEl.value = ov.name || p.name;
  updatePeditNameCount();
  peditNameEl.oninput = updatePeditNameCount;
  document.getElementById('peditCaption').value = ov.caption || '';
  updatePeditCharCount();
  document.getElementById('peditW5').value = ov.prices ? ov.prices.w5 : p.prices.w5;
  document.getElementById('peditW10').value = ov.prices ? ov.prices.w10 : p.prices.w10;
  document.getElementById('peditStock').value = (typeof ov.stock === 'number') ? ov.stock : '';
  document.getElementById('peditVideoId').value = ov.videoId || '';
  document.getElementById('peditBeforeImg').value = ov.beforeImage || '';
  document.getElementById('peditAfterImg').value = ov.afterImage || '';
  document.getElementById('peditCloudNote').textContent = (typeof AHS_CLOUD_READY !== 'undefined' && AHS_CLOUD_READY)
    ? 'Picha zitahifadhiwa kwenye database (Firestore) — zitaonekana kwa wateja wote papo hapo. Kikomo: picha 5 kwa kila bidhaa.'
    : '⚠️ Firebase haijawekwa: picha zitahifadhiwa kwenye kivinjari hiki tu (localStorage) na hazitaonekana kwa mteja kwenye kifaa kingine.';
  renderPeditThumbs();
  document.getElementById('peditOverlay').classList.add('open');
}
function updatePeditNameCount() {
  const el = document.getElementById('peditName');
  const countEl = document.getElementById('peditNameCount');
  if (!el || !countEl) return;
  const len = el.value.length;
  countEl.textContent = `${len} / 60 herufi (Google inakata majina marefu zaidi ya ~60)`;
  countEl.style.color = len > 60 ? '#b23a3a' : 'var(--ink-soft)';
}
function closePeditOverlay() {
  document.getElementById('peditOverlay').classList.remove('open');
  peditProductId = null;
}
function renderPeditThumbs() {
  document.getElementById('peditThumbs').innerHTML = peditImages.map((url, i) => `
    <div class="pedit-thumb ${url===peditCover?'is-cover':''}">
      <button class="pedit-setcover" data-setcover="${i}" title="Weka kama Profaili"></button>
      <img src="${url}" alt="">
      ${url===peditCover ? '<span class="pedit-cover-badge">Profaili</span>' : ''}
      ${peditImages.length>1 ? `<button class="pedit-del" data-delimg="${i}">✕</button>` : ''}
    </div>`).join('');
  document.querySelectorAll('[data-setcover]').forEach(b => b.addEventListener('click', () => {
    peditCover = peditImages[parseInt(b.dataset.setcover, 10)];
    renderPeditThumbs();
  }));
  document.querySelectorAll('[data-delimg]').forEach(b => b.addEventListener('click', () => {
    const i = parseInt(b.dataset.delimg, 10);
    const removed = peditImages.splice(i, 1)[0];
    if (peditCover === removed) peditCover = peditImages[0];
    renderPeditThumbs();
    if (typeof cloudDeleteImage === 'function' && removed && removed.includes('firebasestorage')) cloudDeleteImage(removed);
  }));
}
// Kubana picha kabla ya kuhifadhi. Firebase Storage sasa inahitaji mpango wa
// kulipa (Blaze), kwa hiyo tunahifadhi picha moja kwa moja ndani ya Firestore
// (bure kabisa) kama "data URL" — lakini Firestore ina ukomo wa 1MB kwa kila
// hati (document). Kazi hii inapunguza ubora (quality) hatua kwa hatua mpaka
// picha iwe chini ya ~110KB, ili picha 5 ziweze kutoshea salama.
function compressImageFile(file, maxDim = 900, targetBytes = 110 * 1024) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else if (height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const qualitySteps = [0.75, 0.6, 0.45, 0.32, 0.2, 0.12];
        let stepIdx = 0;
        const tryStep = () => {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(file); return; } // fallback: use original if compression fails
            const isLast = stepIdx === qualitySteps.length - 1;
            if (blob.size <= targetBytes || isLast) {
              resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
            } else {
              stepIdx++;
              tryStep();
            }
          }, 'image/jpeg', qualitySteps[stepIdx]);
        };
        tryStep();
      };
      img.onerror = () => resolve(file); // fallback: use original if it can't be decoded as an image
      img.src = reader.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

const PEDIT_MAX_IMAGES = 5;

document.getElementById('peditFileInput')?.addEventListener('change', async (e) => {
  const rawFiles = Array.from(e.target.files || []);
  if (!rawFiles.length) return;
  const room = PEDIT_MAX_IMAGES - peditImages.length;
  if (room <= 0) {
    alert('Umefikia kikomo cha picha ' + PEDIT_MAX_IMAGES + ' kwa kila bidhaa. Futa picha moja kwanza ukitaka kuongeza nyingine.');
    e.target.value = '';
    return;
  }
  if (rawFiles.length > room) {
    alert('Unaweza kuongeza picha ' + room + ' zaidi tu (kikomo ni ' + PEDIT_MAX_IMAGES + ' kwa bidhaa). Zitakazozidi hazitaongezwa.');
  }
  const filesToUse = rawFiles.slice(0, room);
  const progWrap = document.getElementById('peditProgressWrap');
  const progBar = document.getElementById('peditProgressBar');
  progWrap.style.display = 'block';
  for (let i = 0; i < filesToUse.length; i++) {
    progBar.style.width = Math.round(((i) / filesToUse.length) * 100) + '%';
    const file = await compressImageFile(filesToUse[i]);
    const dataUrl = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
    peditImages.push(dataUrl);
    if (!peditCover) peditCover = dataUrl;
  }
  progBar.style.width = '100%';
  setTimeout(() => { progWrap.style.display = 'none'; progBar.style.width = '0%'; }, 300);
  renderPeditThumbs();
  e.target.value = '';
});
document.getElementById('peditCaption')?.addEventListener('input', updatePeditCharCount);
function updatePeditCharCount() {
  const el = document.getElementById('peditCaption');
  const count = el.value.length;
  const cEl = document.getElementById('peditCharCount');
  cEl.textContent = count + ' / 900';
  cEl.classList.toggle('over', count >= 900);
}
function peditFallbackCaption(p) {
  // Akiba TU kwa wakati AI_WORKER_URL haijawekwa bado kwenye js/ai-config.js
  // (ona cloudflare-worker/agnes-ai-worker.js kwa maelekezo ya kuiwasha),
  // au Worker imeshindwa kujibu — ili panel isikwame kabisa.
  const effectSw = translateEffect(p.effect).toLowerCase();
  const templates = [
    `${p.name} ni bidhaa ya asili inayosaidia ${effectSw}. Imetengenezwa kwa viungo vya asili, salama kutumia kila siku, na inapatikana kwa bei nafuu ya rejareja na jumla. Agiza sasa Agnes Herbal Supplements!`,
    `Karibu ${p.name} — suluhisho la asili kwa ${effectSw}. Bidhaa hii imependwa na wateja wengi kutokana na ubora wake. Inapatikana rejareja na kwa bei ya jumla (MOQ 5pcs).`,
  ];
  return templates[Math.floor(Math.random() * templates.length)].slice(0, 900);
}

async function peditGenerateCaption() {
  // AI HALISI: tunatumia TensorFlow.js + MobileNet (bure, hakuna API key) tu
  // kuthibitisha picha inasomeka na kupata vidokezo vya kuona ndani yake, KISHA
  // tunatuma jina/athari/vidokezo hivyo kwa modeli halisi ya lugha (Groq, kupitia
  // Cloudflare Worker yetu — ona cloudflare-worker/agnes-ai-worker.js) ambayo
  // ndiyo INAYOANDIKA maneno ya caption yenyewe — si tena template ya kubahatisha.
  const p = getBaseProductA(peditProductId);
  const srcImg = peditCover || peditImages[0];
  const btn = document.querySelector('[onclick="peditGenerateCaption()"]');
  if (!srcImg) {
    alert('Weka picha kwanza ndipo AI iweze kuisoma.');
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = '🤖 AI inasoma picha...'; }
  let labels = [];
  try {
    const imgEl = new Image();
    await new Promise((resolve, reject) => {
      imgEl.onload = resolve; imgEl.onerror = reject; imgEl.src = srcImg;
    });
    // NOTE: MobileNet ni classifier ya vitu vya kawaida (ImageNet), hivyo lebo
    // zake si sahihi kwa "chai za mitishamba" moja kwa moja — tunazipeleka kwa
    // AI ya maneno kama muktadha wa ziada tu (hiari), si chanzo pekee cha maandishi.
    const preds = await classifyImage(imgEl, 3);
    labels = (preds || []).map(x => x.className || x.label).filter(Boolean);
  } catch (e) {
    console.warn('Image classify failed (itaendelea bila lebo za picha)', e);
  }

  const extraInstruction = (document.getElementById('peditCaptionPrompt')?.value || '').trim();

  let text = null;
  if (typeof aiAssistantConfigured === 'function' && aiAssistantConfigured()) {
    if (btn) btn.textContent = '🤖 AI inaandika caption...';
    try {
      const data = await aiWorkerCall({ action: 'caption', lang: 'sw', name: p.name, effect: p.effect, labels, instruction: extraInstruction });
      if (data && data.caption) text = data.caption;
    } catch (e) {
      console.warn('AI caption worker failed, tunatumia akiba', e);
    }
  }
  if (!text) text = peditFallbackCaption(p);

  document.getElementById('peditCaption').value = text.slice(0, 900);
  updatePeditCharCount();
  if (btn) { btn.disabled = false; btn.textContent = '🤖 Tengeneza Caption kwa AI (kutoka picha)'; }
}
async function savePeditOverlay() {
  const statusEl = document.getElementById('peditSaveStatus');
  const saveBtn = document.getElementById('peditSaveBtn');
  const overrides = lsGetA('ahs_product_overrides', {});
  const id = peditProductId;
  const base = getBaseProductA(id).prices;
  const w5 = parseInt(document.getElementById('peditW5').value, 10) || base.w5;
  const w10 = parseInt(document.getElementById('peditW10').value, 10) || base.w10;
  const retail = overrides[id] && overrides[id].prices ? overrides[id].prices.retail : base.retail;
  const stockVal = document.getElementById('peditStock').value;
  const videoId = document.getElementById('peditVideoId').value.trim();
  const beforeImg = document.getElementById('peditBeforeImg').value.trim();
  const afterImg = document.getElementById('peditAfterImg').value.trim();
  const nameVal = document.getElementById('peditName').value.trim();
  if (!nameVal) { alert('Jina la bidhaa haliwezi kuachwa wazi.'); return; }
  const data = {
    name: nameVal,
    images: peditImages,
    cover: peditCover,
    caption: document.getElementById('peditCaption').value.slice(0, 900),
    prices: { retail, w5, w10 },
    videoId: videoId || null,
    beforeImage: beforeImg || null,
    afterImage: afterImg || null,
  };
  if (stockVal !== '') data.stock = parseInt(stockVal, 10);
  const approxBytes = JSON.stringify(data).length;
  if (approxBytes > 900 * 1024) {
    alert('Picha ulizoongeza ni kubwa mno kwa pamoja (zaidi ya kikomo cha database ya bure). Futa picha moja au mbili kisha jaribu tena.');
    return;
  }
  overrides[id] = { ...(overrides[id] || {}), ...data };
  lsSetA('ahs_product_overrides', overrides);

  // Tofauti na hapo awali: sasa TUNASUBIRI matokeo halisi ya Firestore kabla
  // ya kufunga dirisha, ili kama uhifadhi umeshindikana (mfano hujaingia kama
  // Admin wa Cloud) uone ukweli papo hapo badala ya kudhani kila kitu
  // kimefanikiwa wakati kwa kweli mteja hataona mabadiliko yoyote.
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Inahifadhi...'; }
  if (statusEl) { statusEl.style.display = 'block'; statusEl.style.color = 'var(--ink-soft)'; statusEl.textContent = '⏳ Inahifadhi kwenye Cloud...'; }

  let cloudOk = true;
  if (typeof AHS_CLOUD_READY !== 'undefined' && AHS_CLOUD_READY) {
    if (!ahsCloudAdminOK) {
      cloudOk = false;
    } else if (typeof cloudSaveProduct === 'function') {
      cloudOk = await cloudSaveProduct(id, data);
    }
  }

  if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Hifadhi'; }
  renderProductsTab(document.getElementById('productSearch')?.value);

  if (!AHS_CLOUD_READY) {
    // Local-only kabisa, halali kwa mtumiaji anayefahamu — funga kama kawaida.
    closePeditOverlay();
    return;
  }
  if (cloudOk) {
    if (statusEl) { statusEl.style.color = 'var(--green-deep)'; statusEl.textContent = '✅ Imehifadhiwa — wateja wote wataona mabadiliko haya papo hapo.'; }
    setTimeout(closePeditOverlay, 900);
  } else {
    // MUHIMU: usifunge dirisha kimya kimya — hii ndiyo hasa iliyokuwa
    // ikisababisha bei/caption/picha "kupotea" bila Floribert kujua.
    if (statusEl) {
      statusEl.style.color = '#b23a3a';
      statusEl.textContent = '❌ HAIJAHIFADHIWA kwa wateja (imebaki kivinjari hiki tu)! Hujaingia kama Admin wa Cloud. Funga dirisha hili, bofya 🚪 Toka, kisha Ingia tena ukijaza Email/Password sahihi ya Firebase kabla ya kuhariri tena.';
    }
  }
}

/* live sync: reflect changes made from another device/session while this admin panel is open */
let unsubscribeProducts = null;
function initAdminProductSync() {
  if (typeof cloudListenProducts !== 'function') return;
  if (unsubscribeProducts) unsubscribeProducts();
  unsubscribeProducts = cloudListenProducts((cloudMap) => {
    const overrides = lsGetA('ahs_product_overrides', {});
    Object.keys(cloudMap).forEach(id => { overrides[id] = { ...(overrides[id] || {}), ...cloudMap[id] }; });
    lsSetA('ahs_product_overrides', overrides);
    if (document.getElementById('tab-products').style.display !== 'none') {
      renderProductsTab(document.getElementById('productSearch')?.value);
    }
  });
}

/* ===================== MPANGILIO WA DUKA (Ofa za Kundi + Bidhaa za Leo) ===================== */
// Mpangilio huu unahifadhiwa kwenye hati MOJA ya Firestore (meta/homepageSettings)
// — hakuna Firestore Rules mpya zinazohitajika (rule ya "meta/{docId}" iliyopo
// tayari inaruhusu kila mtu kusoma, admin pekee kuandika). Bila Firebase,
// mabadiliko yanabaki kwenye kivinjari hiki tu (localStorage), kama sehemu
// nyingine za admin panel hii.
let mpFeaturedDraft = [];   // orodha ya ID za bidhaa "Leo Tunapendekeza", kwa mfuatano
let mpOffersDraft = {};     // { "Jina la Kundi": asilimiaYaOfa }

function mpLoadSettings() {
  const s = lsGetA('ahs_homepage_settings', { featuredToday: [], categoryOffers: {} });
  mpFeaturedDraft = Array.isArray(s.featuredToday) ? [...s.featuredToday] : [];
  mpOffersDraft = { ...(s.categoryOffers || {}) };
}

function renderMpangilioTab() {
  mpLoadSettings();
  const cloudOn = (typeof AHS_CLOUD_READY !== 'undefined' && AHS_CLOUD_READY);
  document.getElementById('tab-mpangilio').innerHTML = `
    <h2 style="color:var(--green-deep); margin-bottom:6px; font-family:'Fraunces',serif;">🎯 Mpangilio wa Duka</h2>
    <p style="font-size:.78rem; color:var(--ink-soft); margin-bottom:20px;">
      Hapa unaweza: (1) kuchagua bidhaa zipi zionekane MWANZONI kabisa dukani leo, na kupangilia mfuatano wake, na
      (2) kuweka/kubadilisha ofa (asilimia ya punguzo) kwa kila kundi la bidhaa — punguzo linatumika moja kwa moja
      kwenye bei halisi (rejareja na jumla) kila mahali dukani, si onyesho tu.
      ${cloudOn ? '' : '⚠️ Firebase haijaunganishwa — mabadiliko yatabaki kwenye kivinjari hiki tu.'}
    </p>

    <div style="border:1px solid var(--line); border-radius:14px; padding:18px 20px; margin-bottom:24px; max-width:720px;">
      <h3 style="color:var(--green-deep); font-size:1rem; margin-bottom:10px;">🌿 Bidhaa za Leo (zionekane mwanzoni)</h3>
      <p style="font-size:.78rem; color:var(--ink-soft); margin-bottom:12px;">Tafuta bidhaa kisha bofya "➕ Ongeza". Panga mfuatano kwa vitufe ⬆️⬇️ — ya juu ndiyo itaonekana kwanza kabisa.</p>
      <input type="text" class="admin-search" id="mpFeaturedSearch" placeholder="Tafuta bidhaa ya kuongeza...">
      <div id="mpFeaturedSearchResults" style="margin-top:8px; max-height:220px; overflow:auto; border:1px solid var(--line); border-radius:8px; display:none;"></div>
      <div id="mpFeaturedList" style="margin-top:14px; display:flex; flex-direction:column; gap:8px;"></div>
      <button class="btn btn-primary" style="margin-top:14px;" id="mpFeaturedSaveBtn" onclick="mpSaveSettings()">💾 Hifadhi Mpangilio</button>
      <p id="mpFeaturedStatus" style="font-size:.78rem; font-weight:700; margin-top:10px; display:none;"></p>
    </div>

    <div style="border:1px solid var(--line); border-radius:14px; padding:18px 20px; max-width:720px;">
      <h3 style="color:var(--green-deep); font-size:1rem; margin-bottom:10px;">🏷️ Ofa kwa Kila Kundi</h3>
      <p style="font-size:.78rem; color:var(--ink-soft); margin-bottom:12px;">Weka asilimia ya punguzo (mfano 15) kwa kundi lolote, au acha 0 kuzima ofa yake.</p>
      <div id="mpOffersRows" style="display:flex; flex-direction:column; gap:10px;"></div>
      <button class="btn btn-primary" style="margin-top:16px;" id="mpOffersSaveBtn" onclick="mpSaveSettings()">💾 Hifadhi Ofa</button>
      <p id="mpOffersStatus" style="font-size:.78rem; font-weight:700; margin-top:10px; display:none;"></p>
    </div>`;

  mpRenderFeaturedList();
  mpRenderOffersRows();

  const searchEl = document.getElementById('mpFeaturedSearch');
  searchEl.addEventListener('input', () => mpRenderFeaturedSearchResults(searchEl.value));
}

function mpRenderFeaturedSearchResults(q) {
  const box = document.getElementById('mpFeaturedSearchResults');
  q = (q || '').trim().toLowerCase();
  if (!q) { box.style.display = 'none'; box.innerHTML = ''; return; }
  const matches = allAdminProducts()
    .filter(p => !mpFeaturedDraft.includes(p.id) && p.name.toLowerCase().includes(q))
    .slice(0, 12);
  if (!matches.length) {
    box.style.display = 'block';
    box.innerHTML = `<div style="padding:10px 12px; font-size:.8rem; color:var(--ink-soft);">Hakuna bidhaa zinazolingana.</div>`;
    return;
  }
  box.style.display = 'block';
  box.innerHTML = matches.map(p => `
    <div style="display:flex; align-items:center; gap:10px; padding:8px 12px; border-bottom:1px solid var(--line);">
      <span style="flex:1; font-size:.82rem;">${escapeHtmlA(p.name)} <span style="color:var(--ink-soft);">(${escapeHtmlA(p.category)})</span></span>
      <button class="order-confirm-btn" data-mpadd="${p.id}">➕ Ongeza</button>
    </div>`).join('');
  box.querySelectorAll('[data-mpadd]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.mpadd, 10);
      if (!mpFeaturedDraft.includes(id)) mpFeaturedDraft.push(id);
      document.getElementById('mpFeaturedSearch').value = '';
      mpRenderFeaturedSearchResults('');
      mpRenderFeaturedList();
    });
  });
}

function mpRenderFeaturedList() {
  const wrap = document.getElementById('mpFeaturedList');
  if (!wrap) return;
  if (!mpFeaturedDraft.length) {
    wrap.innerHTML = `<p style="font-size:.8rem; color:var(--ink-soft);">Bado hujachagua bidhaa yoyote — duka litaonekana kwa mpangilio wake wa kawaida.</p>`;
    return;
  }
  wrap.innerHTML = mpFeaturedDraft.map((id, i) => {
    const p = getBaseProductA(id);
    if (!p) return '';
    return `<div style="display:flex; align-items:center; gap:10px; padding:8px 10px; border:1px solid var(--line); border-radius:8px;">
      <b style="width:22px; color:var(--ink-soft);">${i + 1}.</b>
      <span style="flex:1; font-size:.85rem;">${escapeHtmlA(p.name)}</span>
      <button class="order-confirm-btn" data-mpup="${i}" ${i===0?'disabled':''}>⬆️</button>
      <button class="order-confirm-btn" data-mpdown="${i}" ${i===mpFeaturedDraft.length-1?'disabled':''}>⬇️</button>
      <button class="admin-danger" data-mpremove="${i}">✕</button>
    </div>`;
  }).join('');
  wrap.querySelectorAll('[data-mpup]').forEach(btn => btn.addEventListener('click', () => {
    const i = parseInt(btn.dataset.mpup, 10);
    if (i > 0) { [mpFeaturedDraft[i-1], mpFeaturedDraft[i]] = [mpFeaturedDraft[i], mpFeaturedDraft[i-1]]; mpRenderFeaturedList(); }
  }));
  wrap.querySelectorAll('[data-mpdown]').forEach(btn => btn.addEventListener('click', () => {
    const i = parseInt(btn.dataset.mpdown, 10);
    if (i < mpFeaturedDraft.length - 1) { [mpFeaturedDraft[i+1], mpFeaturedDraft[i]] = [mpFeaturedDraft[i], mpFeaturedDraft[i+1]]; mpRenderFeaturedList(); }
  }));
  wrap.querySelectorAll('[data-mpremove]').forEach(btn => btn.addEventListener('click', () => {
    mpFeaturedDraft.splice(parseInt(btn.dataset.mpremove, 10), 1);
    mpRenderFeaturedList();
  }));
}

function mpRenderOffersRows() {
  const wrap = document.getElementById('mpOffersRows');
  if (!wrap) return;
  wrap.innerHTML = CATEGORIES.map(cat => {
    const pct = mpOffersDraft[cat] || 0;
    return `<div style="display:flex; align-items:center; gap:10px;">
      <span style="flex:1; font-size:.85rem;">${escapeHtmlA(cat)}</span>
      <input type="number" min="0" max="90" value="${pct}" data-mpoffer="${escapeHtmlA(cat)}" style="width:90px; padding:6px 8px; border-radius:8px; border:1px solid var(--line);">
      <span style="font-size:.8rem; color:var(--ink-soft);">%</span>
    </div>`;
  }).join('');
  wrap.querySelectorAll('[data-mpoffer]').forEach(input => {
    input.addEventListener('input', () => {
      const cat = input.dataset.mpoffer;
      const pct = Math.max(0, Math.min(90, parseInt(input.value, 10) || 0));
      if (pct > 0) mpOffersDraft[cat] = pct; else delete mpOffersDraft[cat];
    });
  });
}

async function mpSaveSettings() {
  const data = { featuredToday: mpFeaturedDraft, categoryOffers: mpOffersDraft };
  lsSetA('ahs_homepage_settings', data);
  const statusEls = [document.getElementById('mpFeaturedStatus'), document.getElementById('mpOffersStatus')];
  statusEls.forEach(el => { if (el) { el.style.display = 'block'; el.style.color = 'var(--ink-soft)'; el.textContent = '⏳ Inahifadhi...'; } });

  let cloudOk = true;
  if (typeof AHS_CLOUD_READY !== 'undefined' && AHS_CLOUD_READY) {
    if (!ahsCloudAdminOK) {
      cloudOk = false;
    } else if (typeof cloudSaveHomepageSettings === 'function') {
      cloudOk = await cloudSaveHomepageSettings(data);
    }
  }

  if (!AHS_CLOUD_READY) {
    statusEls.forEach(el => { if (el) { el.style.color = 'var(--green-deep)'; el.textContent = '✅ Imehifadhiwa kwenye kivinjari hiki.'; } });
    return;
  }
  if (cloudOk) {
    statusEls.forEach(el => { if (el) { el.style.color = 'var(--green-deep)'; el.textContent = '✅ Imehifadhiwa — wateja wote wataona mabadiliko haya papo hapo.'; } });
  } else {
    statusEls.forEach(el => { if (el) {
      el.style.color = '#b23a3a';
      el.textContent = '❌ HAIJAHIFADHIWA kwa wateja! Hujaingia kama Admin wa Cloud — toka (🚪) kisha ingia tena kwa Email/Password sahihi ya Firebase.';
    } });
  }
}

let unsubscribeHomepageSettings = null;
function initAdminHomepageSettingsSync() {
  if (typeof cloudListenHomepageSettings !== 'function') return;
  if (unsubscribeHomepageSettings) unsubscribeHomepageSettings();
  unsubscribeHomepageSettings = cloudListenHomepageSettings((data) => {
    lsSetA('ahs_homepage_settings', { featuredToday: (data && data.featuredToday) || [], categoryOffers: (data && data.categoryOffers) || {} });
    if (document.getElementById('tab-mpangilio').style.display !== 'none') renderMpangilioTab();
  });
}

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adminPass').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
  if (sessionStorage.getItem('ahs_admin_session') === '1') showDashboard();
});
