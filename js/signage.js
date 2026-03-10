/**
 * Digital Signage – Rotation Engine
 * Konfiguration erfolgt über config.json
 */

let config = null;
let slides = [];
let currentIndex = 0;
let progressTimer = null;
let slideTimer = null;
let activeSlot = 'a'; // alterniert zwischen 'a' und 'b' (sanfter Übergang)

const slotA = document.getElementById('slide-a');
const slotB = document.getElementById('slide-b');
const titleEl = document.getElementById('slide-title');
const clockEl = document.getElementById('clock');
const progressBar = document.getElementById('progress-bar');
const dotsEl = document.getElementById('dots');
const topBar = document.getElementById('top-bar');
const progressWrap = document.getElementById('progress-bar-wrap');

// ─── Uhr ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${h}:${m}:${s}`;
}

// ─── Slide-Inhalt erzeugen ────────────────────────────────────────────────
function buildSlideContent(slide) {
  if (slide.type === 'url') {
    const iframe = document.createElement('iframe');
    iframe.src = slide.url;
    iframe.allow = 'fullscreen; autoplay';
    iframe.setAttribute('allowfullscreen', '');
    return iframe;

  } else if (slide.type === 'local') {
    const iframe = document.createElement('iframe');
    iframe.src = slide.file;
    return iframe;

  } else if (slide.type === 'image') {
    const img = document.createElement('img');
    img.src = slide.file;
    img.alt = slide.title || '';
    img.className = 'full-media';
    return img;

  } else if (slide.type === 'pdf') {
    const iframe = document.createElement('iframe');
    iframe.src = slide.file + '#toolbar=0&navpanes=0&scrollbar=0&view=Fit';
    return iframe;
  }

  // Fallback
  const div = document.createElement('div');
  div.className = 'error-slide';
  div.textContent = `Unbekannter Slide-Typ: ${slide.type}`;
  return div;
}

// ─── Dots (Indikatoren) ──────────────────────────────────────────────────
function renderDots() {
  dotsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === currentIndex ? ' active' : '');
    dot.addEventListener('click', () => {
      clearTimers();
      currentIndex = i;
      showSlide(currentIndex);
    });
    dotsEl.appendChild(dot);
  });
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

// ─── Fortschrittsbalken ──────────────────────────────────────────────────
function startProgressBar(duration) {
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';

  // Mini-Verzögerung damit der Reset sichtbar ist
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progressBar.style.transition = `width ${duration}ms linear`;
      progressBar.style.width = '100%';
    });
  });
}

// ─── Slide anzeigen ──────────────────────────────────────────────────────
function showSlide(index) {
  const slide = slides[index];
  const duration = (slide.duration ?? config.settings.defaultDuration) * 1000;
  const transMs = config.settings.transitionDuration ?? 800;

  // Slots bestimmen
  const currentSlot = activeSlot === 'a' ? slotA : slotB;
  const nextSlot    = activeSlot === 'a' ? slotB : slotA;

  // Nächsten Slide in inaktivem Slot aufbauen
  nextSlot.innerHTML = '';
  nextSlot.appendChild(buildSlideContent(slide));

  // Titel aktualisieren
  if (config.settings.showSlideTitle && slide.title) {
    titleEl.textContent = slide.title;
    topBar.style.display = '';
  } else if (!config.settings.showSlideTitle) {
    topBar.style.display = 'none';
  }

  // Übergang: next einblenden, current ausblenden
  nextSlot.classList.add('active');
  currentSlot.classList.remove('active');

  // Slots tauschen
  activeSlot = activeSlot === 'a' ? 'b' : 'a';

  // Dots & Fortschritt
  updateDots();
  if (config.settings.showProgressBar) startProgressBar(duration);

  // Alten Slot nach Transition leeren
  setTimeout(() => {
    currentSlot.innerHTML = '';
  }, transMs + 100);

  // Nächsten Slide planen
  clearTimers();
  slideTimer = setTimeout(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }, duration);
}

function clearTimers() {
  clearTimeout(slideTimer);
  clearTimeout(progressTimer);
}

// ─── Tastatur-Steuerung ──────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    clearTimers();
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  } else if (e.key === 'ArrowLeft') {
    clearTimers();
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  }
});

// ─── Start ───────────────────────────────────────────────────────────────
function init() {
  if (!window.SIGNAGE_CONFIG) {
    document.body.innerHTML = '<div class="error-slide">config.js nicht geladen. Stelle sicher, dass config.js im gleichen Ordner liegt.</div>';
    return;
  }
  config = window.SIGNAGE_CONFIG;

  // Nur aktive Slides (kein disabled: true)
  slides = config.slides.filter(s => s.disabled !== true);

  if (slides.length === 0) {
    document.body.innerHTML = '<div class="error-slide">Keine Slides in config.js konfiguriert.</div>';
    return;
  }

  // UI-Optionen
  if (!config.settings.showProgressBar) progressWrap.style.display = 'none';
  if (!config.settings.showClock) clockEl.style.display = 'none';

  renderDots();
  showSlide(0);

  // Uhr starten
  updateClock();
  setInterval(updateClock, 1000);
}

init();
