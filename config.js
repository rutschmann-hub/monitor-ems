// Digital Signage Konfiguration
// Diese Datei direkt bearbeiten – kein Server nötig!

window.SIGNAGE_CONFIG = {
  settings: {
    defaultDuration: 15,
    transitionDuration: 800,
    showProgressBar: true,
    showSlideTitle: true,
    showClock: true
  },
  slides: [
    {
      id: "webuntis",
      type: "url",
      url: "https://ev-montessorischulhaus-freiburg.webuntis.com/WebUntis/monitor?school=ev-montessorischulhaus-freiburg&monitorType=subst&format=Cluster%20rot",
      title: "Vertretungsplan",
      duration: 30
    },
    {
      id: "canva",
      type: "url",
      url: "https://www.canva.com/design/DAF8LVmbsTU/rpT7Uf96EhY4Q5UgW8MZew/view?embed",
      title: "Mittagessen",
      duration: 20
    },
    {
      id: "info-bild",
      type: "image",
      file: "assets/L.png",
      title: "Info",
      duration: 12
      // disabled: true  ← hinzufügen zum Ausblenden
    },
    {
      id: "info-pdf",
      type: "pdf",
      file: "assets/L.pdf",
      title: "Info",
      duration: 20,
      disabled: true
      // disabled: true entfernen wenn L.pdf im assets/ Ordner liegt
    }
  ]
};
