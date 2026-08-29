# Florbal Kuřim

Appka na přihlašování na tréninky, zápasy a klubové akce.

Statická stránka na GitHub Pages, data v Supabase.
Účet si založí každý sám na webu, potřebuje k tomu klubový kód.

## Soubory
```
index.html           celá appka, jeden soubor
tabulka.json         tabulka soutěže, přepisuje ji robot
scripts/tabulka.py   stahovač tabulky z Českého florbalu
.github/workflows/   spouští stahovače dvakrát denně
manifest.json        aby šla appka přidat na plochu
logo.svg             klubové logo ve křivkách
logo-256.png         logo v appce
icon-*.png           ikony aplikace
CNAME                doména
.nojekyll            ať GitHub soubory nezpracovává Jekyllem
```

## Kde se co mění

| Co | Kde |
|---|---|
| Klubový kód, uzávěrky, hlášky, role | ve Správě přímo v appce |
| Krátké názvy týmů v tabulce | `scripts/tabulka.py`, slovník `KRATKE` |
| Odkaz na soutěž po skončení sezóny | `scripts/tabulka.py`, proměnná `URL` |
| Pravidla přístupu k datům | Supabase → SQL Editor |

## Robot na tabulku
Běží sám ráno a večer. Ručně: **Actions → Aktualizace tabulky → Run workflow**.
