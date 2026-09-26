// Digital Signage Konfiguration
// Diese Datei direkt bearbeiten – kein Server nötig!

window.SIGNAGE_CONFIG = {
  settings: {
    defaultDuration: 20,
    transitionDuration: 1200,
    showProgressBar: true,
    showClock: true,

    // Google-Tabelle mit der Seitenliste (Spalten: an, Titel, Link, Sekunden).
    // Leer = nur die Liste unten verwenden. Die Liste unten ist auch die Reserve,
    // falls Google nicht erreichbar ist.
    sheetCsvUrl: "https://docs.google.com/spreadsheets/d/18vz3J_22zN62QApgEvwpHC7ApmGFECdyMeD27PRRtcc/gviz/tq?tqx=out:csv&headers=1",
    sheetEditUrl: "https://docs.google.com/spreadsheets/d/18vz3J_22zN62QApgEvwpHC7ApmGFECdyMeD27PRRtcc/edit",      // Link zum Bearbeiten – /admin.html leitet dorthin weiter
    refreshMinutes: 2,     // wie oft die Bildschirme die Tabelle neu prüfen
  },
  slides: [
    {
      id: "webuntis",
      type: "url",
      url: "https://ev-montessorischulhaus-freiburg.webuntis.com/WebUntis/monitor?school=ev-montessorischulhaus-freiburg&monitorType=subst&format=Cluster%20rot",
      title: "Vertretungsplan",
      duration: 20
    },
    {
      id: "nachrichten",
      type: "url",
      url: "https://www.canva.com/design/DAHWBrJVw2M/krN5lJ8RvcpChKgau3JIyA/view?embed",
      title: "Schulnachrichten",
      duration: 20,
      enabled: true   // ← false = Seite wird übersprungen
    },
    {
      id: "ems-monitor",
      type: "url",
      url: "https://www.canva.com/design/DAHVKs9dIZ8/yA55jLvtnVfo03T9hWmleQ/view?embed",
      title: "Mittagessen",
      duration: 20
    },
    {
      id: "sonderveranstaltungen",
      type: "url",
      url: "https://www.canva.com/design/DAHWBlMJJ7M/fvq8VrbbUEP_VTLcYDan-g/view?embed",
      title: "Sonderveranstaltungen",
      duration: 20,
      enabled: false   // ← Standardmäßig aus – nur bei Bedarf einschalten
    }
  ]
};
