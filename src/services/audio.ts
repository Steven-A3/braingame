/**
 * Audio Service - Generates sounds using Web Audio API
 * No external audio files needed - all sounds are synthesized
 */

type SoundType =
  | 'tap'
  | 'correct'
  | 'wrong'
  | 'complete'
  | 'achievement'
  | 'streak'
  | 'countdown'
  | 'levelUp'
  | 'combo';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
      return null;
    }
  }

  // Resume context if suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

// Sound generators
function playTap(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

function playCorrect(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
  osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

function playWrong(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

function playComplete(ctx: AudioContext) {
  // Triumphant arpeggio: C5 -> E5 -> G5 -> C6
  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const startTime = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
}

function playAchievement(ctx: AudioContext) {
  // Magical shimmer + fanfare
  const notes = [783.99, 987.77, 1174.66, 1318.51, 1567.98]; // G5 -> B5 -> D6 -> E6 -> G6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const startTime = ctx.currentTime + i * 0.08;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });

  // Add shimmer overlay
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmer.connect(shimmerGain);
  shimmerGain.connect(ctx.destination);

  shimmer.type = 'sine';
  shimmer.frequency.setValueAtTime(2000, ctx.currentTime);
  shimmer.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.5);

  shimmerGain.gain.setValueAtTime(0.03, ctx.currentTime);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  shimmer.start(ctx.currentTime);
  shimmer.stop(ctx.currentTime + 0.5);
}

function playStreak(ctx: AudioContext) {
  // Energetic ascending pattern
  const notes = [440, 554.37, 659.25, 880]; // A4 -> C#5 -> E5 -> A5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const startTime = ctx.currentTime + i * 0.07;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  });
}

function playCountdown(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

function playLevelUp(ctx: AudioContext) {
  // Ascending sweep with harmonics
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.type = 'sine';
  osc2.type = 'sine';

  osc1.frequency.setValueAtTime(300, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);

  osc2.frequency.setValueAtTime(600, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.4);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.5);
  osc2.stop(ctx.currentTime + 0.5);
}

function playCombo(ctx: AudioContext) {
  // Quick satisfying pop
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

// Main play function
export function playSound(sound: SoundType): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  switch (sound) {
    case 'tap':
      playTap(ctx);
      break;
    case 'correct':
      playCorrect(ctx);
      break;
    case 'wrong':
      playWrong(ctx);
      break;
    case 'complete':
      playComplete(ctx);
      break;
    case 'achievement':
      playAchievement(ctx);
      break;
    case 'streak':
      playStreak(ctx);
      break;
    case 'countdown':
      playCountdown(ctx);
      break;
    case 'levelUp':
      playLevelUp(ctx);
      break;
    case 'combo':
      playCombo(ctx);
      break;
  }
}

// Initialize audio context on first user interaction
export function initAudio(): void {
  getAudioContext();
}
