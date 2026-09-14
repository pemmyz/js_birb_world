// --- src/main.js ---
// Main Game Engine Controller, Visibility State Handler & Flight Orchestrator

import * as Audio from './audio.js';
import * as Input from './input.js';
import { createPlayerGlider } from './glider.js';
import { createPlayerState, formatTime, updatePlayerPhysics, updatePlayerCamera } from './flight.js';
import * as World from './world.js';
import * as UI from './ui.js';
import { getMapByIndex, getTotalMaps } from './maps/mapRegistry.js';

// --- Game Engine State ---
let currentGameState = 'menu'; // 'menu' | 'map-select' | 'flight'
let isGamePaused = false;
let autoPauseEnabled = true;
let selectedMode = 'single';
let currentMapIndex = 0;
let invertPitch = false;
let raceActive = false;
let raceStartTime = 0;
let racePausedAccumulated = 0;
let pauseTimestamp = 0;
let raceWinner = null;

// Real-time FPS Calculation
let fpsFrames = 0;
let fpsLastTime = performance.now();
let currentFps = 60;

// Three.js Scene Setup
const container = document.getElementById('canvas-container');
World.initWorld(container);

// Player Glider Mesh Creation
const gliderP1 = createPlayerGlider(
  [0xdc3545, 0xe67e22, 0xf4d03f, 0x2ecc71, 0x1b7a3e],
  0x2e7d32,
  0xf1c40f,
  World.scene
);

const gliderP2 = createPlayerGlider(
  [0x8e44ad, 0x9b59b6, 0x3498db, 0x00bcd4, 0xe74c3c],
  0x1976d2,
  0xe67e22,
  World.scene
);

// Player Physics States
const p1 = createPlayerState();
const p2 = createPlayerState();

// Initialize Inputs & Sensors
Input.initMouseInput(() => selectedMode);
Input.VirtualJoystick.init({ maxRadius: 65, getGameMode: () => selectedMode });
Input.initMobileControls();
Input.initGyroscope();

// --- PAUSE & RESUME LOGIC (Background / Inactive tab handler) ---
function pauseGame() {
  if (!autoPauseEnabled || isGamePaused || currentGameState !== 'flight') return;
  isGamePaused = true;
  pauseTimestamp = performance.now();
  Audio.pauseAudio();
  UI.showPauseOverlay(true);
}

function resumeGame() {
  if (!isGamePaused) return;
  isGamePaused = false;
  if (pauseTimestamp > 0) {
    racePausedAccumulated += (performance.now() - pauseTimestamp);
    pauseTimestamp = 0;
  }
  Audio.resumeAudio();
  UI.showPauseOverlay(false);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (autoPauseEnabled) pauseGame();
  }
});

window.addEventListener('blur', () => {
  if (currentGameState === 'flight' && autoPauseEnabled) {
    pauseGame();
  }
});

// --- Carousel & Navigation Logic ---
function refreshCarouselUI() {
  const current = getMapByIndex(currentMapIndex);
  const prev = getMapByIndex(currentMapIndex - 1);
  const next = getMapByIndex(currentMapIndex + 1);
  UI.updateCarouselCard(current, prev, next);
}

function nextMap() {
  currentMapIndex = (currentMapIndex + 1) % getTotalMaps();
  Audio.playCarouselTick(1);
  refreshCarouselUI();
}

function prevMap() {
  currentMapIndex = (currentMapIndex - 1 + getTotalMaps()) % getTotalMaps();
  Audio.playCarouselTick(-1);
  refreshCarouselUI();
}

function launchFlight() {
  Audio.playConfirmBeep();
  Audio.startWind();
  currentGameState = 'flight';
  isGamePaused = false;
  UI.showPauseOverlay(false);
  document.body.className = `mode-${selectedMode}`;

  const activeMap = getMapByIndex(currentMapIndex);
  World.loadMap(activeMap);

  if (activeMap.id === '05_dunes') {
    World.setWaterLevel(-500);
    UI.syncWaterLevelUI(-500);
  } else {
    UI.syncWaterLevelUI(World.getWaterLevel());
  }

  resetFlightMatch();
}

function resetFlightMatch() {
  const activeMap = getMapByIndex(currentMapIndex);

  p1.pos.set(
    (selectedMode === 'race' || selectedMode === 'coop') ? -8 : 0,
    activeMap.spawns.p1.pos[1],
    activeMap.spawns.p1.pos[2]
  );
  p1.yaw = activeMap.spawns.p1.yaw || 0.0;
  p1.pitch = 0.0;
  p1.roll = 0.0;
  p1.steerX = 0;
  p1.steerPitch = 0;
  p1.gatesCleared = 0;
  p1.currentRingIndex = 0;
  p1.reverseOrder = false;
  p1.score = 0;
  p1.finishTime = null;
  p1.intro.active = true;
  p1.intro.elapsed = 0.0;

  if (selectedMode === 'coop') {
    const totalG = activeMap.waypoints.length;
    const lastGate = activeMap.waypoints[totalG - 1];
    const prevGate = activeMap.waypoints[totalG - 2];
    const reverseApproach = new THREE.Vector3().subVectors(prevGate, lastGate).normalize();

    p2.pos.copy(lastGate).sub(reverseApproach.clone().multiplyScalar(70));
    p2.pos.y = activeMap.spawns.p1.pos[1] + 10;
    p2.yaw = Math.atan2(-(lastGate.x - p2.pos.x), -(lastGate.z - p2.pos.z));
    p2.pitch = 0.0;
    p2.roll = 0.0;
    p2.steerX = 0;
    p2.steerPitch = 0;
    p2.gatesCleared = 0;
    p2.currentRingIndex = totalG - 1;
    p2.reverseOrder = true;
    p2.score = 0;
    p2.finishTime = null;
    p2.intro.active = true;
    p2.intro.elapsed = 0.0;
  } else {
    p2.pos.set(8, activeMap.spawns.p1.pos[1], activeMap.spawns.p1.pos[2]);
    p2.yaw = activeMap.spawns.p2Race.yaw || 0.0;
    p2.pitch = 0.0;
    p2.roll = 0.0;
    p2.steerX = 0;
    p2.steerPitch = 0;
    p2.gatesCleared = 0;
    p2.currentRingIndex = 0;
    p2.reverseOrder = false;
    p2.score = 0;
    p2.finishTime = null;
    p2.intro.active = true;
    p2.intro.elapsed = 0.0;
  }

  if (selectedMode === 'single') {
    gliderP2.setVisible(false);
  } else {
    gliderP2.setVisible(true);
  }

  raceActive = true;
  raceStartTime = performance.now();
  racePausedAccumulated = 0;
  pauseTimestamp = 0;
  raceWinner = null;

  document.getElementById('p1-winner-banner').classList.remove('show');
  document.getElementById('p2-winner-banner').classList.remove('show');
  document.getElementById('race-finish-modal').classList.remove('active');
}

// Setup Handlers with UI
UI.setupUIEventListeners({
  onResumeGame: resumeGame,
  onSelectMode: (mode) => {
    selectedMode = mode;
    currentGameState = 'map-select';
    Audio.playRingChime(1.1);
    const labels = { single: '1 Player (Solo)', coop: '2P Reverse Co-Op', race: '2P Competition Race' };
    UI.showMapCarousel(labels[mode]);
    refreshCarouselUI();
  },
  onPrevMap: prevMap,
  onNextMap: nextMap,
  onConfirmMap: launchFlight,
  onBackToMenu: () => {
    Audio.stopWind();
    currentGameState = 'menu';
    isGamePaused = false;
    UI.showPauseOverlay(false);
    UI.showModeMenu();
  },
  onOpenMapCarousel: () => {
    Audio.stopWind();
    currentGameState = 'map-select';
    isGamePaused = false;
    UI.showPauseOverlay(false);
    const labels = { single: '1 Player (Solo)', coop: '2P Reverse Co-Op', race: '2P Competition Race' };
    UI.showMapCarousel(labels[selectedMode]);
    refreshCarouselUI();
  },
  onResetMatch: () => resetFlightMatch(),
  onToggleInvert: () => {
    invertPitch = !invertPitch;
    const invBtn = document.getElementById('invert-btn');
    if (invBtn) {
      invBtn.classList.toggle('active', invertPitch);
      invBtn.innerText = invertPitch ? '↕ Invert: ON' : '↕ Invert: OFF';
    }
  },
  onWaterLevelChange: (newLevel) => {
    World.setWaterLevel(newLevel);
  },
  onWaterLevelReset: () => {
    const activeMap = getMapByIndex(currentMapIndex);
    const defaultLevel = (activeMap.id === '05_dunes')
      ? -500
      : ((activeMap.ocean && activeMap.ocean.level !== undefined)
          ? activeMap.ocean.level
          : (activeMap.ocean ? 0 : -500));
    World.setWaterLevel(defaultLevel);
    UI.syncWaterLevelUI(defaultLevel);
  },
  onVolumeChange: (vol) => {
    Audio.setMasterVolume(vol);
  },
  onForceReloadMaps: () => {
    const activeMap = getMapByIndex(currentMapIndex);
    World.loadMap(activeMap);
    UI.syncWaterLevelUI(World.getWaterLevel());
    Audio.playConfirmBeep();
    resetFlightMatch();
  },
  onToggleAutoPause: () => {
    autoPauseEnabled = !autoPauseEnabled;
    UI.updateAutoPauseUI(autoPauseEnabled);
    if (!autoPauseEnabled && isGamePaused) {
      resumeGame();
    }
  },
  onToggleGyro: async () => {
    const granted = await Input.requestGyroPermission();
    if (granted) {
      Input.gyroState.enabled = !Input.gyroState.enabled;
      Input.VirtualJoystick.setAnchorCorner(Input.gyroState.enabled);
      UI.updateGyroUI(Input.gyroState.enabled);
    }
  },
  onCalibrateGyro: async () => {
    const granted = await Input.requestGyroPermission();
    if (!granted) return;
    UI.showGyroCalibration(true);
    Input.calibrateGyroscope(
      (progress) => UI.updateGyroCalibrationProgress(progress),
      () => {
        setTimeout(() => {
          UI.showGyroCalibration(false);
          Input.VirtualJoystick.setAnchorCorner(true);
          UI.updateGyroUI(true);
          Audio.playRingChime(1.4);
        }, 300);
      }
    );
  }
});

// Fullscreen button
const fsBtn = document.getElementById('fullscreen-btn');
if (fsBtn) {
  fsBtn.addEventListener('click', () => {
    const doc = document;
    const docEl = doc.documentElement;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    }
  });

  const updateFsLabel = () => {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    fsBtn.innerHTML = isFs ? '✕ Exit Full' : '⛶ Fullscreen';
  };
  document.addEventListener('fullscreenchange', updateFsLabel);
  document.addEventListener('webkitfullscreenchange', updateFsLabel);
}

// Checkpoint & Finish Handlers
function onGateCleared(playerId) {
  UI.triggerRingPopup(playerId);
}

function onFinish(playerId) {
  const activeMap = getMapByIndex(currentMapIndex);
  const p = playerId === 'p1' ? p1 : p2;
  const currentDuration = ((performance.now() - raceStartTime) - racePausedAccumulated) / 1000;
  p.finishTime = currentDuration;

  if (selectedMode === 'race') {
    if (!raceWinner) {
      raceWinner = playerId;
      UI.showWinnerBanner(playerId);
      Audio.playWinFanfare();
      setTimeout(() => {
        UI.showFinishModal(
          `${playerId === 'p1' ? 'PLAYER 1 (EMERALD)' : 'PLAYER 2 (SAPPHIRE)'} WINS!`,
          `Fastest run through ${activeMap.name}!`,
          formatTime(p1.finishTime || currentDuration),
          formatTime(p2.finishTime || currentDuration)
        );
      }, 1200);
    }
  } else if (selectedMode === 'coop') {
    Audio.playWinFanfare();
    setTimeout(() => {
      UI.showFinishModal(
        'CO-OP MISSION COMPLETE! 🎉',
        `Both pilots converged and conquered ${activeMap.name}!`,
        formatTime(p1.finishTime || currentDuration),
        formatTime(p2.finishTime || currentDuration)
      );
    }, 1200);
  } else {
    Audio.playWinFanfare();
    setTimeout(() => {
      UI.showFinishModal(
        'SOLO RUN COMPLETE! 🪂',
        `All vortex gates cleared on ${activeMap.name}!`,
        formatTime(p1.finishTime),
        '--:--.-'
      );
    }, 1200);
  }
}

// Main Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const t = clock.getElapsedTime();

  // Smooth FPS sampling (calculated every 250ms)
  fpsFrames++;
  const now = performance.now();
  if (now - fpsLastTime >= 250) {
    currentFps = Math.round((fpsFrames * 1000) / (now - fpsLastTime));
    fpsFrames = 0;
    fpsLastTime = now;
  }

  // Poll Gamepads for ABXY pairing & controller tester
  const gpInputs = Input.pollGamepads(() => UI.updateControllerUI());
  UI.renderControllerTestModal();

  // Carousel Gamepad / Keyboard Navigation
  if (currentGameState === 'map-select') {
    const nav = Input.pollCarouselInput(delta);
    if (nav) {
      if (nav.prev) prevMap();
      if (nav.next) nextMap();
      if (nav.confirm) launchFlight();
      if (nav.back) {
        Audio.stopWind();
        currentGameState = 'menu';
        UI.showModeMenu();
      }
    }
    return;
  }

  if (currentGameState !== 'flight' || isGamePaused) return;

  // Steering Input Hierarchy (Pad > Gyro > Touch Stick > Keys > Mouse)
  const steerP1 = { x: 0, y: 0 };
  const hasArrowKeys = Input.keys.ArrowLeft || Input.keys.ArrowRight || Input.keys.ArrowUp || Input.keys.ArrowDown;
  const hasSoloWasd = (selectedMode === 'single') && (Input.keys.a || Input.keys.A || Input.keys.d || Input.keys.D || Input.keys.w || Input.keys.W || Input.keys.s || Input.keys.S);

  if (gpInputs.p1.active) {
    steerP1.x = gpInputs.p1.x;
    steerP1.y = -gpInputs.p1.y * 1.25;
  } else if (Input.VirtualJoystick.isActive()) {
    const joy = Input.VirtualJoystick.getVector();
    steerP1.x = joy.x;
    steerP1.y = -joy.y * 1.35;
  } else if (Input.gyroState.enabled) {
    steerP1.x = Input.gyroState.steer.x;
    steerP1.y = Input.gyroState.steer.y;
  } else if (hasArrowKeys) {
    if (Input.keys.ArrowLeft) steerP1.x -= 1.0;
    if (Input.keys.ArrowRight) steerP1.x += 1.0;
    if (Input.keys.ArrowUp) steerP1.y += 1.0;
    if (Input.keys.ArrowDown) steerP1.y -= 1.0;
  } else if (hasSoloWasd) {
    if (Input.keys.a || Input.keys.A) steerP1.x -= 1.0;
    if (Input.keys.d || Input.keys.D) steerP1.x += 1.0;
    if (Input.keys.w || Input.keys.W) steerP1.y += 1.0;
    if (Input.keys.s || Input.keys.S) steerP1.y -= 1.0;
  } else if (Input.mouseP1Active) {
    steerP1.x = Input.mouseP1.x;
    steerP1.y = -Input.mouseP1.y;
  }

  const steerP2 = { x: 0, y: 0 };
  if (selectedMode === 'race' || selectedMode === 'coop') {
    if (gpInputs.p2.active) {
      steerP2.x = gpInputs.p2.x;
      steerP2.y = -gpInputs.p2.y * 1.25;
    } else {
      if (Input.keys.a || Input.keys.A) steerP2.x -= 1.0;
      if (Input.keys.d || Input.keys.D) steerP2.x += 1.0;
      if (Input.keys.w || Input.keys.W) steerP2.y += 1.0;
      if (Input.keys.s || Input.keys.S) steerP2.y -= 1.0;
    }
  }

  // Aerodynamics & Kinematics Step
  const spdP1 = updatePlayerPhysics(p1, gliderP1, steerP1, 'p1', delta, t, invertPitch, World.vortexRings, onGateCleared, onFinish);
  let spdP2 = 0;
  if (selectedMode === 'race' || selectedMode === 'coop') {
    spdP2 = updatePlayerPhysics(p2, gliderP2, steerP2, 'p2', delta, t, invertPitch, World.vortexRings, onGateCleared, onFinish);
  }

  const activeAirspeed = (selectedMode === 'race' || selectedMode === 'coop')
    ? Math.max(spdP1, spdP2)
    : spdP1;
  Audio.updateWind(activeAirspeed, delta);

  World.updateWorld(delta, t);

  updatePlayerCamera(World.camera1, p1, delta);
  if (selectedMode === 'race' || selectedMode === 'coop') {
    updatePlayerCamera(World.camera2, p2, delta);
  }

  // Telemetry Readouts
  const elapsed = (raceStartTime > 0) ? ((performance.now() - raceStartTime) - racePausedAccumulated) / 1000 : 0;
  const timeP1Formatted = formatTime(p1.finishTime !== null ? p1.finishTime : elapsed);
  const timeP2Formatted = formatTime(p2.finishTime !== null ? p2.finishTime : elapsed);

  const activeMap = getMapByIndex(currentMapIndex);
  const totalGates = activeMap.waypoints.length;
  const distP1 = World.vortexRings[p1.currentRingIndex] ? Math.round(p1.pos.distanceTo(World.vortexRings[p1.currentRingIndex].pos)) : 0;
  const distP2 = World.vortexRings[p2.currentRingIndex] ? Math.round(p2.pos.distanceTo(World.vortexRings[p2.currentRingIndex].pos)) : 0;

  UI.updateTelemetry(p1, p2, spdP1, spdP2, totalGates, selectedMode, timeP1Formatted, timeP2Formatted, distP1, distP2, currentFps);

  // Viewport Rendering
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (selectedMode === 'race' || selectedMode === 'coop') {
    const halfWidth = Math.floor(width * 0.5);
    World.renderer.setScissorTest(true);

    World.renderer.setViewport(0, 0, halfWidth, height);
    World.renderer.setScissor(0, 0, halfWidth, height);
    World.camera1.aspect = halfWidth / height;
    World.camera1.updateProjectionMatrix();
    World.renderer.render(World.scene, World.camera1);

    World.renderer.setViewport(halfWidth, 0, width - halfWidth, height);
    World.renderer.setScissor(halfWidth, 0, width - halfWidth, height);
    World.camera2.aspect = (width - halfWidth) / height;
    World.camera2.updateProjectionMatrix();
    World.renderer.render(World.scene, World.camera2);
  } else {
    World.renderer.setScissorTest(false);
    World.renderer.setViewport(0, 0, width, height);
    World.camera1.aspect = width / height;
    World.camera1.updateProjectionMatrix();
    World.renderer.render(World.scene, World.camera1);
  }
}

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  World.renderer.setSize(width, height);

  if (selectedMode === 'race' || selectedMode === 'coop') {
    const halfWidth = width * 0.5;
    World.camera1.aspect = halfWidth / height;
    World.camera1.updateProjectionMatrix();
    World.camera2.aspect = halfWidth / height;
    World.camera2.updateProjectionMatrix();
  } else {
    World.camera1.aspect = width / height;
    World.camera1.updateProjectionMatrix();
  }
});

UI.showModeMenu();
animate();
