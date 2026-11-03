# Étrend 2.0 – heti longevity menü Claude-dal (PWA)

Telefonos app a heti étrendhez. A 2.0-tól a Claude közvetlenül az appból tervezi meg a hetet, cserél, részletez és válaszol a kérdésekre – a saját Claude API-kulccsal (a Max-előfizetés havi API-kreditjéből). Szerver nem kell: minden adat és a kulcs is csak a telefonon, `localStorage`-ben (`etrend.` előtaggal) tárolódik.

## Fájlok
| Fájl | Mi ez |
|---|---|
| `index.html` | Az egész app (markup + stílus + script) |
| `sw.js` | Service worker: app shell network-first, offline fallback; a `week.json`-t és az API-hívásokat soha nem cache-eli |
| `manifest.webmanifest` | Telepíthetőség (név, ikonok, színek) |
| `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Ikonok |
| `week.json` | DEMO terv – az első generált vagy betöltött terv lecseréli |

## 1. Feltöltés GitHub Pagesre
**Ha a 1.0 már fent van:** a repóban *Add file* → *Upload files* → a zip tartalma → *Commit changes*. Kész, az app a következő megnyitáskor frissül.

**Ha még nincs fent:**
1. github.com → *Sign up* (ingyenes).
2. Jobb felül **+** → *New repository* → név: `etrend`, **Public** → *Create repository*.
3. *uploading an existing file* → a zip **tartalmát** (a fájlokat, ne a mappát) kell behúzni → *Commit changes*.
4. *Settings* → *Pages* → Source: *Deploy from a branch* → Branch: `main`, mappa: `/ (root)` → *Save*.
5. 1–2 perc múlva él: `https://<felhasználónév>.github.io/etrend/`

A repó nyilvános, de **sem az API-kulcs, sem a személyes adatok nincsenek benne** – ezeket csak a telefonon kell megadni.

## 2. A Max-előfizetés API-kreditjének bekapcsolása
1. claude.ai (böngészőben, nem az appban) → **Settings → Billing → API credits → Link organization**. Egy meglévő Console-szervezet választható, vagy újat lehet létrehozni. (Feltétel: legalább 7 napja aktív Max-előfizetés; a Console-ba ugyanazzal az e-mail-címmel kell belépni.)
2. platform.claude.com → **API keys → Create key** (név pl. „etrend-telefon”) → a kulcsot kimásolni (`sk-ant-…`).
3. Biztonsági ajánlás: a Console-ban **ne** legyen bekapcsolva automatikus feltöltés (auto-reload) és ne legyen vásárolt kredit. Így a legrosszabb eset is csak annyi, hogy az adott hónap 100 dolláros kreditje elfogy – a Max-előfizetésre nem terhel semmit.
4. Ha a receptlink-keresés hibát ad, a Console-ban a webkeresést (web search) engedélyezni kell a szervezetnél.

Fontos: a havi kredit a számlázási ciklus végén lejár, nem gyűlik.

## 3. Telepítés a telefonra
**iPhone (Safari):** a címet megnyitni → Megosztás → *Főképernyőhöz adás*. Ezután mindig az ikonról indítva (az ott tárolt adatok külön vannak a Safari-lapétól).
**Android (Chrome):** ⋮ menü → *Alkalmazás telepítése*.

Utána: **Több → Claude AI** → kulcs beillesztése → *Mentés* → *Kulcs tesztelése*. Majd **Több → Rólam**: nem, kor, magasság, testsúly – ebből számolja a fehérje- és kalóriacélt.

## Mit tud a Claude az appban
| Funkció | Hol | Becsült költség (Sonnet 5.5) |
|---|---|---|
| ✨ Új hét generálása (63 étel, 12 tartalék, 10 snack, meal prep) | Hét fül tetején / Több | ≈ $0,8 + linkek ≈ $0,9 |
| 🔄 3 új ötlet egy étkezéshez (Gyorsabb, Több fehérje, Kamrából, Olcsóbb…) | Csere | ≈ $0,05 |
| 🔍 Részletezd (kezdőbarát lépések, tippek, helyettesítések) | Kártya, főzés mód | ≈ $0,03 |
| 💬 Kérdezz a receptről | Kártya, főzés mód | ≈ $0,01 / kérdés |
| 🔗 Receptlink keresése (csak ténylegesen megtalált oldal) | Kártya / Több | ≈ $0,03 / étel |

A generálás az értékeléseket (👍 👎 😵), az utóbbi 3 hét választásait és a kamrát automatikusan figyelembe veszi – nem kell kézzel átmásolni. Kb. 5–10 perc; közben az app használható, és ha bezáródik, a kész részek megmaradnak, újranyitáskor folytatódik. Havi becsült fogyasztás a Több fülön látszik (a pontos egyenleg a Console-ban).

Modellek: **Sonnet 5.5** (alapértelmezett), **Opus 5.5** (legjobb, kb. kétszeres ár), **Haiku 5.5** (leggyorsabb, töredék ár). A linkkeresés alapból Haiku 5.5-tel megy.

## Jó tudni
- A heti scheduled task így már nem szükséges; ha mégis fut, az általa feltöltött `week.json`-t az app továbbra is betölti, ha az újabb.
- Új terv esetén a választások és pipák nullázódnak; a kamra, az értékelések és az előzmények (12 hét) megmaradnak.
- A mentés (Több → Mentés) az API-kulcsot nem tartalmazza.
- iPhone-on a böngésző nem tud rezegni; az időzítő hangja a némítókapcsolótól függ.
- Új API-fióknál alacsony a sebességkorlát (rate limit): ilyenkor a generálás magától kivár és folytatja – csak lassabb.
