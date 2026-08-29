#!/usr/bin/env python3
"""
Stáhne tabulku Jihomoravské ligy mužů z webu Českého florbalu
a uloží ji jako tabulka.json do kořene repozitáře.

Spouští se přes GitHub Actions, ne ručně.
"""

import json
import re
import sys
from datetime import datetime, timezone, timedelta

import requests
from bs4 import BeautifulSoup

# ------------------------------------------------------------
# NASTAVENÍ — po skončení sezóny se mění jen tahle adresa
# ------------------------------------------------------------
URL = ("https://repre.ceskyflorbal.cz/competition/detail/overview/6JM6"
       "?divisionId=5598&competitionFisId=4653")

NAS_TYM_ID = "44265"          # Florbal Kuřim
VYSTUP = "tabulka.json"

HLAVICKA = {
    "User-Agent": "FlorbalKurim-klubova-appka/1.0 (interni pouziti)"
}

# sloupce, jak jdou za sebou v hlavičce tabulky
KLICE = {
    "Z": "zapasy", "V": "vyhry", "VP": "vyhry_p", "PP": "prohry_p",
    "P": "prohry", "B": "body", "BV": "branky_vstrelene",
    "BO": "branky_obdrzene", "BR": "rozdil",
}


def cislo(text):
    """'12' → 12, '-3' → -3, prázdno → 0"""
    t = (text or "").strip().replace("−", "-")
    m = re.search(r"-?\d+", t)
    return int(m.group()) if m else 0


def najdi_tabulku(soup):
    """Vrátí první tabulku, která vypadá jako tabulka pořadí."""
    for tabulka in soup.find_all("table"):
        hlavicka = [b.get_text(strip=True) for b in tabulka.find_all("th")]
        if "Tým" in hlavicka and "BR" in hlavicka:
            return tabulka
    return None


def zpracuj(html):
    soup = BeautifulSoup(html, "html.parser")
    tabulka = najdi_tabulku(soup)
    if tabulka is None:
        raise SystemExit("Tabulku pořadí se nepodařilo najít — změnila se struktura webu.")

    hlavicka = [b.get_text(strip=True) for b in tabulka.find_all("th")]
    poradi_sloupcu = {n: i for i, n in enumerate(hlavicka)}

    tymy = []
    telo = tabulka.find("tbody") or tabulka
    for radek in telo.find_all("tr"):
        bunky = radek.find_all("td")
        if len(bunky) < 5:
            continue

        # tým a jeho ID z odkazu
        odkaz = None
        for b in bunky:
            a = b.find("a", href=re.compile(r"/team/detail/"))
            if a and a.get_text(strip=True):
                odkaz = a
                break
        if odkaz is None:
            continue

        href = odkaz.get("href", "")
        tym_id = (re.search(r"/team/detail/\w+/(\d+)", href) or [None, ""])[1]

        # název a zkratka jsou dva odkazy vedle sebe
        odkazy = [a.get_text(strip=True) for a in
                  radek.find_all("a", href=re.compile(r"/team/detail/"))
                  if a.get_text(strip=True)]
        nazev = odkazy[0] if odkazy else "?"
        zkratka = odkazy[1] if len(odkazy) > 1 else ""

        obrazek = radek.find("img")
        logo = obrazek.get("src") if obrazek else None
        if logo and logo.startswith("/"):
            logo = "https://repre.ceskyflorbal.cz" + logo

        tym = {
            "poradi": cislo(bunky[0].get_text()),
            "nazev": nazev,
            "zkratka": zkratka,
            "logo": logo,
            "nas": tym_id == NAS_TYM_ID,
        }
        for zkr, klic in KLICE.items():
            i = poradi_sloupcu.get(zkr)
            tym[klic] = cislo(bunky[i].get_text()) if i is not None and i < len(bunky) else 0

        tymy.append(tym)

    return tymy


def main():
    odpoved = requests.get(URL, headers=HLAVICKA, timeout=30)
    odpoved.raise_for_status()

    tymy = zpracuj(odpoved.text)
    if not tymy:
        raise SystemExit("Tabulka je prázdná — nic se neuloží.")

    praha = timezone(timedelta(hours=1))
    data = {
        "aktualizovano": datetime.now(praha).isoformat(timespec="minutes"),
        "soutez": "Jihomoravská liga mužů",
        "odkaz": URL,
        "tymy": tymy,
    }

    with open(VYSTUP, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

    print(f"Uloženo {len(tymy)} týmů do {VYSTUP}")
    for t in tymy:
        znak = "→" if t["nas"] else " "
        print(f' {znak} {t["poradi"]:>2}. {t["nazev"][:34]:<34} {t["body"]:>3} b')


if __name__ == "__main__":
    sys.exit(main())
