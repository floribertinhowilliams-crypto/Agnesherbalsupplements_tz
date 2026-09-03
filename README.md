# Agnes Herbal Store — Tovuti Kamili (v7)

Tovuti hii imejengwa kwa **HTML, CSS na JavaScript safi (vanilla)**. Kwa
msingi inafanya kazi bila huduma yoyote ya kulipia (frontend pekee). Sasa ina
**uwezo wa hiari wa Firebase (bure)** unaowasha sync ya "live" kati ya duka
lako na admin panel — ona sehemu ya "Kuwasha Firebase (Hiari)" chini.

## Jinsi ya Kutumia (Deploy)

1. Pakia folda hii nzima kwenye hosting yoyote ya bure/inayolipiwa inayounga
   mkono static files (GitHub Pages, Netlify, Vercel, cPanel, n.k) — hauhitaji
   Node.js wala database ya seva.
2. Badilisha `https://agnesherbalstore.com/` kwenye `index.html`, `blog.html`,
   `robots.txt` na `sitemap.xml` na domain yako halisi.
3. Namba za akaunti (Mix by Yas, M-Pesa, HaloPesa, NMB) tayari zimewekwa
   kwenye `index.html` (sehemu ya "Njia za Malipo" na kwenye invoice). Zibadilishe
   pale zitakapobadilika baadaye kwa kutafuta "payNumMix"/"payNumMpesa"/
   "payNumHalo"/"payNumNmb" na maeneo ya `copyPaymentNumber(...)` ndani ya faili.
4. Fungua `js/app.js`, tafuta `VIDEO_EMBEDS`, weka ID halisi za video zako za
   YouTube (baada ya `v=` kwenye URL ya YouTube) badala ya `null`.
5. (Hiari, kwa sync ya live) Fuata sehemu ya "Kuwasha Firebase" hapa chini.

## Vipengele Vilivyojumuishwa (Vipya — v7)

- **Admin: kuongeza/kubadilisha picha za bidhaa** — kitufe cha "🖼 Hariri" kwenye
  kila bidhaa (tab ya "Bidhaa"): pakia picha nyingi, chagua ipi iwe "Profaili",
  futa picha, na hifadhi.
- **Image slider kwenye ukurasa wa bidhaa** — mteja anaweza ku-slide kuona
  picha zote za bidhaa moja (buttons ‹ › na dots).
- **Caption ya bidhaa** — herufi 900 kiwango cha juu, inaweza kujazwa manually
  au kutumia kitufe cha "Tengeneza kwa AI" (kinachotengeneza mfano wa maandishi
  kutoka jina/kundi/kazi ya bidhaa — hakuna funguo ya AI ya nje inayotumika,
  kwa usalama wa data).
- **Display mode: Portrait / Horizontal** — kitufe juu ya orodha ya bidhaa,
  mteja anachagua anavyopenda kuona bidhaa, kinahifadhiwa kwa kivinjari chake.
- **Lugha mpya**: French (FR), Kirundi (RN), Kinyarwanda (RW) — pamoja na
  Kiswahili na Kiingereza vilivyokuwepo. *(RN/RW ni tafsiri ya awali — zikaguliwe
  na mzawa wa lugha kabla ya matumizi rasmi ya biashara.)*
- **Bei za jumla mtindo wa Alibaba** — jedwali kwenye ukurasa wa bidhaa
  linaonyesha "1-4 vipande", "5-9 vipande (MOQ 5pcs)", "10+ vipande (MOQ 10pcs)".
- **Tafuta kwa Picha** — kitufe cha kamera karibu na search bar; mteja
  anapakia picha yake na mfumo unaonyesha bidhaa zinazofanana zaidi (ulinganisho
  wa rangi/muundo unaofanyika kwenye kivinjari — si utambuzi kamili wa AI).
- **Order → WhatsApp + Notification ya Live kwenye Admin** — oda ikiwekwa
  inatumwa WhatsApp yako (kama awali) NA (ikiwa Firebase imewekwa) inaonekana
  papo hapo kwenye admin panel yenye sauti ya arifa na "badge" nyekundu.
- **Admin: Thibitisha oda + badilisha hali** — Imepokelewa → Imethibitishwa →
  Imefungashwa → Imesafirishwa → Imewasilishwa. Mteja anaona hali hii papo
  hapo kwenye ukurasa wake wa "Fuatilia Oda" (ikiwa Firebase imewekwa).
- **Presence ya Admin** — swichi ya "Niko Mtandaoni" kwenye Dashibodi. Oda
  zinazowasili wakati hauko mtandaoni HAZIPOTEI — Firestore inazihifadhi na
  zote zinaonekana mara tu ukiwa online tena (hakuna usanidi wa ziada
  unaohitajika kwa hili).

## Nyongeza za v7.1

- **Push Notifications (OneSignal + Cloudflare Worker, bure)** — oda mpya
  ikija, simu/kompyuta yako ya admin inapata notification ya kweli hata
  admin.html ikiwa haijafunguliwa. Funguo ya siri ya OneSignal haiko kwenye
  tovuti — inashikiliwa salama na Cloudflare Worker ndogo (bure). Ona sehemu
  ya "Kuwasha Push Notifications" hapa chini kwa maelekezo.
- **Onyo la Stock** — kwenye paneli ya "🖼 Hariri" ya kila bidhaa, weka idadi
  ya stock iliyobaki. Mfumo utaonyesha "Stock: N" (chungwa) ikiwa imebaki 5 au
  chini, na "Imeisha" (nyekundu) ikiwa ni sifuri — na kuzuia mteja asiweke
  bidhaa hiyo kwenye kikapu. Acha uwanja huo wazi kama hutaki kufuatilia stock
  ya bidhaa fulani.
- **Kubana Picha Kiotomatiki** — picha zozote unazopakia kwenye "🖼 Hariri"
  zinabanwa kiotomatiki (upana/urefu hadi 1280px, ubora 78%) kabla ya
  kuhifadhiwa — hii inaharakisha upakiaji kwa mtandao mdogo na kupunguza
  matumizi ya nafasi ya Firebase Storage, bila kuathiri muonekano wa picha.
- **Nafasi za Google Analytics na Meta (Facebook) Pixel** — zimewekwa kwenye
  `<head>` ya `index.html`, `blog.html` na `track-order.html`, zikiwa
  zimezimwa (ndani ya maoni ya HTML `<!-- -->`). Fuata maelekezo yaliyoandikwa
  juu ya kila snippet kuweka Measurement ID / Pixel ID yako na kuziwasha.

## Nyongeza za Utafutaji (Search Upgrade)

Sehemu ya utafutaji (juu ya "Bidhaa Zetu Zote") sasa ina vipengele hivi vipya —
vyote vinafanya kazi bila huduma yoyote ya kulipia:

- **Live Search Suggestions** — unapoandika, bidhaa zinaonekana papo hapo na
  neno lililotafutwa limepigiwa mstari (highlight), pamoja na ukadiriaji (★) na bei.
- **Category Search** — ukiandika jina la kundi (hata kwa Kiswahili, mfano
  "chai", "vidonge", "poda", "pipi") mfumo unapendekeza kundi husika moja kwa moja.
- **Voice Search (🎤)** — bofya kipaza sauti karibu na search bar na sema
  unachotafuta (inatumia Web Speech API ya kivinjari — hakuna funguo ya nje).
- **Search History** — utafutaji wako wa hivi karibuni unahifadhiwa
  (kivinjari chako pekee) na kuonekana ukibofya search bar tupu; unaweza
  kufuta moja moja au zote.
- **Trending Searches** — bidhaa zinazouzwa zaidi zinapendekezwa, zikibadilika
  kila siku.
- **Popular Searches** — mada zinazotafutwa zaidi (kulingana na idadi ya
  bidhaa zilizopo dukani na matumizi yako halisi kwenye kivinjari chako).
- **Search by Symptoms (🩺)** na **Search by Health Goal (🎯)** — vitufe
  vinavyoonyesha orodha ya dalili za kiafya (mfano Kuvimbiwa, Kisukari,
  Uchovu) na malengo ya afya (mfano Kupunguza Uzito, Kinga ya Mwili) — bofya
  moja kuona bidhaa zote zinazohusiana.
- **No Result Suggestions** — ukitafuta neno lisilopatikana, mfumo
  unapendekeza "Je, ulimaanisha...?" (marekebisho ya tahajia), mada maarufu,
  kundi/dalili/lengo la kuchagua, na kitufe cha kuuliza WhatsApp moja kwa moja.

Data ya dalili/malengo (`SYMPTOMS` / `HEALTH_GOALS`) iko kwenye
`js/search-v2.js` — ongeza maneno mapya ya `keywords` hapo ukiongeza bidhaa
mpya ambazo hazipatikani kirahisi na orodha iliyopo.



Haya ni mambo makubwa zaidi yaliyobaki — Security Rules na Push Notifications
tayari zimekamilika (ona sehemu husika hapo juu):

- Malipo halisi ya Mobile Money (M-Pesa/Tigo Pesa Push API)
- Arifa za barua pepe/SMS (nyongeza ya push notifications zilizopo)
- Invoice ya PDF ya moja kwa moja
- Wasimamizi wengi (multi-admin roles)

## Vipengele vya Awali (bado vipo)

- Responsive design (simu, tablet, desktop) + Dark mode
- Search yenye suggestions + Filters (kundi, bei, mpya zaidi, zinazouzwa zaidi)
- Wishlist, Compare (hadi bidhaa 4), Recently Viewed, Related Products
- Product zoom (bofya picha), maelezo kamili, maoni ya wateja (ratings)
- Video section (nafasi tayari kwa YouTube embed — bure)
- FAQ accordion, Before/After slider (mfano — badilisha na picha halisi)
- Customer testimonials + per-product reviews (mfano, admin anaweza kuongeza halisi)
- Contact form + Newsletter signup (zinahifadhiwa localStorage; angalia sehemu ya "Mipaka" chini)
- Floating WhatsApp/Call buttons, Share buttons (WhatsApp/Facebook/X/Telegram)
- Blog/Health Articles (bilingual)
- SEO: meta tags, Open Graph, Twitter Card, JSON-LD schema, sitemap.xml, robots.txt
- Lazy loading + fade-in kwa picha, skeleton loaders, scroll animations
- Custom 404 na 500 error pages
- PWA: inaweza "kusakinishwa" kama app (manifest.json + service worker offline cache)
- Admin dashboard (`admin.html`, password chaguo-msingi: `agnes2026`)
- Usalama wa msingi: input validation, HTML escaping (kuzuia XSS), honeypot fields

## Nyongeza za v11.1 — Ongeza Bidhaa Mwenyewe (bila kuhariri faili)

- **Admin → "➕ Ongeza Bidhaa"** — tab mpya kwenye admin.html inayokuruhusu
  kuongeza bidhaa MPYA kabisa (jina, kundi, bei, maelezo, stock, hadi picha 5)
  moja kwa moja kutoka kwenye kivinjari — bila kuhariri `js/products-data.js`
  wala kutuma faili kwa mtu. Bidhaa inahifadhiwa Firestore (collection
  `customProducts`) na inaonekana dukani kwa wateja WOTE papo hapo.
- Inahitaji Firebase iwe imewekwa (ona "Kuwasha Firebase" hapa chini) — bila
  hiyo kitufe cha "Hifadhi Bidhaa" kitabaki kimezimwa.
- Unaweza kuchagua kundi lililopo au kuandika kundi jipya kabisa — litaongezwa
  kiotomatiki kwenye kichujio cha "Kundi" dukani.
- Kufuta bidhaa uliyoiongeza: bofya "🗑 Futa" kwenye orodha iliyo chini ya
  fomu (ndani ya tab hiyo hiyo).
- Kikomo: bidhaa hizi mpya hazionekani kwenye "Tafuta kwa Picha" (AI visual
  search) kwa sasa — hilo bado linatumia picha 288 za awali pekee.

## Kuwasha Firebase (Hiari — Bure, Kiwango cha "Spark")

Bila hatua hizi, tovuti inaendelea kufanya kazi kama kawaida (localStorage
pekee, kila kifaa peke yake) — hakuna kitakachovunjika. Ukitaka oda/status
ziunganishwe LIVE kati ya duka lako na admin panel, na picha za bidhaa
kuonekana kwa wateja wote (siyo kivinjari kimoja tu):

1. Nenda **https://console.firebase.google.com** → "Add project" (bure kabisa,
   hauhitaji kadi ya benki kwa mpango wa "Spark").
2. Ndani ya mradi: **Build → Firestore Database → Create database** → chagua
   "Start in test mode" → chagua region iliyo karibu (km. europe-west au
   nam5) → Create.
3. Ndani ya mradi: **Build → Storage → Get started** (kwa ajili ya picha za
   bidhaa zinazopakiwa na admin).
4. **Project settings** (ikoni ya gia juu kushoto) → chini kwenye "Your apps"
   → bofya ikoni ya wavuti "</>" → sajili app (jina lolote) → Firebase
   itakuonyesha kitu kama:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "jina-lako.firebaseapp.com",
     projectId: "jina-lako",
     storageBucket: "jina-lako.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
5. Fungua faili **`js/firebase-config.js`** kwenye mradi huu, badilisha
   `FIREBASE_CONFIG` na thamani zako halisi (weka vile vile kwa herufi na
   alama, usibadilishe majina ya funguo).
6. Pakia upya (deploy) faili zote — sasa `index.html`, `admin.html` na
   `track-order.html` zitatumia Firebase kiotomatiki. Utaona ujumbe wa
   "☁️ Sync ya live imewashwa (Firebase)" juu ya Dashibodi ya admin.
7. **Usalama (Security Rules) — FANYA HII KABLA YA KUUZA HALISI:**
   - **Authentication**: Firebase Console → **Build → Authentication → Get
     started → Sign-in method → Email/Password → Wezesha**.
   - Kisha **Authentication → Users → Add user** → weka email na password
     utakayotumia WEWE MWENYEWE kuingia kwenye `admin.html` (chagua password
     imara — hii ndiyo itakayolinda duka lako).
   - **Firestore Database → Rules** → futa yaliyopo → bandika YOTE ya faili
     **`firestore.rules`** iliyomo kwenye mradi huu → badilisha
     `PASTE_YOUR_ADMIN_EMAIL_HERE` na email uliyosajili hapo juu → "Publish".
   - **Storage → Rules** → fanya vivyo hivyo na faili **`storage.rules`**
     (email ile ile).
   - Fungua `admin.html`, jaza Email (ile uliyosajili) + Password ya ndani
     ("Nenosiri" ulilobainisha kwenye `js/admin.js`, `getAdminPass()`) —
     mfumo utaingia kwa Firebase Auth pia kwa niaba yako. Utaona kwenye
     Dashibodi: "☁️ Sync ya live imewashwa — umeingia kama email-yako".
   - Bila hatua hii, mtu yeyote mwenye internet anaweza kuandika/kufuta
     bidhaa au oda zako kupitia Firestore/Storage moja kwa moja — usianze
     mauzo halisi kabla ya kukamilisha hatua hii.

## Kuwasha Push Notifications (Hiari — Bure, OneSignal + Cloudflare Worker)

Hii inafanya simu/kompyuta yako (admin) ipige "ting" ya notification ya
kweli kila oda mpya ikija — hata kama admin.html haijafunguliwa (mradi
tu umeruhusu notification kwenye kivinjari chako mara moja).

**Hatua za OneSignal:**
1. Nenda **https://onesignal.com** → jisajili bure → "New App/Website" →
   chagua "Web Push" → fuata hatua zake kuunganisha na tovuti yako
   (itakuomba domain yako).
2. Chukua **App ID** yako (inapatikana "Settings → Keys & IDs") — hii SI siri,
   weka kwenye `js/onesignal-config.js` uwanja wa `ONESIGNAL_APP_ID`.
3. Chukua pia **REST API Key** kutoka ukurasa huo huo — hii NI SIRI, kamwe
   usiiweke kwenye faili za tovuti — itaenda kwenye Cloudflare Worker pekee
   (hatua inayofuata).

**Hatua za Cloudflare Worker (kushikilia funguo ya siri kwa usalama):**
1. Nenda **https://dash.cloudflare.com** → jisajili bure.
2. "Workers & Pages" → "Create" → "Create Worker" → mpe jina (mfano
   `agnes-notify`) → "Deploy".
3. "Edit code" → futa code iliyopo → bandika code YOTE kutoka faili
   `cloudflare-worker/agnes-notify-worker.js` iliyomo kwenye mradi huu →
   "Save and Deploy".
4. "Settings → Variables" → ongeza:
   - `ONESIGNAL_APP_ID` = App ID yako
   - `ONESIGNAL_REST_API_KEY` = REST API Key yako (chagua "Encrypt")
   - (hiari) `SHARED_SECRET` = neno lolote refu la siri unalochagua wewe
5. Nakili URL ya Worker yako (mfano `https://agnes-notify.jinaLako.workers.dev`)
   → weka kwenye `js/onesignal-config.js` uwanja wa `NOTIFY_WORKER_URL` (na
   `NOTIFY_SHARED_SECRET` kama umeweka SHARED_SECRET hapo juu).
6. Pakia upya faili zote. Fungua `admin.html`, ingia, ukubali ombi la
   "Allow Notifications" litakaloonekana — sasa umejisajili kupokea arifa.

**Kumbuka:** Bila hatua hizi, kila kitu kinaendelea kufanya kazi kama
kawaida (WhatsApp + admin panel badge) — hii ni nyongeza tu, si lazima.

## Mipaka Muhimu (Soma Hii!)

- **Bila Firebase**: tovuti ni static site pekee (frontend only) — order
  tracking, admin data, na picha za bidhaa zinabaki kwenye kivinjari kimoja
  pekee (localStorage), si kwa pamoja kati ya vifaa.
- **Kwa Firebase (hiari)**: oda, hali ya oda, picha na caption za bidhaa
  zinaunganishwa LIVE kati ya duka na admin — lakini bado unahitaji kufuata
  hatua ya usalama (Security Rules) iliyotajwa hapo juu kabla ya kuendesha
  biashara halisi, la sivyo mtu yeyote anaweza kuandika/kufuta data yako.
- **Newsletter & Contact form**: bado zinahifadhiwa `localStorage` pekee (si
  Firestore) — ujumbe huu haujaunganishwa na Firebase kwenye toleo hili.
- **Admin Dashboard password**: nenosiri linakaguliwa kwenye kivinjari
  (client-side), hivyo ni ulinzi wa msingi tu dhidi ya wageni wa kawaida — si
  usalama kamili wa kiwango cha biashara.
- **Tafuta kwa Picha**: ni ulinganisho wa rangi/muundo unaofanyika kwenye
  kivinjari (hakuna AI ya kutambua vitu halisi) — matokeo ni ya "yanayokaribiana"
  si sahihi 100%.
- **Tafsiri za Kirundi/Kinyarwanda**: ni jitihada ya awali — zikaguliwe na
  mzawa wa lugha kabla ya kutumika rasmi kibiashara.

## Muundo wa Faili

```
index.html            → Ukurasa mkuu
blog.html             → Makala za afya
track-order.html      → Ufuatiliaji wa oda (sasa live ikiwa Firebase imewekwa)
admin.html            → Dashibodi ya admin
404.html / 500.html   → Kurasa za hitilafu
manifest.json / sw.js → PWA
robots.txt / sitemap.xml → SEO
css/style.css          → CSS ya awali
css/ahs-extra.css      → CSS ya vipengele vipya (v7)
css/homepage-v2.css    → CSS ya sehemu mpya za homepage (v2)
css/search-v2.css      → CSS ya nyongeza za utafutaji (Search Upgrade)
js/firebase-config.js  → Daraja la Firebase (hiari) — weka funguo zako hapa
js/onesignal-config.js → Push notifications (hiari) — App ID + Worker URL hapa
cloudflare-worker/     → Code ya Worker inayoshikilia funguo ya siri ya OneSignal
firestore.rules        → Security Rules za Firestore (nakili kwenye Firebase Console)
storage.rules          → Security Rules za Storage (nakili kwenye Firebase Console)
js/products-data.js    → Data ya bidhaa
js/content-data.js     → Maoni, FAQ, makala
js/i18n.js              → Tafsiri SW/EN/FR/RN/RW
js/app.js               → Mantiki kuu ya duka (slider, MOQ, display mode, image search)
js/homepage-v2.js       → Sehemu mpya za homepage (hero slider, flash sale, n.k)
js/search-v2.js         → Nyongeza za utafutaji (dalili, lengo la afya, sauti, historia, trending)
js/blog.js, js/track.js, js/admin.js → Mantiki ya kurasa husika
images/                 → Picha za bidhaa
assets/                 → Logo na icons za PWA
```
