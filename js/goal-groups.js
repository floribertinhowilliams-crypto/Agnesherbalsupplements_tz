// Agnes Herbal Supplements — Makundi ya KAZI ya bidhaa (si aina/umbo la bidhaa)
// =============================================================================
// Badala ya kupanga duka kwa "Tea / Gummies / Powder...", bidhaa zinapangwa kwa
// KAZI/LENGO lake (Kupunguza Uzito, Kinga ya Mwili, Uzazi, n.k.). Kila bidhaa
// inaingia kwenye kundi MOJA tu (la kwanza linalolingana kwenye orodha ya
// "match" hapa chini — maalum zaidi ndiyo ya kwanza).
//
// Admin anapanga mfuatano wa makundi (na kuficha/kuonyesha chip ya kundi) kwenye
// "🎯 Mpangilio wa Duka → 🗂 Mpangilio wa Makundi ya Kazi". Mipangilio inahifadhiwa
// ndani ya homepageSettings.goalOrder / goalHidden (Firestore meta/homepageSettings).
// Bidhaa inaweza pia kulazimishwa kundi fulani kwa kuweka uwanja `goal` kwenye
// bidhaa yenyewe (mfano goal: 'skin') — unashinda kila kitu kingine.

// key + label + icon = kile kinachoonekana. `match` = maneno (regex) yanayotafutwa
// kwenye jina + kazi ya bidhaa.
const GOAL_GROUPS = [
  { key: 'immunity',  icon: '🛡️', label: { sw: 'Kinga, Vitamini & Nguvu', en: 'Immunity, Vitamins & Energy' } },
  { key: 'weightloss',icon: '⚖️', label: { sw: 'Kupunguza Uzito & Detox', en: 'Weight Loss & Detox' } },
  { key: 'skin',      icon: '✨', label: { sw: 'Ngozi, Nywele & Collagen', en: 'Skin, Hair & Collagen' } },
  { key: 'fertility', icon: '👶', label: { sw: 'Afya ya Uzazi (Ugumba, PMS, Menopause)', en: 'Fertility, PMS & Menopause' } },
  { key: 'male',      icon: '💪', label: { sw: 'Nguvu za Kiume & Kibofu', en: 'Men\'s Health & Prostate' } },
  { key: 'digest',    icon: '🍃', label: { sw: 'Tumbo & Mmeng\'enyo', en: 'Digestion & Gut' } },
  { key: 'sleep',     icon: '🌙', label: { sw: 'Usingizi, Stress & Akili', en: 'Sleep, Stress & Focus' } },
  { key: 'bones',     icon: '🦴', label: { sw: 'Mifupa & Viungo', en: 'Bones & Joints' } },
  { key: 'heart',     icon: '❤️', label: { sw: 'Moyo, Sukari & Shinikizo', en: 'Heart & Blood Sugar' } },
  { key: 'organs',    icon: '🫁', label: { sw: 'Ini, Figo, Macho & Mapafu', en: 'Liver, Kidney, Eyes & Lungs' } },
  { key: 'muscle',    icon: '🏋️', label: { sw: 'Kuongeza Uzito, Misuli & Kimo', en: 'Weight Gain, Muscle & Height' } },
  { key: 'curves',    icon: '🍑', label: { sw: 'Maumbo ya Mwili', en: 'Body Curves' } },
];

// Mfuatano wa KUTAFUTA (maalum → jumla). Si mfuatano wa kuonyesha dukani.
const GOAL_MATCH_ORDER = [
  ['immunity',  /shilajit|shila jit|shilijit/],
  ['fertility', /fertil|pregnan|womb|uterus|reproduct|inositol|fibroid|menopaus|\bpms\b|menstrual|yoni|evening primrose|women'?s probiotic|cranberry gummies/],
  ['muscle',    /weight gain|weight gainer|muscle|creatine|height|turkesterone|pre workout/],
  ['curves',    /butt|buttock|\bhips?\b|breast|boob|curve|curvy|\bbbl\b|plump/],
  ['male',      /prostate|tonif|libido|horny|aphrodis|men power|power male|go man|tongkat|men'?s health|x power|\blove tea|\bmaca\b/],
  ['organs',    /liver|kidney|\beye|carotene|\blung|mullein|smok|milk thistle|lianhua/],
  ['skin',      /collagen|glutathione|\bgluta\b/],
  ['weightloss',/weight loss|loss weight|slim|tummy|detox|teatox|fat burn|\bfat\b|\bburn|keto|garcinia|hunger|\bdiet\b|apple cider|green coffee|acv|prune/],
  ['skin',      /whiten|glow|collagen|glutathione|gluta|\bskin|hair|biotin|acne|beauty|matcha|aging|anti-aging|aloe|astaxanthin|grape seed/],
  ['heart',     /cardiovascular|blood sugar|sugar|hypertension|diabet|bitter melon|bitter gourd|lecithin|blood lipid|fish oil|krill|ginkgo|omega|blood vessel/],
  ['bones',     /bone|calcium|joint|arthr|articular|glucosamine|uric/],
  ['digest',    /probiotic|bowel|colon|digest|gut|ulcer|stomach|hemorrhoid|fiber|barley|lion'?s mane/],
  ['sleep',     /sleep|calm|relax|ashwagandha|melatonin|serenity|magnesium|stress|bedtime|brain|focus|memory/],
  // Kila kitu kingine (vitamini, kinga, nguvu/energy, uyoga, shilajit, n.k.) → 'immunity'
];

// ---------------------------------------------------------------------------
// Mipangilio ya admin (homepageSettings, au draft ya admin wakati wa kuhariri):
//   goalOrder  : ['immunity','c_123',...]  mfuatano wa makundi
//   goalHidden : ['curves']                 makundi yaliyofichwa kwenye vitufe
//   goalLabels : { immunity: {icon,sw,en} } majina/alama zilizobadilishwa na admin
//   goalCustom : [{key,icon,sw,en}]         makundi mapya aliyoyaunda admin
//   goalAssign : { "12": "c_123" }          bidhaa moja moja aliyoiweka kundi mwenyewe
// ---------------------------------------------------------------------------
function ahsGoalSettings() {
  if (typeof window !== 'undefined' && window.AHS_GOAL_SETTINGS_OVERRIDE) return window.AHS_GOAL_SETTINGS_OVERRIDE;
  if (typeof homepageSettings !== 'undefined' && homepageSettings) return homepageSettings;
  return {};
}
// Orodha kamili ya makundi (yaliyopo + mapya) yenye majina ya sasa.
function ahsGoalGroups() {
  const st = ahsGoalSettings();
  const labels = st.goalLabels || {};
  const base = GOAL_GROUPS.map(g => {
    const o = labels[g.key] || {};
    return { key: g.key, custom: false, icon: o.icon || g.icon,
      label: { sw: o.sw || g.label.sw, en: o.en || o.sw || g.label.en } };
  });
  const custom = (Array.isArray(st.goalCustom) ? st.goalCustom : []).filter(c => c && c.key).map(c => {
    const o = labels[c.key] || {};
    const sw = o.sw || c.sw || 'Kundi Jipya';
    return { key: c.key, custom: true, icon: o.icon || c.icon || '⭐', label: { sw, en: o.en || c.en || sw } };
  });
  return base.concat(custom);
}
function ahsGoalInfo(key) {
  return ahsGoalGroups().find(g => g.key === key) || null;
}
function ahsGoalOf(p) {
  if (!p) return 'immunity';
  const groups = ahsGoalGroups();
  const has = k => groups.some(g => g.key === k);
  const assign = ahsGoalSettings().goalAssign || {};
  const manual = assign[String(p.id)];
  if (manual && has(manual)) return manual;
  if (p.goal && has(p.goal)) return p.goal;
  const hay = ((p.name || '') + ' ' + (p.effect || '')).toLowerCase();
  for (const [key, re] of GOAL_MATCH_ORDER) if (re.test(hay) && has(key)) return key;
  return 'immunity';
}
function ahsGoalLabel(key, lang) {
  const g = ahsGoalInfo(key);
  if (!g) return key;
  return g.label[lang] || g.label.sw;
}
// Mfuatano wa kuonyesha: ule aliouhifadhi admin kwanza, kisha makundi mapya/yaliyobaki.
function ahsGoalDisplayOrder() {
  const st = ahsGoalSettings();
  const saved = Array.isArray(st.goalOrder) ? st.goalOrder : [];
  const known = ahsGoalGroups().map(g => g.key);
  return [...saved.filter(k => known.includes(k)), ...known.filter(k => !saved.includes(k))];
}
function ahsGoalHiddenSet() {
  const h = ahsGoalSettings().goalHidden;
  return new Set(Array.isArray(h) ? h : []);
}
// Panga orodha ya bidhaa kwa kundi la kazi (thabiti: ndani ya kundi mpangilio wa awali unabaki).
function ahsSortByGoal(list) {
  const order = ahsGoalDisplayOrder();
  const rank = new Map(order.map((k, i) => [k, i]));
  return list
    .map((p, i) => ({ p, i, r: rank.get(ahsGoalOf(p)) }))
    .sort((a, b) => (a.r - b.r) || (a.i - b.i))
    .map(x => x.p);
}
