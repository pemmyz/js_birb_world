// --- Procedural Web Audio API Sound Synthesizer ---
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playRingChime(freqMultiplier = 1.0) {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33 * freqMultiplier, t);
    gain1.gain.setValueAtTime(0.2, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.18);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880 * freqMultiplier, t + 0.08);
    gain2.gain.setValueAtTime(0.25, t + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.4);
  } catch (err) {}
}

export function playWinFanfare() {
  playRingChime(1.4);
  setTimeout(() => playRingChime(1.8), 160);
  setTimeout(() => playRingChime(2.2), 320);
}

export function playCarouselTick(direction = 1) {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(direction > 0 ? 520 : 440, t);
    osc.frequency.exponentialRampToValueAtTime(direction > 0 ? 780 : 330, t + 0.06);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  } catch (err) {}
}

export function playConfirmBeep() {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(880, t + 0.07);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  } catch (err) {}
}
