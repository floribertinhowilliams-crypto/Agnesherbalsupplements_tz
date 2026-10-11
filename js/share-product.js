/* Kitufe cha Share kwa kurasa za bidhaa (/products/...). Link inayoshirikiwa ni ya ukurasa huu;
   mtu akiifungua anaingizwa moja kwa moja ndani ya duka (/#product-<id>). */
(function () {
  function canonical() {
    var l = document.querySelector('link[rel="canonical"]');
    return (l && l.href) || location.href.split('#')[0].split('?')[0];
  }
  function meta(p) { var m = document.querySelector('meta[property="' + p + '"]'); return m ? m.content : ''; }
  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#0f4d34;color:#fff;padding:10px 16px;border-radius:20px;font:600 .85rem sans-serif;z-index:99999;max-width:90%;text-align:center';
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2400);
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      try { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); ta.remove(); ok ? res() : rej(); } catch (e) { rej(e); }
    });
  }
  function share() {
    var url = canonical();
    var h1 = document.querySelector('h1');
    var name = (h1 && h1.textContent.trim()) || meta('og:title') || document.title;
    var desc = meta('og:description') || '';
    var text = '🌿 ' + name + (desc ? '\n' + desc : '') + '\n';
    if (navigator.share) {
      navigator.share({ title: name + ' | Agnes Herbal Supplements', text: text, url: url }).catch(function (e) {
        if (!e || e.name !== 'AbortError') copy(text + url).then(function () { toast('🔗 Link imenakiliwa'); });
      });
      return;
    }
    copy(text + url).then(function () { toast('🔗 Link imenakiliwa — bandika popote'); }, function () { window.prompt('Nakili link hii:', url); });
  }
  function init() {
    if (document.getElementById('ahsShareBtn')) return;
    var b = document.createElement('button');
    b.id = 'ahsShareBtn'; b.type = 'button'; b.textContent = '🔗 Share bidhaa hii';
    b.style.cssText = 'display:block;width:100%;text-align:center;background:#fff;color:#0f4d34;border:2px solid #0f4d34;padding:13px;border-radius:12px;font-weight:700;font-size:1rem;cursor:pointer;margin-bottom:10px';
    b.addEventListener('click', share);
    var anchor = document.querySelector('a.cta.wa') || document.querySelector('a.cta');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(b, anchor);
    else document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
