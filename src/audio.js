// --- src/audio.js ---
// Procedural Web Audio API Sound Synthesizer, Dynamic Wind & Master Volume Engine

let audioCtx = null;
let masterGainNode = null;
let currentVolume = 0.8;
let isMuted = false;
const loopingSounds = new Map();

let noiseBuffer = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    masterGainNode.connect(audioCtx.destination);
    noiseBuffer = createNoiseBuffer(audioCtx);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setMasterVolume(vol) {
  currentVolume = Math.max(0.0, Math.min(1.0, vol));
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setTargetAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime, 0.05);
  }
  return currentVolume;
}

export function getMasterVolume() {
  return currentVolume;
}

function createNoiseBuffer(ctx) {
  const bufferSize = ctx.sampleRate * 2.5;
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

window.addEventListener('pointerdown', () => unlockAudio(), { once: true });
window.addEventListener('keydown', () => unlockAudio(), { once: true });

// --- DYNAMIC CONTINUOUS FLIGHT WIND ENGINE ---
let windNodes = null;
let targetWindSpeed = 14;

export function startWind() {
  if (isMuted || windNodes) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGainNode) return;

  const t = ctx.currentTime;
  const masterWindGain = ctx.createGain();
  masterWindGain.gain.setValueAtTime(0.001, t);
  masterWindGain.gain.linearRampToValueAtTime(0.12, t + 1.2);
  masterWindGain.connect(masterGainNode);

  // 1. Static wind hum
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

  // 2. Wind howl / whistle
  const howlSource = ctx.createBufferSource();
  howlSource.buffer = noiseBuffer || createNoiseBuffer(ctx);
  howlSource.loop = true;

  const howlFilter = ctx.createBiquadFilter();
  howlFilter.type = 'bandpass';
  howlFilter.frequency.setValueAtTime(650, t);
  howlFilter.Q.setValueAtTime(16, t);

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.38, t);

  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(220, t);
  lfo.connect(lfoGain);
  lfoGain.connect(howlFilter.frequency);
  lfo.start(t);

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
  const spdFactor = Math.max(0.4, Math.min(2.8, targetWindSpeed / 14));

  const humFreq = 220 + spdFactor * 260;
  windNodes.humFilter.frequency.setTargetAtTime(humFreq, t, 0.15);

  const howlFreq = 420 + spdFactor * 480;
  windNodes.howlFilter.frequency.setTargetAtTime(howlFreq, t, 0.15);
  windNodes.whistleOsc.frequency.setTargetAtTime(howlFreq * 0.9, t, 0.2);

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

// --- CHECKPOINT PLONK ---
export function playCheckpointPlonk(freqMultiplier = 1.0) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;

    const masterPlonk = ctx.createGain();
    masterPlonk.gain.setValueAtTime(0.32, t);
    masterPlonk.connect(masterGainNode);

    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(740 * freqMultiplier, t);
    bodyOsc.frequency.exponentialRampToValueAtTime(160 * freqMultiplier, t + 0.12);

    bodyGain.gain.setValueAtTime(0.4, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterPlonk);
    bodyOsc.start(t);
    bodyOsc.stop(t + 0.18);

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
  } catch (err) {}
}

export function playRingChime(freqMultiplier = 1.0) {
  playCheckpointPlonk(freqMultiplier);
}

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
    gain.connect(masterGainNode);
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
    gain.connect(masterGainNode);
    osc.start(t);
    osc.stop(t + 0.22);
  } catch (err) {}
}

export function pauseAudio() {
  if (audioCtx && audioCtx.state === 'running') {
    audioCtx.suspend().catch(() => {});
  }
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}
