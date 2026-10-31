#!/usr/bin/env bash
#
# Ruční aktualizace dat, když Český florbal odmítá robota (HTTP 403).
#
# Stránky si ulož v prohlížeči (Ctrl+S) a hoď je sem:
#
#   scripts/rucne.sh soutez.html statistiky.html   tabulka i statistiky
#   scripts/rucne.sh soutez.html                   jen tabulka
#   scripts/rucne.sh --hraci statistiky.html       jen statistiky
#   scripts/rucne.sh soutez.html --bez-push        necommitnuté k prohlédnutí
#
# Naparsuje, commitne a pushne. Když některý skript spadne, necommitne nic.

set -euo pipefail

KOREN="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$KOREN"

TABULKA=""
HRACI=""
PUSH=1

napoveda() {
    sed -n '3,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
    exit "${1:-0}"
}

while [ $# -gt 0 ]; do
    case "$1" in
        --tabulka) TABULKA="${2:?--tabulka chce soubor}"; shift 2 ;;
        --hraci)   HRACI="${2:?--hraci chce soubor}";     shift 2 ;;
        --bez-push) PUSH=0; shift ;;
        -h|--help)  napoveda 0 ;;
        -*) echo "Neznámá volba: $1" >&2; napoveda 1 ;;
        *)
            # Bez přepínačů: první soubor je tabulka, druhý statistiky.
            if   [ -z "$TABULKA" ]; then TABULKA="$1"
            elif [ -z "$HRACI" ];   then HRACI="$1"
            else echo "Příliš mnoho souborů: $1" >&2; napoveda 1
            fi
            shift ;;
    esac
done

if [ -z "$TABULKA" ] && [ -z "$HRACI" ]; then
    echo "Nedal jsi žádný soubor." >&2
    napoveda 1
fi

for s in "$TABULKA" "$HRACI"; do
    if [ -n "$s" ] && [ ! -r "$s" ]; then
        echo "Soubor $s neexistuje nebo se nedá přečíst." >&2
        exit 1
    fi
done

# Parsování. Při pádu se díky set -e nedostaneme ke commitu, takže
# v repozitáři nezůstane poloviční aktualizace.
[ -n "$TABULKA" ] && python3 scripts/tabulka.py --soubor "$TABULKA"
[ -n "$HRACI" ]   && python3 scripts/hraci.py   --soubor "$HRACI"

echo
if git diff --quiet -- tabulka.json hraci.json; then
    echo "Data jsou stejná jako v repozitáři, není co commitnout."
    exit 0
fi

git --no-pager diff --stat -- tabulka.json hraci.json

if [ "$PUSH" -eq 0 ]; then
    echo
    echo "Změny leží v pracovní kopii (--bez-push). Commitnout a pushnout:"
    echo "  git add tabulka.json hraci.json && git commit -m 'Aktualizace tabulky a statistik' && git push"
    exit 0
fi

git add tabulka.json hraci.json
git commit -q -m "Aktualizace tabulky a statistik"
git push -u origin "$(git branch --show-current)"
echo
echo "Hotovo, appka se narovná za chvíli (GitHub Pages chvilku nasazuje)."
