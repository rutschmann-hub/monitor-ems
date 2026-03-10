# Digital Signage

Eine einfache, selbst gehostete Digital-Signage-Lösung. HTML-Seiten, externe URLs (WebUntis, Canva), Bilder und PDFs rotieren automatisch auf dem Bildschirm.

## Schnellstart

1. Ordner herunterladen oder klonen
2. `config.json` anpassen (Slides hinzufügen/entfernen)
3. `index.html` in einem Browser öffnen – fertig!

> **Hinweis:** Wegen Browser-Sicherheitsregeln muss die Seite über einen lokalen Webserver laufen (nicht einfach per Doppelklick öffnen), damit externe URLs korrekt geladen werden.
> Starte einen einfachen Server z.B. mit:
> ```bash
> npx serve .
> # oder mit Python:
> python3 -m http.server 8080
> ```

---

## Ordnerstruktur

```
DigitalSignage/
├── index.html          ← Hauptseite (öffnen im Browser)
├── config.json         ← Alle Slides hier konfigurieren
├── slides/             ← Eigene HTML-Slides ablegen
│   ├── welcome.html    ← Willkommensseite (Beispiel)
│   └── info.html       ← Info-Karten (Beispiel)
├── assets/             ← PNG, JPG, PDF Dateien ablegen
├── js/
│   └── signage.js      ← Rotation-Engine
└── css/
    └── style.css       ← Styling
```

---

## config.json – Slides konfigurieren

```json
{
  "settings": {
    "defaultDuration": 15,
    "transitionDuration": 800,
    "showProgressBar": true,
    "showSlideTitle": true,
    "showClock": true
  },
  "slides": [ ... ]
}
```

### Slide-Typen

#### Externe URL (WebUntis, Canva, etc.)
```json
{
  "id": "webuntis",
  "type": "url",
  "url": "https://meine-schule.webuntis.com/...",
  "title": "Stundenplan",
  "duration": 30
}
```

#### Canva Präsentation
1. Canva öffnen → Teilen → Einbetten → Link kopieren
2. Link als `url` eintragen:
```json
{
  "id": "canva",
  "type": "url",
  "url": "https://www.canva.com/design/DESIGN-ID/view?embed",
  "title": "Canva Präsentation",
  "duration": 20
}
```

#### Eigene HTML-Seite
```json
{
  "id": "meine-seite",
  "type": "local",
  "file": "slides/meine-seite.html",
  "title": "Meine Seite",
  "duration": 10
}
```

#### Bild (PNG, JPG)
Datei in den `assets/`-Ordner legen:
```json
{
  "id": "mein-bild",
  "type": "image",
  "file": "assets/mein-bild.png",
  "title": "Info",
  "duration": 12
}
```

#### PDF
Datei in den `assets/`-Ordner legen:
```json
{
  "id": "mein-pdf",
  "type": "pdf",
  "file": "assets/mein-dokument.pdf",
  "title": "Dokument",
  "duration": 20
}
```

#### Slide deaktivieren (ohne löschen)
```json
{
  "id": "...",
  "disabled": true,
  ...
}
```

---

## Tastatur-Steuerung

| Taste | Aktion |
|-------|--------|
| `→` oder `Leertaste` | Nächster Slide |
| `←` | Vorheriger Slide |

Auf die **Punkte** (unten) klicken, um direkt zu einem Slide zu springen.

---

## Hinweis zu iframes (WebUntis, Canva)

Manche Webseiten erlauben keine Einbettung via iframe (`X-Frame-Options`). In diesem Fall:
- WebUntis: Prüfe ob deine Schule die öffentliche Ansicht erlaubt
- Canva: Den öffentlichen Einbettungslink verwenden (nicht den Bearbeitungslink)

---

## Lokalen Server starten (empfohlen)

```bash
# Option 1 – Node.js (npx)
npx serve .

# Option 2 – Python
python3 -m http.server 8080

# Dann im Browser öffnen:
# http://localhost:8080
```

Für einen dauerhaften Einsatz (z.B. Raspberry Pi oder Schulserver) empfiehlt sich nginx oder ein ähnlicher Webserver.
