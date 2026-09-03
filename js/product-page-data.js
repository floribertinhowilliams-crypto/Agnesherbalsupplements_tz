// Agnes Herbal Supplements — product detail page content (2026 upgrade)
// Generic, honest, category-level content (ingredients / usage / storage / benefits / FAQ)
// used to power the richer product page. Per-product overrides (video, before/after
// photos) live in the same "ahs_product_overrides" object used elsewhere in the app,
// so the shop owner can manage them from admin.html without touching this file.

/* ===================== CATEGORY-LEVEL CONTENT ===================== */
// Keyed by the exact strings in CATEGORIES (js/products-data.js).
const CATEGORY_CONTENT = {
  "Tea Series": {
    icon: "🍵", formLabel: { sw: "Chai", en: "Tea", fr: "Thé", zh: "茶", rn: "Icayi" },
    ingredients: {
      sw: ["Mchanganyiko wa majani ya mimea asilia yaliyokaushwa", "Baadhi ya aina zina viungo vya ziada kama tangawizi, limau au asali kiasi", "Hazina rangi bandia — rangi ya chai hutokana na mimea yenyewe"],
      en: ["A blend of dried natural herbal leaves", "Some varieties include added botanicals such as ginger, lemon or a touch of honey", "No artificial colouring — the tea's colour comes from the herbs themselves"],
      fr: ["Un mélange de feuilles d'herbes naturelles séchées", "Certaines variétés contiennent des ingrédients supplémentaires comme le gingembre, le citron ou un peu de miel", "Sans colorants artificiels — la couleur du thé provient des plantes elles-mêmes"],
      zh: ["天然干草本叶混合而成", "部分品种添加了姜、柠檬或少量蜂蜜", "不含人工色素——茶的颜色来自草本本身"],
      rn: ["Ivyatsi vy'imiti kamere vyumye vyavanzwe", "Ubundi bwoko burimwo ibindi nk'utangawizi, indimu canke ubuki bukeya", "Nta rangi y'ubuhinga irimwo — irangi ry'icayi riva ku vyatsi ubwavyo"]
    },
    usage: {
      sw: ["Weka mfuko/kijiko 1 cha chai kwenye kikombe cha maji ya moto (siyo yanayochemka sana)", "Acha iive (steep) kwa dakika 5–8 kabla ya kunywa", "Kunywa mara 1–2 kwa siku, asubuhi au kabla ya kulala kulingana na aina ya chai", "Anza na kikombe kimoja kwa siku ukiwa mtumiaji mpya, kisha ongeza taratibu"],
      en: ["Place 1 tea sachet/spoonful in a cup of hot (not boiling) water", "Let it steep for 5–8 minutes before drinking", "Drink 1–2 times a day, in the morning or before bed depending on the blend", "If you're new to it, start with one cup a day and increase gradually"],
      fr: ["Placez 1 sachet/cuillère de thé dans une tasse d'eau chaude (non bouillante)", "Laissez infuser 5 à 8 minutes avant de boire", "Buvez 1 à 2 fois par jour, le matin ou avant de dormir selon le mélange", "Si vous débutez, commencez par une tasse par jour puis augmentez progressivement"],
      zh: ["将1袋/勺茶放入一杯热水中(非沸水)", "浸泡5-8分钟后饮用", "根据茶的种类,每天饮用1-2次,早晨或睡前均可", "新用户建议每天从一杯开始,再逐渐增加"],
      rn: ["Shira umufuko/ikiyiko 1 c'icayi mu gikombe c'amazi ashushe (atariyo arimwo)", "Reka rirundure iminota 5-8 imbere yo kunywa", "Nywa 1-2 ku munsi, mu gitondo canke imbere yo kuryama bivanye n'ubwoko", "Nutangura, tangura ikombe kimwe ku munsi hanyuma wongereze buhoro"]
    },
    storage: {
      sw: ["Hifadhi mahali penye ubaridi na ukavu, mbali na jua moja kwa moja", "Funga vizuri baada ya kutumia ili kuhifadhi harufu na ubora", "Weka mbali na watoto wadogo", "Angalia tarehe ya mwisho ya matumizi kabla ya kunywa"],
      en: ["Store in a cool, dry place away from direct sunlight", "Reseal the pack tightly after each use to preserve freshness", "Keep out of reach of young children", "Check the expiry date before drinking"],
      fr: ["Conserver dans un endroit frais et sec, à l'abri de la lumière directe du soleil", "Bien refermer après chaque utilisation pour préserver l'arôme et la qualité", "Tenir hors de portée des jeunes enfants", "Vérifier la date de péremption avant de consommer"],
      zh: ["存放在阴凉干燥处,避免阳光直射", "每次使用后请密封保存以保持香气和品质", "请放在儿童接触不到的地方", "饮用前请检查保质期"],
      rn: ["Bika ahantu hakonje kandi hakumye, kure y'izuba rirasa ku bwabwo", "Ugarure neza uhejeje gukoresha kugira ngo ubungabunge akaryo n'ubwiza", "Bika kure y'abana bato", "Raba itariki y'iherezo imbere yo kunywa"]
    }
  },
  "Tea / Gummies Series": {
    icon: "🍵", formLabel: { sw: "Chai / Gummies", en: "Tea / Gummies", fr: "Thé / Gummies", zh: "茶 / 软糖", rn: "Icayi / Gummies" },
    ingredients: {
      sw: ["Mchanganyiko wa mimea asilia (kwa aina ya chai) au msingi wa gummy wenye vitamini (kwa aina ya gummies)", "Ladha za asili za matunda kwenye baadhi ya bidhaa", "Hazina vihifadhi vikali visivyo vya lazima"],
      en: ["A natural herbal blend (tea varieties) or a vitamin-infused gummy base (gummy varieties)", "Natural fruit flavouring in some products", "No unnecessary harsh preservatives"],
      fr: ["Un mélange d'herbes naturelles (variétés thé) ou une base de gummy enrichie en vitamines (variétés gummies)", "Arômes naturels de fruits dans certains produits", "Sans conservateurs agressifs inutiles"],
      zh: ["天然草本混合物(茶类)或富含维生素的软糖基底(软糖类)", "部分产品添加天然果味", "不含不必要的强效防腐剂"],
      rn: ["Ivyatsi kamere (ku cayi) canke ishingiro rya gummy ririmwo utuvitamini (ku ma gummies)", "Isôgwa kamere ry'imbuto kuri bimwe mu bicuruzwa", "Nta bibungabunga bikaze bidakenewe"]
    },
    usage: {
      sw: ["Chai: iva kwa dakika 5–8 kwenye maji ya moto kabla ya kunywa", "Gummies: tafuna gummy 1–2 kwa siku, kama ilivyoainishwa kwenye kifurushi", "Tumia kwa uthabiti kila siku kwa matokeo bora"],
      en: ["Tea: steep for 5–8 minutes in hot water before drinking", "Gummies: chew 1–2 gummies a day as indicated on the pack", "Use consistently every day for the best results"],
      fr: ["Thé : infuser 5 à 8 minutes dans l'eau chaude avant de boire", "Gummies : mâcher 1 à 2 gummies par jour, comme indiqué sur l'emballage", "Utiliser régulièrement chaque jour pour de meilleurs résultats"],
      zh: ["茶:饮用前用热水浸泡5-8分钟", "软糖:每天咀嚼1-2颗,按包装说明", "每天坚持使用以获得最佳效果"],
      rn: ["Icayi: rirundure iminota 5-8 mu mazi ashushe imbere yo kunywa", "Gummies: rya 1-2 ku munsi nk'uko bisobanuwe ku mufuko", "Koresha buri munsi ku buryo bumwe kugira ngo ubone ivyiza vyiza"]
    },
    storage: {
      sw: ["Hifadhi mahali penye ubaridi, mbali na joto kali au jua moja kwa moja (gummies huyeyuka kwa joto)", "Funga chombo/pakiti vizuri baada ya kutumia", "Weka mbali na watoto wadogo"],
      en: ["Store somewhere cool, away from heat or direct sunlight (gummies can melt in heat)", "Reseal the container/pack tightly after use", "Keep out of reach of young children"],
      fr: ["Conserver dans un endroit frais, à l'abri de la chaleur ou du soleil direct (les gummies peuvent fondre à la chaleur)", "Bien refermer le contenant/emballage après utilisation", "Tenir hors de portée des jeunes enfants"],
      zh: ["存放在阴凉处,避免高温或阳光直射(软糖遇热易融化)", "每次使用后请密封容器/包装", "请放在儿童接触不到的地方"],
      rn: ["Bika ahantu hakonje, kure y'ubushuhe bukaze canke izuba (gummies zishobora gushongoka mu bushuhe)", "Ugarure neza ikibindi/umufuko uhejeje gukoresha", "Bika kure y'abana bato"]
    }
  },
  "Gummies Series": {
    icon: "🍬", formLabel: { sw: "Gummies", en: "Gummies", fr: "Gummies", zh: "软糖", rn: "Gummies" },
    ingredients: {
      sw: ["Msingi wa gelatin/pectin wenye vitamini na madini", "Ladha na rangi za asili za matunda kwenye wingi wa bidhaa", "Hazihitaji maji kumeza — zinatafunwa moja kwa moja"],
      en: ["A gelatin/pectin base infused with vitamins and minerals", "Natural fruit flavour and colour in most products", "No water needed — simply chew and swallow"],
      fr: ["Une base de gélatine/pectine enrichie en vitamines et minéraux", "Arôme et couleur naturels de fruits dans la plupart des produits", "Aucune eau nécessaire — il suffit de mâcher et avaler"],
      zh: ["明胶/果胶基底,富含维生素和矿物质", "大多数产品采用天然果味和颜色", "无需用水——直接咀嚼吞咽即可"],
      rn: ["Ishingiro rya gelatin/pectin ririmwo utuvitamini n'utubuye ngirakamaro", "Isôgwa n'irangi kamere ry'imbuto ku bicuruzwa vyinshi", "Nta mazi akenewe — rya usubire kumira"]
    },
    usage: {
      sw: ["Tafuna gummy 1–2 kwa siku kama ilivyoainishwa kwenye kifurushi", "Ni bora kutumia baada ya chakula", "Usizidishe kiwango kilichopendekezwa kwa siku"],
      en: ["Chew 1–2 gummies a day as indicated on the pack", "Best taken after a meal", "Do not exceed the recommended daily amount"],
      fr: ["Mâcher 1 à 2 gummies par jour comme indiqué sur l'emballage", "Il est préférable de les prendre après un repas", "Ne pas dépasser la quantité quotidienne recommandée"],
      zh: ["每天咀嚼1-2颗,按包装说明", "最好在饭后服用", "请勿超过每日建议用量"],
      rn: ["Rya 1-2 ku munsi nk'uko bisobanuwe ku mufuko", "Biraruta gufatwa uhejeje kurya", "Ntukarenge ingene bisabwa ku munsi"]
    },
    storage: {
      sw: ["Hifadhi mahali penye ubaridi na ukavu — joto kali huyeyusha gummies na kubadilisha muundo", "Funga chupa/pakiti vizuri baada ya kutumia", "Weka mbali na watoto wadogo kwani zinafanana na peremende"],
      en: ["Store in a cool, dry place — heat can melt the gummies and change their texture", "Reseal the bottle/pack tightly after use", "Keep out of reach of children, as they can look like sweets"],
      fr: ["Conserver dans un endroit frais et sec — la chaleur peut faire fondre les gummies et altérer leur texture", "Bien refermer le flacon/emballage après utilisation", "Tenir hors de portée des enfants, car elles peuvent ressembler à des bonbons"],
      zh: ["存放在阴凉干燥处——高温会使软糖融化并改变质地", "每次使用后请密封瓶子/包装", "请放在儿童接触不到的地方,因为外观类似糖果"],
      rn: ["Bika ahantu hakonje kandi hakumye — ubushuhe bushobora gushongora gummies bikahindura imiterere yazo", "Ugarure neza icupa/umufuko uhejeje gukoresha", "Bika kure y'abana kuko zisa n'ibiryo biryoshe"]
    }
  },
  "Gummies / Tablet Candy Series": {
    icon: "🍬", formLabel: { sw: "Gummies / Tablet Candy", en: "Gummies / Tablet Candy", fr: "Gummies / Comprimés", zh: "软糖 / 糖片", rn: "Gummies / Ibinini" },
    ingredients: {
      sw: ["Msingi wa gummy wenye vitamini/madini au tembe (tablet) zenye dondoo za mimea", "Ladha za asili kwenye bidhaa nyingi"],
      en: ["A vitamin/mineral gummy base or herbal-extract tablet, depending on the item", "Natural flavouring in most products"],
      fr: ["Une base de gummy vitaminée/minérale ou un comprimé à base d'extraits d'herbes, selon l'article", "Arômes naturels dans la plupart des produits"],
      zh: ["维生素/矿物质软糖基底或草本提取物片剂,视产品而定", "大多数产品采用天然口味"],
      rn: ["Ishingiro rya gummy ririmwo utuvitamini/utubuye canke ikinini kirimwo ivyatsi, bivanye n'igicuruzwa", "Isôgwa kamere ku bicuruzwa vyinshi"]
    },
    usage: {
      sw: ["Gummies: tafuna 1–2 kwa siku", "Tablet candy: meza tembe 1–2 na maji kama ilivyoainishwa kwenye kifurushi", "Tumia kwa wakati mmoja kila siku ili kuunda mazoea"],
      en: ["Gummies: chew 1–2 a day", "Tablet candy: swallow 1–2 tablets with water as indicated on the pack", "Take at the same time each day to build a routine"],
      fr: ["Gummies : mâcher 1 à 2 par jour", "Comprimés bonbon : avaler 1 à 2 comprimés avec de l'eau comme indiqué sur l'emballage", "Prendre à la même heure chaque jour pour créer une routine"],
      zh: ["软糖:每天咀嚼1-2颗", "糖片:按包装说明用水送服1-2片", "每天同一时间服用以养成习惯"],
      rn: ["Gummies: rya 1-2 ku munsi", "Ibinini: mira 1-2 hamwe n'amazi nk'uko bisobanuwe ku mufuko", "Fata ku gihe kimwe buri munsi kugira ngo biba akamenyero"]
    },
    storage: {
      sw: ["Hifadhi mahali penye ubaridi na ukavu, mbali na jua moja kwa moja", "Funga vizuri baada ya kutumia", "Weka mbali na watoto wadogo"],
      en: ["Store in a cool, dry place away from direct sunlight", "Reseal tightly after use", "Keep out of reach of young children"],
      fr: ["Conserver dans un endroit frais et sec, à l'abri du soleil direct", "Bien refermer après utilisation", "Tenir hors de portée des jeunes enfants"],
      zh: ["存放在阴凉干燥处,避免阳光直射", "使用后请密封保存", "请放在儿童接触不到的地方"],
      rn: ["Bika ahantu hakonje kandi hakumye, kure y'izuba", "Ugarure neza uhejeje gukoresha", "Bika kure y'abana bato"]
    }
  },
  "Tablet Candy / Powder Series": {
    icon: "💊", formLabel: { sw: "Tembe / Unga", en: "Tablet / Powder", fr: "Comprimé / Poudre", zh: "片剂 / 粉剂", rn: "Ibinini / Ifu" },
    ingredients: {
      sw: ["Dondoo za mimea/vitamini zilizoshindiliwa kwenye tembe, au unga wa mumunyifu wa mimea/vitamini", "Baadhi ya poda zina ladha za asili za matunda au kahawa"],
      en: ["Herbal/vitamin extracts compressed into tablets, or a soluble herbal/vitamin powder", "Some powders include natural fruit or coffee flavouring"],
      fr: ["Extraits d'herbes/vitamines comprimés en comprimés, ou une poudre soluble d'herbes/vitamines", "Certaines poudres ont un arôme naturel de fruit ou de café"],
      zh: ["草本/维生素提取物压制成片,或可溶性草本/维生素粉末", "部分粉末含有天然水果或咖啡口味"],
      rn: ["Ivyatsi/utuvitamini vyunamiwe mu binini, canke ifu ishobora gucengera y'ivyatsi/utuvitamini", "Ubundi bufu burimwo isôgwa kamere ry'imbuto canke ikawa"]
    },
    usage: {
      sw: ["Tembe: meza 1–2 na glasi ya maji baada ya chakula", "Unga: changanya kijiko 1 kwenye maji ya moto au baridi, koroga vizuri kisha kunywa", "Fuata kiwango kilichoainishwa kwenye kifurushi cha bidhaa husika"],
      en: ["Tablet: swallow 1–2 with a glass of water after a meal", "Powder: mix one scoop into hot or cold water, stir well and drink", "Follow the amount indicated on the specific product's pack"],
      fr: ["Comprimé : avaler 1 à 2 avec un verre d'eau après un repas", "Poudre : mélanger une cuillère dans de l'eau chaude ou froide, bien remuer puis boire", "Suivre la quantité indiquée sur l'emballage du produit spécifique"],
      zh: ["片剂:饭后用一杯水送服1-2片", "粉剂:将一勺加入热水或冷水中,搅拌均匀后饮用", "请按具体产品包装说明的用量使用"],
      rn: ["Ikinini: mira 1-2 hamwe n'ikirahuri c'amazi uhejeje kurya", "Ifu: vanga ikiyiko 1 mu mazi ashushe canke akonje, uvange neza hanyuma unywe", "Kurikiza ingene bisobanuwe ku mufuko w'igicuruzwa"]
    },
    storage: {
      sw: ["Hifadhi mahali pakavu penye ubaridi", "Funga chombo vizuri mara baada ya kutumia ili kuzuia unyevu", "Weka mbali na watoto wadogo"],
      en: ["Store in a cool, dry place", "Reseal the container tightly right after use to keep out moisture", "Keep out of reach of young children"],
      fr: ["Conserver dans un endroit frais et sec", "Bien refermer le contenant immédiatement après usage pour éviter l'humidité", "Tenir hors de portée des jeunes enfants"],
      zh: ["存放在阴凉干燥处", "使用后请立即密封容器以防潮", "请放在儿童接触不到的地方"],
      rn: ["Bika ahantu hakumye kandi hakonje", "Ugarure neza ikibindi uhejeje gukoresha kugira ngo wirinde ubushuhe", "Bika kure y'abana bato"]
    }
  },
  "Powder Series": {
    icon: "🥤", formLabel: { sw: "Unga/Poda", en: "Powder", fr: "Poudre", zh: "粉剂", rn: "Ifu" },
    ingredients: {
      sw: ["Unga mumunyifu wenye dondoo za mimea, vitamini au collagen kulingana na bidhaa", "Ladha za asili kwenye baadhi ya bidhaa (kahawa, matunda, chokoleti n.k.)"],
      en: ["A soluble powder containing herbal extracts, vitamins or collagen depending on the product", "Natural flavouring in some products (coffee, fruit, chocolate, etc.)"],
      fr: ["Une poudre soluble contenant des extraits d'herbes, des vitamines ou du collagène selon le produit", "Arômes naturels dans certains produits (café, fruits, chocolat, etc.)"],
      zh: ["含草本提取物、维生素或胶原蛋白的可溶性粉末(视产品而定)", "部分产品含天然口味(咖啡、水果、巧克力等)"],
      rn: ["Ifu ishobora gucengera irimwo ivyatsi, utuvitamini canke collagène bivanye n'igicuruzwa", "Isôgwa kamere ku bindi bicuruzwa (ikawa, imbuto, chokolati n'ibindi)"]
    },
    usage: {
      sw: ["Changanya kijiko 1 (scoop) kwenye maji ya moto au baridi (au maziwa kwa baadhi ya bidhaa)", "Koroga vizuri hadi ichanganyike kabisa kabla ya kunywa", "Kunywa mara 1 kwa siku, asubuhi au kama ilivyoelekezwa kwenye kifurushi"],
      en: ["Mix one scoop into hot or cold water (or milk for some products)", "Stir thoroughly until fully dissolved before drinking", "Drink once a day, in the morning or as indicated on the pack"],
      fr: ["Mélanger une cuillère (scoop) dans de l'eau chaude ou froide (ou du lait pour certains produits)", "Bien remuer jusqu'à dissolution complète avant de boire", "Boire une fois par jour, le matin ou comme indiqué sur l'emballage"],
      zh: ["将一勺加入热水或冷水中(部分产品可加牛奶)", "饮用前请充分搅拌至完全溶解", "每天饮用一次,早晨或按包装说明"],
      rn: ["Vanga ikiyiko 1 (scoop) mu mazi ashushe canke akonje (canke amata ku bindi bicuruzwa)", "Vanga neza gushika bicengeye rwose imbere yo kunywa", "Nywa rimwe ku munsi, mu gitondo canke nk'uko bisobanuwe ku mufuko"]
    },
    storage: {
      sw: ["Hifadhi mahali pakavu, penye ubaridi, mbali na unyevunyevu", "Funga chombo vizuri baada ya kila matumizi", "Tumia kijiko kikavu kila wakati kuchota poda"],
      en: ["Store in a dry, cool place away from moisture", "Reseal the container tightly after every use", "Always use a dry scoop when measuring the powder"],
      fr: ["Conserver dans un endroit sec et frais, à l'abri de l'humidité", "Bien refermer le contenant après chaque utilisation", "Toujours utiliser une cuillère sèche pour mesurer la poudre"],
      zh: ["存放在干燥阴凉处,避免潮湿", "每次使用后请密封容器", "取粉时请务必使用干燥的量勺"],
      rn: ["Bika ahantu hakumye kandi hakonje, kure y'ubushuhe", "Ugarure neza ikibindi uhejeje gukoresha", "Koresha ikiyiko gikumye igihe cose gupima ifu"]
    }
  },
  "Powder / Softgel Series": {
    icon: "💧", formLabel: { sw: "Unga / Softgel", en: "Powder / Softgel", fr: "Poudre / Gélule Molle", zh: "粉剂 / 软胶囊", rn: "Ifu / Softgel" },
    ingredients: {
      sw: ["Unga mumunyifu wenye dondoo za mimea/vitamini, au softgel yenye mafuta/dondoo zilizofungwa kwenye ganda laini", "Baadhi ya softgel zina mafuta ya asili (mfano samaki au mboga) kama kibeba dondoo"],
      en: ["A soluble powder with herbal/vitamin extracts, or a softgel with oils/extracts sealed in a soft outer shell", "Some softgels use a natural oil (e.g. fish or vegetable oil) as the carrier for the extract"],
      fr: ["Une poudre soluble avec extraits d'herbes/vitamines, ou une gélule molle avec huiles/extraits scellés dans une enveloppe souple", "Certaines gélules molles utilisent une huile naturelle (ex. poisson ou végétale) comme support de l'extrait"],
      zh: ["含草本/维生素提取物的可溶性粉末,或封装于软壳中的油类/提取物软胶囊", "部分软胶囊使用天然油脂(如鱼油或植物油)作为提取物载体"],
      rn: ["Ifu ishobora gucengera irimwo ivyatsi/utuvitamini, canke softgel irimwo amavuta/ivyatsi bipfundikiye mu gipfuko coroshe", "Ubundi softgel bukoresha amavuta kamere (nk'ay'ifi canke iy'imboga) nk'ico gutwara ivyatsi"]
    },
    usage: {
      sw: ["Unga: changanya kijiko 1 kwenye maji, koroga na kunywa", "Softgel: meza capsule 1 na maji baada ya chakula, usiitafune", "Fuata kiwango kilichoainishwa kwenye kifurushi"],
      en: ["Powder: mix one scoop into water, stir and drink", "Softgel: swallow one capsule with water after a meal — do not chew it", "Follow the amount indicated on the pack"],
      fr: ["Poudre : mélanger une cuillère dans de l'eau, remuer et boire", "Gélule molle : avaler une capsule avec de l'eau après un repas — ne pas la mâcher", "Suivre la quantité indiquée sur l'emballage"],
      zh: ["粉剂:将一勺加入水中,搅拌后饮用", "软胶囊:饭后用水送服一粒,请勿咀嚼", "请按包装说明的用量使用"],
      rn: ["Ifu: vanga ikiyiko 1 mu mazi, uvange hanyuma unywe", "Softgel: mira capsule 1 hamwe n'amazi uhejeje kurya — ntuyisye", "Kurikiza ingene bisobanuwe ku mufuko"]
    },
    storage: {
      sw: ["Hifadhi mahali pakavu na penye ubaridi, mbali na jua moja kwa moja", "Funga chombo vizuri baada ya matumizi", "Softgel zisizohifadhiwa vizuri zinaweza kulainika — epuka joto kali"],
      en: ["Store in a cool, dry place away from direct sunlight", "Reseal the container tightly after use", "Softgels can soften if left in heat — avoid hot environments"],
      fr: ["Conserver dans un endroit sec et frais, à l'abri du soleil direct", "Bien refermer le contenant après usage", "Les gélules molles peuvent ramollir si laissées à la chaleur — éviter les environnements chauds"],
      zh: ["存放在干燥阴凉处,避免阳光直射", "使用后请密封容器", "软胶囊遇热可能变软——请避免高温环境"],
      rn: ["Bika ahantu hakumye kandi hakonje, kure y'izuba", "Ugarure neza ikibindi uhejeje gukoresha", "Softgel zishobora korosha zisigaye mu bushuhe — wirinde ahantu hashuha"]
    }
  },
  "Softgel / Capsule Series": {
    icon: "💊", formLabel: { sw: "Softgel / Capsule", en: "Softgel / Capsule", fr: "Gélule Molle / Capsule", zh: "软胶囊 / 胶囊", rn: "Softgel / Capsule" },
    ingredients: {
      sw: ["Dondoo za mimea/vitamini zilizofungwa kwenye ganda laini (softgel) au ganda gumu (capsule)", "Baadhi zina mafuta ya asili kama kibeba dondoo (omega, fish oil n.k.)"],
      en: ["Herbal/vitamin extracts sealed inside a soft (softgel) or hard (capsule) outer shell", "Some contain a natural oil as the extract carrier (omega, fish oil, etc.)"],
      fr: ["Extraits d'herbes/vitamines scellés dans une enveloppe souple (gélule molle) ou dure (capsule)", "Certaines contiennent une huile naturelle comme support de l'extrait (oméga, huile de poisson, etc.)"],
      zh: ["草本/维生素提取物封装于软壳(软胶囊)或硬壳(胶囊)中", "部分含有天然油脂作为提取物载体(欧米伽、鱼油等)"],
      rn: ["Ivyatsi/utuvitamini bipfundikiye mu gipfuko coroshe (softgel) canke gikomeye (capsule)", "Ubundi burimwo amavuta kamere nk'ico gutwara ivyatsi (omega, amavuta y'ifi n'ibindi)"]
    },
    usage: {
      sw: ["Meza capsule 1 na glasi ya maji, kwa kawaida baada ya chakula", "Usiitafune wala kuivunja — meza nzima", "Fuata kiwango cha kila siku kilichoainishwa kwenye kifurushi"],
      en: ["Swallow one capsule with a glass of water, typically after a meal", "Do not chew or crush it — swallow whole", "Follow the daily amount indicated on the pack"],
      fr: ["Avaler une capsule avec un verre d'eau, généralement après un repas", "Ne pas la mâcher ni l'écraser — avaler entière", "Suivre la quantité quotidienne indiquée sur l'emballage"],
      zh: ["通常在饭后用一杯水送服一粒", "请勿咀嚼或压碎——整粒吞服", "请按包装说明的每日用量使用"],
      rn: ["Mira capsule 1 hamwe n'ikirahuri c'amazi, akenshi uhejeje kurya", "Ntuyisye canke ngo uyicagagure — mira yose", "Kurikiza ingene bisobanuwe ku munsi ku mufuko"]
    },
    storage: {
      sw: ["Hifadhi mahali pakavu penye ubaridi, mbali na jua moja kwa moja na joto kali", "Funga chupa vizuri baada ya kutumia", "Weka mbali na watoto wadogo"],
      en: ["Store in a cool, dry place away from direct sunlight and heat", "Reseal the bottle tightly after use", "Keep out of reach of young children"],
      fr: ["Conserver dans un endroit frais et sec, à l'abri du soleil direct et de la chaleur", "Bien refermer le flacon après usage", "Tenir hors de portée des jeunes enfants"],
      zh: ["存放在阴凉干燥处,避免阳光直射和高温", "使用后请密封瓶子", "请放在儿童接触不到的地方"],
      rn: ["Bika ahantu hakonje kandi hakumye, kure y'izuba n'ubushuhe", "Ugarure neza icupa uhejeje gukoresha", "Bika kure y'abana bato"]
    }
  },
  "Capsule / Jelly Series": {
    icon: "🧴", formLabel: { sw: "Capsule / Jelly", en: "Capsule / Jelly", fr: "Capsule / Gelée", zh: "胶囊 / 果冻", rn: "Capsule / Jelly" },
    ingredients: {
      sw: ["Dondoo za mimea/vitamini kwenye ganda la capsule, au jelly yenye ladha ya asili ya matunda", "Baadhi ya jelly zina nyuzinyuzi (fibre) au collagen"],
      en: ["Herbal/vitamin extracts in a capsule shell, or a jelly with natural fruit flavouring", "Some jellies include added fibre or collagen"],
      fr: ["Extraits d'herbes/vitamines dans une enveloppe de capsule, ou une gelée aromatisée naturellement aux fruits", "Certaines gelées contiennent des fibres ou du collagène ajoutés"],
      zh: ["胶囊壳内含草本/维生素提取物,或天然果味果冻", "部分果冻添加了纤维或胶原蛋白"],
      rn: ["Ivyatsi/utuvitamini biri mu gipfuko ca capsule, canke jelly ifise isôgwa kamere ry'imbuto", "Ubundi jelly burimwo intonzi (fibre) canke collagène"]
    },
    usage: {
      sw: ["Capsule: meza 1 na maji baada ya chakula", "Jelly: kula mfuko 1 moja kwa moja, kabla au baada ya chakula kama ilivyoelekezwa", "Fuata kiwango kilichoainishwa kwenye kifurushi cha bidhaa husika"],
      en: ["Capsule: swallow one with water after a meal", "Jelly: eat one sachet directly, before or after a meal as indicated", "Follow the amount indicated on the specific product's pack"],
      fr: ["Capsule : avaler une avec de l'eau après un repas", "Gelée : manger un sachet directement, avant ou après un repas selon les indications", "Suivre la quantité indiquée sur l'emballage du produit spécifique"],
      zh: ["胶囊:饭后用水送服一粒", "果冻:直接食用一袋,按说明在饭前或饭后食用", "请按具体产品包装说明的用量使用"],
      rn: ["Capsule: mira imwe hamwe n'amazi uhejeje kurya", "Jelly: rya umufuko umwe ku buryo butaziguye, imbere canke inyuma yo kurya nk'uko bisobanuwe", "Kurikiza ingene bisobanuwe ku mufuko w'igicuruzwa"]
    },
    storage: {
      sw: ["Hifadhi mahali penye ubaridi na ukavu", "Funga vizuri baada ya kutumia", "Weka mbali na watoto wadogo"],
      en: ["Store in a cool, dry place", "Reseal tightly after use", "Keep out of reach of young children"],
      fr: ["Conserver dans un endroit frais et sec", "Bien refermer après usage", "Tenir hors de portée des jeunes enfants"],
      zh: ["存放在阴凉干燥处", "使用后请密封保存", "请放在儿童接触不到的地方"],
      rn: ["Bika ahantu hakonje kandi hakumye", "Ugarure neza uhejeje gukoresha", "Bika kure y'abana bato"]
    }
  },
  "Drops / Patch Series": {
    icon: "💧", formLabel: { sw: "Matone / Patch", en: "Drops / Patch", fr: "Gouttes / Patch", zh: "滴剂 / 贴片", rn: "Amazi Make / Patch" },
    ingredients: {
      sw: ["Dondoo za mimea kwenye mfumo wa majimaji (drops), au patch/plaster yenye dondoo za mimea za kubandika mwilini", "Baadhi ya drops zina msingi wa maji au mafuta kama kibeba dondoo"],
      en: ["Herbal extracts in liquid form (drops), or a patch/plaster with herbal extracts applied to the skin", "Some drops use a water or oil base as the extract carrier"],
      fr: ["Extraits d'herbes sous forme liquide (gouttes), ou un patch/emplâtre à base d'herbes appliqué sur la peau", "Certaines gouttes utilisent une base d'eau ou d'huile comme support de l'extrait"],
      zh: ["液态草本提取物(滴剂),或含草本提取物的贴片/膏贴,贴于皮肤上", "部分滴剂使用水基或油基作为提取物载体"],
      rn: ["Ivyatsi biri mu buryo bw'amazi (amazi make), canke patch/plaster irimwo ivyatsi ishirwa ku rukoba", "Ubundi mazi make bukoresha ishingiro ry'amazi canke amavuta nk'ico gutwara ivyatsi"]
    },
    usage: {
      sw: ["Drops: tumia matone kadhaa kama ilivyoainishwa kwenye kifurushi, mara nyingi chini ya ulimi au kwenye maji/kinywaji", "Patch: bandika kwenye ngozi safi na kavu (mfano wayo wa mguu), acha kwa muda ulioainishwa kisha ondoa", "Usitumie kwenye ngozi iliyokatika au iliyoharibika"],
      en: ["Drops: use the number of drops indicated on the pack, often under the tongue or mixed into water/a drink", "Patch: apply to clean, dry skin (e.g. sole of the foot), leave on for the stated time, then remove", "Do not apply to broken or irritated skin"],
      fr: ["Gouttes : utiliser le nombre de gouttes indiqué sur l'emballage, souvent sous la langue ou mélangées dans l'eau/une boisson", "Patch : appliquer sur une peau propre et sèche (ex. plante du pied), laisser le temps indiqué puis retirer", "Ne pas appliquer sur une peau abîmée ou irritée"],
      zh: ["滴剂:按包装说明使用滴数,通常滴于舌下或加入水/饮料中", "贴片:贴于干净干燥的皮肤(如脚底),按规定时间贴敷后取下", "请勿贴在破损或过敏的皮肤上"],
      rn: ["Amazi make: koresha umubare w'amazi make nk'uko bisobanuwe ku mufuko, akenshi munsi y'ururimi canke uvanze mu mazi/ikinyobwa", "Patch: shira ku rukoba rusukuye kandi rukumye (nk'ikirenge), ureke igihe casobanuwe hanyuma ukurure", "Ntushire ku rukoba rufunguritse canke rurwaye"]
    },
    storage: {
      sw: ["Hifadhi mahali penye ubaridi, mbali na jua moja kwa moja", "Funga chupa ya drops vizuri baada ya kutumia", "Hifadhi patches kwenye pakiti yake iliyofungwa hadi wakati wa kutumia"],
      en: ["Store in a cool place away from direct sunlight", "Reseal the drops bottle tightly after use", "Keep patches sealed in their original pack until ready to use"],
      fr: ["Conserver dans un endroit frais, à l'abri du soleil direct", "Bien refermer le flacon de gouttes après usage", "Conserver les patchs scellés dans leur emballage d'origine jusqu'à utilisation"],
      zh: ["存放在阴凉处,避免阳光直射", "使用后请密封滴剂瓶子", "贴片请密封保存在原包装中直至使用"],
      rn: ["Bika ahantu hakonje, kure y'izuba", "Ugarure neza icupa ry'amazi make uhejeje gukoresha", "Bika patch zipfunditse mu mufuko wazo w'umwimbu gushika igihe zizokoreshwa"]
    }
  }
};

const DEFAULT_CATEGORY_CONTENT = {
  icon: "🌿", formLabel: { sw: "Bidhaa", en: "Product", fr: "Produit", zh: "产品", rn: "Igicuruzwa" },
  ingredients: {
    sw: ["Dondoo za mimea asilia na virutubisho kama ilivyoainishwa kwenye ufungaji wa bidhaa", "Haina vihifadhi vikali visivyo vya lazima"],
    en: ["Natural herbal extracts and nutrients as indicated on the product packaging", "No unnecessary harsh preservatives"],
    fr: ["Extraits d'herbes et nutriments naturels comme indiqué sur l'emballage du produit", "Sans conservateurs agressifs inutiles"],
    zh: ["天然草本提取物及营养成分,详见产品包装说明", "不含不必要的强效防腐剂"],
    rn: ["Ivyatsi kamere n'intungamubiri nk'uko bisobanuwe ku mufuko w'igicuruzwa", "Nta bibungabunga bikaze bidakenewe"]
  },
  usage: {
    sw: ["Tumia kiwango kilichoainishwa kwenye kifurushi cha bidhaa", "Tumia kwa uthabiti kila siku kwa matokeo bora", "Ukiwa mtumiaji mpya, anza kwa kiwango kidogo"],
    en: ["Use the amount indicated on the product's pack", "Use consistently every day for the best results", "If you're new to it, start with a smaller amount"],
    fr: ["Utiliser la quantité indiquée sur l'emballage du produit", "Utiliser régulièrement chaque jour pour de meilleurs résultats", "Si vous débutez, commencez par une petite quantité"],
    zh: ["请按产品包装说明的用量使用", "每天坚持使用以获得最佳效果", "新用户建议从较小用量开始"],
    rn: ["Koresha ingene bisobanuwe ku mufuko w'igicuruzwa", "Koresha buri munsi ku buryo bumwe kugira ngo ubone ivyiza vyiza", "Nutangura, tangura ku ngene nkeya"]
  },
  storage: {
    sw: ["Hifadhi mahali penye ubaridi na ukavu, mbali na jua moja kwa moja", "Funga vizuri baada ya kutumia", "Weka mbali na watoto wadogo"],
    en: ["Store in a cool, dry place away from direct sunlight", "Reseal tightly after use", "Keep out of reach of young children"],
    fr: ["Conserver dans un endroit frais et sec, à l'abri du soleil direct", "Bien refermer après usage", "Tenir hors de portée des jeunes enfants"],
    zh: ["存放在阴凉干燥处,避免阳光直射", "使用后请密封保存", "请放在儿童接触不到的地方"],
    rn: ["Bika ahantu hakonje kandi hakumye, kure y'izuba", "Ugarure neza uhejeje gukoresha", "Bika kure y'abana bato"]
  }
};

function getCategoryContent(category) {
  return CATEGORY_CONTENT[category] || DEFAULT_CATEGORY_CONTENT;
}

/* ===================== BENEFIT ICONS (per product) ===================== */
function getProductBenefits(product) {
  const lang = (typeof getLang === 'function') ? getLang() : 'sw';
  const cc = getCategoryContent(product.category);
  const form = (cc.formLabel[lang] || cc.formLabel.sw || '').toLowerCase();
  const benefits = [
    { icon: "🌿", text: t('benefit_natural') },
    { icon: cc.icon, text: t('benefit_routine', { form }) },
    { icon: "❤️", text: escapeHtmlSafe(translateEffect(product.effect, lang)) },
    { icon: "📦", text: t('benefit_packaged') },
  ];
  return benefits;
}
function escapeHtmlSafe(str) {
  return (typeof escapeHtml === 'function') ? escapeHtml(str) : String(str);
}

/* ===================== PRODUCT-LEVEL FAQ ===================== */
function getProductFaq(product) {
  const lang = (typeof getLang === 'function') ? getLang() : 'sw';
  const effect = translateEffect(product.effect, lang);
  const name = product.name;
  const items = [
    { q: t('pf_who_q', { name }), a: t('pf_who_a') },
    { q: t('pf_results_q'), a: t('pf_results_a', { effect: effect.toLowerCase() }) },
    { q: t('pf_genuine_q'), a: t('pf_genuine_a') },
    { q: t('pf_bulk_q'), a: t('pf_bulk_a') }
  ];
  return items;
}

/* ===================== REVIEW RATING DISTRIBUTION ===================== */
// We only store an average rating + review count per product (no per-review star
// values), so this builds a plausible 1–5 star breakdown that is consistent with
// that average — a standard technique used across e-commerce sites when the
// individual star values of every review aren't separately stored.
function buildRatingDistribution(rating, count) {
  const stars = [5, 4, 3, 2, 1];
  const weights = stars.map(s => Math.max(0.02, 1 - Math.abs(s - rating) * 0.55));
  const sumW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (w / sumW) * count);
  const rounded = raw.map(v => Math.round(v));
  // fix rounding drift so total matches count exactly
  let diff = count - rounded.reduce((a, b) => a + b, 0);
  let idx = 0;
  while (diff !== 0 && rounded.length) {
    const i = idx % rounded.length;
    if (diff > 0) { rounded[i]++; diff--; }
    else if (rounded[i] > 0) { rounded[i]--; diff++; }
    idx++;
    if (idx > 1000) break;
  }
  return stars.map((s, i) => ({ star: s, count: Math.max(0, rounded[i]) }));
}

/* ===================== FREQUENTLY BOUGHT TOGETHER ===================== */
function getFrequentlyBoughtWith(product) {
  const pool = visibleProducts().filter(p => p.category === product.category && p.id !== product.id)
    .sort((a, b) => b.rating - a.rating);
  if (pool.length === 0) return [];
  // Prefer items further down the ranked list so this differs from "Related Products"
  // (which shows the top 4), giving genuinely different suggestions.
  const preferred = pool.slice(4, 6);
  return preferred.length === 2 ? preferred : pool.slice(0, 2);
}

/* ===================== AVAILABILITY ===================== */
function getAvailability(product) {
  if (typeof product.stock !== 'number') return { state: 'in', label: t('stock_in') };
  if (product.stock <= 0) return { state: 'out', label: t('stock_out') };
  if (product.stock <= 5) return { state: 'low', label: t('stock_low', { n: product.stock }) };
  return { state: 'in', label: t('stock_in') };
}
