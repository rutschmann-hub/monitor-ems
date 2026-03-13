// Digital Signage Konfiguration
// Diese Datei direkt bearbeiten – kein Server nötig!

window.SIGNAGE_CONFIG = {
  settings: {
    defaultDuration: 15,
    transitionDuration: 800,
    showProgressBar: true,
    showSlideTitle: true,
    showClock: true,
    adminPin: "1234"   // ← PIN für das Admin-Panel (ändern!)
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
      id: "nachrichten",
      type: "url",
      url: "https://www.canva.com/design/DAHD0_QcYJU/Bu7uqMes1_002VeZn7O3mQ/view?embed",
      title: "Schulnachrichten",
      duration: 25,
      enabled: true   // ← false = Seite wird übersprungen
    },
    {
      id: "ems-monitor",
      type: "url",
      url: "https://www.canva.com/design/DAHD0Yvn9a0/0Ry0YUl1dtIK2trdqtpYvQ/view?embed",
      title: "EMS Monitor",
      duration: 25
    }
  ]
};
