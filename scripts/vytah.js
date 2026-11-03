/*
 * Výtah dat ze stránek Českého florbalu přímo v prohlížeči.
 *
 * Robot na ně nedosáhne (web mu odpovídá 403), ale tobě se stránka načte
 * normálně — tenhle kód jen přečte to, co už máš na obrazovce, a vyrobí
 * z toho obsah souboru `tabulka.json` nebo `hraci.json`.
 *
 * Spouští se z iPhonu jako Zkratka s akcí „Spustit JavaScript na webové
 * stránce“ (návod v README) — vlož do ní celý tenhle soubor beze změny.
 *
 * Tabulky hledá podle textu v hlavičce, ne podle tříd — stejně jako
 * stahovače v Pythonu, takže přežije přelakování webu.
 */
(() => {
  "use strict";

  // Krátké názvy týmů. Drž je stejné jako slovník KRATKE v scripts/tabulka.py,
  // jinak se appce po ruční aktualizaci přejmenují týmy v tabulce.
  const KRATKE = {
    "44336": "Aligators", "44944": "Pohořelice", "44265": "Kuřim",
    "45560": "Hornets", "43962": "Galaxy Židenice", "45694": "Bojanovice",
    "46290": "Shooters Beta", "45741": "Gullivers", "46135": "Letovice",
    "45818": "Troopers", "46604": "VUT Brno",
  };
  const NAS_TYM_ID = "44265";                 // Florbal Kuřim
  const PUVOD = "https://repre.ceskyflorbal.cz";

  const text = (el) => (el ? el.textContent : "").replace(/\s+/g, " ").trim();

  /* '12' → 12, '−3' → -3, '4,50' → 4.5, prázdno → 0.
     Chová se jako cislo() ve stahovačích: celá čísla zůstanou celá. */
  const cislo = (t) => {
    const m = String(t || "").replace(/−/g, "-").replace(/%/g, "")
                             .replace(/,/g, ".").match(/-?\d+(\.\d+)?/);
    if (!m) return 0;
    const h = parseFloat(m[0]);
    return Number.isInteger(h) ? h : Math.round(h * 10) / 10;
  };

  // Hlavičky srovnáváme malými písmeny, ať nezáleží na tom, jestli si je web
  // vysází velkými (TÝM) nebo ne.
  const hlavicky = (t) => [...t.querySelectorAll("th")].map((b) => text(b).toLowerCase());

  /* Tabulky, jejichž hlavička obsahuje všechny zadané názvy. Viditelné dřív
     než schované — na stránce bývají i neaktivní záložky (DOMA, VENKU). */
  const najdiTabulky = (...nazvy) => {
    const sedi = [...document.querySelectorAll("table")].filter((t) => {
      const h = hlavicky(t);
      return nazvy.every((n) => h.includes(n));
    });
    const videt = sedi.filter((t) => t.offsetParent !== null);
    return videt.length ? videt : sedi;
  };

  const radky = (t) => [...(t.tBodies[0] || t).querySelectorAll("tr")];

  /* Hodnoty řádku podle názvů v hlavičce: {"z": "zapasy"} → {zapasy: 4} */
  const sloupce = (bunky, poradi, mapa) => {
    const out = {};
    for (const [nazev, klic] of Object.entries(mapa)) {
      const i = poradi[nazev];
      out[klic] = i !== undefined && i < bunky.length ? cislo(text(bunky[i])) : 0;
    }
    return out;
  };

  const poradiSloupcu = (t) => {
    const p = {};
    hlavicky(t).forEach((n, i) => { if (!(n in p)) p[n] = i; });
    return p;
  };

  /* 'Bednář Michael' i 'Michael Bednář' dají stejný klíč — musí souhlasit
     s klic_jmena() v hraci.py i s klicJmena() v appce. */
  const klicJmena = (jmeno) =>
    (jmeno || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().match(/[\p{L}\p{N}]+/gu)?.sort().join(" ") || "";

  const ted = () => {
    const d = new Date(Date.now() + 3600000);   // +01:00, jako stahovače
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`
         + `T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}+01:00`;
  };

  // ---------------- tabulka soutěže ----------------
  const SLOUPCE_TABULKY = {
    "z": "zapasy", "v": "vyhry", "vp": "vyhry_p", "pp": "prohry_p",
    "p": "prohry", "b": "body", "bv": "branky_vstrelene",
    "bo": "branky_obdrzene", "br": "rozdil",
  };

  const tabulkaSoutez = () => {
    const t = najdiTabulky("tým", "br")[0];
    if (!t) return null;
    const poradi = poradiSloupcu(t);

    const tymy = [];
    for (const tr of radky(t)) {
      const bunky = [...tr.querySelectorAll("td")];
      if (bunky.length < 5) continue;

      const odkazy = [...tr.querySelectorAll('a[href*="/team/detail/"]')]
        .filter((a) => text(a));
      if (!odkazy.length) continue;

      const id = (odkazy[0].getAttribute("href").match(/\/team\/detail\/\w+\/(\d+)/) || [])[1] || "";
      const nazev = text(odkazy[0]);
      const slova = nazev.split(" ");

      const obrazek = tr.querySelector("img");
      let logo = obrazek ? obrazek.getAttribute("src") : null;
      if (logo && logo.startsWith("/")) logo = PUVOD + logo;

      tymy.push({
        poradi: cislo(text(bunky[0])),
        nazev,
        kratky: KRATKE[id] || (slova.length > 2 ? slova.slice(0, 2).join(" ") : nazev),
        zkratka: odkazy.length > 1 ? text(odkazy[1]) : "",
        logo,
        nas: id === NAS_TYM_ID,
        ...sloupce(bunky, poradi, SLOUPCE_TABULKY),
      });
    }
    if (!tymy.length) return null;

    return {
      soubor: "tabulka.json",
      obsah: {
        aktualizovano: ted(),
        soutez: "Jihomoravská liga mužů",
        odkaz: location.href,
        tymy,
      },
    };
  };

  // ---------------- statistiky hráčů ----------------
  const SLOUPCE_HRACU = {
    "z": "zapasy", "b": "branky", "a": "asistence", "kb": "body",
    "tm": "trestne", "s": "strely", "+/-": "plusminus",
  };
  const SLOUPCE_BRANKARU = {
    "z": "zapasy", "zch": "odchytane", "min": "minuty", "bo": "obdrzene",
    "ø bo": "prumer_obdrzenych", "so": "cista_konta", "v": "vyhry",
  };

  const lidi = (t, mapa) => {
    const poradi = poradiSloupcu(t);
    if (!("jméno" in poradi)) return [];

    const out = [];
    for (const tr of radky(t)) {
      const bunky = [...tr.querySelectorAll("td")];
      if (bunky.length < 4) continue;
      const jmeno = text(bunky[poradi["jméno"]]);
      if (!jmeno || jmeno.includes("nejsou žádná data")) continue;

      const zaznam = { jmeno, klic: klicJmena(jmeno) };
      if ("post" in poradi && poradi["post"] < bunky.length)
        zaznam.post = text(bunky[poradi["post"]]);
      out.push({ ...zaznam, ...sloupce(bunky, poradi, mapa) });
    }
    return out;
  };

  const statistiky = () => {
    const tabHracu = najdiTabulky("jméno", "kb")[0];
    const tabBrankaru = najdiTabulky("jméno", "zch", "so")[0];
    if (!tabHracu && !tabBrankaru) return null;

    const hraci = tabHracu ? lidi(tabHracu, SLOUPCE_HRACU) : [];
    const brankari = tabBrankaru ? lidi(tabBrankaru, SLOUPCE_BRANKARU) : [];

    hraci.sort((a, b) => b.body - a.body || b.branky - a.branky
                         || a.jmeno.localeCompare(b.jmeno, "cs"));
    brankari.sort((a, b) => b.odchytane - a.odchytane
                            || a.jmeno.localeCompare(b.jmeno, "cs"));

    return {
      soubor: "hraci.json",
      obsah: { aktualizovano: ted(), odkaz: location.href, hraci, brankari },
      chybi: [!tabHracu && "tabulka hráčů", !tabBrankaru && "tabulka brankářů"].filter(Boolean),
    };
  };

  // ---------------- výstup ----------------
  // Zkratky na iOS čekají výsledek přes completion(), jinde se prostě vrátí.
  const hotovo = (s) => (typeof completion === "function" ? completion(s) : s);

  const vysledek = tabulkaSoutez() || statistiky();
  if (!vysledek) {
    return hotovo("Na téhle stránce nevidím ani tabulku soutěže, ani statistiky hráčů.\n"
         + "Otevři přehled soutěže nebo statistiky týmu a spusť to znovu.");
  }

  const json = JSON.stringify(vysledek.obsah, null, 1);
  const pocty = vysledek.obsah.tymy
    ? `${vysledek.obsah.tymy.length} týmů`
    : `${vysledek.obsah.hraci.length} hráčů a ${vysledek.obsah.brankari.length} brankářů`;

  let hlavicka = `${vysledek.soubor} — ${pocty}`;
  if (vysledek.chybi && vysledek.chybi.length)
    hlavicka += ` (POZOR: na stránce nebyla ${vysledek.chybi.join(" ani ")})`;

  return hotovo(hlavicka + "\n" + json);
})();
