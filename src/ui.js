// --- src/ui.js ---
// UI Management: Menus, Carousel, Quick Actions, HUD Telemetry & Modals

import { playCarouselTick } from './audio.js';
import { p1GamepadIndex, p2GamepadIndex } from './input.js';

// DOM Bindings
const startMenuModal = document.getElementById('start-menu-modal');
const carouselModal = document.getElementById('map-carousel-modal');
const raceFinishModal = document.getElementById('race-finish-modal');

// Controller status slots
const p1StatusEl = document.getElementById('p1-pad-status');
const p2StatusEl = document.getElementById('p2-pad-status');

// Carousel Elements
const selectedModeBadge = document.getElementById('selected-mode-badge');
const cardPrev = document.getElementById('card-prev');
const cardNext = document.getElementById('card-next');
const prevTitle = document.getElementById('prev-card-title');
const nextTitle = document.getElementById('next-card-title');

const activeNumber = document.getElementById('active-card-number');
const activeIcon = document.getElementById('active-card-icon');
const activeName = document.getElementById('active-card-name');
const activeDesc = document.getElementById('active-card-desc');
const activeGatesVal = document.getElementById('card-gates-val');
const activeAltVal = document.getElementById('card-alt-val');
const activeDiffVal = document.getElementById('card-diff-val');

const viewportSky = document.getElementById('viewport-sky-bg');
const viewportMountain = document.getElementById('viewport-mountain-svg');
const viewportWater = document.getElementById('viewport-water-line');
const viewportTag = document.getElementById('viewport-biome-tag');

// HUD Telemetry Elements
const p1TimeEl = document.getElementById('p1-time-val');
const p1RingEl = document.getElementById('p1-ring-val');
const p1ScoreEl = document.getElementById('p1-score-val');
const p1DistEl = document.getElementById('p1-dist-val');
const p1AltEl = document.getElementById('p1-alt-val');
const p1SpdEl = document.getElementById('p1-spd-val');

const p2TimeEl = document.getElementById('p2-time-val');
const p2RingEl = document.getElementById('p2-ring-val');
const p2ScoreEl = document.getElementById('p2-score-val');
const p2DistEl = document.getElementById('p2-dist-val');
const p2AltEl = document.getElementById('p2-alt-val');
const p2SpdEl = document.getElementById('p2-spd-val');

export function updateControllerUI() {
  if (p1StatusEl) {
    if (p1GamepadIndex !== null) {
      p1StatusEl.className = 'pad-slot connected p1-connected';
      p1StatusEl.querySelector('.pad-state').innerText = `✓ Xbox Pad [ID: ${p1GamepadIndex}]`;
    } else {
      p1StatusEl.className = 'pad-slot waiting';
      p1StatusEl.querySelector('.pad-state').innerText = 'Press [A / B / X / Y]';
    }
  }

  if (p2StatusEl) {
    if (p2GamepadIndex !== null) {
      p2StatusEl.className = 'pad-slot connected p2-connected';
      p2StatusEl.querySelector('.pad-state').innerText = `✓ Xbox Pad [ID: ${p2GamepadIndex}]`;
    } else {
      p2StatusEl.className = 'pad-slot waiting';
      p2StatusEl.querySelector('.pad-state').innerText = 'Press [A / B / X / Y]';
    }
  }
}

export function showModeMenu() {
  document.body.className = 'mode-menu';
  startMenuModal.style.visibility = 'visible';
  carouselModal.classList.remove('active');
  raceFinishModal.classList.remove('active');
}

export function showMapCarousel(modeLabel) {
  document.body.className = 'mode-map-select';
  if (selectedModeBadge) selectedModeBadge.innerText = modeLabel.toUpperCase();
}

export function updateCarouselCard(currentMap, prevMap, nextMap) {
  if (activeNumber) activeNumber.innerText = `WORLD ${currentMap.number}`;
  if (activeIcon) activeIcon.innerText = currentMap.icon;
  if (activeName) activeName.innerText = currentMap.name;
  if (activeDesc) activeDesc.innerText = currentMap.desc;
  if (activeGatesVal) activeGatesVal.innerText = `${currentMap.totalGates} GATES`;
  if (activeAltVal) activeAltVal.innerText = currentMap.preview.altDisplay;
  if (activeDiffVal) activeDiffVal.innerText = currentMap.difficulty;

  // Update Mini PS1 Viewport
  if (viewportSky) viewportSky.style.background = currentMap.preview.skyGradient;
  if (viewportMountain) {
    viewportMountain.style.background = currentMap.preview.mountainColor;
    viewportMountain.style.clipPath = currentMap.preview.clipPath;
  }

  // Handle water bar visibility for dry maps
  if (viewportWater) {
    if (currentMap.ocean && (currentMap.ocean.level === undefined || currentMap.ocean.level > -450)) {
      viewportWater.style.display = 'block';
      viewportWater.style.background = currentMap.preview.waterColor || '#1da2b4';
    } else {
      viewportWater.style.display = 'none';
    }
  }

  if (viewportTag) viewportTag.innerText = currentMap.biome;

  // Side Preview Cards
  if (prevTitle) prevTitle.innerText = `${prevMap.icon} ${prevMap.name}`;
  if (nextTitle) nextTitle.innerText = `${nextMap.icon} ${nextMap.name}`;
}

export function triggerRingPopup(playerId) {
  const popup = document.getElementById(`${playerId}-ring-popup`);
  if (popup) {
    popup.classList.add('show');
    clearTimeout(popup._timer);
    popup._timer = setTimeout(() => popup.classList.remove('show'), 700);
  }
}

export function showWinnerBanner(playerId) {
  const banner = document.getElementById(`${playerId}-winner-banner`);
  if (banner) banner.classList.add('show');
}

export function showFinishModal(title, subtitle, p1Time, p2Time) {
  const modal = document.getElementById('race-finish-modal');
  document.getElementById('race-winner-title').innerText = title;
  document.getElementById('race-winner-subtitle').innerText = subtitle;
  document.getElementById('p1-finish-time').innerText = p1Time;
  document.getElementById('p2-finish-time').innerText = p2Time;
  modal.classList.add('active');
}

export function updateTelemetry(p1, p2, spdP1, spdP2, totalGates, gameMode, timeP1, timeP2, distP1, distP2) {
  if (p1TimeEl) p1TimeEl.innerText = timeP1;
  if (p1RingEl) p1RingEl.innerText = `Gate #${p1.currentRingIndex + 1} (${p1.gatesCleared}/${totalGates})`;
  if (p1ScoreEl) p1ScoreEl.innerText = `${p1.score}`;
  if (p1DistEl) p1DistEl.innerText = `${distP1}m`;
  if (p1AltEl) p1AltEl.innerText = `ALT: ${Math.round(p1.pos.y)}m`;
  if (p1SpdEl) p1SpdEl.innerText = `SPD: ${Math.round(spdP1 * 1.8)} km/h`;

  if (gameMode === 'race' || gameMode === 'coop') {
    if (p2TimeEl) p2TimeEl.innerText = timeP2;
    if (p2RingEl) p2RingEl.innerText = `Gate #${p2.currentRingIndex + 1} (${p2.gatesCleared}/${totalGates})`;
    if (p2ScoreEl) p2ScoreEl.innerText = `${p2.score}`;
    if (p2DistEl) p2DistEl.innerText = `${distP2}m`;
    if (p2AltEl) p2AltEl.innerText = `ALT: ${Math.round(p2.pos.y)}m`;
    if (p2SpdEl) p2SpdEl.innerText = `SPD: ${Math.round(spdP2 * 1.8)} km/h`;
  }
}

export function syncWaterLevelUI(level) {
  const qaWaterSlider = document.getElementById('qa-water-slider');
  const qaWaterVal = document.getElementById('qa-water-val');
  if (qaWaterSlider) {
    qaWaterSlider.value = Math.max(-300, Math.min(300, level));
  }
  if (qaWaterVal) {
    qaWaterVal.innerText = level <= -450 ? 'DRAINED' : `${Math.round(level)}m`;
  }
}

export function setupUIEventListeners(handlers) {
  // Mode selection buttons
  document.getElementById('btn-mode-single').addEventListener('click', () => handlers.onSelectMode('single'));
  document.getElementById('btn-mode-coop').addEventListener('click', () => handlers.onSelectMode('coop'));
  document.getElementById('btn-mode-race').addEventListener('click', () => handlers.onSelectMode('race'));

  // Carousel navigation buttons
  document.getElementById('carousel-prev-btn').addEventListener('click', () => handlers.onPrevMap());
  document.getElementById('carousel-next-btn').addEventListener('click', () => handlers.onNextMap());
  cardPrev.addEventListener('click', () => handlers.onPrevMap());
  cardNext.addEventListener('click', () => handlers.onNextMap());

  document.getElementById('btn-confirm-map').addEventListener('click', () => handlers.onConfirmMap());
  document.getElementById('btn-carousel-back').addEventListener('click', () => handlers.onBackToMenu());

  // In-flight top-left toolbar buttons
  document.getElementById('menu-toggle-btn').addEventListener('click', () => handlers.onBackToMenu());
  document.getElementById('map-select-btn').addEventListener('click', () => handlers.onOpenMapCarousel());
  document.getElementById('reset-btn').addEventListener('click', () => handlers.onResetMatch());
  document.getElementById('invert-btn').addEventListener('click', () => handlers.onToggleInvert());

  // Finish modal buttons
  document.getElementById('btn-rematch').addEventListener('click', () => handlers.onResetMatch());
  document.getElementById('btn-change-map').addEventListener('click', () => handlers.onOpenMapCarousel());
  document.getElementById('btn-back-menu').addEventListener('click', () => handlers.onBackToMenu());

  // Quick Actions Dropdown (Right side)
  const qaContainer = document.getElementById('quick-actions-container');
  const qaBtn = document.getElementById('quick-actions-btn');
  const qaWaterSlider = document.getElementById('qa-water-slider');
  const qaWaterVal = document.getElementById('qa-water-val');

  if (qaBtn && qaContainer) {
    qaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      qaContainer.classList.toggle('open');
      qaBtn.classList.toggle('active', qaContainer.classList.contains('open'));
    });

    window.addEventListener('click', (e) => {
      if (!qaContainer.contains(e.target)) {
        qaContainer.classList.remove('open');
        qaBtn.classList.remove('active');
      }
    });
  }

  // Real-Time Water Slider
  if (qaWaterSlider) {
    qaWaterSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (qaWaterVal) qaWaterVal.innerText = `${Math.round(val)}m`;
      if (handlers.onWaterLevelChange) handlers.onWaterLevelChange(val);
    });
  }

  // Quick Action Presets
  const qaResetWater = document.getElementById('qa-water-reset');
  if (qaResetWater) {
    qaResetWater.addEventListener('click', () => {
      if (handlers.onWaterLevelReset) handlers.onWaterLevelReset();
    });
  }

  const qaDrainWater = document.getElementById('qa-water-drain');
  if (qaDrainWater) {
    qaDrainWater.addEventListener('click', () => {
      if (handlers.onWaterLevelChange) handlers.onWaterLevelChange(-500);
      if (qaWaterSlider) qaWaterSlider.value = -300;
      if (qaWaterVal) qaWaterVal.innerText = 'DRAINED';
    });
  }

  const qaInvert = document.getElementById('qa-btn-invert');
  if (qaInvert) qaInvert.addEventListener('click', () => handlers.onToggleInvert());

  const qaRespawn = document.getElementById('qa-btn-reset');
  if (qaRespawn) qaRespawn.addEventListener('click', () => handlers.onResetMatch());
}
