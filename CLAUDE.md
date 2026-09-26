# CLAUDE.md — monitor-ems (Digital Signage)

## Arbeitsregeln (nach Karpathy)
1. **Keine stillen Annahmen.** Verständnis der Aufgabe vor der Änderung bestätigen; bei Unklarheit nachfragen statt raten.
2. **Kein Over-Engineering.** Die einfachste funktionierende Lösung ist die richtige. Dieses Projekt ist bewusst **abhängigkeitsfrei** (Vanilla JS, kein Build, kein Framework) — so halten.
3. **Keine ungefragten Änderungen.** Nur anfassen, worum gebeten wurde; nicht nebenbei umbauen, umformatieren oder „aufräumen".
4. **Erst Plan, dann Code.** Bei nicht-trivialen Aufgaben kurzer Plan + lokale Verifikation vor dem Commit.

## Was das ist
Selbstgehostete Digital-Signage-Seite (statisch, Vanilla JS). Live über GitHub Pages: <https://rutschmann-hub.github.io/monitor-ems/>, eingebunden im IServ-Modul „Infobildschirm" auf mehreren Mini-PCs (Linux, `iserv-display`).

## Wichtigstes Betriebsprinzip
- Die **Seitenliste kommt live aus einer Google-Tabelle** (CSV via gviz), **nicht** aus dem Code. Spalten: `an`, `Titel`, `Link`, `Sekunden`. Die Bildschirme prüfen alle `refreshMinutes` (Standard 2) neu (`refreshSlides` in `js/signage.js`).
- Tabelle bearbeiten: <https://docs.google.com/spreadsheets/d/18vz3J_22zN62QApgEvwpHC7ApmGFECdyMeD27PRRtcc/edit>
- **Seiten ein/aus, Titel, Links, Dauer ändert der Nutzer selbst in der Tabelle** — dafür keinen Code anfassen.
- `config.js` → `slides` ist nur **Reserve** (greift, wenn die Tabelle nicht erreichbar oder ganz leer ist). Bei dauerhaften Link-Änderungen dort mitpflegen.
- Das **`ems`-Panel** (Tasten `e` `m` `s` tippen) ist **nur Anzeige** — es schaltet nichts und wirkt nicht auf die Minis.

## Konventionen
- **Canva-Links immer als `…/view?embed`** (aus dem „Einbetten"-Code), sonst lädt das iframe nicht.
- Slide-Typen (`config.js` / Tabelle liefert nur `url`): `url`, `local` (→ `slides/*.html`), `image` (→ `assets/…`), `pdf` (→ `assets/…`).
- **`config.json` ist Alt-Rest und wird NICHT geladen** — nicht verwenden; Konfiguration lebt in `config.js` (`window.SIGNAGE_CONFIG`).

## Dateien
- `index.html` — der Screen; lädt `config.js` + `js/signage.js`.
- `js/signage.js` — Engine: Tabelle laden (`loadSheetSlides`), Rotation, Vorladen/Überblendung, Fortschrittsbalken, Dots, `ems`-Panel.
- `config.js` — `settings` (`sheetCsvUrl`, `sheetEditUrl`, `refreshMinutes`, Dauer/Übergang, Anzeige-Flags) + Reserve-`slides`.
- `css/style.css` · `slides/*.html` (Reserve) · `assets/` (Bilder/PDF) · `admin.html` (leitet nur zur Tabelle weiter).

## Lokal testen
Server nötig (nicht per Doppelklick öffnen — sonst laden externe URLs nicht):
```bash
python3 -m http.server 8790
# oder Preview-Config „signage" aus .claude/launch.json
```

## Deploy
Push via **SSH**: `git@github.com:rutschmann-hub/monitor-ems.git` → GitHub Pages aktualisiert die Live-Seite automatisch. (Bei Auth-Fehler Remote auf `git@github.com:` prüfen.)
