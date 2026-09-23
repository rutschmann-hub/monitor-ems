/**
 * Digital Signage – Rotation Engine
 * Seitenliste: Google-Tabelle (settings.sheetCsvUrl), Reserve: config.js
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
    dot.appendChild(document.createElement('span')).className = 'dot-fill';
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
  // Balken unten + Füllung im aktiven Punkt (bleibt sichtbar, falls der Bildschirm unten abschneidet)
  const fills = [progressBar, ...document.querySelectorAll('.dot-fill')];
  const activeFill = document.querySelector('.dot.active .dot-fill');
  fills.forEach(el => { el.style.transition = 'none'; el.style.width = '0%'; });

  // Mini-Verzögerung damit der Reset sichtbar ist
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      [progressBar, activeFill].forEach(el => {
        if (!el) return;
        el.style.transition = `width ${duration}ms linear`;
        el.style.width = '100%';
      });
    });
  });
}

// ─── Slide anzeigen ──────────────────────────────────────────────────────
// Die nächste Folie wird vorab unsichtbar in den freien Slot geladen und erst
// eingeblendet, wenn sie fertig ist – so gibt es kein weißes Aufblitzen.
const PRELOAD_MS  = 6000;  // so lange vor dem Wechsel wird die nächste Folie geladen
const MAX_WAIT_MS = 5000;  // länger wird beim Wechsel nicht auf das Laden gewartet
const SETTLE_MS   = 500;   // Canva & Co. brauchen nach "load" noch einen Moment

let preloaded = null;      // { slide, slot, ready }
let preloadTimer = null;
let cleanupTimer = null;
let showToken = 0;

function loadInto(slot, slide) {
  slot.innerHTML = '';
  const el = buildSlideContent(slide);
  const ready = new Promise(resolve => {
    if (el.tagName === 'IFRAME' || el.tagName === 'IMG') {
      el.addEventListener('load', () => setTimeout(resolve, SETTLE_MS), { once: true });
      el.addEventListener('error', resolve, { once: true });
    } else {
      resolve();
    }
  });
  slot.appendChild(el);
  return ready;
}

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise(r => setTimeout(r, ms))]);
}

async function showSlide(index) {
  const token = ++showToken;
  clearTimers();

  const slide = slides[index];
  const duration = (slide.duration ?? config.settings.defaultDuration) * 1000;
  const transMs = config.settings.transitionDuration ?? 1200;

  // Slots bestimmen
  const currentSlot = activeSlot === 'a' ? slotA : slotB;
  const nextSlot    = activeSlot === 'a' ? slotB : slotA;

  // Vorgeladene Folie verwenden, sonst jetzt laden – und auf das Laden warten
  const ready = (preloaded && preloaded.slide === slide && preloaded.slot === nextSlot)
    ? preloaded.ready
    : loadInto(nextSlot, slide);
  preloaded = null;
  await withTimeout(ready, MAX_WAIT_MS);
  if (token !== showToken) return;   // inzwischen weitergeblättert

  // Titel aktualisieren
  if (config.settings.showSlideTitle && slide.title) {
    titleEl.textContent = slide.title;
    topBar.style.display = '';
  } else if (!config.settings.showSlideTitle) {
    topBar.style.display = 'none';
  }

  // Übergang: neue Folie blendet über der alten ein (die alte bleibt stehen bis zum Schluss)
  currentSlot.classList.remove('active');
  currentSlot.classList.add('leaving');
  nextSlot.classList.remove('leaving');
  nextSlot.classList.add('active');

  // Slots tauschen
  activeSlot = activeSlot === 'a' ? 'b' : 'a';

  // Dots & Fortschritt
  updateDots();
  if (config.settings.showProgressBar) startProgressBar(duration);

  // Alten Slot nach Transition leeren
  cleanupTimer = setTimeout(() => {
    currentSlot.classList.remove('leaving');
    currentSlot.innerHTML = '';
  }, transMs + 100);

  // Nächste Folie rechtzeitig vorladen …
  const nextIndex = (index + 1) % slides.length;
  const nextSlide = slides[nextIndex];
  preloadTimer = setTimeout(() => {
    preloaded = { slide: nextSlide, slot: currentSlot, ready: loadInto(currentSlot, nextSlide) };
  }, Math.max(transMs + 200, duration - PRELOAD_MS));

  // … und dann wechseln
  slideTimer = setTimeout(() => {
    currentIndex = nextIndex;
    showSlide(currentIndex);
  }, duration);
}

function clearTimers() {
  clearTimeout(slideTimer);
  clearTimeout(progressTimer);
  clearTimeout(preloadTimer);
  clearTimeout(cleanupTimer);
}

// ─── Google-Tabelle ──────────────────────────────────────────────────────
// Die Seitenliste kommt aus einer Google-Tabelle (Spalten: an, Titel, Link, Sekunden).
// Ist sie nicht erreichbar, gilt die Liste aus config.js.
let slideSource = 'config.js';

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function isOn(value) {
  return ['true', 'wahr', 'ja', 'x', '1', 'an'].includes(String(value).trim().toLowerCase());
}

async function loadSheetSlides() {
  const url = config.settings.sheetCsvUrl;
  if (!url) return null;
  try {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + '_=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const [header, ...rows] = parseCSV(await res.text());
    const col = name => header.findIndex(h => h.trim().toLowerCase() === name);
    const cOn = col('an'), cTitle = col('titel'), cLink = col('link'), cSec = col('sekunden');
    if (cOn < 0 || cLink < 0) throw new Error('Spalten "an" / "Link" fehlen');

    return rows
      .filter(r => (r[cLink] || '').trim().startsWith('http'))
      .map((r, i) => ({
        id: 'sheet-' + i,
        type: 'url',
        url: r[cLink].trim(),
        title: cTitle >= 0 ? r[cTitle].trim() : '',
        duration: parseFloat(cSec >= 0 ? r[cSec] : '') || undefined,
        enabled: isOn(r[cOn]),
      }));
  } catch (err) {
    console.warn('Google-Tabelle nicht lesbar, nutze config.js:', err);
    return null;
  }
}

// Holt die aktuelle Seitenliste und startet die Rotation nur neu, wenn sich etwas geändert hat
async function refreshSlides() {
  const sheetSlides = await loadSheetSlides();
  const all = sheetSlides ?? config.slides;
  const active = all.filter(s => s.enabled !== false);
  // Leere Tabelle (alle Häkchen weg) → lieber config.js zeigen als schwarzen Bildschirm
  const next = active.length ? active : config.slides.filter(s => s.enabled !== false);
  slideSource = (sheetSlides && active.length) ? 'Google-Tabelle' : 'config.js';
  allSlides = all;

  const key = s => [s.url, s.title, s.duration].join('|');
  if (next.map(key).join('\n') === slides.map(key).join('\n')) return;

  slides = next;
  clearTimers();
  currentIndex = 0;
  renderDots();
  showSlide(0);
}

// ─── Info-Panel (e m s) ──────────────────────────────────────────────────
// Nur Anzeige: geschaltet wird in der Google-Tabelle, damit alle Bildschirme gleich laufen.
let allSlides = [];

function adminOpen() {
  const overlay = document.getElementById('admin-overlay');
  const list    = document.getElementById('admin-slide-list');
  document.getElementById('admin-source').textContent = 'Quelle: ' + slideSource;
  list.innerHTML = '';

  allSlides.forEach(slide => {
    const active = slide.enabled !== false;
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div>
        <div class="admin-row-title"></div>
        <div class="admin-row-status ${active ? 'on' : 'off'}">
          ${active ? '● Aktiv' : '● Ausgeblendet'}
        </div>
      </div>`;
    row.querySelector('.admin-row-title').textContent = slide.title || slide.url;
    list.appendChild(row);
  });

  overlay.classList.add('open');
}

async function adminReload() {
  document.getElementById('admin-overlay').classList.remove('open');
  await refreshSlides();
}

// ─── Konami-Code Schutz ──────────────────────────────────────────────────
const KONAMI = ['e','m','s'];
let konamiPos = 0;

// ─── Tastatur-Steuerung ──────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  // Admin-Panel: Esc schließt
  if (e.key === 'Escape') {
    document.getElementById('admin-overlay').classList.remove('open');
    konamiPos = 0;
    return;
  }

  // Konami-Code prüfen
  if (e.key === KONAMI[konamiPos]) {
    konamiPos++;
    if (konamiPos === KONAMI.length) {
      konamiPos = 0;
      const overlay = document.getElementById('admin-overlay');
      overlay.classList.contains('open') ? overlay.classList.remove('open') : adminOpen();
    }
    return;
  } else {
    konamiPos = (e.key === KONAMI[0]) ? 1 : 0;
  }

  // Admin offen → keine Slide-Navigation
  if (document.getElementById('admin-overlay').classList.contains('open')) return;


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
async function init() {
  if (!window.SIGNAGE_CONFIG) {
    document.body.innerHTML = '<div class="error-slide">config.js nicht geladen. Stelle sicher, dass config.js im gleichen Ordner liegt.</div>';
    return;
  }
  config = window.SIGNAGE_CONFIG;

  // Alte gerätelokale Schalter (früheres e-m-s-Panel) aufräumen
  try { localStorage.removeItem('signage_enabled_overrides'); } catch {}

  // UI-Optionen
  document.documentElement.style.setProperty('--trans-ms', (config.settings.transitionDuration ?? 1200) + 'ms');
  if (!config.settings.showProgressBar) progressWrap.style.display = 'none';
  if (!config.settings.showClock) clockEl.style.display = 'none';

  // Uhr starten
  updateClock();
  setInterval(updateClock, 1000);

  await refreshSlides();
  if (slides.length === 0) {
    document.body.innerHTML = '<div class="error-slide">Keine aktiven Seiten – weder in der Google-Tabelle noch in config.js.</div>';
    return;
  }

  // Tabelle regelmäßig neu prüfen
  setInterval(refreshSlides, (config.settings.refreshMinutes ?? 2) * 60 * 1000);
}

init();
