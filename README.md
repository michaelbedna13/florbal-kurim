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
scripts/vytah.js     výtah dat z otevřené stránky (iPhone Zkratka)
.github/workflows/   tabulka.yml = robot (vypnutý plán), iphone.yml = data z iPhonu
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

## Odkud se berou data
Od 4. 10. 2026 web Českého florbalu odpovídá serverům GitHubu **403 Forbidden**,
takže robot (`tabulka.yml`) už sám neběží — plánované spouštění je vypnuté,
ručně se dá pustit dál (**Actions → Aktualizace dat → Run workflow**), kdyby
web GitHub zase pustil.

Telefonu ale web odpovídá normálně, i bez prohlížeče. Data proto nosí iPhone:

### Automaticky z iPhonu
Zkratka dvakrát denně stáhne obě stránky a nahraje je přes GitHub API do
složky `vstup/`. Workflow `iphone.yml` je přečte stejnými stahovači jako dřív
robot (`--soubor`), uloží JSON a `vstup/` smaže, aby šlo příště nahrát znovu.
Telefon se hlásí jako Zkratky, nic nepředstírá.

**Token** (jednou za rok): GitHub → Settings → Developer settings →
Fine-grained tokens → Generate new token
([přímý odkaz](https://github.com/settings/personal-access-tokens/new)).
Repository access: *Only select repositories* → `florbal-kurim`;
Permissions → Repository → **Contents: Read and write**, nic jiného.
Token se ukáže jen jednou — rovnou ho vlož do Zkratky.

**Zkratka „Florbal automat“** — pro každou ze dvou stránek tři akce:

| # | akce | nastavení |
|---|---|---|
| 1 | Načíst obsah URL | adresa stránky (tabulka soutěže / statistiky týmu) |
| 2 | Base64 | Kódovat, zalomení řádků: **Žádné** |
| 3 | Načíst obsah URL | `https://api.github.com/repos/michaelbedna13/florbal-kurim/contents/vstup/soutez.html` (u statistik `…/vstup/statistiky.html`), Metoda **PUT**, záhlaví `Authorization` = `Bearer <token>`, tělo **JSON**: `message` = `Data z iPhonu`, `content` = výstup Base64 těsně nad |

**Automatizace:** Zkratky → Automatizace → + → Denní čas → denně,
**Spustit okamžitě** → „Florbal automat“. Dvakrát (ráno a večer).

Když se běh nepovede (telefon zrovna bez signálu, chvilkový výpadek), nic se
nerozbije — data se doplní při dalším. Když za rok vyprší token, Zkratka
začne vracet `Bad credentials`; stačí vyrobit nový a přepsat ho v obou akcích.

## Ručně
Kdyby iPhone nějakou dobu nenosil (nebo to bylo potřeba hned po zápase),
jde tabulka přepsat i ručně. V appce se u dat starších než týden připíše,
jak jsou stará, takže se zpoždění nepřehlédne. Data jsou v `tabulka.json`
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

### Jedním ťuknutím z iPhonu
`scripts/vytah.js` přečte tabulku přímo z otevřené stránky a vyrobí hotový
JSON — nic se nepřepisuje ručně, nic se nečte ze screenshotu. Jednorázové
založení Zkratky:

1. v Safari otevři
   [vytah.js](https://raw.githubusercontent.com/michaelbedna13/florbal-kurim/main/scripts/vytah.js),
   podrž prst na textu → Vybrat vše → Kopírovat;
2. Zkratky → **+** → Přidat akci → **Spustit JavaScript na webové stránce**
   a místo předvyplněného kódu vlož zkopírovaný;
3. přidej akce **Zkopírovat do schránky** a **Zobrazit výsledek**;
4. v detailu zkratky (ⓘ) zapni **Zobrazit v listu sdílení** a jako vstup
   nech jen **Webové stránky Safari**. Pojmenuj ji třeba „Florbal data“.

Použití: otevři v Safari tabulku soutěže nebo statistiky týmu → **Sdílet**
→ „Florbal data“. Výsledek máš ve schránce; nalep ho do Claude Code a ten
ho uloží a pushne. První řádek výstupu je jen shrnutí (kolik týmů / hráčů),
JSON začíná od druhého. Poprvé se Zkratka zeptá, jestli smí na
`repre.ceskyflorbal.cz` spustit skript — povol.

Statistiky si přečte obě záložky najednou (hráči i brankáři jsou ve stránce
oba), přepínat mezi nimi nemusíš.

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
