// Agnes Herbal Supplements — Search Engine v2 (multilingual, offline, no CDN)
// ============================================================================
// SABABU YA KUANDIKWA UPYA:
//  1. Catalog (jina + faida) iko kwa Kiingereza, lakini wateja wanaandika
//     Kiswahili ("kisukari", "chai", "uzito", "ugumba"), Kifaransa, Kichina au
//     Kirundi — injini ya zamani (MiniSearch) ilirudisha MATOKEO SIFURI.
//  2. MiniSearch ilipakuliwa kutoka CDN; mtandao ukiwa dhaifu utafutaji ulivunjika.
//  3. Index ilijengwa kwa bidhaa ghafi (si zilizohaririwa na admin) na ilikuwa
//     inakwama ikiwa "stale" — jina/faida/kundi alilobadilisha admin halikutafutika.
//  4. Maneno mengi (OR) yalileta kelele: "slimming tea" = bidhaa 85, "vitamin c" = 187.
//
// MUUNDO MPYA: injini hii inatafuta moja kwa moja kwenye orodha ya bidhaa HALISI
// (zilizohaririwa, zisizofichwa) kila mara — hakuna index ya kuhifadhi, hivyo
// haiwezi kuwa "stale". Inaelewa lugha 5 (sw/en/fr/zh/rn), makosa ya herufi,
// wingi/umoja (gummy/gummies), na inapanga matokeo kwa umuhimu.
// Haitegemei maktaba yoyote ya nje.
(function (root) {
  'use strict';

  /* ===================== NORMALIZE ===================== */
  var CJK = /[\u3400-\u9fff]/;
  function norm(s) {
    s = String(s == null ? '' : s).toLowerCase();
    try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { /* kivinjari cha zamani */ }
    // herufi za Kilatini + tarakimu + CJK; kila kitu kingine = nafasi
    return s.replace(/[^a-z0-9\u3400-\u9fff]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function stem(w) {
    if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }
  // Maneno yasiyo na maana ya kutafutia (viunganishi) kwa lugha zote.
  var STOP = {};
  ('ya za na kwa la wa ni cha vya the and for with of to a an de du des la le les et pour avec un une ' +
    'series series plus kwenye wangu yangu langu').split(' ').forEach(function (w) { STOP[w] = 1; });

  /* ===================== CONCEPTS (lugha zote → maneno ya catalog) =====================
     Kila "concept": `k` = maneno ambayo mteja anaweza kuandika (sw/fr/zh/rn/en slang),
     `e` = maneno ya Kiingereza yaliyopo kwenye catalog (jina/faida/kundi).
     Ongeza mistari hapa kama mteja akitafuta neno ambalo halipati bidhaa. */
  var CONCEPTS = [
    // --- uzito / tumbo ---
    { k: ['kupunguza uzito', 'punguza uzito', 'kupunguza mwili', 'kukonda', 'konda', 'unene', 'kupunguza unene', 'kupunguza kitambi', 'kitambi', 'kupunguza tumbo', 'tumbo kubwa', 'perte de poids', 'perdre du poids', 'maigrir', 'minceur', 'amincissant', '减肥', '瘦身', '瘦', 'kunanuka', 'kugabanya umubiri', 'kugabanya ibiro'], e: ['weight loss', 'loss weight', 'slim', 'fat burn', 'tummy', 'detox'] },
    { k: ['kuongeza uzito', 'ongeza uzito', 'kunenepa', 'kuongeza mwili', 'nenepesha', 'prise de poids', 'grossir', 'prendre du poids', '增重', '增肥', 'kongera ibiro'], e: ['weight gain', 'weight gainer', 'muscle', 'curves'] },
    { k: ['uzito', 'mwili mkubwa', 'poids', '体重', 'ibiro'], e: ['weight loss', 'loss weight', 'slim', 'weight'] },
    { k: ['tumbo', 'estomac', 'ventre', '肚子', '腹', 'inda'], e: ['tummy', 'stomach', 'belly', 'slim', 'bowel', 'digest'] },
    // --- sukari / moyo ---
    { k: ['kisukari', 'sukari', 'sukari ya damu', 'ugonjwa wa sukari', 'diabetes', 'diabete', 'diabetique', 'diabete', 'glycemie', 'taux de sucre', '糖尿病', '血糖', 'isukari', 'diyabete'], e: ['blood sugar', 'diabet', 'glucose', 'metabolic', 'uric'] },
    { k: ['shinikizo la damu', 'shinikizo', 'presha', 'bp', 'pressure', 'tension', 'hypertension', 'tension arterielle', 'high blood pressure', '高血压', '血压', 'umuvuduko w amaraso'], e: ['blood pressure', 'cardiovascular', 'blood vessel', 'blood lipid'] },
    { k: ['moyo', 'matatizo ya moyo', 'coeur', 'cardiaque', 'cardio', '心脏', '心血管', 'umutima'], e: ['cardiovascular', 'heart', 'blood vessel'] },
    { k: ['mafuta mwilini', 'cholesterol', 'cholesterole', 'lipides', 'mafuta kwenye damu', '胆固醇', '血脂'], e: ['blood lipid', 'cardiovascular'] },
    // --- viungo vya mwili ---
    { k: ['ini', 'foie', 'hepatique', '肝', '肝脏', 'umwijima'], e: ['liver'] },
    { k: ['figo', 'rein', 'reins', 'renal', '肾', '肾脏', 'impyiko'], e: ['kidney'] },
    { k: ['macho', 'jicho', 'oeil', 'yeux', 'vision', '眼', '眼睛', 'amaso'], e: ['eye'] },
    { k: ['mapafu', 'pafu', 'poumon', 'poumons', '肺', 'ibihaha'], e: ['lung'] },
    { k: ['mifupa', 'mfupa', 'osseux', '骨', '骨骼', 'amagufa'], e: ['bone'] },
    { k: ['viungo', 'maungio', 'goti', 'articulations', 'arthrite', 'arthrose', 'joint', '关节', 'ingingo'], e: ['joint', 'arthritis', 'bone'] },
    { k: ['kibofu', 'tezi dume', 'tezi', 'prostate', '前列腺', 'prostat'], e: ['prostate', 'urinary'] },
    { k: ['mkojo', 'njia ya mkojo', 'urinaire', 'vessie', '泌尿', 'inkari'], e: ['urinary', 'kidney'] },
    // --- uzazi / wanawake / wanaume ---
    { k: ['ugumba', 'utasa', 'kupata mimba', 'kushika mimba', 'mimba', 'uzazi', 'kubeba mimba', 'infertilite', 'fertilite', 'fertilité', 'grossesse', 'enceinte', 'concevoir', '备孕', '怀孕', '不孕', '生育', 'gutwita', 'kubyara', 'imbuto'], e: ['fertility', 'pregnan', 'reproduct', 'womb', 'uterus', 'inositol'] },
    { k: ['hedhi', 'kukoma hedhi', 'ukoma wa hedhi', 'ukomo wa hedhi', 'menopause', 'menopaus', 'ménopause', 'regles', 'règles', 'menstruation', 'pms', '更年期', '月经', 'imihango'], e: ['menopaus', 'menstrual', 'pms', 'hormone'] },
    { k: ['uke', 'via vya uzazi', 'kizazi', 'vagin', 'vaginal', 'yoni', '阴道', 'nyababyeyi'], e: ['vaginal', 'yoni', 'womb', 'uterus', 'women'] },
    { k: ['nguvu za kiume', 'nguvu za kiumeni', 'upungufu wa nguvu za kiume', 'hamu', 'hamu ya tendo', 'tendo la ndoa', 'kiume', 'wanaume', 'mwanaume', 'homme', 'hommes', 'virilite', 'virilité', 'libido', 'performance', '男性', '壮阳', '补肾', 'abagabo', 'imbaraga z abagabo'], e: ['tonif', 'libido', 'aphrodis', 'horny', 'performance', 'men', 'male', 'power', 'kidney'] },
    { k: ['wanawake', 'mwanamke', 'kina mama', 'femme', 'femmes', 'feminin', '女性', '女士', 'abagore'], e: ['women', 'female', 'fertility', 'womb'] },
    { k: ['watoto', 'mtoto', 'enfant', 'enfants', '儿童', '小孩', 'abana'], e: ['children', 'kids', 'kid'] },
    // --- umbo la mwili ---
    { k: ['matiti', 'titi', 'kukuza matiti', 'seins', 'poitrine', '丰胸', '胸', 'amabere'], e: ['breast'] },
    { k: ['makalio', 'matako', 'kikalio', 'kukuza makalio', 'kukuza matako', 'fesses', 'fessier', '丰臀', '臀', 'amakofi', 'impinga'], e: ['butt', 'buttock', 'hip', 'curve'] },
    { k: ['nyonga', 'nyonga kubwa', 'hanches', 'hanche', '髋', '胯'], e: ['hip', 'butt', 'curve'] },
    { k: ['maumbo', 'umbo', 'shape', 'courbes', '曲线'], e: ['curve', 'butt', 'hip', 'breast'] },
    { k: ['kimo', 'urefu', 'kuongeza kimo', 'kuongeza urefu', 'taille', 'grandir', '增高', '长高', 'uburebure'], e: ['height'] },
    { k: ['misuli', 'kujenga misuli', 'musculation', 'muscle', 'muscles', 'masse musculaire', '肌肉', '增肌', 'imikaya'], e: ['muscle', 'build', 'creatine', 'protein'] },
    // --- ngozi / nywele ---
    { k: ['ngozi', 'ngozi nzuri', 'ngozi laini', 'peau', 'peau eclatante', 'éclat', '皮肤', '肌肤', 'uruhu'], e: ['skin', 'collagen', 'glutathione', 'beauty'] },
    { k: ['kupauka', 'kuwa mweupe', 'weupe', 'kujichubua', 'kung\'arisha ngozi', 'kung\'aa', 'kuwa na ngozi nyeupe', 'blanchiment', 'blanchir', 'eclaircir', 'éclaircir', 'eclaircissant', 'dépigmentation', 'depigmentation', '美白', '亮肤', '淡斑', 'kwera', 'kwerisha uruhu'], e: ['whiten', 'whitening', 'brighten', 'lighten', 'glutathione', 'glow'] },
    { k: ['chunusi', 'vipele', 'madoa', 'acne', 'acné', 'boutons', 'taches', '痘', '祛痘', '粉刺', 'ibisebe', 'imitoto'], e: ['acne', 'skin clarity', 'skin health', 'skin'] },
    { k: ['makunyanzi', 'uzee', 'kuzeeka', 'kupambana na uzee', 'rides', 'vieillissement', 'anti age', 'anti-age', 'antiage', '抗衰老', '抗衰', '皱纹', 'gusaza'], e: ['anti-aging', 'aging', 'collagen', 'antioxidant'] },
    { k: ['nywele', 'kukuza nywele', 'upara', 'cheveux', 'chevelure', '头发', '生发', '脱发', 'umusatsi'], e: ['hair'] },
    { k: ['kolajeni', 'kolagen', 'collagene', 'collagène', '胶原蛋白', 'kolajene'], e: ['collagen'] },
    { k: ['glutathione', 'glutathioni', 'gluta', '谷胱甘肽'], e: ['glutathione', 'gluta'] },
    // --- kinga / vitamini / nguvu ---
    { k: ['kinga', 'kinga ya mwili', 'kuongeza kinga', 'immunite', 'immunité', 'defenses', 'défenses', 'immunitaire', '免疫', '免疫力', 'ubudahangarwa', 'ubwirinzi'], e: ['immun', 'vitamin', 'shilajit'] },
    { k: ['vitamini', 'vitamin', 'vitamines', 'vitamine', '维生素', 'vitamini'], e: ['vitamin'] },
    { k: ['uchovu', 'kukosa nguvu', 'nguvu', 'nishati', 'stamina', 'fatigue', 'energie', 'énergie', 'fatigué', 'epuisement', '疲劳', '体力', '精力', 'umunaniro', 'imbaraga'], e: ['fatigue', 'energy', 'vitality', 'endurance', 'strength'] },
    { k: ['usingizi', 'kukosa usingizi', 'kulala', 'kulala vizuri', 'sommeil', 'dormir', 'insomnie', 'insomnia', '睡眠', '失眠', '助眠', 'ibitotsi', 'gusinzira'], e: ['sleep', 'calm', 'relax', 'insomnia'] },
    { k: ['msongo wa mawazo', 'msongo', 'stress', 'wasiwasi', 'kupumzika', 'detente', 'détente', 'anxiete', 'anxiété', 'relaxation', '压力', '放松', 'guhangayika', 'umubabaro'], e: ['stress', 'calm', 'relax', 'sleep'] },
    { k: ['kumbukumbu', 'akili', 'memoire', 'mémoire', 'concentration', 'focus', '记忆', '专注', 'ubwenge'], e: ['focus', 'memory', 'brain'] },
    // --- tumbo / mmeng'enyo ---
    { k: ['kuvimbiwa', 'choo kigumu', 'choo', 'constipation', 'selles', 'transit', '便秘', 'kugira umwanda'], e: ['bowel', 'constipat', 'colon', 'gut'] },
    { k: ['mmeng\'enyo', 'mmengenyo', 'usagaji', 'kusaga chakula', 'digestion', 'digestif', 'intestin', 'intestins', '消化', '肠胃', 'igogora'], e: ['digest', 'gut', 'stomach', 'bowel', 'probiotic'], },
    { k: ['vidonda vya tumbo', 'vidonda', 'ulcere', 'ulcère', 'ulcer', '溃疡', 'ibisebe vyo munda'], e: ['ulcer', 'stomach'] },
    { k: ['bawasiri', 'hemorroides', 'hémorroïdes', 'hemorrhoid', '痔疮', 'imvuvu'], e: ['hemorrhoid', 'bowel', 'colon'] },
    { k: ['probiotiki', 'probiotics', 'probiotique', 'probiotiques', '益生菌', 'probiyotike'], e: ['probiotic'] },
    // --- sumu / sigara / pombe ---
    { k: ['sumu', 'kusafisha mwili', 'kusafisha', 'detox', 'detoxification', 'desintoxication', 'désintoxication', 'detoxifier', '排毒', '解毒', 'koza umubiri', 'gusukura umubiri'], e: ['detox', 'toxin', 'cleanse', 'cleansing'] },
    { k: ['sigara', 'kuacha sigara', 'kuvuta sigara', 'tumbaku', 'cigarette', 'cigarettes', 'tabac', 'arreter de fumer', 'arrêter de fumer', 'fumer', '戒烟', '烟', 'itabi', 'kureka itabi'], e: ['smok', 'lung'] },
    { k: ['pombe', 'ulevi', 'alcool', 'alcoolisme', '酒', '解酒', 'inzoga'], e: ['alcohol', 'liver'] },
    // --- aina ya bidhaa ---
    { k: ['chai', 'majani', 'chai ya', 'tisane', 'infusion', '茶', '茶包', 'icayi', 'ikawa'], e: ['tea'] },
    { k: ['poda', 'unga', 'poudre', '粉', '粉末', 'ifu'], e: ['powder'] },
    { k: ['kidonge', 'vidonge', 'kapsuli', 'kapsuro', 'capsule', 'capsules', 'gelule', 'gélule', 'gelules', 'gélules', 'comprime', 'comprimé', 'comprimes', 'comprimés', 'pilule', '胶囊', '片剂', 'ibinini', 'ikinini', 'agakapusule'], e: ['capsule', 'tablet', 'softgel'] },
    { k: ['gamu', 'gam', 'gummies', 'gummy', 'gomme', 'gommes', '软糖', 'ibombo'], e: ['gummies', 'gummy'] },
    { k: ['pipi', 'peremende', 'bonbon', 'bonbons', 'candy', '糖果'], e: ['candy', 'gummies', 'gummy'] },
    { k: ['jeli', 'gelee', 'gelée', '果冻', 'jele'], e: ['jelly', 'gel'] },
    { k: ['krimu', 'kirimu', 'dawa ya kupaka', 'kupaka', 'creme', 'crème', 'pommade', '乳霜', '面霜', 'ikirimu'], e: ['cream', 'gel', 'oil', 'lotion'] },
    { k: ['mafuta ya kupaka', 'mafuta ya ngozi', 'huile', 'huiles', '精油', '按摩油', 'amavuta'], e: ['oil', 'cream', 'gel'] },
    { k: ['losheni', 'lotion', 'lotions', '乳液'], e: ['lotion', 'cream'] },
    { k: ['matone', 'gouttes', 'goutte', '滴剂', 'ibitonyanga'], e: ['drops'] },
    { k: ['kiraka', 'plasta', 'patch', 'patchs', 'timbre', '贴', '贴片', 'agapfundikizo'], e: ['patch'] },
    { k: ['zinki', 'zinc', '锌', 'zinki'], e: ['zinc'] },
    { k: ['protini', 'proteine', 'protéine', 'proteines', 'protéines', '蛋白', '蛋白质', 'poroteyine'], e: ['protein', 'muscle'] },
    // --- kiingereza (maneno ya kawaida) ---
    { k: ['lose weight', 'losing weight', 'slimming', 'slim', 'fat loss', 'burn fat', 'belly fat', 'tummy'], e: ['weight loss', 'loss weight', 'slim', 'fat burn', 'tummy'] },
    { k: ['blood sugar', 'sugar', 'diabetic', 'diabetes'], e: ['blood sugar', 'diabet', 'metabolic'] },
    { k: ['skin whitening', 'whitening', 'lightening', 'brightening', 'fair skin'], e: ['whiten', 'brighten', 'lighten', 'glutathione'] },
    { k: ['immune', 'immunity', 'immune system'], e: ['immun'] },
    { k: ['stamina men', 'men power', 'male enhancement', 'men health', 'mens health'], e: ['tonif', 'libido', 'aphrodis', 'horny', 'performance', 'men', 'male', 'kidney'] },
    { k: ['pregnant', 'pregnancy', 'conceive', 'get pregnant', 'infertility', 'fertility'], e: ['fertility', 'pregnan', 'reproduct', 'womb', 'uterus', 'inositol'] },
  ];

  // Tayarisha concepts mara moja: kila `k` inawekwa normalized.
  var _concepts = null;
  function concepts() {
    if (_concepts) return _concepts;
    _concepts = CONCEPTS.map(function (c) {
      return {
        keys: c.k.map(function (k) { return norm(k); }).filter(Boolean),
        en: c.e.map(function (e) { return norm(e); })
      };
    });
    return _concepts;
  }

  /* ===================== DOC (kila bidhaa) ===================== */
  // Cache ya docs: ufunguo = id + jina + faida + kundi, hivyo mabadiliko ya admin
  // yanaonekana mara moja (hakuna index ya kuharibika).
  var _docCache = {};
  function allEffectTranslations(effect) {
    var out = [];
    try {
      if (typeof EFFECT_I18N !== 'undefined') {
        var key = String(effect || '').trim().replace(/[.,]+$/, '').toLowerCase();
        var ent = EFFECT_I18N[key];
        if (ent) for (var l in ent) if (ent.hasOwnProperty(l) && ent[l]) out.push(ent[l]);
      }
    } catch (e) { /* ignore */ }
    return out;
  }
  function makeDoc(p) {
    var ck = p.id + '|' + p.name + '|' + p.effect + '|' + p.category;
    var d = _docCache[ck];
    if (d) return d;
    var name = norm(p.name), effect = norm(p.effect), cat = norm(p.category);
    var tr = norm(allEffectTranslations(p.effect).join(' '));
    var goalTxt = ''; // makundi ya kazi yanabadilishwa na admin; hayaingizwi kwenye cache ya search
    var all = (name + ' ' + effect + ' ' + cat + ' ' + tr + ' ' + goalTxt).trim();
    var words = {};
    all.split(' ').forEach(function (w) { if (w) { words[w] = 1; words[stem(w)] = 1; } });
    d = { p: p, name: name, effect: effect, cat: cat, tr: tr, goal: goalTxt, all: all, words: words, wordList: Object.keys(words) };
    // cache isikue bila kikomo
    if (Object.keys(_docCache).length > 4000) _docCache = {};
    _docCache[ck] = d;
    return d;
  }

  /* ===================== FUZZY ===================== */
  function lev(a, b, max) {
    var m = a.length, n = b.length;
    if (Math.abs(m - n) > max) return max + 1;
    var prev = new Array(n + 1), cur = new Array(n + 1), i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      var rowMin = cur[0];
      for (j = 1; j <= n; j++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > max) return max + 1;
      var t = prev; prev = cur; cur = t;
    }
    return prev[n];
  }
  function fuzzyWordHit(tok, doc) {
    if (tok.length < 4 || CJK.test(tok)) return false;
    var max = tok.length >= 8 ? 2 : 1;
    for (var i = 0; i < doc.wordList.length; i++) {
      var w = doc.wordList[i];
      if (w.length < 3) continue;
      if (lev(tok, w, max) <= max) return true;
      // makosa mwishoni mwa neno refu ("collagn" → "collagen")
      if (w.length > tok.length && lev(tok, w.slice(0, tok.length), max) <= max && tok.length >= 5) return true;
    }
    return false;
  }

  /* ===================== QUERY ANALYSIS ===================== */
  // Rudisha: { tokens: [...], conceptHits: [ {en:[...], covers:[token...]} ] }
  function analyze(query) {
    var q = norm(query);
    var padded = ' ' + q + ' ';
    var allTokens = q ? q.split(' ') : [];
    var covered = {};
    var hits = [];
    concepts().forEach(function (c) {
      var matchedKey = null;
      for (var i = 0; i < c.keys.length; i++) {
        var key = c.keys[i];
        if (CJK.test(key)) {
          if (q.indexOf(key) > -1) { matchedKey = key; break; }
          continue;
        }
        if (padded.indexOf(' ' + key + ' ') > -1) { matchedKey = key; break; }
        // mteja bado anaandika (prefix): "kisukar" → "kisukari" (angalau herufi 4, neno moja)
        if (key.indexOf(' ') === -1) {
          for (var t = 0; t < allTokens.length; t++) {
            var tk = allTokens[t];
            if (tk.length >= 4 && key.length > tk.length && key.indexOf(tk) === 0 && !CJK.test(tk)) { matchedKey = key; break; }
          }
          if (matchedKey) break;
        }
      }
      if (matchedKey) hits.push({ en: c.en, key: matchedKey });
    });
    // Concept fupi iliyomo ndani ya ndefu inaondolewa: "nguvu za kiume" isichanganywe na "nguvu" (uchovu),
    // "kupunguza uzito" isichanganywe na "uzito".
    hits = hits.filter(function (h) {
      return !hits.some(function (o) {
        return o !== h && o.key.length > h.key.length && (' ' + o.key + ' ').indexOf(' ' + h.key + ' ') > -1;
      });
    });
    hits.forEach(function (h) {
      var mk = h.key;
      mk.split(' ').forEach(function (w) { covered[w] = 1; });
      // prefix: funika tokeni zinazoanza vivyo hivyo
      allTokens.forEach(function (tk) { if (tk.length >= 4 && mk.indexOf(tk) === 0) covered[tk] = 1; });
      // CJK: funika tokeni zenye neno hilo
      if (CJK.test(mk)) allTokens.forEach(function (tk) { if (tk.indexOf(mk) > -1) covered[tk] = 1; });
    });
    var tokens = allTokens.filter(function (t) {
      if (STOP[t]) return false;
      if (t.length < 2 && !CJK.test(t)) return false;
      return true;
    });
    return { q: q, tokens: tokens, covered: covered, hits: hits };
  }

  /* ===================== SCORING ===================== */
  function tokenScore(tok, doc, allowFuzzy) {
    var st = stem(tok), s = 0;
    var nameWords = doc.name.split(' ');
    var effWords = doc.effect.split(' ');
    var i;
    // jina
    for (i = 0; i < nameWords.length; i++) {
      var nw = nameWords[i], ns = stem(nw);
      if (nw === tok || ns === st) { s = Math.max(s, 12); }
      else if (tok.length >= 2 && (nw.indexOf(tok) === 0 || ns.indexOf(st) === 0)) { s = Math.max(s, 9); }
    }
    if (!s && doc.name.indexOf(tok) > -1) s = 6;
    // faida
    for (i = 0; i < effWords.length; i++) {
      var ew = effWords[i], es = stem(ew);
      if (ew === tok || es === st) { s = Math.max(s, 8); }
      else if (ew.indexOf(tok) === 0 || es.indexOf(st) === 0) { s = Math.max(s, 6); }
    }
    if (!s && doc.effect.indexOf(tok) > -1) s = 4;
    // kundi + tafsiri za lugha zote + kundi la kazi
    if (!s && doc.cat.indexOf(tok) > -1) s = 3;
    if (!s && doc.tr.indexOf(tok) > -1) s = 5;
    if (!s && doc.goal && doc.goal.indexOf(tok) > -1) s = 2;
    if (!s && allowFuzzy && fuzzyWordHit(tok, doc)) s = 2;
    return s;
  }
  // Maneno ya concept yanalinganishwa kwa MWANZO WA NENO (si sehemu yoyote ya neno), ili
  // "male" isipatikane ndani ya "female", wala "men" ndani ya "supplement"/"treatment".
  function hasWordStart(str, term) { return (' ' + str).indexOf(' ' + term) > -1; }
  // Neno la kwanza kwenye orodha `e` ni maalum zaidi → alama ya juu; la mwisho = jumla zaidi.
  function conceptScore(hit, doc) {
    var best = 0;
    for (var i = 0; i < hit.en.length; i++) {
      var term = hit.en[i];
      if (!term) continue;
      var sc = 0;
      if (hasWordStart(doc.name, term)) sc = 7;
      else if (hasWordStart(doc.effect, term)) sc = 6;
      else if (hasWordStart(doc.cat, term)) sc = 3;
      else if (hasWordStart(doc.all, term)) sc = 2;
      if (sc) { sc = sc - 0.4 * i; if (sc > best) best = sc; }
    }
    return best > 0 ? best : 0;
  }

  function runPass(docs, a, mode, allowFuzzy) {
    // mode: 'AND' (kila neno LAZIMA lipatikane) | 'OR' (neno lolote)
    var out = [];
    for (var d = 0; d < docs.length; d++) {
      var doc = docs[d], total = 0, matched = 0, needed = 0, conceptAny = false;
      // tokeni ambazo hazijafunikwa na concept
      for (var t = 0; t < a.tokens.length; t++) {
        var tok = a.tokens[t];
        if (a.covered[tok]) continue;
        needed++;
        var sc = tokenScore(tok, doc, allowFuzzy);
        if (sc) { matched++; total += sc; }
      }
      // concepts (kila concept iliyopatikana kwenye swali ni "lazima" kwa AND)
      var cMatched = 0;
      for (var c = 0; c < a.hits.length; c++) {
        var cs = conceptScore(a.hits[c], doc);
        if (cs) { cMatched++; total += cs; conceptAny = true; }
      }
      var cNeeded = a.hits.length;
      if (mode === 'AND') {
        if (needed + cNeeded === 0) continue;
        if (matched < needed || cMatched < cNeeded) continue;
      } else {
        if (!matched && !conceptAny) continue;
      }
      // bonasi: swali zima linaonekana kwenye jina
      if (a.q && doc.name.indexOf(a.q) > -1) total += 10;
      if (doc.p.bestseller) total += 0.5;
      out.push({ p: doc.p, score: total });
    }
    out.sort(function (x, y) { return y.score - x.score; });
    return out;
  }

  /* ===================== PUBLIC API ===================== */
  // ahsSearchProducts(query, products) → bidhaa zilizopangwa kwa umuhimu.
  // `products` = orodha halisi (visibleProducts()) — hivyo admin edits/hidden/duplicates
  // zinazingatiwa kiotomatiki.
  // Sahihisha makosa ya herufi kwa maneno ya Kiswahili/Kifaransa (mf. "kisukri" → "kisukari").
  // Inatumika TU matokeo yakiwa sifuri, ili isiharibu utafutaji wa kawaida.
  function singleKeys() {
    if (!root._ahsSingleKeys) {
      var out = {};
      concepts().forEach(function (c) { c.keys.forEach(function (k) { if (k.indexOf(' ') === -1 && k.length >= 5 && !CJK.test(k)) out[k] = 1; }); });
      root._ahsSingleKeys = Object.keys(out);
    }
    return root._ahsSingleKeys;
  }
  function correctTypos(query) {
    var q = norm(query), changed = false, keys = singleKeys();
    var out = q.split(' ').map(function (t) {
      if (t.length < 5 || STOP[t] || CJK.test(t)) return t;
      var max = t.length >= 8 ? 2 : 1, best = null, bd = max + 1;
      for (var i = 0; i < keys.length; i++) {
        var d = lev(t, keys[i], max);
        if (d < bd) { bd = d; best = keys[i]; if (d === 0) break; }
      }
      if (best && bd > 0 && bd <= max) { changed = true; return best; }
      return t;
    }).join(' ');
    return changed ? out : null;
  }
  // Mapendekezo ya "ulimaanisha..." kutoka kwenye maneno ya concepts (Kiswahili/Kifaransa).
  function suggestConceptWords(query, max) {
    var q = norm(query).split(' ').filter(function (t) { return t.length >= 4 && !CJK.test(t); });
    var keys = singleKeys(), seen = {}, res = [];
    q.forEach(function (t) {
      var m = t.length >= 8 ? 3 : 2;
      keys.forEach(function (k) {
        if (k === t || seen[k]) return;
        var d = lev(t, k, m);
        if (d > 0 && d <= m) { seen[k] = 1; res.push({ k: k, d: d }); }
      });
    });
    res.sort(function (a, b) { return a.d - b.d; });
    return res.slice(0, max || 3).map(function (x) { return x.k; });
  }

  // ahsSearchProducts(query, products) → bidhaa zilizopangwa kwa umuhimu.
  // `products` = orodha halisi (visibleProducts()) — hivyo admin edits/hidden/duplicates
  // zinazingatiwa kiotomatiki.
  function ahsSearchProducts(query, products) {
    var a = analyze(query);
    if (!a.q || (!a.tokens.length && !a.hits.length)) return [];
    var docs = products.map(makeDoc);
    var r = runPass(docs, a, 'AND', false);
    if (!r.length) r = runPass(docs, a, 'AND', true);   // makosa ya herufi
    if (!r.length) {                                    // makosa kwenye maneno ya concept (Kiswahili/Kifaransa)
      var fixed = correctTypos(query);
      if (fixed) {
        var a2 = analyze(fixed);
        r = runPass(docs, a2, 'AND', true);
      }
    }
    if (!r.length) r = runPass(docs, a, 'OR', true);    // neno lolote
    return r.map(function (x) { return x.p; });
  }

  // Toleo lenye makundi mawili: full = kila neno limepatikana; part = baadhi ya maneno tu (kwa ukurasa wa "Je, ipo?").
  function ahsSearchProductsEx(query, products) {
    var a = analyze(query);
    if (!a.q || (!a.tokens.length && !a.hits.length)) return { full: [], part: [] };
    var docs = products.map(makeDoc);
    var r = runPass(docs, a, 'AND', false);
    if (!r.length) r = runPass(docs, a, 'AND', true);
    if (!r.length) { var fx = correctTypos(query); if (fx) r = runPass(docs, analyze(fx), 'AND', true); }
    var full = r.map(function (x) { return x.p; });
    if (full.length) return { full: full, part: [] };
    var o = runPass(docs, a, 'OR', true).map(function (x) { return x.p; });
    return { full: [], part: o };
  }

  // Tafuta kwa orodha ya maneno-funguo (dalili / lengo la afya): OR, substring.
  function ahsKeywordSearch(keywords, products) {
    var kw = (keywords || []).map(function (k) { return norm(k); }).filter(Boolean);
    if (!kw.length) return products.slice();
    return products.filter(function (p) {
      var d = makeDoc(p);
      return kw.some(function (k) { return d.all.indexOf(k) > -1; });
    });
  }

  root.ahsSearchProducts = ahsSearchProducts;
  root.ahsSearchProductsEx = ahsSearchProductsEx;
  root.ahsKeywordSearch = ahsKeywordSearch;
  root.ahsSearchAnalyze = analyze;
  root.ahsSuggestConceptWords = suggestConceptWords;
  root.AHS_SEARCH_CONCEPTS = CONCEPTS;
  root.ahsSearchNorm = norm;
})(typeof window !== 'undefined' ? window : globalThis);
