# Agnes Herbal Supplements — agnesherbalsupplements.com (v72)

Duka la mtandaoni: HTML/CSS/JavaScript safi + Firebase (Firestore, Auth, Storage)
kwa data ya live, na `functions/` (Cloudflare Pages Functions) kwa SEO ya bidhaa
mpya za admin, orodha kamili na IndexNow.

## Kupakia (deploy)
1. Pakia folda nzima (ikiwemo `functions/`) kwenye Cloudflare Pages. Bila `functions/`
   kurasa zifuatazo hazitafanya kazi: `/orodha/`, `/catalog.json`, `/llms-full.txt`,
   `/api/indexnow`, `/sitemap-products-live.xml` na kurasa za bidhaa mpya za admin.
   Duka la kawaida, `/je-ipo/` (kwa bidhaa 288 za awali) na admin vinaendelea kufanya kazi.
2. Baada ya kila deploy: fungua tovuti kwa Incognito ili kuepuka cache ya zamani.
3. Google Search Console: wasilisha `sitemap.xml` na `sitemap-products-live.xml`.
   Bing Webmaster Tools: ongeza tovuti (Bing hulisha ChatGPT Search na Copilot).

## Admin (`/admin.html`)
- 🗂 **Makundi ya Kazi**: badilisha majina/alama za vitufe vya duka, panga mfuatano, ficha,
  ongeza makundi mapya, weka bidhaa kwenye kundi, na kitufe cha "📣 Arifu Bing/AI Sasa".
- 🎯 **Mpangilio wa Duka**: Bidhaa za Leo, mfuatano wa sehemu za ukurasa, ofa kwa kundi.
- ➕ **Ongeza Bidhaa**: bidhaa mpya huonekana dukani, kwenye sitemap ya live na `/orodha/`.
- Mipangilio yote ya duka huhifadhiwa kwenye Firestore `meta/homepageSettings`.

## Mpangilio wa duka kwa KAZI ya bidhaa
`js/goal-groups.js` ina makundi 12 ya kazi na maneno yanayotumika kuweka kila bidhaa
kwenye kundi lake kiotomatiki. Admin anaweza kubadilisha kila kitu kwenye tab ya Makundi ya Kazi.
Nakala ya seva ya data hii iko `functions/_lib/goal-data.js` na bidhaa 288 za awali
`functions/_lib/static-catalog.js` (zinatengenezwa kutoka `js/products-data.js`; zikibadilisha
bidhaa za awali, zitengenezwe upya).

## Kuonekana Google na AI
`robots.txt` (crawlers zote zinaruhusiwa), `llms.txt`, `/llms-full.txt`, `/catalog.json`,
`/orodha/` (viungo vya bidhaa zote), `/je-ipo/` (angalia upatikanaji, WhatsApp bidhaa ikikosekana),
IndexNow (ufunguo: faili la `<ufunguo>.txt` kwenye mzizi).

## Bidhaa za admin zilizohifadhiwa kama kurasa tuli (v56)
Bidhaa 81 za admin (ID 100040–100127) zimetengenezewa kurasa tuli `products/<slug>.html`
(zinafunguka kama `/products/<slug>`), picha halisi kwenye `images_custom/<id>-<n>.jpg`,
video `images_custom/<id>.webm`, na ziko kwenye `sitemap.xml` na `catalog-snapshot.json`.
Kurasa hizi ni NAKALA ya data ya `agnes-products-export-2026-09-30.json`: ukibadilisha bei,
jina au picha kwenye admin, nakala hizi hazibadiliki hadi zitengenezwe upya kutoka export mpya.
Faili tuli hutangulia Function ya `/products/:slug`; bidhaa mpya zaidi ya hizi 81 bado
zinahudumiwa na Function (zinahitaji `functions/`).


## Bidhaa mpya: URL, SEO, robots na injini (v56)
Kila bidhaa (369 zilizopo + mpya) ina URL yake, `robots` meta (`index, follow` + picha/video kubwa),
canonical, JSON-LD (Product + Breadcrumb), na iko kwenye sitemap.
- **Bidhaa mpya ya admin**: ukisave, ukurasa wake unatengenezwa papo hapo na Function ya `/products/:slug`;
  `sitemap-products-live.xml` inajisasisha yenyewe; na `js/firebase-config.js` inatuma URL yake
  (pamoja na `/`, `/orodha/`, sitemap) kwa `/api/indexnow` sekunde 2 baada ya kusave.
- **Bing / ChatGPT Search / Copilot / Yandex / Naver / Seznam**: hupokea IndexNow papo hapo.
- **Google**: haitumii IndexNow; husoma `sitemap.xml` na `sitemap-products-live.xml` (tuma mara moja tu
  kwenye Search Console; kisha ni otomatiki). Kwa bidhaa muhimu: Search Console > Ukaguzi wa URL > "Omba kuorodheshwa".
- **Kitufe "📣 Arifu Bing/AI Sasa"** (admin, Makundi ya Kazi): kinatuma kurasa kuu, bidhaa zote 288 za awali
  na zote za admin kwa mara moja (kitumie baada ya kila deploy kubwa).

## Ukurasa wa matangazo
`/ofa/?src=facebook` (au instagram / tiktok): bidhaa zisizo na madai ya hatari kwa matangazo,
`noindex`; chanzo cha tangazo kinaandikwa kwenye oda.

## Mipangilio ya hiari (haijawashwa bado)
`js/onesignal-config.js` (push notifications), `js/ai-config.js` (AI worker),
`js/analytics-config.js` (Meta/TikTok pixel). Zikiwa na `PASTE_...`/`YOUR_...` ni kawaida —
vipengele hivyo vimezimwa hadi uziweke thamani halisi.

## Muundo wa faili
- `index.html`, `blog.html`, `track-order.html`, `404.html`, `500.html`, `admin.html`
- `products/` — kurasa 288 za bidhaa za awali; `categories/` — kurasa 7 za aina; `ofa/`, `je-ipo/`
- `js/`, `css/`, `images/`, `images_custom/`, `assets/`
- `functions/` — Cloudflare Pages Functions
- `firestore.rules`, `storage.rules`, `_headers`, `sw.js` (network-first, cache `ahs-cache-v56`)

## Tahadhari
Bidhaa hazikusudiwi kutibu, kuponya au kuzuia ugonjwa wowote. Kagua maneno ya madai ya
bidhaa (mfano kukuza mwili, kung'arisha ngozi) kabla ya kuanza matangazo kwenye Meta/TikTok.


## v58: URL moja kwa bidhaa zote + muundo mmoja wa ukurasa
- Kila bidhaa (288 za awali + 81 za admin + mpya) ina URL ya muundo `/products/p<namba>-<jina>` (bila `.html`),
  mfano `/products/p0-28-day-slimming-tea`, `/products/p100040-7days-slim-plus-fat-burner`.
  URL za zamani `/products/100040-jina` zinaelekezwa (301) kwenye `p100040-jina`.
- Kila ukurasa una: Product (brand, sku, offer url) + BreadcrumbList + FAQPage, twitter/og, picha, bidhaa zinazohusiana,
  vitufe ORDER NOW / Ona kwenye Duka (`/#product-<id>` inafungua bidhaa) / WhatsApp.
- Bidhaa mpya ya admin hupata muundo huo huo papo hapo kupitia `functions/products/[slug].js`; slug yake huhifadhiwa kama `p<id>-<jina>`.

## v59: Majina (Title) na mpangilio wa sehemu za duka
Admin → 🎯 Mpangilio wa Duka → "📐 Mpangilio wa Sehemu za Ukurasa": ⬆️⬇️ kuhamisha sehemu nzima (bidhaa zake zinahama nazo),
na visanduku vya Title / maelezo (na ujumbe wa Wholesale kwa "Bidhaa Zetu Zote"). Huhifadhiwa kwenye `meta/homepageSettings.sectionMeta`;
wateja huona papo hapo. Uwanja wazi = jina la awali.

## v60: SEO ya Afrika Mashariki + viungo vya bidhaa
Kurasa zote 369 za bidhaa (na zile mpya za admin kupitia Function) zina hreflang (sw/en: TZ, KE, UG, RW, BI + x-default), geo meta,
`eligibleRegion` kwenye Offer. Mtu halisi akifungua `/products/<slug>` anapelekwa moja kwa moja `/#product-<id>` (dukani); bots
(Google, Bing, AI) hubaki kwenye ukurasa kusoma maudhui. Ongeza `?stay=1` kuona ukurasa bila kuelekezwa.
Bidhaa 9 zinazofanana na nyingine (mfano p31→p30) zina canonical kwenye pacha wao — ni makusudi, kuzuia maudhui yanayojirudia.

## v61: Majina halisi ya chupa kwa bidhaa 17 zilizofanana
Bidhaa 9 zilizokuwa pacha (na pacha wao 8) zimepewa majina kulingana na maandishi kwenye chupa/pakiti, na URL mpya zinazoyafuata.
URL za zamani (mfano /products/p31-slimming-tea) zinaelekezwa (301) kwenye mpya na Function ya /products/:slug kupitia `static-catalog.js`.
Kila moja sasa ina canonical yake na iko kwenye sitemap (jumla 369).

## v65: Chagua bidhaa za kila sehemu
Admin → Panga Sehemu & Majina: kila sehemu (Flash Sale, New Products, Best Sellers, New Arrivals, Trending, Daily Deals, Recently Added) ina kisanduku cha kuchagua bidhaa. Hifadhiwa kwenye meta/homepageSettings.sectionProducts. Hakuna bidhaa zilizochaguliwa = kiotomatiki.


## v69: Marekebisho ya URL za bidhaa (ukaguzi wa bidhaa zote)
- **Ukurasa wa bidhaa SASA unabaki ukurasa wa bidhaa.** Script iliyomrusha kila mtu halisi kwenda `/#product-<id>` (ukurasa mkuu)
  imeondolewa kutoka kurasa zote 288 tuli na kutoka `functions/_lib/render-product.js`. Kiungo cha tangazo (Facebook/Instagram/WhatsApp/Google)
  kinafungua picha, jina, bei, maelezo na kitufe cha ORDER NOW za bidhaa hiyo. Viungo vya zamani `/#product-<id>` bado vinafanya kazi.
- **`functions/products/[slug].js`**: Cloudflare Pages huendesha Function KWANZA kisha huangukia kwenye faili tuli kupitia `context.next()`.
  Toleo la awali lilikuwa linaelekeza (301) kila URL ya bidhaa ya awali kwenye URL ile ile (mzunguko usio na mwisho). Sasa slug ya sasa ya ukurasa tuli
  inahudumiwa kwa `next()`; `.html`, slug za zamani (`p31-slimming-tea`), `100040-jina` na slug zisizo na `p<id>` (`mix-products`) zinaelekezwa 301 kwenye ukurasa sahihi wa bidhaa ile ile,
  na `?src=`/`?utm_`/`fbclid` vinahifadhiwa. Bidhaa isiyokuwepo = 404 halisi. Firestore ikishindwa = 503 (si 404 ya uongo). Akiba haitegemei query string.
- **`404.html`** haimrushi tena mtu kwenda ukurasa mkuu kwa `/products/...` isiyopatikana; inaonyesha "Bidhaa Haipatikani".
- `functions/sitemap-products-live.xml.js` inatoa 503 (si sitemap tupu) Firestore ikishindwa; `fetchCustomProducts` inatupa kosa ukurasa wa kwanza ukishindwa.
- Social preview: `og:site_name`, `og:image:width/height/alt`, `product:price:*` zimeongezwa. Picha za bidhaa ni 480px upana — Facebook inapendelea 600px+ kwa kadi kubwa.
- `sw.js` cache `ahs-cache-v73`.
- v69b: `sitemap-products-live.xml`, `/orodha/`, `/catalog.json`, `/llms-full.txt` na `/api/indexnow` sasa hutumia orodha NYEPESI ya Firestore (bila picha/video za base64). Hapo awali zilipakua picha zote za bidhaa za admin (MB nyingi) kuhesabu URL tu; sitemap ya live ilirudi tupu. Video za `videoClip` hazimo tena kwenye sitemap ya live (ukurasa wa bidhaa bado una VideoObject).
- v69c/d (OTOMATIKI): kila ukurasa wa bidhaa unasoma Firestore papo hapo (akiba ya sekunde 60). Bidhaa za admin: kurasa zinatengenezwa live (`functions/products/[slug].js`). Bidhaa 288 za awali: ukurasa tuli ni kiolezo, na mabadiliko ya Admin → Hariri Bidhaa (`productOverrides`: jina, bei, maelezo, picha, stock, ficha) yanawekwa juu yake na `functions/_lib/apply-override.js`. Bidhaa iliyofichwa = 404 halisi. Hakuna nakala tuli za bidhaa za admin (zinakuwa za zamani). Firestore ikishindwa: bidhaa za awali hubaki (ukurasa tuli), za admin hupata 503 (jaribu tena), si 404 ya uongo. Bidhaa ya admin ikibadilishwa jina na haina slug iliyohifadhiwa, URL ya zamani inaelekezwa (301) kwenye mpya.
- v69e (fomu ya oda): (1) Kikapu kwenye simu sasa kinasogea; hapo awali, hasa kwa "Mkoani", vitufe vya "Ona Invoice"/"Agiza kwa WhatsApp" vilikuwa chini ya skrini bila kuweza kufikiwa (css/style.css, mwishoni). (2) Namba ya oda ni ya kipekee (`AHS-` + tarakimu 8, `ahsNewOrderNo()` kwenye js/app.js); hapo awali tarakimu 4 nasibu ziligongana na Firestore ilikataa oda ya pili kimya kimya. (3) Oda isiyofika Firestore (mtandao) inahifadhiwa `ahs_pending_orders` na kutumwa tena yenyewe (js/firebase-config.js). (4) Mkoa: orodha haifungwi tena mteja akiwa bado anaandika, na hachaguliwi mkoa kwa kubahatisha ("kilo" haiwi Kilosa kimya); mikoa 10 isiyo na bei (Kagera, Katavi, Kilimanjaro, Manyara, Mara, Pwani, Rukwa, Ruvuma, Simiyu, Songwe) inaonekana kwenye orodha kama "bei itathibitishwa" — ongeza bei zake kwenye js/shipping-data.js (na uondoe jina kwenye REGIONS_WITHOUT_RATE kwenye js/app.js). (5) Dar es Salaam haionyeshi tena onyo jekundu la "hatari".

## v69f — Ingiza bidhaa 2026 (Admin → ➕ Ongeza Bidhaa → "📦 Ingiza Bidhaa")
Inaongeza bidhaa 36 za orodha ya 2026 kwa kubofya mara moja (zilizopo kwa jina zinarukwa). Kila moja: kundi la umbo + `goal` (kundi la kazi),
bei ya rejareja = bei ya mteja, jumla 5+ = -10%, jumla 10+ = -15% (Pure & Broken GS Oil: jumla = bei ya mteja kwa kuwa ingekuwa hasara),
picha ya muda yenye jina (`placeholderImg`) na caption/stock tupu. Weka picha 5 kupitia "🖼 Hariri" — picha ya muda inabadilishwa. Bei ya kununua na PV HAZIHIFADHIWI.

## v69g — Picha mpya za admin zinaonekana mara moja
URL za picha za ukurasa wa bidhaa sasa zina `?v=<alama ya picha>` (picha ikibadilika URL inabadilika; cache ndefu salama), picha bila `?v` zina cache ya dakika 1 tu (zamani saa 1),
na picha ya "Profaili" (cover) uliyochagua inakuwa ya kwanza kwa og:image/Google/ukurasa wa bidhaa.

## v69h — "New Products" ilionyesha picha/bei/jina za zamani
`renderNewProducts()` ilitumia bidhaa za msingi (bila mabadiliko ya Admin). Sasa inatumia `visibleProducts()` (mabadiliko ya Admin + zilizofichwa hazionekani).

## v69i — Picha ya share (og:image) haikufunguka kwa bidhaa zilizohaririwa
Ukihariri bidhaa ya awali kwenye Admin, picha ilihifadhiwa kama njia ya faili ("images/p282.jpg"), na seva iliiweka kwenye /img/custom/ (inarudisha 404).
Sasa picha zisizo data-URL (njia ya faili au https) zinatumika moja kwa moja, na /img/custom/ inaelekeza (302) kwenye picha halisi.

## v70 — marekebisho 12 (Oktoba 2026)
- `js/site-config.js` sasa inatumika: `flashSaleEnd` (tupu/imepita = Flash Sale inafichwa; weka tarehe mpya kama '2026-11-30T23:59:59+03:00'), `stats` (counters: 410 / 12 / 4 / 1000+), `waReviews` (screenshots halisi za WhatsApp; picha kwenye `assets/reviews/`).
- Pagination ya bidhaa 24 kwa ukurasa kwenye "Bidhaa Zetu Zote" (`renderGrid` + `renderGridPager` kwenye js/app.js). Mpangilio wa admin haubadiliki; picha zinapakia lazy.
- Bidhaa zenye jina lilelile zinaonyeshwa mara moja (`ahsDuplicateIds`): pacha 5 (p66, p67, p222, p227, p280) zimefichwa kwenye orodha; URL zao zinaelekezwa 301 na zimetolewa kwenye sitemap.xml.
- `js/descriptions-data.js` imeunganishwa: maelezo yanatumika TU bidhaa isipokuwa na maelezo; Admin → Hariri → Maelezo yanaonyesha na kuhariri maandishi hayo.
- Namba za malipo kwenye dirisha la bidhaa karibu na Ongeza Kwenye Kikapu; location ya Makumbusho Bus Stand + Google Maps embed + schema Store/LocalBusiness (hasMap) kwenye contact na footer.
- Makala 3 mpya kwenye `js/content-data.js`; maneno ya "effect" ya Meta Ads yamebadilishwa kuwa salama (majina ya bidhaa hayajabadilishwa ili URL zisivunjike).
- `sw.js` cache `ahs-cache-v83`.


## v71 — Viral East Africa
- Title/meta/schema (areaServed, slogan, keywords), counter ya 'Tunatuma East Africa na Duniani Kote', footer yenye bendera.
- Share: WhatsApp, Facebook, TikTok (nakili link), Copy Link, '🔥 Share na Rafiki'.
- 'Ofa ya Leo' kupitia `todayOffer` ndani ya `js/site-config.js`.
- Fomu ya oda: chaguo 'Nje ya Tanzania' (nchi + mji), simu ya kimataifa, oda inatumwa WhatsApp.
- FOMO bandia (watu 47, zimebaki 12, 4.9/5) HAIJAWEKWA kwa makusudi.

## v71b — marekebisho ya simu
- Search ya juu inapeleka kwenye ukurasa wa Je, Ipo? (Enter au 🔍).
- Je, Ipo?: kitufe cha "Angalia" hakikatiki tena.
- Kikapu kiko juu ya menyu ya chini (vitufe vya Invoice/WhatsApp vinaonekana); maandishi ya fomu yamefupishwa.
- Vitufe vinavyoelea (WhatsApp/Simu) vimehamia kulia kwenye simu — havifuniki fomu tena.
- Cache kubwa ya bidhaa za admin kwenye IndexedDB (zaidi ya 3MB) — bidhaa zinaonekana papo hapo ziara zinazofuata.

## v71c — Hero 3D
- Slider ya juu: slaidi 3 mpya (Apple Cider Vinegar Gummies, Glutathione + Collagen, Nchi 8 za usafirishaji) zenye picha halisi za bidhaa; slaidi ya chai imeondolewa. Sehemu nyingine za homepage hazijaguswa.
- Trust bar chini ya slider; namba zinasomwa kutoka `js/site-config.js` (stats).

## v71d — Je, Ipo? utafutaji
- Umoja/wingi (gummy=gummies, capsule=capsules), makosa ya kuandika (glutathion, shilajeet), maneno ya Kiswahili zaidi (vidonge, poda, acv, siki, hedhi...) na maneno ya ziada yanapuuzwa (je, ipo, nataka...).
- Jaribio: majina yote 288 ya bidhaa yanapatikana kwa kila mtindo wa kuandika; kabla ya hapo 42 ("... Gummy") zilikosekana.

## v71e — ukaguzi wa ukurasa mzima
- Kurasa 13 zimejaribiwa (simu 390px): hakuna 404, hakuna overflow, hakuna picha zilizovunjika.
- Counter ya nchi: "8+ Nchi Tunazotuma (na Duniani Kote)" (awali ilionyesha globe mara mbili); counters zina usalama zisibaki "0".
- Placeholder ya search imefupishwa isikatike.

## v71f — Je, Ipo? makosa ya kuandika
- Herufi zilizobadilishana (meloa → MELAO Hot Cream), herufi iliyopungua/kuzidi, umoja/wingi. Jaribio: bidhaa 375 (zikiwemo 87 za admin) × aina 5 za makosa = hakuna iliyokosekana.

## Utafutaji na lugha (v72)
- `js/search-engine.js`: injini MOJA ya utafutaji (gridi, dropdown na ukurasa wa `/je-ipo/`). Inaelewa Kiswahili, Kiingereza,
  Kifaransa, Kichina na Kirundi, makosa ya herufi, wingi/umoja; haitegemei MiniSearch/CDN. Neno jipya la mteja
  likikosa matokeo, ongeza mstari kwenye `CONCEPTS` juu ya faili hilo.
- `js/i18n.js`: kamusi ya lugha 5 (funguo 352 kila lugha), `?lang=fr` kwenye kiungo, storage ikizuiwa haivunji tovuti.
- Tafsiri za Kirundi (rn) mpya zimeandikwa kwa juhudi bora — zihakikiwe na mzungumzaji wa Kirundi.
