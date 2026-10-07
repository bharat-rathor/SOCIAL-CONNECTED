// ============================================================
// SOCIAL CONNECT — Synthesized Web Audio Sound Engine
// Zero external files; generates crystal-clear dial and ring tones.
// ============================================================

let audioCtx = null;
let activeToneInterval = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a short dual-frequency tone
 */
function playTone(freq1, freq2, duration = 0.4, gainLevel = 0.1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc1 = ctx.createOscillator();
    const osc2 = freq2 ? ctx.createOscillator() : null;
    const gain = ctx.createGain();

    osc1.frequency.value = freq1;
    osc1.type = 'sine';

    if (osc2) {
      osc2.frequency.value = freq2;
      osc2.type = 'sine';
    }

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc1.connect(gain);
    if (osc2) osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    if (osc2) osc2.start();

    osc1.stop(ctx.currentTime + duration);
    if (osc2) osc2.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context may be blocked by browser autoplay policy until user gesture
  }
}

/**
 * Start playing an outgoing call dial tone (North American ringback: 440Hz + 480Hz)
 */
export function startOutgoingDialTone() {
  stopRingtone();
  // Play immediately once
  playTone(440, 480, 1.2, 0.08);

  // Repeat every 3 seconds
  activeToneInterval = setInterval(() => {
    playTone(440, 480, 1.2, 0.08);
  }, 3000);
}

/**
 * Start playing an incoming call ringtone (Melodic gentle chime: 523Hz + 659Hz + 784Hz)
 */
export function startIncomingRingtone() {
  stopRingtone();

  const playChimeSequence = () => {
    playTone(523.25, null, 0.25, 0.12); // C5
    setTimeout(() => playTone(659.25, null, 0.25, 0.12), 220); // E5
    setTimeout(() => playTone(783.99, null, 0.35, 0.14), 440); // G5
  };

  playChimeSequence();
  activeToneInterval = setInterval(playChimeSequence, 2400);
}

/**
 * Stop any ongoing ringtone or dial tone
 */
export function stopRingtone() {
  if (activeToneInterval) {
    clearInterval(activeToneInterval);
    activeToneInterval = null;
  }
}

/**
 * Play call ended tone
 */
export function playCallEndedTone() {
  stopRingtone();
  playTone(480, null, 0.2, 0.1);
  setTimeout(() => playTone(440, null, 0.3, 0.08), 220);
}
