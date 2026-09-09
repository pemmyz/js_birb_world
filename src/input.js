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
    if (p1GamepadIndex === null && !VirtualJoystick.isActive()) {
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

// Floating Virtual Joystick
export const VirtualJoystick = (function () {
  let activePointerId = null;
  let startX = 0;
  let startY = 0;
  let maxRadius = 65;
  const vector = { x: 0, y: 0 };
  let joystickEl = null;
  let thumbEl = null;
  let modeGetter = () => 'single';

  function init(options = {}) {
    joystickEl = document.getElementById(options.joystickId || 'virtual-joystick');
    if (joystickEl) thumbEl = joystickEl.querySelector('.joystick-thumb');
    if (options.maxRadius) maxRadius = options.maxRadius;
    if (options.getGameMode) modeGetter = options.getGameMode;

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerDown(e) {
    if (activePointerId !== null) return;
    if (e.target && e.target.closest('button, select, input, textarea, a, .no-joystick')) return;
    if (p1GamepadIndex !== null) return;
    const mode = modeGetter();
    if ((mode === 'race' || mode === 'coop') && e.clientX > window.innerWidth * 0.5) return;

    activePointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;

    if (joystickEl) {
      joystickEl.style.left = `${startX}px`;
      joystickEl.style.top = `${startY}px`;
      joystickEl.classList.add('active');
    }
    if (thumbEl) thumbEl.style.transform = 'translate(0px, 0px)';
    vector.x = 0;
    vector.y = 0;
  }

  function onPointerMove(e) {
    if (activePointerId === null || e.pointerId !== activePointerId) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance === 0) {
      vector.x = 0;
      vector.y = 0;
      if (thumbEl) thumbEl.style.transform = 'translate(0px, 0px)';
      return;
    }

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(deltaY, deltaX);
    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    if (thumbEl) thumbEl.style.transform = `translate(${thumbX}px, ${thumbY}px)`;
    const strength = clampedDist / maxRadius;
    vector.x = Math.cos(angle) * strength;
    vector.y = deltaY / maxRadius;
  }

  function onPointerUp(e) {
    if (activePointerId === null || e.pointerId !== activePointerId) return;
    activePointerId = null;
    vector.x = 0;
    vector.y = 0;
    if (joystickEl) joystickEl.classList.remove('active');
    if (thumbEl) thumbEl.style.transform = 'translate(0px, 0px)';
  }

  return {
    init,
    getVector: () => vector,
    isActive: () => activePointerId !== null
  };
})();

// Mobile On-Screen D-Pad & Actions
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

// Gamepad polling, button mapping & deadzones
export function pollGamepads(onPairCallback) {
  if (!navigator.getGamepads) return { p1: { x: 0, y: 0, active: false }, p2: { x: 0, y: 0, active: false } };
  const gamepads = navigator.getGamepads();

  // Scan for ABXY buttons to pair controllers
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

  function readLeftStick(gpIndex) {
    if (gpIndex === null) return { x: 0, y: 0, active: false };
    const gp = gamepads[gpIndex];
    if (!gp || !gp.connected) return { x: 0, y: 0, active: false };

    let lx = gp.axes[0] || 0;
    let ly = gp.axes[1] || 0;
    const DEADZONE = 0.18;
    if (Math.abs(lx) < DEADZONE) lx = 0;
    if (Math.abs(ly) < DEADZONE) ly = 0;

    // D-Pad Fallback
    if (gp.buttons[14]?.pressed) lx = -1.0;
    if (gp.buttons[15]?.pressed) lx = 1.0;
    if (gp.buttons[12]?.pressed) ly = -1.0;
    if (gp.buttons[13]?.pressed) ly = 1.0;

    return { x: lx, y: ly, active: (Math.abs(lx) > 0 || Math.abs(ly) > 0) };
  }

  return {
    p1: readLeftStick(p1GamepadIndex),
    p2: readLeftStick(p2GamepadIndex)
  };
}

// Carousel navigation helper with cooldown debounce
let carouselCooldown = 0;
export function pollCarouselInput(delta) {
  if (carouselCooldown > 0) {
    carouselCooldown -= delta;
    return null;
  }

  const result = { prev: false, next: false, confirm: false, back: false };

  // Keyboard navigation
  if (keys.ArrowLeft || keys.a || keys.A) result.prev = true;
  if (keys.ArrowRight || keys.d || keys.D) result.next = true;
  if (keys.Enter || keys[' ']) result.confirm = true;
  if (keys.Escape) result.back = true;

  // Gamepad navigation (checked on P1 pad or any pad)
  if (navigator.getGamepads) {
    const gamepads = navigator.getGamepads();
    const gp = (p1GamepadIndex !== null) ? gamepads[p1GamepadIndex] : gamepads[0];
    if (gp && gp.connected) {
      const lx = gp.axes[0] || 0;
      if (lx < -0.45 || gp.buttons[14]?.pressed) result.prev = true;
      if (lx > 0.45 || gp.buttons[15]?.pressed) result.next = true;
      if (gp.buttons[0]?.pressed) result.confirm = true; // A button
      if (gp.buttons[1]?.pressed) result.back = true;    // B button
    }
  }

  if (result.prev || result.next || result.confirm || result.back) {
    carouselCooldown = 0.22; // 220ms repeat debounce
    return result;
  }
  return null;
}

window.addEventListener('gamepaddisconnected', (e) => {
  if (p1GamepadIndex === e.gamepad.index) p1GamepadIndex = null;
  if (p2GamepadIndex === e.gamepad.index) p2GamepadIndex = null;
});
