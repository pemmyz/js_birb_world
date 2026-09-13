// --- src/audio.js ---
// Procedural Web Audio API Sound Synthesizer & Dynamic Flight Wind Engine

let audioCtx = null;
let isMuted = false;
const loopingSounds = new Map();

// --- Procedural Noise Buffer ---
let noiseBuffer = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    noiseBuffer = createNoiseBuffer(audioCtx);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function createNoiseBuffer(ctx) {
  const bufferSize = ctx.sampleRate * 2.5; // 2.5 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function unlockAudio() {
  getAudioContext();
}

// Automatically unlock AudioContext on first user interaction
window.addEventListener('pointerdown', () => unlockAudio(), { once: true });
window.addEventListener('keydown', () => unlockAudio(), { once: true });

// --- DYNAMIC CONTINUOUS FLIGHT WIND ENGINE (Hum & Howl) ---
let windNodes = null;
let targetWindSpeed = 14;

export function startWind() {
  if (isMuted || windNodes) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const masterWindGain = ctx.createGain();
  masterWindGain.gain.setValueAtTime(0.001, t);
  masterWindGain.gain.linearRampToValueAtTime(0.12, t + 1.2);
  masterWindGain.connect(ctx.destination);

  // 1. STATIC WIND RUSH / HUM (Lowpass-filtered white noise)
  const humSource = ctx.createBufferSource();
  humSource.buffer = noiseBuffer || createNoiseBuffer(ctx);
  humSource.loop = true;

  const humFilter = ctx.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.setValueAtTime(320, t);
  humFilter.Q.setValueAtTime(1.8, t);

  const humGain = ctx.createGain();
  humGain.gain.setValueAtTime(0.35, t);

  humSource.connect(humFilter);
  humFilter.connect(humGain);
  humGain.connect(masterWindGain);
  humSource.start(t);

  // 2. WIND HOWL / WHISTLE (Resonant sweeping bandpass + LFO drift)
  const howlSource = ctx.createBufferSource();
  howlSource.buffer = noiseBuffer || createNoiseBuffer(ctx);
  howlSource.loop = true;

  const howlFilter = ctx.createBiquadFilter();
  howlFilter.type = 'bandpass';
  howlFilter.frequency.setValueAtTime(650, t);
  howlFilter.Q.setValueAtTime(16, t); // High Q produces the eerie howling resonance

  // LFO for natural wind gust oscillation
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.38, t); // Slow breathing cycle ~2.6s

  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(220, t);
  lfo.connect(lfoGain);
  lfoGain.connect(howlFilter.frequency);
  lfo.start(t);

  // Soft whistling overtone that intensifies at higher airspeeds
  const whistleOsc = ctx.createOscillator();
  whistleOsc.type = 'sine';
  whistleOsc.frequency.setValueAtTime(540, t);
  const whistleGain = ctx.createGain();
  whistleGain.gain.setValueAtTime(0.02, t);
  whistleOsc.connect(whistleGain);
  whistleGain.connect(masterWindGain);
  whistleOsc.start(t);

  const howlGain = ctx.createGain();
  howlGain.gain.setValueAtTime(0.48, t);

  howlSource.connect(howlFilter);
  howlFilter.connect(howlGain);
  howlGain.connect(masterWindGain);
  howlSource.start(t);

  windNodes = {
    masterWindGain,
    humSource,
    humFilter,
    howlSource,
    howlFilter,
    lfo,
    whistleOsc,
    whistleGain
  };
}

export function updateWind(airspeed = 14, delta = 0.016) {
  if (!windNodes || isMuted || !audioCtx) return;
  targetWindSpeed = airspeed;

  const ctx = audioCtx;
  const t = ctx.currentTime;

  // Normalized speed factor (10..35 km/h -> 0.6..2.2)
  const spdFactor = Math.max(0.4, Math.min(2.8, targetWindSpeed / 14));

  // Modulate wind hum cutoff frequency
  const humFreq = 220 + spdFactor * 260;
  windNodes.humFilter.frequency.setTargetAtTime(humFreq, t, 0.15);

  // Modulate howling resonance center and whistle frequency
  const howlFreq = 420 + spdFactor * 480;
  windNodes.howlFilter.frequency.setTargetAtTime(howlFreq, t, 0.15);
  windNodes.whistleOsc.frequency.setTargetAtTime(howlFreq * 0.9, t, 0.2);

  // Dynamic master wind volume scaled with speed
  const windVol = Math.min(0.38, 0.08 + (spdFactor - 0.5) * 0.12);
  windNodes.masterWindGain.gain.setTargetAtTime(windVol, t, 0.15);
}

export function stopWind() {
  if (!windNodes || !audioCtx) return;
  const ctx = audioCtx;
  const t = ctx.currentTime;
  try {
    windNodes.masterWindGain.gain.linearRampToValueAtTime(0.0001, t + 0.3);
    setTimeout(() => {
      if (windNodes) {
        if (windNodes.humSource) windNodes.humSource.stop();
        if (windNodes.howlSource) windNodes.howlSource.stop();
        if (windNodes.lfo) windNodes.lfo.stop();
        if (windNodes.whistleOsc) windNodes.whistleOsc.stop();
        windNodes = null;
      }
    }, 320);
  } catch (e) {
    windNodes = null;
  }
}

// --- CHECKPOINT PLONK & CHIME ---
/**
 * Plays a punchy, resonant "PLONK!" sound when flying through a vortex checkpoint gate.
 */
export function playCheckpointPlonk(freqMultiplier = 1.0) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;

    const masterPlonk = ctx.createGain();
    masterPlonk.gain.setValueAtTime(0.32, t);
    masterPlonk.connect(ctx.destination);

    // 1. Rapid downward pitch drop for the primary "Plonk" body
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    const startPitch = 740 * freqMultiplier;
    const endPitch = 160 * freqMultiplier;
    bodyOsc.frequency.setValueAtTime(startPitch, t);
    bodyOsc.frequency.exponentialRampToValueAtTime(endPitch, t + 0.12);

    bodyGain.gain.setValueAtTime(0.4, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterPlonk);
    bodyOsc.start(t);
    bodyOsc.stop(t + 0.18);

    // 2. Resonant ringing overtone (hollow wood / water droplet tone)
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bellOsc.type = 'triangle';
    bellOsc.frequency.setValueAtTime(1100 * freqMultiplier, t);
    bellOsc.frequency.exponentialRampToValueAtTime(440 * freqMultiplier, t + 0.22);

    bellGain.gain.setValueAtTime(0.28, t);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    bellOsc.connect(bellGain);
    bellGain.connect(masterPlonk);
    bellOsc.start(t);
    bellOsc.stop(t + 0.38);

    // 3. Crisp impact transient click at t=0
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(320 * freqMultiplier, t);
    clickGain.gain.setValueAtTime(0.18, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    clickOsc.connect(clickGain);
    clickGain.connect(masterPlonk);
    clickOsc.start(t);
    clickOsc.stop(t + 0.025);
  } catch (err) {}
}

// Backwards compatibility alias: existing game calls playRingChime()
export function playRingChime(freqMultiplier = 1.0) {
  playCheckpointPlonk(freqMultiplier);
}

// --- FANFARES & UI SOUNDS ---
export function playWinFanfare() {
  playCheckpointPlonk(1.2);
  setTimeout(() => playCheckpointPlonk(1.5), 140);
  setTimeout(() => playCheckpointPlonk(1.9), 280);
}

export function playCarouselTick(direction = 1) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(direction > 0 ? 520 : 440, t);
    osc.frequency.exponentialRampToValueAtTime(direction > 0 ? 780 : 330, t + 0.06);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  } catch (err) {}
}

export function playConfirmBeep() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(880, t + 0.07);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  } catch (err) {}
}

// --- GENERIC SOUND DISPATCHER (crash, land, explosion, etc.) ---
export function playSound(type, volume = 0.3) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(volume, t);

  let source = null;

  if (type === 'plonk' || type === 'checkpoint') {
    playCheckpointPlonk();
    return;
  } else if (type === 'crash') {
    source = ctx.createOscillator();
    source.type = 'sawtooth';
    source.frequency.setValueAtTime(140, t);
    source.frequency.exponentialRampToValueAtTime(50, t + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  } else if (type === 'land') {
    source = ctx.createOscillator();
    source.type = 'sine';
    source.frequency.setValueAtTime(300, t);
    source.frequency.exponentialRampToValueAtTime(100, t + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  } else if (type === 'clamp_on') {
    source = ctx.createOscillator();
    source.type = 'square';
    source.frequency.setValueAtTime(140, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  } else if (type === 'clamp_off') {
    source = ctx.createOscillator();
    source.type = 'square';
    source.frequency.setValueAtTime(600, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  } else if (type === 'explosion') {
    source = ctx.createBufferSource();
    source.buffer = noiseBuffer || createNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  } else if (type === 'win') {
    playWinFanfare();
    return;
  } else if (type === 'lose') {
    source = ctx.createOscillator();
    source.type = 'sawtooth';
    source.frequency.setValueAtTime(200, t);
    source.frequency.exponentialRampToValueAtTime(50, t + 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
  } else if (type === 'ui_click') {
    source = ctx.createOscillator();
    source.type = 'triangle';
    source.frequency.setValueAtTime(700, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  } else {
    return;
  }

  if (source) {
    if (!(source instanceof AudioBufferSourceNode)) {
      source.connect(gainNode);
    }
    source.start(t);
    source.stop(t + 1);
  }
}

// --- CONTINUOUS LOOPING SOUNDS ---
export function startLoopingSound(ownerId, type) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || loopingSounds.has(ownerId + type)) return;

  const t = ctx.currentTime;
  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);
  let source;

  if (type === 'thrust') {
    source = ctx.createBufferSource();
    source.buffer = noiseBuffer || createNoiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 15;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.1, t + 0.1);
  } else if (type === 'bomb_hum') {
    source = ctx.createOscillator();
    source.type = 'sawtooth';
    source.frequency.setValueAtTime(50, t);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(source.frequency);
    source.connect(gainNode);
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.01, t + 0.5);
    lfo.start();
  } else {
    return;
  }

  source.start(t);
  loopingSounds.set(ownerId + type, { source, gainNode });
}

export function stopLoopingSound(ownerId, type) {
  const sound = loopingSounds.get(ownerId + type);
  if (sound && audioCtx) {
    const t = audioCtx.currentTime;
    sound.gainNode.gain.cancelScheduledValues(t);
    sound.gainNode.gain.setValueAtTime(sound.gainNode.gain.value, t);
    sound.gainNode.gain.linearRampToValueAtTime(0, t + 0.2);
    sound.source.stop(t + 0.21);
    loopingSounds.delete(ownerId + type);
  }
}

export function stopAllLoopingSounds() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  loopingSounds.forEach((sound) => {
    sound.gainNode.gain.cancelScheduledValues(t);
    sound.gainNode.gain.setValueAtTime(sound.gainNode.gain.value, t);
    sound.gainNode.gain.linearRampToValueAtTime(0, t + 0.1);
    sound.source.stop(t + 0.11);
  });
  loopingSounds.clear();
  stopWind();
}

// --- MUTE CONTROLLER ---
export function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    stopAllLoopingSounds();
  } else {
    unlockAudio();
  }
  return isMuted;
}

export function getMuted() {
  return isMuted;
}
