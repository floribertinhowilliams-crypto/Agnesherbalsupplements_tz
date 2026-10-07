/* ============================================================
   Agnes Herbal Supplements — Live Buying Notification System
   Moving live-purchase ticker bar + popup purchase toasts.
   Self-contained: does not modify any existing feature/file.
   Turn off either widget by flipping the flags in LN_CONFIG below.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- CONFIG ---------------- */
  var LN_CONFIG = {
    enableBar: true,           // moving live purchase bar
    enablePopup: false,        // popup notification toasts (bottom corner) — disabled per owner request
    popupMinDelayMs: 7000,     // gap between popups (min)
    popupMaxDelayMs: 15000,    // gap between popups (max)
    popupVisibleMs: 5200,      // how long a popup stays visible
    popupFirstDelayMs: 3200,   // delay before the very first popup
    barItemCount: 16,          // how many entries feed the ticker loop
    barRefreshMs: 55000,       // rebuild ticker content this often
    barSpeedPxPerSec: 42,      // scroll speed of the ticker
    rememberDismissKey: "ahs_ln_dismissed" // sessionStorage key
  };

  /* ---------------- DATA POOLS ---------------- */
  var CUSTOMER_NAMES = [
    "Juma P", "Asha M", "Neema K", "Baraka S", "Fatuma J", "Emmanuel T",
    "Grace L", "Hassan O", "Zainab R", "Peter M", "Halima Y", "Godfrey N",
    "Mwajuma S", "Elias K", "Rehema A", "Vicent J", "Salma H", "Daudi W",
    "Consolata B", "Ibrahim A", "Winnie C", "Josephat M", "Amina S",
    "Kelvin O", "Furaha L", "Samwel T", "Rukia M", "Deo N", "Agnes F",
    "Frank R", "Zawadi H", "Ramadhani I", "Editha G", "Onesmo K",
    "Khadija W", "Method B", "Prisca N", "Yusuf A", "Devotha M",
    "Alex P", "Mariam T", "Costantine J", "Happiness L", "Omary S",
    "Beatrice K", "Shabani D", "Veronica R", "Athumani M", "Nuru Z",
    "Erick B", "Tatu O", "Msafiri C", "Upendo N", "Gideon T", "Salome W",
    "Rajabu H", "Lightness A", "Jackson K", "Mercy I", "Said M", "Dorcas L"
  ];

  var FALLBACK_PRODUCTS = [
    "Women's Probiotic Gummies", "Apple Cider Vinegar Gummies", "28 Day Slimming Tea",
    "Male Fertility Tea", "Womb Tea", "Multivitamin Gummies", "Collagen Gummies",
    "Hair Growth Gummies", "Detox Foot Patches", "Joint Support Capsules",
    "Prostate Care Capsules", "Flat Tummy Tea", "Immune Boost Gummies",
    "Vitamin C Gummies", "Fertility Tea", "Weight Loss Capsules"
  ];

  var VERBS = {
    sw: ["aliagiza", "amenunua", "ameagiza"],
    en: ["ordered", "purchased", "just bought"],
    fr: ["a commandé", "a acheté", "vient d'acheter"],
    zh: ["已订购", "已购买", "刚刚购买"],
    rn: ["yatumije", "yaguze", "aherutse kugura"]
  };

  var LABELS = {
    sw: { live: "MOTO SASA", liveShort: "MOTO", justNow: "sasa hivi", minAgo: "dakika {n} zilizopita", pcs: "vipande", closeTitle: "Ficha" },
    en: { live: "LIVE ORDERS", liveShort: "LIVE", justNow: "just now", minAgo: "{n} min ago", pcs: "pcs", closeTitle: "Hide" },
    fr: { live: "COMMANDES EN DIRECT", liveShort: "DIRECT", justNow: "à l'instant", minAgo: "il y a {n} min", pcs: "pièces", closeTitle: "Masquer" },
    zh: { live: "实时订单", liveShort: "实时", justNow: "刚刚", minAgo: "{n}分钟前", pcs: "件", closeTitle: "隐藏" },
    rn: { live: "IBIGUZWE UBU", liveShort: "UBU", justNow: "ubu nyene", minAgo: "iminota {n} irashize", pcs: "ibice", closeTitle: "Hisha" }
  };

  var QTY_POOL = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 5, 5, 5, 6, 8, 8, 10, 10, 12, 15, 20];
  var MINUTES_AGO_POOL = [0, 0, 1, 2, 2, 3, 4, 5, 6, 7, 9, 11, 14, 18, 22, 27, 34, 41];

  function getLang() {
    try { return (typeof window.getLang === "function") ? window.getLang() : (localStorage.getItem("ahs_lang") || "sw"); }
    catch (e) { return "sw"; }
  }
  function L() {
    var lang = getLang();
    return LABELS[lang] || LABELS.sw;
  }
  function pickVerb() {
    var lang = getLang();
    var pool = VERBS[lang] || VERBS.sw;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function pickTimeText() {
    var lang = getLang();
    var lbl = LABELS[lang] || LABELS.sw;
    var mins = MINUTES_AGO_POOL[Math.floor(Math.random() * MINUTES_AGO_POOL.length)];
    if (mins === 0) return lbl.justNow;
    return lbl.minAgo.replace("{n}", mins);
  }

  /* ---------------- Product name source ---------------- */
  function getProductNames() {
    try {
      if (Array.isArray(window.PRODUCTS) && window.PRODUCTS.length) {
        var seen = {};
        var names = [];
        window.PRODUCTS.forEach(function (p) {
          if (p && p.name && !seen[p.name]) { seen[p.name] = true; names.push(p.name); }
        });
        if (names.length >= 8) return names;
      }
    } catch (e) { /* ignore, fall through */ }
    return FALLBACK_PRODUCTS;
  }

  /* ---------------- Anti-repetition shuffled queues ---------------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function makeCycler(items) {
    var queue = [];
    var lastValue = null;
    return function next() {
      if (queue.length === 0) {
        queue = shuffle(items);
        // avoid immediate repeat across a refill boundary
        if (queue.length > 1 && queue[0] === lastValue) {
          queue.push(queue.shift());
        }
      }
      var val = queue.shift();
      lastValue = val;
      return val;
    };
  }

  var nextCustomer = makeCycler(CUSTOMER_NAMES);
  var nextProduct = null; // built lazily once PRODUCTS is available
  var recentMessages = [];

  function ensureProductCycler() {
    if (!nextProduct) nextProduct = makeCycler(getProductNames());
  }

  function generateEntry() {
    ensureProductCycler();
    var attempt = 0, customer, product, key;
    do {
      customer = nextCustomer();
      product = nextProduct();
      key = customer + "|" + product;
      attempt++;
    } while (recentMessages.indexOf(key) !== -1 && attempt < 6);
    recentMessages.push(key);
    if (recentMessages.length > 10) recentMessages.shift();

    return {
      customer: customer,
      product: product,
      qty: QTY_POOL[Math.floor(Math.random() * QTY_POOL.length)],
      verb: pickVerb(),
      timeText: pickTimeText()
    };
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ================= MOVING LIVE PURCHASE BAR ================= */
  var barEl, barViewport, barTrack;

  function buildBarHTML(entries) {
    var lbl = L();
    return entries.map(function (e) {
      return '<span class="ln-bar-item">' +
        '<span class="ln-dot" aria-hidden="true"></span>' +
        '<b>' + esc(e.customer) + '</b> ' + esc(e.verb) + ' ' +
        esc(e.product) + ' <span class="ln-qty">×' + e.qty + ' ' + esc(lbl.pcs) + '</span>' +
        '<span style="opacity:.75; margin-left:6px;">· ' + esc(e.timeText) + '</span>' +
        '</span>';
    }).join("");
  }

  function refreshBarContent() {
    if (!barTrack) return;
    var entries = [];
    for (var i = 0; i < LN_CONFIG.barItemCount; i++) entries.push(generateEntry());
    var html = buildBarHTML(entries);
    // duplicate content back-to-back for a seamless 0%->-50% loop
    barTrack.innerHTML = html + html;
    // duration scales with content width so speed stays visually consistent
    requestAnimationFrame(function () {
      var singleWidth = barTrack.scrollWidth / 2;
      var duration = Math.max(18, singleWidth / LN_CONFIG.barSpeedPxPerSec);
      barTrack.style.animationDuration = duration + "s";
    });
  }

  function initBar() {
    if (!LN_CONFIG.enableBar) return;
    try {
      if (sessionStorage.getItem(LN_CONFIG.rememberDismissKey + "_bar") === "1") return;
    } catch (e) {}

    var header = document.querySelector("header");
    if (!header || !header.parentNode) return;

    var lbl = L();
    barEl = document.createElement("div");
    barEl.className = "ln-bar";
    barEl.id = "lnBar";
    barEl.innerHTML =
      '<div class="ln-bar-label"><span class="ln-dot" aria-hidden="true"></span>' +
      '<span class="ln-label-text">' + esc(lbl.live) + '</span></div>' +
      '<div class="ln-bar-viewport"><div class="ln-bar-track" id="lnBarTrack"></div></div>' +
      '<button class="ln-bar-close" id="lnBarClose" title="' + esc(lbl.closeTitle) + '" aria-label="' + esc(lbl.closeTitle) + '">✕</button>';

    header.parentNode.insertBefore(barEl, header.nextSibling);
    barViewport = barEl.querySelector(".ln-bar-viewport");
    barTrack = document.getElementById("lnBarTrack");

    // pause the marquee on hover/focus for readability
    barEl.addEventListener("mouseenter", function () { barEl.setAttribute("data-paused", "1"); });
    barEl.addEventListener("mouseleave", function () { barEl.removeAttribute("data-paused"); });

    document.getElementById("lnBarClose").addEventListener("click", function () {
      barEl.remove();
      try { sessionStorage.setItem(LN_CONFIG.rememberDismissKey + "_bar", "1"); } catch (e) {}
    });

    refreshBarContent();
    setInterval(refreshBarContent, LN_CONFIG.barRefreshMs);
  }

  /* ================= POPUP PURCHASE NOTIFICATION ================= */
  var popupHost;

  function initPopupHost() {
    popupHost = document.createElement("div");
    popupHost.className = "ln-popup-host";
    popupHost.id = "lnPopupHost";
    document.body.appendChild(popupHost);
  }

  function showPopup() {
    if (!LN_CONFIG.enablePopup) return scheduleNextPopup();
    try {
      if (sessionStorage.getItem(LN_CONFIG.rememberDismissKey + "_popup") === "1") return;
    } catch (e) {}
    if (document.hidden) { scheduleNextPopup(true); return; }

    var e = generateEntry();
    var lbl = L();

    var card = document.createElement("div");
    card.className = "ln-toast";
    card.innerHTML =
      '<div class="ln-toast-icon">🛍️</div>' +
      '<div class="ln-toast-body">' +
      '<div class="ln-toast-line1"><b>' + esc(e.customer) + '</b> ' + esc(e.verb) + ' ' +
      '<span class="ln-toast-product">' + esc(e.product) + '</span></div>' +
      '<div class="ln-toast-meta"><span class="ln-qty-chip">×' + e.qty + ' ' + esc(lbl.pcs) + '</span>' +
      '<span>' + esc(e.timeText) + '</span></div>' +
      '</div>' +
      '<button class="ln-toast-close" aria-label="' + esc(lbl.closeTitle) + '">✕</button>';

    popupHost.innerHTML = "";
    popupHost.appendChild(card);
    requestAnimationFrame(function () { card.classList.add("ln-in"); });

    var hideTimer = setTimeout(hideCard, LN_CONFIG.popupVisibleMs);

    function hideCard() {
      clearTimeout(hideTimer);
      card.classList.remove("ln-in");
      card.classList.add("ln-out");
      setTimeout(function () { if (card.parentNode) card.remove(); }, 360);
    }

    card.querySelector(".ln-toast-close").addEventListener("click", function () {
      hideCard();
      try { sessionStorage.setItem(LN_CONFIG.rememberDismissKey + "_popup", "1"); } catch (err) {}
    });

    scheduleNextPopup();
  }

  function scheduleNextPopup(quick) {
    var delay = quick ? 4000 :
      (LN_CONFIG.popupMinDelayMs + Math.random() * (LN_CONFIG.popupMaxDelayMs - LN_CONFIG.popupMinDelayMs));
    setTimeout(showPopup, delay);
  }

  /* ---------------- LANG CHANGE HOOK ---------------- */
  function refreshBarLabelAndContent() {
    if (!barEl) return;
    var lbl = L();
    var labelText = barEl.querySelector(".ln-label-text");
    if (labelText) labelText.textContent = lbl.live;
    var closeBtn = document.getElementById("lnBarClose");
    if (closeBtn) { closeBtn.title = lbl.closeTitle; closeBtn.setAttribute("aria-label", lbl.closeTitle); }
    refreshBarContent();
  }
  var ln_prevOnLangChanged = (typeof window.onLangChanged === "function") ? window.onLangChanged : null;
  window.onLangChanged = function () {
    if (ln_prevOnLangChanged) ln_prevOnLangChanged();
    refreshBarLabelAndContent();
  };

  /* ---------------- INIT ---------------- */
  function start() {
    if (LN_CONFIG.enableBar) initBar();
    if (LN_CONFIG.enablePopup) {
      initPopupHost();
      setTimeout(showPopup, LN_CONFIG.popupFirstDelayMs);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
