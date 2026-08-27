# Florbal Kuřim

Appka na přihlašování na tréninky, zápasy a klubové akce.
Statická stránka na GitHub Pages, data v Supabase.

## Stav

Zatím je nasazený **návrh s vymyšlenými daty** — všechno funguje,
ale nic se neukládá. Po refreshi je to zase jako na začátku.
Napojení na Supabase je další krok.

## Co je v repozitáři

```
index.html                 celá appka, jeden soubor
manifest.json              aby šla přidat na plochu telefonu
logo.svg                   klubové logo ve křivkách
logo-256.png               logo pro použití v appce
icon-192.png               ikona aplikace
icon-512.png
icon-maskable-512.png      varianta s okrajem pro Android
.nojekyll                  ať GitHub soubory nezpracovává Jekyllem
```

## Nasazení

1. Nahraj obsah téhle složky do kořene repozitáře (větev `main`).
2. **Settings → Pages** → Source: `Deploy from a branch`,
   větev `main`, složka `/ (root)`, ulož.
3. Za pár minut běží na `https://<uživatel>.github.io/<repozitář>/`.

Repozitář musí být veřejný — Pages na free účtu z privátního nefungují.
Nevadí to, v kódu není žádné tajemství.

## Přidat na plochu (iPhone)

Safari → Sdílet → Přidat na plochu. Appka se pak otevírá bez adresního
řádku, jako běžná aplikace.

## Další kroky

- [x] Klubové logo v hlavičce, na přihlašovací obrazovce i v ikonách
- [ ] Supabase projekt + schéma (`florbal-schema.sql`)
- [ ] Napojit index.html na Supabase (přihlášení, události, účast, chat)
- [ ] Vlastní doména
- [ ] SMTP přes Resend, aby chodily pozvánky a obnova hesla
