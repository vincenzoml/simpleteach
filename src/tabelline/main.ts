import { Game, type Question } from './game';
import { isSpeechEnabled, setSpeechEnabled, speak } from '../shared/speech';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const STAR = (on: boolean) =>
  `<svg viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8z" fill="${on ? '#ffc93c' : '#e6e0f5'}" stroke="${on ? '#d9a51f' : 'none'}" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const DROP = (on: boolean) =>
  `<svg viewBox="0 0 24 24"><path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" fill="${on ? '#5fa8ff' : '#e6e0f5'}"/></svg>`;
const BACKSPACE = `<svg viewBox="0 0 24 24"><path d="M9 5h11v14H9l-6-7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 9l5 6M17 9l-5 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
const CHECK = `<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const PRAISE = ['Bravo!', 'Giusto!', 'Esatto!', 'Perfetto!', 'Grande!', 'Evviva!'];
const pick = <T>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

const owl = $<SVGElement & HTMLElement>('owl');
const card = $('card');
const answerEl = $('answer');

let game: Game;
let q: Question;
let typed = '';
let busy = false;

// --- Schermata iniziale ---

$('play').onclick = () => {
  game = new Game();
  $('start').hidden = true;
  $('game').hidden = false;
  $('level').hidden = false;
  renderProgress();
  ask();
};

// --- Gioco ---

function renderProgress(popStar = -1, popDrop = -1) {
  $('level').querySelector('b')!.textContent = String(game.level);
  $('stars').innerHTML = Array.from({ length: game.needed }, (_, i) => STAR(i < game.correct)).join('');
  $('misses').innerHTML = Array.from({ length: game.maxErrors }, (_, i) => DROP(i < game.wrong)).join('');
  $('stars').children[popStar]?.classList.add('pop');
  $('misses').children[popDrop]?.classList.add('pop');
}

function questionText() {
  return `${q.a} per ${q.b}`;
}

function ask() {
  q = game.next();
  typed = '';
  $('qa').textContent = String(q.a);
  $('qb').textContent = String(q.b);
  answerEl.textContent = '';
  answerEl.classList.remove('hint');
  card.classList.remove('ok', 'ko');
  owl.classList.remove('happy', 'sad');
  busy = false;
  speak(`Quanto fa ${questionText()}?`);
}

function type(d: string) {
  if (busy || typed.length >= 3) return;
  typed = (typed === '0' ? '' : typed) + d;
  answerEl.textContent = typed;
}

function erase() {
  if (busy) return;
  typed = typed.slice(0, -1);
  answerEl.textContent = typed;
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function submit() {
  if (busy || typed === '') return;
  busy = true;
  const before = { correct: game.correct, wrong: game.wrong };
  const outcome = game.answer(q, Number(typed));
  const result = q.a * q.b;

  if (outcome === 'correct' || outcome === 'levelUp') {
    card.classList.add('ok');
    owl.classList.add('happy');
    if (outcome === 'correct') {
      renderProgress(before.correct);
      await Promise.all([speak(`${pick(PRAISE)} ${questionText()} fa ${result}`), pause(900)]);
    } else {
      await Promise.all([speak(`${pick(PRAISE)} ${questionText()} fa ${result}`), pause(700)]);
      confetti();
      await banner('up', `Livello ${game.level}!`, `Bravissimo! Sei passato al livello ${game.level}!`);
      renderProgress();
    }
  } else {
    card.classList.add('ko');
    owl.classList.add('sad');
    answerEl.textContent = String(result);
    answerEl.classList.add('hint');
    if (outcome === 'wrong') {
      renderProgress(-1, game.wrong ? before.wrong : -1);
      await Promise.all([speak(`No, ${questionText()} fa ${result}`), pause(1800)]);
    } else {
      await Promise.all([speak(`No, ${questionText()} fa ${result}`), pause(1500)]);
      await banner('down', `Livello ${game.level}`, `Niente paura! Ci alleniamo ancora un po' al livello ${game.level}.`);
      renderProgress();
    }
  }
  ask();
}

async function banner(kind: 'up' | 'down', text: string, spoken: string) {
  const el = $('banner');
  el.className = `banner ${kind}`;
  el.textContent = text;
  el.hidden = false;
  await Promise.all([speak(spoken), pause(1600)]);
  el.hidden = true;
}

function confetti() {
  const box = $('confetti');
  const colors = ['#ffc93c', '#ff6f69', '#3ec5a3', '#5fa8ff', '#9b6bff'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('i');
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = pick(colors);
    c.style.animationDelay = `${Math.random() * 0.6}s`;
    c.style.animationDuration = `${1.4 + Math.random()}s`;
    box.append(c);
  }
  setTimeout(() => (box.innerHTML = ''), 3000);
}

function buildKeypad() {
  const pad = $('keypad');
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
  for (const k of keys) {
    const b = document.createElement('button');
    b.className = 'key' + (k === 'del' ? ' del' : k === 'ok' ? ' ok' : '');
    b.innerHTML = k === 'del' ? BACKSPACE : k === 'ok' ? CHECK : k;
    b.setAttribute('aria-label', k === 'del' ? 'Cancella' : k === 'ok' ? 'Conferma' : k);
    b.onclick = () => (k === 'del' ? erase() : k === 'ok' ? submit() : type(k));
    pad.append(b);
  }
}

document.addEventListener('keydown', (e) => {
  if ($('game').hidden) return;
  if (/^\d$/.test(e.key)) type(e.key);
  else if (e.key === 'Backspace') erase();
  else if (e.key === 'Enter') submit();
});

$('repeat').onclick = () => speak(`Quanto fa ${questionText()}?`);

const mute = $('mute');
const syncMute = () => mute.classList.toggle('off', !isSpeechEnabled());
mute.onclick = () => {
  setSpeechEnabled(!isSpeechEnabled());
  try { localStorage.setItem('tabelline.voice', isSpeechEnabled() ? '1' : '0'); } catch { /* ignora */ }
  syncMute();
};
try { if (localStorage.getItem('tabelline.voice') === '0') setSpeechEnabled(false); } catch { /* ignora */ }
syncMute();

buildKeypad();
