# Florbal Kuřim

Appka na přihlašování na tréninky, zápasy a klubové akce.

Statická stránka na GitHub Pages, data v Supabase.
Účet si založí každý sám na webu, potřebuje k tomu klubový kód.

## Soubory
```
index.html           celá appka, jeden soubor
tabulka.json         tabulka soutěže, přepisuje ji robot
hraci.json           statistiky hráčů a brankářů, taky od robota
scripts/tabulka.py   stahovač tabulky z Českého florbalu
scripts/hraci.py     stahovač statistik hráčů
scripts/rucne.sh     ruční aktualizace z uložených stránek
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
| Ruční aktualizace tabulky, když robot nemůže | viz níž |
| Pravidla přístupu k datům | Supabase → SQL Editor |

## Robot na tabulku
Běží sám ráno a večer. Ručně: **Actions → Aktualizace dat → Run workflow**.

## Když robot nemůže
Od 4. 10. 2026 odpovídá Český florbal robotovi **HTTP 403 Forbidden** — web
stahování ze serverů GitHubu odmítá, i když se v prohlížeči normálně načítá.
V Actions je to vidět jako spadlý běh; v appce se u tabulky připíše, jak jsou
data stará.

Dokud to platí, aktualizuje se tabulka ručně. Stránku stáhneš ty v prohlížeči,
skript ji jen přečte:

1. otevři soutěž a statistiky týmu a ulož stránky na disk (Ctrl+S, „pouze HTML“ stačí);
2. v repozitáři spusť:

```
scripts/rucne.sh ~/Downloads/soutez.html ~/Downloads/statistiky.html
```

Naparsuje oba soubory, commitne a pushne — appka se narovná sama. Stačí i jeden
soubor (`scripts/rucne.sh soutez.html`), jen statistiky dá `--hraci statistiky.html`
a `--bez-push` nechá změny v pracovní kopii k prohlédnutí. Když některý stahovač
spadne, necommitne se nic, takže v repozitáři nezůstane poloviční aktualizace.

Pod tím jsou obyčejné stahovače, které jdou spustit i samostatně:

```
python scripts/tabulka.py --soubor soutez.html
python scripts/hraci.py   --soubor statistiky.html
```

Parsování i výsledný JSON jsou stejné jako u robota, včetně krátkých názvů
ze slovníku `KRATKE`. Skripty píšou do kořene repozitáře, takže je můžeš
spustit odkudkoli. Když v uložené stránce tabulku nenajdou, radši nic
nepřepíšou a řeknou to.
