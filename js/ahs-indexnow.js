/* Arifu Bing/AI (IndexNow) — nyongeza (additive); admin.js haijabadilishwa.
   1) Kitufe "📣 Arifu Bing/AI Sasa" kwenye Dashboard (chini ya "Tuma Update").
   2) Kiotomatiki: ukiongeza/ukibadilisha/ukifuta bidhaa, URL yake inatumwa kimya kimya kwa Bing/IndexNow.
   Kikishindwa hakuna madhara kwa kuhifadhi bidhaa. Google husoma sitemap yenyewe (sitemap-products-live.xml). */
(function () {
  'use strict';
  var SITE = 'https://agnesherbalsupplements.com';
  var sl = function (x) { return String(x || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); };
  // URL ya bidhaa ya admin — sawa na productSlug() kwenye functions/_lib/seo.js
  function productUrl(p) {
    if (!p || !p.name) return null;
    var c = sl(p.slug), slug = c ? (/^\d+-/.test(c) ? 'p' + c : c) : (sl(p.name) ? 'p' + p.id + '-' + sl(p.name) : 'bidhaa-' + p.id);
    return SITE + '/products/' + slug;
  }
  var CORE = [SITE + '/', SITE + '/orodha/', SITE + '/sitemap-products-live.xml'];
  var timer = null, pending = {};
  window.ahsPingIndexNow = function (force, urls) {
    try {
      clearTimeout(timer);
      if (force) {
        pending = {};
        return fetch('/api/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: (urls && urls.length) ? JSON.stringify({ urls: urls }) : '{}' })
          .then(function (r) { return r.json(); }).catch(function () { return null; });
      }
      // Hifadhi URL zote za ndani ya sekunde 2 ili hakuna iliyopotea (kisha tuma zote kwa pamoja).
      (urls || []).forEach(function (u) { pending[u] = 1; });
      timer = setTimeout(function () {
        var list = Object.keys(pending); pending = {};
        if (!list.length) return;
        fetch('/api/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls: list }) }).catch(function () {});
      }, 2000);
    } catch (e) { /* hakuna madhara */ }
    return Promise.resolve(null);
  };
  function autoPing(p) {
    var u = productUrl(p);
    window.ahsPingIndexNow(false, (u ? [u] : []).concat(CORE));
  }
  // Funga (wrap) kazi za kuhifadhi/kufuta bidhaa bila kubadilisha admin.js
  function wrap(name, after) {
    var orig = window[name];
    if (typeof orig !== 'function' || orig.__ahsWrapped) return;
    var w = function () {
      var args = arguments, res = orig.apply(this, args);
      Promise.resolve(res).then(function (ok) { if (ok !== false) { try { after(args); } catch (e) {} } }).catch(function () {});
      return res;
    };
    w.__ahsWrapped = true;
    window[name] = w;
  }
  wrap('cloudSaveNewProduct', function (a) { autoPing(a[0]); });
  wrap('cloudSaveProduct', function () { window.ahsPingIndexNow(false, CORE.slice()); });
  wrap('cloudDeleteCustomProduct', function () { window.ahsPingIndexNow(false, CORE.slice()); });

  window.mpPingIndexNow = async function (btn) {
    var old = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Inatuma...'; }
    try {
      var r = await window.ahsPingIndexNow(true);
      alert(r && r.ok ? '✅ Imetumwa: URL ' + r.submitted + ' zimearifiwa kwa Bing/IndexNow.' : '⚠️ Haikufanikiwa (hali: ' + (r ? r.status : 'hakuna jibu') + '). Jaribu tena baadaye.');
    } catch (e) { alert('⚠️ Haikufanikiwa. Jaribu tena.'); }
    if (btn) { btn.disabled = false; btn.textContent = old; }
  };

  function inject() {
    var push = document.getElementById('pushUpdateBtn');
    if (!push || document.getElementById('ahsIndexNowBox')) return;
    var host = push.closest('div');
    if (!host) return;
    var box = document.createElement('div');
    box.id = 'ahsIndexNowBox';
    box.style.cssText = 'margin-top:20px; border:1px solid var(--line); border-radius:14px; padding:18px 20px; max-width:640px;';
    box.innerHTML = '<h3 style="color:var(--green-deep); font-size:1rem; margin-bottom:8px;">📣 Arifu Google / Bing / AI</h3>' +
      '<p style="font-size:.8rem; color:var(--ink-soft); margin-bottom:12px;">Bidhaa mpya na mabadiliko huarifiwa kiotomatiki Bing na injini zinazotumia IndexNow (Bing pia hulisha ChatGPT Search na Copilot). Bonyeza hapa kuarifu wewe mwenyewe sasa hivi. Google husoma sitemap ya bidhaa yenyewe (hujisasisha), na unaweza kuiwasilisha kwenye Search Console.</p>' +
      '<button class="btn btn-ghost" onclick="mpPingIndexNow(this)">📣 Arifu Bing/AI Sasa</button> ' +
      '<a class="btn btn-ghost" href="/orodha/" target="_blank" rel="noopener">📋 Ona Orodha Kamili</a>';
    host.insertAdjacentElement('afterend', box);
  }
  var rd = window.renderDashboard;
  if (typeof rd === 'function' && !rd.__ahsWrapped) {
    var w = function () { var r = rd.apply(this, arguments); try { inject(); } catch (e) {} return r; };
    w.__ahsWrapped = true;
    window.renderDashboard = w;
  }
  document.addEventListener('DOMContentLoaded', function () { try { inject(); } catch (e) {} });
})();
