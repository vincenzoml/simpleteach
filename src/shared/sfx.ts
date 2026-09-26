// Effetti sonori sintetizzati con la Web Audio API: niente file da scaricare.

let ctx: AudioContext | undefined;
let enabled = true;

function ac(): AudioContext | undefined {
  if (!enabled) return undefined;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// L'audio si può avviare solo dentro un gesto dell'utente.
window.addEventListener('pointerdown', () => ac(), { capture: true, once: true });

export function setSfxEnabled(on: boolean) {
  enabled = on;
}

function tone(
  freq: number, start: number, dur: number,
  { type = 'sine' as OscillatorType, vol = 0.2, to = 0 } = {},
) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(start: number, dur: number, vol = 0.3, freq = 1200) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
}

const C5 = 523, E5 = 659, G5 = 784, C6 = 1047;

export const sfx = {
  tap: () => tone(700, 0, 0.06, { type: 'triangle', vol: 0.12 }),
  correct: () => [C5, E5, G5, C6].forEach((f, i) => tone(f, i * 0.07, 0.25, { vol: 0.18 })),
  wrong: () => tone(320, 0, 0.4, { type: 'square', vol: 0.07, to: 140 }),
  levelUp: () => {
    [C5, E5, G5].forEach((f, i) => tone(f, i * 0.12, 0.14, { type: 'triangle', vol: 0.22 }));
    tone(C6, 0.36, 0.6, { type: 'triangle', vol: 0.25 });
    sfx.sparkle(0.5);
  },
  levelDown: () => tone(900, 0, 0.7, { vol: 0.15, to: 260 }),
  sparkle: (delay = 0) => {
    for (let i = 0; i < 10; i++) tone(1200 + Math.random() * 1400, delay + i * 0.05, 0.12, { vol: 0.08 });
  },
  poof: () => noise(0, 0.35, 0.5, 900),
  boing: () => {
    tone(140, 0, 0.18, { vol: 0.3, to: 520 });
    tone(520, 0.18, 0.35, { vol: 0.25, to: 120 });
  },
  whistle: () => {
    tone(400, 0, 0.35, { vol: 0.15, to: 1400 });
    tone(1400, 0.4, 0.45, { vol: 0.15, to: 300 });
  },
  raspberry: () => {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const lfo = c.createOscillator();
    const lg = c.createGain();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(95, t);
    o.frequency.linearRampToValueAtTime(70, t + 0.7);
    lfo.frequency.value = 28;
    lg.gain.value = 0.12;
    g.gain.setValueAtTime(0.12, t);
    g.gain.linearRampToValueAtTime(0, t + 0.75);
    lfo.connect(lg).connect(g.gain);
    o.connect(g).connect(c.destination);
    o.start(t); lfo.start(t);
    o.stop(t + 0.8); lfo.stop(t + 0.8);
  },
};

export const sillySounds = [sfx.boing, sfx.whistle, sfx.raspberry];
