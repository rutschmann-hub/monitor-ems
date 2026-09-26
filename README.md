# monitor-ems — Digital Signage

🌐 **Live:** <https://rutschmann-hub.github.io/monitor-ems/>

Selbstgehostete Digital-Signage-Seite für die Infobildschirme der Schule (Mini-PCs mit IServ-Modul „Infobildschirm"). Externe URLs (WebUntis, Canva) und eigene HTML-Seiten rotieren automatisch im Vollbild, mit weicher Überblendung.

## Seiten verwalten — der normale Weg

Die angezeigten Seiten stehen **zentral in einer Google-Tabelle**. Kein Code, kein Anfassen der Bildschirme nötig:

👉 **[Seiten-Tabelle bearbeiten](https://docs.google.com/spreadsheets/d/18vz3J_22zN62QApgEvwpHC7ApmGFECdyMeD27PRRtcc/edit)**

| Spalte | Bedeutung |
|--------|-----------|
| `an` | `ja` / `x` / `1` / Häkchen = Seite wird gezeigt · leer = übersprungen |
| `Titel` | interne Bezeichnung (wird nicht angezeigt) |
| `Link` | URL der Seite (muss mit `http` beginnen) |
| `Sekunden` | Anzeigedauer |

Die Bildschirme lesen die Tabelle **alle 2 Minuten** neu — Änderungen erscheinen von allein.

> **Canva-Links** immer als Einbettungslink: in Canva auf *Teilen → Einbetten → Link kopieren*; die URL endet auf `…/view?embed`.

## Aufbau

```
monitor-ems/
├── index.html      ← der Anzeige-Screen
├── config.js       ← Einstellungen + Reserve-Seitenliste
├── js/signage.js   ← Rotation, Tabelle laden, Überblendung
├── css/style.css   ← Styling
├── admin.html      ← leitet nur zur Google-Tabelle weiter
├── slides/         ← optionale eigene HTML-Seiten (Typ „local")
└── assets/         ← Bilder / PDFs
```

## config.js

Enthält die `settings` (Tabellen-Link, Aktualisierungs­intervall, Standard­dauer, Übergang, Uhr/Fortschritts­balken an/aus) und eine **Reserve-Seitenliste** `slides`. Die Reserve greift nur, wenn die Google-Tabelle nicht erreichbar oder leer ist — bei dauerhaften Link-Änderungen dort mitpflegen.

Unterstützte Slide-Typen: `url`, `local` (Datei in `slides/`), `image`, `pdf` (Datei in `assets/`). Die Google-Tabelle liefert immer `url`.

> Es gibt **kein `config.json`** mehr — die gesamte Konfiguration liegt in `config.js` (`window.SIGNAGE_CONFIG`).

## Bedienung am Bildschirm

| Eingabe | Aktion |
|---------|--------|
| `→` / Leertaste | nächste Seite |
| `←` | vorige Seite |
| Klick auf die **Punkte** unten | direkt zu einer Seite springen |
| Tastenfolge `e` `m` `s` | Info-Panel (nur Anzeige — geschaltet wird in der Tabelle) |

## Lokal testen

Wegen Browser-Sicherheitsregeln über einen lokalen Server öffnen (nicht per Doppelklick):

```bash
python3 -m http.server 8790
# dann: http://localhost:8790
```

In Claude Code: Vorschau-Konfiguration **„signage"** aus `.claude/launch.json`.

## Deploy

Push auf `main` → GitHub Pages aktualisiert die Live-Seite automatisch. Remote ist **SSH**:

```bash
git push   # git@github.com:rutschmann-hub/monitor-ems.git
```

> Nach Änderungen an `css/style.css` oder `js/signage.js` den Cache-Parameter `?v=N` in `index.html` hochzählen, damit die Bildschirme die neue Version laden.
