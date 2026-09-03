// Agnes Herbal Supplements — reviews, FAQ & blog content (bilingual SW/EN)
// Static demo content. Replace with real customer reviews from the Admin dashboard.

const REVIEW_POOL = [
  { name: "Amina H.", sw: "Nimetumia bidhaa hii kwa wiki mbili, matokeo ni mazuri sana. Naipenda!", en: "I've used this for two weeks and the results are great. I love it!", fr: "Je l'utilise depuis deux semaines et les résultats sont excellents. J'adore !", zh: "我已经使用了两周，效果非常好。我很喜欢！", rn: "Nkoresheje iki gicuruzwa mu ndwi zibiri, ivyavuye ni vyiza cane. Ndakikunda!" },
  { name: "Juma M.", sw: "Ubora wa bidhaa ni wa hali ya juu, na huduma kwa wateja ni nzuri.", en: "Product quality is excellent, and customer service was great.", fr: "La qualité du produit est excellente et le service client était très bon.", zh: "产品质量非常好，客户服务也很棒。", rn: "Ubuziranenge bw'igicuruzwa ni bwiza cane, kandi ubufasha bw'abakiriya ni bwiza." },
  { name: "Grace P.", sw: "Nimeagiza mara tatu sasa, kila mara napata bidhaa halisi na kwa haraka.", en: "I've ordered three times now, always genuine products delivered fast.", fr: "J'ai commandé trois fois maintenant, toujours des produits authentiques livrés rapidement.", zh: "我已经下单三次了，每次都能收到正品，配送也很快。", rn: "Ndamaze gutegura incuro zitatu, buri gihe nronka ibicuruzwa vy'ukuri kandi bitwarwa ningoga." },
  { name: "Neema K.", sw: "Bei ni nzuri ukilinganisha na maduka mengine, na ubora haujashuka.", en: "Prices are fair compared to other shops, and quality hasn't dropped.", fr: "Les prix sont justes par rapport à d'autres boutiques, et la qualité reste constante.", zh: "价格比其他店铺公道，而且质量一直很稳定。", rn: "Ibiciro ni vyiza ugereranije n'amaduka andi, kandi ubuziranenge ntibwaragabanutse." },
  { name: "Baraka S.", sw: "Nashukuru kwa ushauri walionipa kabla ya kununua, ilinisaidia kuchagua sahihi.", en: "Grateful for the advice they gave me before buying — helped me choose right.", fr: "Merci pour les conseils avant l'achat — cela m'a aidé à bien choisir.", zh: "感谢他们在购买前给我的建议，帮助我做出了正确的选择。", rn: "Ndashimira impanuro bampaye imbere yo kugura — vyamfashije guhitamwo neza." },
  { name: "Fatuma R.", sw: "Bidhaa imefika salama na packaging ni nzuri sana.", en: "Product arrived safely and the packaging was excellent.", fr: "Le produit est arrivé en toute sécurité et l'emballage était excellent.", zh: "产品安全送达，包装非常精美。", rn: "Igicuruzwa carashitse neza kandi ipaki yaco yari nziza cane." },
  { name: "Elias N.", sw: "Nimeona mabadiliko ndani ya mwezi mmoja wa matumizi.", en: "I noticed changes within one month of use.", fr: "J'ai remarqué des changements en un mois d'utilisation.", zh: "使用一个月后我就看到了变化。", rn: "Narabonye impinduka mu kwezi kumwe nkoresha." },
  { name: "Zawadi T.", sw: "Huduma ya WhatsApp ni ya haraka, majibu yanakuja mara moja.", en: "WhatsApp service is fast, replies come right away.", fr: "Le service WhatsApp est rapide, les réponses arrivent immédiatement.", zh: "WhatsApp客服响应很快，回复很及时。", rn: "Ubufasha kuri WhatsApp ni bwihuse, inyishu ziza ako kanya." }
];

function getProductReviews(productId, count) {
  const list = [];
  const n = REVIEW_POOL.length;
  for (let i = 0; i < count; i++) {
    list.push(REVIEW_POOL[(productId + i * 3) % n]);
  }
  return list;
}

const FAQ_DATA = [
  {
    sw_q: "Je, mnatuma bidhaa nje ya Dar es Salaam?",
    en_q: "Do you deliver outside Dar es Salaam?",
    sw_a: "Ndiyo, tunatuma bidhaa Tanzania nzima na pia Kenya, Uganda na Burundi kupitia mabasi na kampuni za usafirishaji. Gharama za usafirishaji hutegemea eneo lako.",
    en_a: "Yes, we deliver across Tanzania and also to Kenya, Uganda and Burundi via bus and courier companies. Shipping cost depends on your location.",
    fr_q: "Livrez-vous en dehors de Dar es Salaam ?", fr_a: "Oui, nous livrons dans toute la Tanzanie ainsi qu'au Kenya, en Ouganda et au Burundi via des bus et des transporteurs. Les frais de livraison dépendent de votre localisation.",
    zh_q: "达累斯萨拉姆以外地区也能配送吗？", zh_a: "是的，我们配送至坦桑尼亚全国，以及肯尼亚、乌干达和布隆迪，通过巴士和快递公司运送。运费取决于您所在的地区。",
    rn_q: "Muratwara ibicuruzwa hanze ya Dar es Salaam?", rn_a: "Ego, turatwara ibicuruzwa mu Tanzania yose n'i Kenya, Uganda na Burundi biciye ku mabisi n'amakoranyi y'ugutwara. Ikiguzi c'ugutwara kirashingira ku hantu uri."
  },
  {
    sw_q: "Bidhaa hizi ni halisi (original)?",
    en_q: "Are these products genuine/original?",
    sw_a: "Bidhaa zote tunazouza ni halisi, zinatoka kwa wasambazaji wanaoaminika. Tunatoa risiti/invoice kwa kila oda.",
    en_a: "All products we sell are genuine, sourced from trusted suppliers. We provide a receipt/invoice for every order.",
    fr_q: "Ces produits sont-ils authentiques (originaux) ?", fr_a: "Tous les produits que nous vendons sont authentiques, provenant de fournisseurs fiables. Nous fournissons un reçu/facture pour chaque commande.",
    zh_q: "这些产品是正品（原装）吗？", zh_a: "我们出售的所有产品均为正品，来自可信赖的供应商。每笔订单我们都提供收据/发票。",
    rn_q: "Ibi bicuruzwa ni ivy'ukuri (original)?", rn_a: "Ibicuruzwa vyose tugurisha ni ivy'ukuri, biva ku batanga bizewe. Duha risiti/invoice kuri buri kurikira."
  },
  {
    sw_q: "Bei ya jumla (wholesale) inafanya kazi vipi?",
    en_q: "How does the wholesale pricing work?",
    sw_a: "Ukinunua vipande 5 au zaidi vya bidhaa moja, bei ya jumla ya kwanza inatumika kiotomatiki. Ukinunua vipande 10 au zaidi, unapata bei nafuu zaidi.",
    en_a: "If you buy 5 or more pieces of one product, the first wholesale tier applies automatically. Buying 10+ pieces unlocks an even lower price.",
    fr_q: "Comment fonctionne le prix de gros (wholesale) ?", fr_a: "Si vous achetez 5 pièces ou plus d'un même produit, le premier palier de prix de gros s'applique automatiquement. À partir de 10 pièces, vous obtenez un prix encore plus bas.",
    zh_q: "批发价是如何计算的？", zh_a: "如果您购买同一产品5件或以上，会自动适用第一档批发价。购买10件以上可享受更低的价格。",
    rn_q: "Igiciro c'ibingi (wholesale) gikora gute?", rn_a: "Nugura ibice 5 canke birenga vy'igicuruzwa kimwe, igiciro ca mbere c'ibingi gikoreshwa mu buryo bwikora. Nugura ibice 10 canke birenga, uronka igiciro kigabanutse kuruta."
  },
  {
    sw_q: "Naweza kulipaje?",
    en_q: "How can I pay?",
    sw_a: "Tunapokea malipo kupitia M-Pesa, Mixx by Yas, HaloPesa na benki (NMB). Baada ya kulipa, tuma risiti kupitia WhatsApp ili tuthibitishe oda yako.",
    en_a: "We accept M-Pesa, Mixx by Yas, HaloPesa and bank transfer (NMB). After paying, send your receipt via WhatsApp so we can confirm your order.",
    fr_q: "Comment puis-je payer ?", fr_a: "Nous acceptons M-Pesa, Mixx by Yas, HaloPesa et le virement bancaire (NMB). Après paiement, envoyez votre reçu via WhatsApp afin que nous confirmions votre commande.",
    zh_q: "我可以如何付款？", zh_a: "我们接受 M-Pesa、Mixx by Yas、HaloPesa 以及银行转账（NMB）。付款后，请通过WhatsApp发送收据，以便我们确认您的订单。",
    rn_q: "Noshobora kwishura gute?", rn_a: "Turakira ubwishuzi biciye kuri M-Pesa, Mixx by Yas, HaloPesa na banki (NMB). Inyuma yo kwishura, rungika risiti kuri WhatsApp kugira twemeze ikurikira ryawe."
  },
  {
    sw_q: "Je, kuna madhara yoyote ya kutumia supplements hizi?",
    en_q: "Are there any side effects from using these supplements?",
    sw_a: "Bidhaa zetu ni za asili (herbal), lakini kila mtu ni tofauti. Kama una mimba, unanyonyesha, au una hali maalum ya kiafya, wasiliana na daktari kabla ya kutumia.",
    en_a: "Our products are herbal/natural, but everyone's body is different. If you are pregnant, breastfeeding, or have a medical condition, consult a doctor before use.",
    fr_q: "Y a-t-il des effets secondaires à l'utilisation de ces compléments ?", fr_a: "Nos produits sont naturels/à base de plantes, mais chaque corps réagit différemment. Si vous êtes enceinte, allaitez, ou avez une condition médicale, consultez un médecin avant utilisation.",
    zh_q: "使用这些保健品有副作用吗？", zh_a: "我们的产品是天然草本产品，但每个人的身体状况不同。如果您怀孕、哺乳或有特殊健康状况，请在使用前咨询医生。",
    rn_q: "Hariho ingaruka zo gukoresha izi supplements?", rn_a: "Ibicuruzwa vyacu ni ivya kamere (herbal), mugabo umubiri wa buri muntu uratandukanye. Nimba uri inda, uronsa, canke ufise indwara idasanzwe, raba muganga imbere yo gukoresha."
  },
  {
    sw_q: "Naweza kurudisha bidhaa nikibadilisha mawazo?",
    en_q: "Can I return a product if I change my mind?",
    sw_a: "Kwa sababu za kiafya, bidhaa zilizofunguliwa haziwezi kurudishwa. Bidhaa ikiwa na hitilafu ya kiwanda tunabadilisha bila gharama ndani ya siku 3.",
    en_a: "For health/hygiene reasons, opened products cannot be returned. If a product has a manufacturing defect we replace it free of charge within 3 days.",
    fr_q: "Puis-je retourner un produit si je change d'avis ?", fr_a: "Pour des raisons de santé, les produits ouverts ne peuvent pas être retournés. En cas de défaut de fabrication, nous le remplaçons gratuitement dans les 3 jours.",
    zh_q: "如果我改变主意，可以退货吗？", zh_a: "出于健康原因，已开封的产品不可退货。如果产品存在生产缺陷，我们将在3天内免费更换。",
    rn_q: "Noshobora gusubiza igicuruzwa nimba nahinduye ivyifuzo?", rn_a: "Kubera impamvu z'ubuzima, ibicuruzwa vyugururiwe ntibisubizwa. Igicuruzwa nicagira ikosa ryo mu ruganda turasubiza ku buntu mu misi 3."
  },
  {
    sw_q: "Muda wa uwasilishaji ni gani?",
    en_q: "What is the delivery timeframe?",
    sw_a: "Ndani ya Dar es Salaam: siku 1. Mikoa mingine Tanzania: siku 1-3. Kenya, Uganda, Burundi: siku 3-7 kutegemea na kampuni ya usafirishaji.",
    en_a: "Within Dar es Salaam: 1 day. Other regions in Tanzania: 1-3 days. Kenya, Uganda, Burundi: 3-7 days depending on the courier.",
    fr_q: "Quel est le délai de livraison ?", fr_a: "À Dar es Salaam : 1 jour. Autres régions de Tanzanie : 1-3 jours. Kenya, Ouganda, Burundi : 3-7 jours selon le transporteur.",
    zh_q: "配送需要多长时间？", zh_a: "达累斯萨拉姆市内：1天。坦桑尼亚其他地区：1-3天。肯尼亚、乌干达、布隆迪：3-7天，具体取决于快递公司。",
    rn_q: "Igihe co gutwara ni ikahe?", rn_a: "Muri Dar es Salaam: umusi 1. Intara zindi za Tanzania: imisi 1-3. Kenya, Uganda, Burundi: imisi 3-7 bivanye n'uwutwara."
  },
  {
    sw_q: "Naweza kuwa muuzaji/wakala wa Agnes Herbal Supplements?",
    en_q: "Can I become a reseller/agent for Agnes Herbal Supplements?",
    sw_a: "Ndiyo! Tunakaribisha mawakala katika miji na nchi zote tunazofikia. Wasiliana nasi kwa WhatsApp kujadili masharti ya bei ya jumla.",
    en_a: "Yes! We welcome resellers/agents in every city and country we serve. Contact us on WhatsApp to discuss wholesale terms.",
    fr_q: "Puis-je devenir revendeur/agent pour Agnes Herbal Supplements ?", fr_a: "Oui ! Nous accueillons des revendeurs/agents dans toutes les villes et tous les pays que nous desservons. Contactez-nous sur WhatsApp pour discuter des conditions de gros.",
    zh_q: "我可以成为 Agnes Herbal Supplements 的经销商/代理吗？", zh_a: "可以！我们欢迎在我们服务的每个城市和国家寻找经销商/代理。请通过WhatsApp联系我们讨论批发条款。",
    rn_q: "Noshobora kuba umudandaza/uwuhagarariye Agnes Herbal Supplements?", rn_a: "Ego! Turakira abadandaza mu migi n'ibihugu vyose tugezayo. Tuvugishe kuri WhatsApp kuganira ku mabwirizwa y'igiciro c'ibingi."
  }
];

const ARTICLES_DATA = [
  {
    slug: "faida-za-virutubisho-vya-asili",
    img: "images/p014.jpg",
    sw_title: "Faida 5 za Virutubisho vya Asili kwa Afya Yako",
    en_title: "5 Benefits of Natural Herbal Supplements for Your Health",
    date: "2026-06-02",
    sw_excerpt: "Virutubisho vya asili vinaweza kusaidia mwili wako kwa njia nyingi. Hapa kuna sababu 5 kuu za kuzingatia.",
    en_excerpt: "Natural supplements can support your body in many ways. Here are 5 key reasons to consider them.",
    sw_body: "Virutubisho vya asili (herbal supplements) vimekuwa sehemu muhimu ya maisha ya kila siku kwa watu wengi barani Afrika Mashariki. Kwanza, husaidia kuziba upungufu wa lishe unaotokana na chakula tunachokula kila siku. Pili, baadhi ya mimea kama tangawizi na limau husaidia kuongeza kinga ya mwili dhidi ya magonjwa ya kawaida. Tatu, virutubisho vingi husaidia kuboresha mmeng'enyo wa chakula na afya ya tumbo. Nne, kwa wale wanaotafuta kupunguza uzito, michanganyiko ya mimea kama chai za detox husaidia kuongeza kasi ya mmeng'enyo bila kutumia kemikali kali. Tano, matumizi ya mara kwa mara ya vitamini asilia huchangia ngozi nzuri, nywele imara na hisia za ustawi. Kama ilivyo kwa kila kitu, ni vyema kuongea na daktari wako kabla ya kuanza matumizi endapo una hali maalum ya kiafya au unatumia dawa nyingine.",
    en_body: "Herbal supplements have become an important part of daily life for many people across East Africa. First, they help fill nutritional gaps that come from our everyday diet. Second, certain plants like ginger and lemon support the body's natural defenses against common illnesses. Third, many supplements help improve digestion and gut health. Fourth, for those looking to manage their weight, herbal blends such as detox teas can support metabolism without harsh chemicals. Fifth, regular use of natural vitamins contributes to healthier skin, stronger hair, and an overall sense of wellbeing. As with anything, it's wise to talk to your doctor before starting any new supplement if you have an existing condition or take other medication."
  },
  {
    slug: "jinsi-ya-kuchagua-chai-ya-detox",
    img: "images/p005.jpg",
    sw_title: "Jinsi ya Kuchagua Chai ya Detox Inayokufaa",
    en_title: "How to Choose the Right Detox Tea for You",
    date: "2026-06-18",
    sw_excerpt: "Kuna aina nyingi za chai za detox — hii ni jinsi ya kuchagua inayokufaa mahitaji yako.",
    en_excerpt: "There are many types of detox tea — here's how to choose the one that fits your needs.",
    sw_body: "Kabla ya kuchagua chai ya detox, jiulize lengo lako ni nini: kupunguza uzito, kusafisha tumbo, au kuongeza nishati? Chai za detox za muda mfupi (siku 7-14) ni nzuri kwa mwanzo, wakati chai za siku 28 zinafaa kwa matokeo ya kudumu zaidi. Angalia pia viungo — chai zenye limau na tangawizi ni nzuri kwa mmeng'enyo, wakati zile zenye mchanganyiko wa mimea mingi (kama Ganoderma) husaidia kinga ya mwili kwa ujumla. Kunywa maji ya kutosha wakati wa matumizi ya chai ya detox ni muhimu sana ili kusaidia mwili kuondoa sumu vizuri.",
    en_body: "Before choosing a detox tea, ask yourself what your goal is: weight loss, digestive cleansing, or an energy boost? Short-term detox teas (7-14 days) are a great starting point, while 28-day programs suit those looking for more lasting results. Also check the ingredients — teas with lemon and ginger are great for digestion, while blends with multiple herbs (like Ganoderma) support overall immunity. Drinking plenty of water while on a detox tea program is essential to help your body flush out toxins effectively."
  },
  {
    slug: "afya-ya-ngozi-kutoka-ndani",
    img: "images/p081.jpg",
    sw_title: "Afya ya Ngozi Huanzia Ndani: Nafasi ya Collagen na Glutathione",
    en_title: "Skin Health Starts From Within: The Role of Collagen & Glutathione",
    date: "2026-07-01",
    sw_excerpt: "Ngozi nzuri si suala la vipodozi tu — virutubisho sahihi vinaweza kuleta mabadiliko makubwa.",
    en_excerpt: "Beautiful skin isn't just about cosmetics — the right supplements can make a real difference.",
    sw_body: "Collagen ni protini muhimu inayosaidia ngozi kuwa na uimara na unyumbufu, lakini uzalishaji wake mwilini hupungua kadri umri unavyoongezeka. Kutumia virutubisho vya collagen husaidia kupunguza mikunjo na kuboresha unyevu wa ngozi. Glutathione, kwa upande mwingine, ni antioxidant yenye nguvu inayosaidia kuondoa sumu mwilini na kuboresha mng'ao wa ngozi kwa matumizi ya muda mrefu. Ili kupata matokeo bora, changanya matumizi ya virutubisho hivi na maji ya kutosha, usingizi bora, na ulinzi dhidi ya jua.",
    en_body: "Collagen is a key protein that keeps skin firm and elastic, but the body's natural production declines with age. Taking collagen supplements can help reduce fine lines and improve skin hydration. Glutathione, on the other hand, is a powerful antioxidant that helps detoxify the body and improve skin radiance with consistent, longer-term use. For the best results, combine these supplements with adequate water intake, quality sleep, and sun protection."
  },
  {
    slug: "virutubisho-vya-nguvu-za-kiume",
    img: "images/p107.jpg",
    sw_title: "Virutubisho vya Nguvu za Kiume: Ukweli Unaopaswa Kujua",
    en_title: "Men's Vitality Supplements: What You Should Know",
    date: "2026-07-10",
    sw_excerpt: "Mimea kama Tongkat Ali na Maca imetumika kwa karne nyingi kusaidia nguvu na uwezo wa kiume.",
    en_excerpt: "Herbs like Tongkat Ali and Maca have been used for centuries to support male vitality.",
    sw_body: "Kwa karne nyingi, jamii mbalimbali barani Asia na Amerika Kusini zimetumia mimea kama Tongkat Ali, Maca na Shilajit kusaidia nguvu za mwili, uwezo wa uzazi na hali ya kiakili kwa wanaume. Virutubisho hivi vinaaminika kusaidia uwiano wa homoni na kuongeza nguvu za asili za mwili. Ni muhimu kununua bidhaa kutoka chanzo kinachoaminika ili kuepuka bidhaa bandia, na kutumia kwa kufuata maelekezo ya kifurushi.",
    en_body: "For centuries, communities across Asia and South America have used herbs like Tongkat Ali, Maca, and Shilajit to support physical vitality, reproductive health, and mental clarity in men. These supplements are believed to help support hormonal balance and the body's natural energy levels. It's important to buy from a trusted source to avoid counterfeit products, and to follow the dosage instructions on the packaging."
  },
  {
    slug: "kinga-ya-mwili-majira-ya-baridi",
    img: "images/p016.jpg",
    sw_title: "Kuimarisha Kinga ya Mwili Wakati wa Majira ya Baridi",
    en_title: "Boosting Your Immunity During the Cold Season",
    date: "2026-07-15",
    sw_excerpt: "Mabadiliko ya hali ya hewa yanaweza kudhoofisha kinga ya mwili — hivi ndivyo unavyoweza kujilinda.",
    en_excerpt: "Seasonal changes can weaken your immune system — here's how you can protect yourself.",
    sw_body: "Wakati wa majira ya baridi au mabadiliko ya hali ya hewa, mwili huwa hatarini zaidi kupata mafua na magonjwa mengine ya kawaida. Vitamini C, Zinc, na Ganoderma Lucidum ni miongoni mwa virutubisho vinavyosaidia kuimarisha kinga ya mwili. Pia, kunywa chai za asili zenye tangawizi na limau husaidia kupunguza dalili za mafua na kuongeza joto la mwili. Kula mlo kamili wenye mboga za majani na matunda, pamoja na kupumzika vya kutosha, ni sehemu muhimu ya kujilinda msimu huu.",
    en_body: "During colder seasons or sudden weather changes, the body becomes more vulnerable to colds and other common illnesses. Vitamin C, Zinc, and Ganoderma Lucidum are among the supplements known to help strengthen the immune system. Drinking natural teas with ginger and lemon can also help ease cold symptoms and keep the body warm. Eating a balanced diet rich in vegetables and fruits, along with adequate rest, is an essential part of staying protected this season."
  },
  {
    slug: "uzazi-na-afya-ya-mfumo-wa-uzazi",
    img: "images/p004.jpg",
    sw_title: "Kutunza Afya ya Mfumo wa Uzazi kwa Njia ya Asili",
    en_title: "Supporting Reproductive Health the Natural Way",
    date: "2026-07-20",
    sw_excerpt: "Mimea kama vile Womb Tea na Fertility Tea zimetumika kwa muda mrefu kusaidia afya ya uzazi.",
    en_excerpt: "Herbs like Womb Tea and Fertility Tea have long been used to support reproductive health.",
    sw_body: "Afya ya mfumo wa uzazi ni sehemu muhimu ya ustawi wa jumla kwa wanawake na wanaume. Chai na virutubisho vya asili kama Womb Tea, Fertility Tea na Myo-Inositol vimetumika kusaidia uwiano wa homoni na kuandaa mwili kwa ujauzito. Ni vyema kutumia bidhaa hizi kwa muda unaopendekezwa na kuambatana na mlo bora na mazoezi ya mara kwa mara. Kama unatafuta kupata ujauzito na umekuwa ukijaribu kwa muda mrefu bila mafanikio, ni vyema pia kumuona daktari wa uzazi kwa ushauri zaidi.",
    en_body: "Reproductive health is a key part of overall wellbeing for both women and men. Natural teas and supplements such as Womb Tea, Fertility Tea, and Myo-Inositol have been used to support hormonal balance and prepare the body for pregnancy. It's best to use these products for the recommended duration alongside a healthy diet and regular exercise. If you're trying to conceive and have not had success for an extended period, it's also wise to see a fertility specialist for further guidance."
  }
];
