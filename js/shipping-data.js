/* ===================== SHIPPING RATES (USIRI Group Parcel Price List) =====================
   Bei za usafiri wa oda kutoka Dar es Salaam kwenda mikoani, kwa TZS.
   Chanzo: orodha ya bei ya USIRI Transportation Services. Weka jina la mkoa/wilaya
   kwa herufi kubwa (UPPERCASE) kama "key". Badilisha/ongeza bei hapa endapo
   msambazaji akibadilisha viwango vyake — hakuna haja ya kugusa app.js. */
const SHIPPING_RATES = {
  "ARUSHA": 5000, "BABATI": 10000, "BAGAMOYO": 7000, "BAHI": 7000, "BARIADI": 10000,
  "BENAKO": 10000, "BIHARAMULO": 10000, "BOMA": 5000, "BUKOBA": 10000, "BUKOMBE": 15000,
  "BUNDA": 10000, "BUTIAMA": 15000, "CHALINZE": 7000, "CHAMWINO": 5000, "CHATO": 15000,
  "CHEMBA": 7000, "CHIMALA": 10000, "CHUNYA": 10000, "DODOMA": 5000, "GAIRO": 7000,
  "GEITA": 10000, "HANDENI": 7000, "IFAKARA": 10000, "IGAWA": 10000, "IGUNGA": 10000,
  "IKONDA": 10000, "IKUNGI": 10000, "IKWIRIRI": 10000, "INYONGA": 10000, "IRAMBA": 10000,
  "IRINGA": 7000, "ITIGI": 7000, "KAHAMA": 10000, "KAKONKO": 10000, "KALIUA": 10000,
  "KARATU": 10000, "KASULU": 10000, "KAYANGA": 10000, "KIBAHA": 7000, "KIBONDO": 10000,
  "KIGOMA": 10000, "KIHOMBOI": 10000, "KILINDI": 10000, "KILOMBERO": 10000, "KILOSA": 10000,
  "KILWA": 10000, "KITETO": 10000, "KITUSA": 10000, "KONDOA": 10000, "KONGWA": 7000,
  "KOROGWE": 7000, "KYELA": 10000, "LINDI": 7000, "LIWALE": 10000, "LONGIDO": 10000,
  "LUDEWA": 10000, "LUSHOTO": 7000, "MADABA": 10000, "MAFINGA": 7000, "MAKAMBAKO": 7000,
  "MAKETE": 10000, "MAKONGOROSI": 15000, "MALINYI": 10000, "MANGAKA": 10000, "MANYONI": 7000,
  "MASASI": 10000, "MBEYA": 10000, "MBINGA": 10000, "MBULU": 10000, "MDAULA": 7000,
  "MEATU": 10000, "MGUMU": 15000, "MISIGILI": 10000, "MKALAMA": 7000, "MLIMBA": 10000,
  "MONDULI": 10000, "MOROGORO": 5000, "MOSHI": 5000, "MPANDA": 10000, "MPWAPWA": 7000, "MTWARA": 10000,
  "MUHEZA": 7000, "MULEBA": 10000, "MUSOMA": 10000, "MWANGA": 5000, "MWANZA": 10000,
  "NACHINGWEA": 10000, "NAMTUMBO": 10000, "NGARA": 10000, "NJOMBE": 7000, "NYANGAO": 10000,
  "NZEGA": 10000, "PANGANI": 10000, "ROMBO": 7000, "RORYA": 15000, "RUANGWA": 10000,
  "SAME": 5000, "SERENGETI": 15000, "SHELUI": 10000, "SHINYANGA": 10000, "SIKONGE": 10000,
  "SIMANJIRO": 10000, "SINGIDA": 7000, "SOMANGA": 10000, "SONGEA": 10000, "SUMBAWANGA": 10000,
  "TABORA": 10000, "TANDAHIMBA": 10000, "TANGA": 5000, "TARIME": 10000, "TUKUYU": 10000,
  "TUNDUMA": 10000, "TUNDURU": 10000, "TURIANI": 10000, "ULANGA": 10000, "URAMBO": 10000,
  "UVINZA": 10000, "WANGING'OMBE": 10000, "NANYAMBA": 10000, "NANYUMBU": 10000, "ZANZIBAR": 10000
};

function shippingNormalize(s) {
  return (s || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

/* Inatafuta bei ya usafiri kulingana na maandishi ya mteja kwenye "Mkoa / Mji".
   Inarudisha { region, price, isDar } au null kama haijapatikana kabisa. */
/* Inatafuta bei ya usafiri kulingana na jina la mkoa/mji alilochagua mteja
   (Dar es Salaam hushughulikiwa tofauti kabisa — mteja anachagua moja kwa moja
   kwenye tovuti, hauhitaji kutafutwa hapa). Inarudisha { region, price } au
   null kama haijapatikana kabisa. */
function findShippingRate(regionText) {
  const norm = shippingNormalize(regionText);
  if (!norm) return null;
  if (Object.prototype.hasOwnProperty.call(SHIPPING_RATES, norm)) {
    return { region: norm, price: SHIPPING_RATES[norm] };
  }
  // Usilinganishe (auto-match) kabla mteja hajaandika angalau herufi 4 —
  // vinginevyo maandishi mafupi kama "Ki" yanaweza kulingana kimakosa na
  // mkoa usiokusudiwa (mfano "KIBAHA") kabla mteja hajamaliza kuandika.
  if (norm.length < 4) return null;
  const keys = Object.keys(SHIPPING_RATES);
  // mfano mteja ameandika "kigoma mjini" -> anza na jina la mkoa
  let match = keys.find(k => norm.startsWith(k) || k.startsWith(norm));
  if (!match) match = keys.find(k => norm.includes(k) || k.includes(norm));
  if (match) return { region: match, price: SHIPPING_RATES[match] };
  return null;
}
