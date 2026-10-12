# Kupakia (deploy) kupitia Git → Cloudflare Pages

## Sheria 3 ambazo Functions zinahitaji
1. Folda `functions/` iwe **mzizi wa repo** (kando ya `index.html`), si ndani ya folda nyingine.
2. Mradi uwe **Cloudflare Pages** (Workers & Pages → Create → **Pages** → Connect to Git).
   Mradi wa aina ya "Workers" au "Direct Upload (drag & drop)" **hauendeshi** `functions/`.
3. Mipangilio ya Build kwenye Cloudflare:
   - Framework preset: **None**
   - Build command: *(acha wazi)*
   - Build output directory: **`/`** (au `.`)
   - Root directory: *(acha wazi)* — ikiwa repo ina site ndani ya subfolder, weka subfolder hiyo hapa
     na hakikisha `functions/` iko ndani yake.

## Hatua za kuweka mabadiliko
```bash
# Fungua zip hii ndani ya folda ya repo yako (ibadilishe faili za zamani), kisha:
git add -A
git commit -m "v68: kadi = viungo vya bidhaa, cache ya bidhaa za Firestore"
git push
```
Cloudflare itajijenga yenyewe. Fungua **Workers & Pages → mradi wako → Deployments → deploy ya mwisho**:
- Ikiwa **Functions** zimegunduliwa utaona "Functions: Detected" / "Compiled Functions" kwenye build log.
- Ikiwa log inasema `No Functions directory found` au haitaji Functions kabisa → angalia sheria 1–3 hapo juu.

## Kukagua baada ya deploy
```bash
bash scripts/check-deploy.sh            # tovuti ya kawaida
bash scripts/check-deploy.sh https://mradi-wako.pages.dev   # au anwani ya pages.dev
```
Inatarajiwa: kila mstari uonyeshe `OK`. Mistari yenye `FAIL 404` = Function haijapakiwa.

## Ikiwa `*.pages.dev` inafanya kazi lakini agnesherbalsupplements.com haifanyi
Domain inaweza kuwa inaelekeza kwenye mradi/mwenyeji mwingine (mfano mradi wa zamani). Kwenye Cloudflare:
Workers & Pages → mradi sahihi → **Custom domains** → hakikisha `agnesherbalsupplements.com` iko hapo,
na uondoe domain hiyo kwenye mradi wa zamani.

## Baada ya Functions kufanya kazi
- Admin → Makundi ya Kazi → **📣 Arifu Bing/AI Sasa** (inapaswa kujibu mafanikio).
- Google Search Console → Sitemaps → wasilisha `sitemap.xml` na `sitemap-products-live.xml`.

## Kumbuka
- Repo ina zip za zamani (v40–v63) kwenye mzizi; zinaongeza ukubwa wa kila deploy. Unaweza kuzifuta: `git rm v*.zip`.
- `/api/indexnow` inakubali POST tu; ijaribu kupitia kitufe cha admin "📣 Arifu Bing/AI Sasa".

## v69 — baada ya deploy, kagua URL za bidhaa
Fungua kwa Incognito: `/products/p0-28-day-slimming-tea` lazima ibaki kwenye ukurasa wa bidhaa (si ukurasa mkuu), na
`curl -sI https://agnesherbalsupplements.com/products/p0-28-day-slimming-tea` lazima irudishe `200` (si `301` kwenda URL ile ile).
Jaribu pia bidhaa ya admin (mf. `/products/p100068-ginseng-five-treasure-tea`) na `/products/haipo-kabisa` (lazima 404).
Search Console: tuma upya `sitemap.xml` na `sitemap-products-live.xml`.
