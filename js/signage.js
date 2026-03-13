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

// ─── Admin-Panel ─────────────────────────────────────────────────────────
const ADMIN_KEY = 'signage_enabled_overrides';

function adminGetOverrides() {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY)) || {}; } catch { return {}; }
}

function adminOpen() {
  const overlay = document.getElementById('admin-overlay');
  const list    = document.getElementById('admin-slide-list');
  const overrides = adminGetOverrides();
  list.innerHTML = '';

  window.SIGNAGE_CONFIG.slides.forEach(slide => {
    const active = (slide.id in overrides) ? overrides[slide.id] : (slide.enabled !== false);
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div>
        <div class="admin-row-title">${slide.title}</div>
        <div class="admin-row-status ${active ? 'on' : 'off'}" id="as-${slide.id}">
          ${active ? '● Aktiv' : '● Ausgeblendet'}
        </div>
      </div>
      <label class="admin-toggle">
        <input type="checkbox" id="at-${slide.id}" ${active ? 'checked' : ''}
          onchange="adminUpdateRow('${slide.id}', this.checked)">
        <span class="sl"></span>
      </label>`;
    list.appendChild(row);
  });

  overlay.classList.add('open');
}

function adminUpdateRow(id, checked) {
  const el = document.getElementById('as-' + id);
  el.textContent = checked ? '● Aktiv' : '● Ausgeblendet';
  el.className = 'admin-row-status ' + (checked ? 'on' : 'off');
}

function adminSave() {
  const overrides = {};
  window.SIGNAGE_CONFIG.slides.forEach(s => {
    const cb = document.getElementById('at-' + s.id);
    if (cb) overrides[s.id] = cb.checked;
  });
  localStorage.setItem(ADMIN_KEY, JSON.stringify(overrides));
  document.getElementById('admin-overlay').classList.remove('open');

  // Rotation sofort neu starten mit neuen Einstellungen
  clearTimers();
  slides = window.SIGNAGE_CONFIG.slides.filter(s => {
    if (s.id in overrides) return overrides[s.id] === true;
    return s.enabled !== false;
  });
  currentIndex = 0;
  renderDots();
  showSlide(0);
}

// ─── PIN-Schutz ───────────────────────────────────────────────────────────
function pinOpen() {
  const pinInput = document.getElementById('pin-input');
  document.getElementById('pin-error').textContent = '';
  pinInput.value = '';
  document.getElementById('pin-overlay').classList.add('open');
  setTimeout(() => pinInput.focus(), 100);
}

function pinCheck() {
  const entered = document.getElementById('pin-input').value;
  const correct = (config.settings.adminPin || '1234');
  if (entered === correct) {
    document.getElementById('pin-overlay').classList.remove('open');
    adminOpen();
  } else {
    const err = document.getElementById('pin-error');
    err.textContent = '❌ Falscher PIN';
    document.getElementById('pin-input').value = '';
    setTimeout(() => { err.textContent = ''; }, 2000);
  }
}

// ─── Tastatur-Steuerung ──────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  // PIN-Feld: Enter bestätigt
  if (document.getElementById('pin-overlay').classList.contains('open')) {
    if (e.key === 'Enter') pinCheck();
    if (e.key === 'Escape') document.getElementById('pin-overlay').classList.remove('open');
    return;
  }
  if (e.key === 'a' || e.key === 'A') {
    const overlay = document.getElementById('admin-overlay');
    if (overlay.classList.contains('open')) {
      overlay.classList.remove('open');
    } else {
      pinOpen();
    }
    return;
  }
  if (e.key === 'Escape') {
    document.getElementById('admin-overlay').classList.remove('open');
    return;
  }
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

  // Gespeicherte Overrides laden (aus Admin-Panel)
  const overrides = adminGetOverrides();

  // Nur aktive Slides: Override hat Vorrang, sonst config.js-Wert
  slides = config.slides.filter(s => {
    if (s.id in overrides) return overrides[s.id] === true;
    return s.enabled !== false;
  });

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
