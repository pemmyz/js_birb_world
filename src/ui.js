// --- src/ui.js ---
// UI Management: Menus, Carousel, Controller Test Lab, Gyro Calibration & Volume

import { playCarouselTick } from './audio.js';
import { p1GamepadIndex, p2GamepadIndex } from './input.js';

// DOM Bindings
const startMenuModal = document.getElementById('start-menu-modal');
const carouselModal = document.getElementById('map-carousel-modal');
const raceFinishModal = document.getElementById('race-finish-modal');
const pauseOverlay = document.getElementById('pause-overlay');
const gyroCalibOverlay = document.getElementById('gyro-calib-overlay');
const calibProgressBar = document.getElementById('calib-progress-bar');
const padTestModal = document.getElementById('controller-test-modal');

// Controller slots
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

let padTestSelectedSlot = 'p1'; // 'p1' or 'p2'

export function showPauseOverlay(show) {
  if (pauseOverlay) {
    pauseOverlay.classList.toggle('active', show);
  }
}

export function showGyroCalibration(show) {
  if (gyroCalibOverlay) {
    gyroCalibOverlay.classList.toggle('active', show);
    if (calibProgressBar) calibProgressBar.style.width = '0%';
  }
}

export function updateGyroCalibrationProgress(progress) {
  if (calibProgressBar) {
    calibProgressBar.style.width = `${Math.round(progress * 100)}%`;
  }
}

export function updateGyroUI(enabled) {
  const gyroBtn = document.getElementById('gyro-toggle-btn');
  const qaGyroBtn = document.getElementById('qa-btn-gyro-toggle');
  const label = enabled ? '📱 Gyro: ON' : '📱 Gyro: OFF';
  if (gyroBtn) {
    gyroBtn.innerText = label;
    gyroBtn.classList.toggle('active', enabled);
  }
  if (qaGyroBtn) {
    qaGyroBtn.innerText = enabled ? '📱 Gyro: ON' : '📱 Gyro: OFF';
    qaGyroBtn.style.borderColor = enabled ? '#55efc4' : '';
  }
}

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

// Controller Diagnostic Visualizer
export function renderControllerTestModal() {
  if (!padTestModal || !padTestModal.classList.contains('active')) return;

  const targetPadIdx = (padTestSelectedSlot === 'p1') ? p1GamepadIndex : p2GamepadIndex;
  const statusEl = document.getElementById('pad-test-status');
  const dotLeft = document.getElementById('stick-left-dot');
  const dotRight = document.getElementById('stick-right-dot');
  const valLeft = document.getElementById('stick-left-val');
  const valRight = document.getElementById('stick-right-val');

  if (!navigator.getGamepads) return;
  const pads = navigator.getGamepads();
  const gp = (targetPadIdx !== null) ? pads[targetPadIdx] : pads[0];

  if (!gp || !gp.connected) {
    if (statusEl) statusEl.innerText = `No gamepad connected for ${padTestSelectedSlot.toUpperCase()}. Press any button to pair.`;
    if (dotLeft) dotLeft.style.transform = 'translate(0px, 0px)';
    if (dotRight) dotRight.style.transform = 'translate(0px, 0px)';
    return;
  }

  if (statusEl) statusEl.innerText = `Connected: ${gp.id.substring(0, 36)}...`;

  const lx = gp.axes[0] || 0;
  const ly = gp.axes[1] || 0;
  const rx = gp.axes[2] || 0;
  const ry = gp.axes[3] || 0;

  if (dotLeft) dotLeft.style.transform = `translate(${lx * 34}px, ${ly * 34}px)`;
  if (dotRight) dotRight.style.transform = `translate(${rx * 34}px, ${ry * 34}px)`;
  if (valLeft) valLeft.innerText = `X: ${lx.toFixed(2)} | Y: ${ly.toFixed(2)}`;
  if (valRight) valRight.innerText = `X: ${rx.toFixed(2)} | Y: ${ry.toFixed(2)}`;

  // Highlight active buttons
  const buttonsToCheck = [0, 1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15];
  buttonsToCheck.forEach((bIdx) => {
    const el = document.getElementById(`btn-vis-${bIdx}`);
    if (el) {
      const isPressed = gp.buttons[bIdx]?.pressed;
      el.classList.toggle('pressed', !!isPressed);
    }
  });
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

  if (viewportSky) viewportSky.style.background = currentMap.preview.skyGradient;
  if (viewportMountain) {
    viewportMountain.style.background = currentMap.preview.mountainColor;
    viewportMountain.style.clipPath = currentMap.preview.clipPath;
  }

  if (viewportWater) {
    if (currentMap.ocean && (currentMap.ocean.level === undefined || currentMap.ocean.level > -450)) {
      viewportWater.style.display = 'block';
      viewportWater.style.background = currentMap.preview.waterColor || '#1da2b4';
    } else {
      viewportWater.style.display = 'none';
    }
  }

  if (viewportTag) viewportTag.innerText = currentMap.biome;
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
  document.getElementById('resume-btn')?.addEventListener('click', () => handlers.onResumeGame());

  document.getElementById('btn-mode-single').addEventListener('click', () => handlers.onSelectMode('single'));
  document.getElementById('btn-mode-coop').addEventListener('click', () => handlers.onSelectMode('coop'));
  document.getElementById('btn-mode-race').addEventListener('click', () => handlers.onSelectMode('race'));

  document.getElementById('carousel-prev-btn').addEventListener('click', () => handlers.onPrevMap());
  document.getElementById('carousel-next-btn').addEventListener('click', () => handlers.onNextMap());
  cardPrev.addEventListener('click', () => handlers.onPrevMap());
  cardNext.addEventListener('click', () => handlers.onNextMap());

  document.getElementById('btn-confirm-map').addEventListener('click', () => handlers.onConfirmMap());
  document.getElementById('btn-carousel-back').addEventListener('click', () => handlers.onBackToMenu());

  document.getElementById('menu-toggle-btn').addEventListener('click', () => handlers.onBackToMenu());
  document.getElementById('map-select-btn').addEventListener('click', () => handlers.onOpenMapCarousel());
  document.getElementById('reset-btn').addEventListener('click', () => handlers.onResetMatch());
  document.getElementById('invert-btn').addEventListener('click', () => handlers.onToggleInvert());
  document.getElementById('gyro-toggle-btn')?.addEventListener('click', () => handlers.onToggleGyro());

  document.getElementById('btn-rematch').addEventListener('click', () => handlers.onResetMatch());
  document.getElementById('btn-change-map').addEventListener('click', () => handlers.onOpenMapCarousel());
  document.getElementById('btn-back-menu').addEventListener('click', () => handlers.onBackToMenu());

  // Quick Actions Dropdown
  const qaContainer = document.getElementById('quick-actions-container');
  const qaBtn = document.getElementById('quick-actions-btn');
  const qaWaterSlider = document.getElementById('qa-water-slider');
  const qaWaterVal = document.getElementById('qa-water-val');
  const qaVolumeSlider = document.getElementById('qa-volume-slider');
  const qaVolumeVal = document.getElementById('qa-volume-val');

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

  // Volume Slider
  if (qaVolumeSlider) {
    qaVolumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value) / 100;
      if (qaVolumeVal) qaVolumeVal.innerText = `${Math.round(vol * 100)}%`;
      if (handlers.onVolumeChange) handlers.onVolumeChange(vol);
    });
  }

  // Water Slider
  if (qaWaterSlider) {
    qaWaterSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (qaWaterVal) qaWaterVal.innerText = `${Math.round(val)}m`;
      if (handlers.onWaterLevelChange) handlers.onWaterLevelChange(val);
    });
  }

  document.getElementById('qa-water-reset')?.addEventListener('click', () => handlers.onWaterLevelReset());
  document.getElementById('qa-water-drain')?.addEventListener('click', () => {
    handlers.onWaterLevelChange(-500);
    if (qaWaterSlider) qaWaterSlider.value = -300;
    if (qaWaterVal) qaWaterVal.innerText = 'DRAINED';
  });

  document.getElementById('qa-btn-invert')?.addEventListener('click', () => handlers.onToggleInvert());
  document.getElementById('qa-btn-reset')?.addEventListener('click', () => handlers.onResetMatch());
  document.getElementById('qa-btn-reload-maps')?.addEventListener('click', () => handlers.onForceReloadMaps());

  document.getElementById('qa-btn-gyro-toggle')?.addEventListener('click', () => handlers.onToggleGyro());
  document.getElementById('qa-btn-calibrate-gyro')?.addEventListener('click', () => handlers.onCalibrateGyro());

  // Controller Test Diagnostic Handlers
  const openPadTest = () => {
    if (padTestModal) padTestModal.classList.add('active');
  };
  const closePadTest = () => {
    if (padTestModal) padTestModal.classList.remove('active');
  };

  document.getElementById('btn-open-pad-test')?.addEventListener('click', openPadTest);
  document.getElementById('qa-btn-test-pad')?.addEventListener('click', openPadTest);
  document.getElementById('btn-close-pad-test')?.addEventListener('click', closePadTest);

  const testP1Btn = document.getElementById('btn-test-p1');
  const testP2Btn = document.getElementById('btn-test-p2');

  testP1Btn?.addEventListener('click', () => {
    padTestSelectedSlot = 'p1';
    testP1Btn.classList.add('active');
    testP2Btn.classList.remove('active');
  });

  testP2Btn?.addEventListener('click', () => {
    padTestSelectedSlot = 'p2';
    testP2Btn.classList.add('active');
    testP1Btn.classList.remove('active');
  });

  // Rumble Test
  document.getElementById('btn-rumble-test')?.addEventListener('click', () => {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const idx = (padTestSelectedSlot === 'p1') ? p1GamepadIndex : p2GamepadIndex;
    const gp = (idx !== null) ? pads[idx] : pads[0];
    if (gp && gp.vibrationActuator) {
      gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 500,
        weakMagnitude: 0.8,
        strongMagnitude: 1.0
      }).catch(() => {});
    }
  });
}
