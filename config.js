// Digital Signage Konfiguration
// Diese Datei direkt bearbeiten – kein Server nötig!

window.SIGNAGE_CONFIG = {
  settings: {
    defaultDuration: 20,
    transitionDuration: 800,
    showProgressBar: true,
    showSlideTitle: true,
    showClock: true,
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
