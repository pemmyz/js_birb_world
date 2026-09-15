// --- src/input.js ---
// Multi-input Tracker: Gamepad, Gyroscope + Calibration, Dual Virtual Joysticks, Keyboard & Mouse

import { playRingChime } from './audio.js';

export let p1GamepadIndex = null;
export let p2GamepadIndex = null;

// Keyboard input tracker
export const keys = {
  ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false,
  w: false, a: false, s: false, d: false,
  W: false, A: false, S: false, D: false,
  Enter: false, Escape: false, ' ': false
};

window.addEventListener('keydown', (e) => {
  if (keys[e.key] !== undefined) keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  if (keys[e.key] !== undefined) keys[e.key] = false;
});

// Mouse input tracker for Player 1
export let mouseP1Active = false;
export const mouseP1 = { x: 0, y: 0 };

export function initMouseInput(getGameMode) {
  window.addEventListener('mousemove', (e) => {
    if (p1GamepadIndex === null && !VirtualJoystick.isActive('p1') && !gyroState.enabled) {
      const mode = getGameMode();
      const maxX = (mode === 'race' || mode === 'coop') ? window.innerWidth * 0.5 : window.innerWidth;
      if (e.clientX <= maxX) {
        mouseP1Active = true;
        mouseP1.x = (e.clientX / maxX) * 2 - 1;
        mouseP1.y = (e.clientY / window.innerHeight) * 2 - 1;
      }
    }
  });
}

// --- GYROSCOPE & SENSOR CALIBRATION ENGINE ---
export const gyroState = {
  supported: false,
  enabled: false,
  calibrating: false,
  neutralPitch: 40.0, // default comfortable hand-held tilt in degrees
  neutralRoll: 0.0,
  currentPitch: 40.0,
  currentRoll: 0.0,
  steer: { x: 0, y: 0 }
};

export async function requestGyroPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      return response === 'granted';
    } catch (e) {
      return false;
    }
  }
  return true;
}

export function initGyroscope() {
  if (!window.DeviceOrientationEvent) return;

  window.addEventListener('deviceorientation', (e) => {
    gyroState.supported = true;
    if (e.beta === null || e.gamma === null) return;

    gyroState.currentPitch = e.beta;
    gyroState.currentRoll = e.gamma;

    if (!gyroState.enabled) return;

    // Calculate delta relative to calibrated neutral holding angle
    const deltaRoll = gyroState.currentRoll - gyroState.neutralRoll;
    const deltaPitch = gyroState.currentPitch - gyroState.neutralPitch;

    // Sensitivity normalization: +/- 25 degrees tilt maps to full [-1, 1] range
    const SENS_ROLL = 24.0;
    const SENS_PITCH = 24.0;

    let sx = THREE.MathUtils.clamp(deltaRoll / SENS_ROLL, -1.0, 1.0);
    let sy = THREE.MathUtils.clamp(-deltaPitch / SENS_PITCH, -1.0, 1.0);

    // Apply tiny deadzone to eliminate hand tremor
    if (Math.abs(sx) < 0.04) sx = 0;
    if (Math.abs(sy) < 0.04) sy = 0;

    gyroState.steer.x = sx;
    gyroState.steer.y = sy;

    // Sync gyro to physical virtual joystick thumb
    VirtualJoystick.setThumbFromExternal(sx, -sy);
  });
}

export function calibrateGyroscope(onProgress, onComplete) {
  gyroState.calibrating = true;
  const samples = [];
  const startTime = performance.now();
  const DURATION = 1400; // 1.4 seconds of still calibration

  function sampleStep() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1.0, elapsed / DURATION);
    samples.push({ pitch: gyroState.currentPitch, roll: gyroState.currentRoll });

    if (onProgress) onProgress(progress);

    if (progress < 1.0) {
      requestAnimationFrame(sampleStep);
    } else {
      const avgPitch = samples.reduce((acc, s) => acc + s.pitch, 0) / samples.length;
      const avgRoll = samples.reduce((acc, s) => acc + s.roll, 0) / samples.length;
      gyroState.neutralPitch = avgPitch;
      gyroState.neutralRoll = avgRoll;
      gyroState.calibrating = false;
      gyroState.enabled = true;
      if (onComplete) onComplete({ pitch: avgPitch, roll: avgRoll });
    }
  }

  requestAnimationFrame(sampleStep);
}

// --- VIRTUAL JOYSTICKS (P1 LEFT & P2 RIGHT) ---
export const VirtualJoystick = (function () {
  let p1JoyEl = null;
  let p1ThumbEl = null;
  let p2JoyEl = null;
  let p2ThumbEl = null;

  let maxRadius = 55;
  let modeGetter = () => 'single';

  const dockedState = {
    p1: false,
    p2: false
  };

  const pointers = {
    p1: { id: null, startX: 0, startY: 0, vector: { x: 0, y: 0 } },
    p2: { id: null, startX: 0, startY: 0, vector: { x: 0, y: 0 } }
  };

  function init(options = {}) {
    p1JoyEl = document.getElementById('virtual-joystick');
    if (p1JoyEl) p1ThumbEl = p1JoyEl.querySelector('.joystick-thumb');

    p2JoyEl = document.getElementById('virtual-joystick-p2');
    if (p2JoyEl) p2ThumbEl = p2JoyEl.querySelector('.joystick-thumb');

    if (options.maxRadius) maxRadius = options.maxRadius;
    if (options.getGameMode) modeGetter = options.getGameMode;

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function syncDocking(p1HasPad, p2HasPad, mode) {
    dockedState.p1 = !!p1HasPad || gyroState.enabled;
    dockedState.p2 = !!p2HasPad;

    // P1 Joystick Docking
    if (p1JoyEl) {
      if (dockedState.p1) {
        if (!p1JoyEl.classList.contains('anchored-left')) {
          p1JoyEl.style.left = '';
          p1JoyEl.style.top = '';
          p1JoyEl.style.right = '';
          p1JoyEl.style.bottom = '';
          p1JoyEl.classList.add('anchored-left', 'active');
        }
        p1JoyEl.style.display = 'block';
      } else {
        if (p1JoyEl.classList.contains('anchored-left')) {
          p1JoyEl.classList.remove('anchored-left');
          if (pointers.p1.id === null) {
            p1JoyEl.classList.remove('active');
          }
        }
        p1JoyEl.style.display = 'block';
      }
    }

    // P2 Joystick Docking
    if (p2JoyEl) {
      if (mode === 'single') {
        p2JoyEl.classList.remove('anchored-right', 'active');
        p2JoyEl.style.display = 'none';
        return;
      }
      p2JoyEl.style.display = 'block';
      if (dockedState.p2) {
        if (!p2JoyEl.classList.contains('anchored-right')) {
          p2JoyEl.style.left = '';
          p2JoyEl.style.top = '';
          p2JoyEl.style.right = '';
          p2JoyEl.style.bottom = '';
          p2JoyEl.classList.add('anchored-right', 'active');
        }
      } else {
        if (p2JoyEl.classList.contains('anchored-right')) {
          p2JoyEl.classList.remove('anchored-right');
          if (pointers.p2.id === null) {
            p2JoyEl.classList.remove('active');
          }
        }
      }
    }
  }

  function hideAll() {
    if (p1JoyEl) {
      p1JoyEl.classList.remove('active', 'anchored-left');
      p1JoyEl.style.display = 'none';
    }
    if (p2JoyEl) {
      p2JoyEl.classList.remove('active', 'anchored-right');
      p2JoyEl.style.display = 'none';
    }
    resetThumb('p1');
    resetThumb('p2');
  }

  function setThumb(player, normX, normY) {
    if (pointers[player].id !== null) return;
    const thumbEl = (player === 'p1') ? p1ThumbEl : p2ThumbEl;
    if (!thumbEl) return;
    const px = THREE.MathUtils.clamp(normX, -1, 1) * maxRadius * 0.75;
    const py = THREE.MathUtils.clamp(normY, -1, 1) * maxRadius * 0.75;
    thumbEl.style.transform = `translate(${px}px, ${py}px)`;
  }

  function resetThumb(player) {
    const thumbEl = (player === 'p1') ? p1ThumbEl : p2ThumbEl;
    if (thumbEl) thumbEl.style.transform = 'translate(0px, 0px)';
    pointers[player].vector.x = 0;
    pointers[player].vector.y = 0;
  }

  function setAnchorCorner(anchored) {
    if (p1JoyEl) {
      if (anchored) {
        p1JoyEl.classList.add('anchored-left', 'active');
      } else if (!dockedState.p1) {
        p1JoyEl.classList.remove('anchored-left');
        if (pointers.p1.id === null) p1JoyEl.classList.remove('active');
      }
    }
  }

  function setThumbFromExternal(normX, normY) {
    setThumb('p1', normX, normY);
  }

  function onPointerDown(e) {
    if (e.target && e.target.closest('button, select, input, textarea, a, .no-joystick')) return;
    const mode = modeGetter();
    const isP2Side = (mode === 'race' || mode === 'coop') && (e.clientX > window.innerWidth * 0.5);
    const player = isP2Side ? 'p2' : 'p1';

    if (pointers[player].id !== null) return;
    pointers[player].id = e.pointerId;

    const joyEl = (player === 'p1') ? p1JoyEl : p2JoyEl;
    const thumbEl = (player === 'p1') ? p1ThumbEl : p2ThumbEl;
    const isDocked = dockedState[player];

    if (joyEl) {
      if (isDocked) {
        const rect = joyEl.getBoundingClientRect();
        pointers[player].startX = rect.left + rect.width / 2;
        pointers[player].startY = rect.top + rect.height / 2;
      } else {
        // Floating touch joystick: appear wherever touched
        pointers[player].startX = e.clientX;
        pointers[player].startY = e.clientY;
        joyEl.style.left = `${e.clientX}px`;
        joyEl.style.top = `${e.clientY}px`;
        joyEl.style.right = 'auto';
        joyEl.style.bottom = 'auto';
        joyEl.classList.add('active');
      }
    }

    if (thumbEl) thumbEl.style.transform = 'translate(0px, 0px)';
    pointers[player].vector.x = 0;
    pointers[player].vector.y = 0;
  }

  function onPointerMove(e) {
    ['p1', 'p2'].forEach((player) => {
      if (pointers[player].id === e.pointerId) {
        updateFromPointer(player, e.clientX, e.clientY);
      }
    });
  }

  function updateFromPointer(player, clientX, clientY) {
    const deltaX = clientX - pointers[player].startX;
    const deltaY = clientY - pointers[player].startY;
    const distance = Math.hypot(deltaX, deltaY);
    const thumbEl = (player === 'p1') ? p1ThumbEl : p2ThumbEl;

    if (distance === 0) {
      pointers[player].vector.x = 0;
      pointers[player].vector.y = 0;
      if (thumbEl) thumbEl.style.transform = 'translate(0px, 0px)';
      return;
    }

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(deltaY, deltaX);
    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    if (thumbEl) thumbEl.style.transform = `translate(${thumbX}px, ${thumbY}px)`;
    pointers[player].vector.x = thumbX / maxRadius;
    pointers[player].vector.y = deltaY / maxRadius;
  }

  function onPointerUp(e) {
    ['p1', 'p2'].forEach((player) => {
      if (pointers[player].id === e.pointerId) {
        pointers[player].id = null;
        resetThumb(player);
        const joyEl = (player === 'p1') ? p1JoyEl : p2JoyEl;
        // If not docked to gamepad, hide floating joystick on release
        if (joyEl && !dockedState[player]) {
          joyEl.classList.remove('active');
        }
      }
    });
  }

  return {
    init,
    syncDocking,
    hideAll,
    setThumb,
    setAnchorCorner,
    setThumbFromExternal,
    getVector: (player = 'p1') => pointers[player].vector,
    isActive: (player = 'p1') => pointers[player].id !== null
  };
})();

// Mobile On-Screen D-Pad
export function initMobileControls() {
  const bindTouch = (elId, key) => {
    const el = document.getElementById(elId);
    if (!el) return;
    const press = (e) => { if (e.cancelable) e.preventDefault(); keys[key] = true; };
    const release = (e) => { if (e.cancelable) e.preventDefault(); keys[key] = false; };
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('mouseleave', release);
  };
  bindTouch('mobile-left', 'ArrowLeft');
  bindTouch('mobile-right', 'ArrowRight');
  bindTouch('mobile-up', 'ArrowUp');
  bindTouch('mobile-down', 'ArrowDown');
}

// Gamepad polling and button pairing
export function pollGamepads(onPairCallback, mode = 'single') {
  if (!navigator.getGamepads) return { p1: { x: 0, y: 0, active: false }, p2: { x: 0, y: 0, active: false } };
  const gamepads = navigator.getGamepads();

  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (!gp || !gp.connected) continue;

    const abxyPressed = (gp.buttons[0]?.pressed) || (gp.buttons[1]?.pressed) ||
                        (gp.buttons[2]?.pressed) || (gp.buttons[3]?.pressed);

    if (abxyPressed) {
      if (p1GamepadIndex === null && p2GamepadIndex !== i) {
        p1GamepadIndex = i;
        playRingChime(1.2);
        if (onPairCallback) onPairCallback();
      } else if (p2GamepadIndex === null && p1GamepadIndex !== i) {
        p2GamepadIndex = i;
        playRingChime(1.5);
        if (onPairCallback) onPairCallback();
      }
    }
  }

  function readStickAxes(gp, axisXIdx, axisYIdx, btnL, btnR, btnU, btnD) {
    if (!gp || !gp.connected) return { x: 0, y: 0, active: false };
    let lx = gp.axes[axisXIdx] || 0;
    let ly = gp.axes[axisYIdx] || 0;
    const DEADZONE = 0.18;
    if (Math.abs(lx) < DEADZONE) lx = 0;
    if (Math.abs(ly) < DEADZONE) ly = 0;

    if (btnL && gp.buttons[btnL]?.pressed) lx = -1.0;
    if (btnR && gp.buttons[btnR]?.pressed) lx = 1.0;
    if (btnU && gp.buttons[btnU]?.pressed) ly = -1.0;
    if (btnD && gp.buttons[btnD]?.pressed) ly = 1.0;

    return { x: lx, y: ly, active: (Math.abs(lx) > 0 || Math.abs(ly) > 0) };
  }

  // Only read stick if pad has been explicitly paired
  const p1Gp = (p1GamepadIndex !== null) ? gamepads[p1GamepadIndex] : null;
  const p1Stick = p1Gp ? readStickAxes(p1Gp, 0, 1, 14, 15, 12, 13) : { x: 0, y: 0, active: false };

  let p2Stick = { x: 0, y: 0, active: false };
  if (p2GamepadIndex !== null && p2GamepadIndex !== p1GamepadIndex && gamepads[p2GamepadIndex]) {
    p2Stick = readStickAxes(gamepads[p2GamepadIndex], 0, 1, 14, 15, 12, 13);
  } else if (p1Gp && mode === 'coop') {
    // In co-op, right stick (axes 2 & 3) of paired P1 gamepad controls P2
    p2Stick = readStickAxes(p1Gp, 2, 3);
  }

  return { p1: p1Stick, p2: p2Stick };
}

let carouselCooldown = 0;
export function pollCarouselInput(delta) {
  if (carouselCooldown > 0) {
    carouselCooldown -= delta;
    return null;
  }

  const result = { prev: false, next: false, confirm: false, back: false };

  if (keys.ArrowLeft || keys.a || keys.A) result.prev = true;
  if (keys.ArrowRight || keys.d || keys.D) result.next = true;
  if (keys.Enter || keys[' ']) result.confirm = true;
  if (keys.Escape) result.back = true;

  if (navigator.getGamepads) {
    const gamepads = navigator.getGamepads();
    const gp = (p1GamepadIndex !== null) ? gamepads[p1GamepadIndex] : gamepads[0];
    if (gp && gp.connected) {
      const lx = gp.axes[0] || 0;
      if (lx < -0.45 || gp.buttons[14]?.pressed) result.prev = true;
      if (lx > 0.45 || gp.buttons[15]?.pressed) result.next = true;
      if (gp.buttons[0]?.pressed) result.confirm = true;
      if (gp.buttons[1]?.pressed) result.back = true;
    }
  }

  if (result.prev || result.next || result.confirm || result.back) {
    carouselCooldown = 0.22;
    return result;
  }
  return null;
}

window.addEventListener('gamepaddisconnected', (e) => {
  if (p1GamepadIndex === e.gamepad.index) p1GamepadIndex = null;
  if (p2GamepadIndex === e.gamepad.index) p2GamepadIndex = null;
});
