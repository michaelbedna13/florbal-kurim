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
| Ruční aktualizace tabulky, když robot nemůže | `tabulka.json`, viz níž |
| Pravidla přístupu k datům | Supabase → SQL Editor |

## Robot na tabulku
Běží sám ráno a večer. Ručně: **Actions → Aktualizace dat → Run workflow**.

## Když robot nemůže
Od 4. 10. 2026 odpovídá Český florbal robotovi **HTTP 403 Forbidden** — web
stahování ze serverů GitHubu odmítá, i když se v prohlížeči normálně načítá.
V Actions je to vidět jako spadlý běh; v appce se u tabulky připíše, jak jsou
data stará.

Dokud to platí, přepisuje se tabulka ručně. Data jsou v `tabulka.json`
a `hraci.json`, appka je jen zobrazuje — jde to tedy celé z prohlížeče.

### Jak to děláme
Stránka soutěže se v prohlížeči normálně načte, takže čísla si odtamtud
přečteš a nadiktuješ Claude Code (tahle appka se tak spravuje):

1. otevři [tabulku soutěže](https://repre.ceskyflorbal.cz/competition/detail/overview/6JM6?divisionId=5598&competitionFisId=4653)
   a případně [statistiky týmu](https://repre.ceskyflorbal.cz/team/detail/statistics/44265);
2. zkopíruj tabulku pořadí (nebo udělej screenshot) a nalep ji do Claude Code;
3. ten přepíše JSON a pushne — appka se narovná sama.

Loga, zkratky a ID týmů už v JSONu jsou, takže se měnívají jen pořadí a čísla:
`zapasy`, `vyhry`, `vyhry_p`, `prohry_p`, `prohry`, `body`,
`branky_vstrelene`, `branky_obdrzene`, `rozdil` a `aktualizovano`.
Kuřim má `"nas": true`, podle toho si ji appka v tabulce zvýrazní.

Dá se to i naklikat přímo na GitHubu (tužka u `tabulka.json`), ale přepisovat
jedenáct týmů ručně v prohlížeči je otrava a snadno se v tom udělá chyba.

### S lokálním klonem
Kdo má repozitář na svém počítači a v něm Python, nemusí nic přepisovat.
Stránky si uloží z prohlížeče (Ctrl+S, „pouze HTML“ stačí) a pustí na ně
stahovače, které je přečtou ze souboru místo z webu:

```
scripts/rucne.sh ~/Downloads/soutez.html ~/Downloads/statistiky.html
```

Naparsuje oba soubory, commitne a pushne. Stačí i jeden soubor
(`scripts/rucne.sh soutez.html`), jen statistiky dá `--hraci statistiky.html`
a `--bez-push` nechá změny v pracovní kopii k prohlédnutí. Když některý
stahovač spadne, necommitne se nic, takže v repozitáři nezůstane poloviční
aktualizace. Jednotlivě:

```
python scripts/tabulka.py --soubor soutez.html
python scripts/hraci.py   --soubor statistiky.html
```

Parsování i výsledný JSON jsou stejné jako u robota, včetně krátkých názvů
ze slovníku `KRATKE`. Skripty píšou do kořene repozitáře, takže je můžeš
spustit odkudkoli. Když v uložené stránce tabulku nenajdou, radši nic
nepřepíšou a řeknou to.
