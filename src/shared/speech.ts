import { setSfxEnabled } from './sfx';

// Lettura ad alta voce in italiano con la Web Speech API del browser.

let enabled = true;
let voice: SpeechSynthesisVoice | undefined;
// Riferimento tenuto vivo: in Chrome un'utterance raccolta dal GC non emette 'end'.
let current: SpeechSynthesisUtterance | undefined;
const supported = 'speechSynthesis' in window;

function pickVoice() {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.replace('_', '-').startsWith('it'));
  voice = voices.find((v) => v.lang === 'it-IT' && v.localService) ?? voices[0];
}

if (supported) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
  // Safari/iOS e Chrome sbloccano l'audio solo dentro un gesto dell'utente.
  const unlock = () => {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

export function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!enabled || !supported) return resolve();
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    speechSynthesis.resume();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.pitch = 1.1;
    u.onend = u.onerror = () => resolve();
    current = u;
    // Alcuni browser non emettono mai 'end': non bloccare il gioco.
    setTimeout(resolve, 1500 + text.length * 120);
    speechSynthesis.speak(current);
  });
}

// Un solo interruttore per voce ed effetti sonori.
export function setSpeechEnabled(on: boolean) {
  enabled = on;
  setSfxEnabled(on);
  if (!on && supported) speechSynthesis.cancel();
}

export function isSpeechEnabled() {
  return enabled;
}
