// Lettura ad alta voce in italiano con la Web Speech API del browser.

let enabled = true;
let voice: SpeechSynthesisVoice | undefined;

function pickVoice() {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('it'));
  voice = voices.find((v) => v.localService) ?? voices[0];
}

if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

export function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!enabled || !('speechSynthesis' in window)) return resolve();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.pitch = 1.1;
    u.onend = u.onerror = () => resolve();
    // Alcuni browser non emettono mai 'end': non bloccare il gioco.
    setTimeout(resolve, 1500 + text.length * 120);
    speechSynthesis.speak(u);
  });
}

export function setSpeechEnabled(on: boolean) {
  enabled = on;
  if (!on && 'speechSynthesis' in window) speechSynthesis.cancel();
}

export function isSpeechEnabled() {
  return enabled;
}
