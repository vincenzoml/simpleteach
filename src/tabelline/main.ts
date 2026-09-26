import { Game, choices, type Question } from './game';
import { CHEERS, JOKES, SURPRISES, nextUnlock, unlockedCount, type Surprise } from './surprises';
import { isSpeechEnabled, setSpeechEnabled, speak } from '../shared/speech';
import { sfx, sillySounds } from '../shared/sfx';
import { getStore, type Profile } from '../shared/storage';
import { avatar, chooseProfile } from '../shared/profiles';
import { LEVELS, UNSEEN, colorFor, factKey, record, score, type Facts } from './mastery';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const STAR = (on: boolean) =>
  `<svg viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8z" fill="${on ? '#ffc93c' : '#e6e0f5'}" stroke="${on ? '#d9a51f' : 'none'}" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const HEART = (full: boolean) =>
  `<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" fill="${full ? '#ff6f69' : '#e6e0f5'}" stroke="${full ? '#d9534f' : 'none'}" stroke-width="1.2"/></svg>`;
const BACKSPACE = `<svg viewBox="0 0 24 24"><path d="M9 5h11v14H9l-6-7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 9l5 6M17 9l-5 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
const CHECK = `<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const drawing = (s: Surprise) => `<svg viewBox="0 0 100 100">${s.svg}</svg>`;

const PRAISE = ['Bravo!', 'Giusto!', 'Esatto!', 'Perfetto!', 'Evviva!', 'Fantastico!', 'Super!'];
const CHOICE_RATE = 0.35; // quante domande sono a risposta multipla
const SURPRISE_RATE = 0.5; // di queste, quante contengono una risposta assurda
const CHEER_RATE = 0.25; // quante risposte giuste ricevono una battuta del gufo

const pick = <T>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

const owl = $<SVGElement & HTMLElement>('owl');
const card = $('card');
const answerEl = $('answer');

// --- Progressi del giocatore, salvati nello Store (vedi shared/storage.ts) ---

interface Saved {
  level: number;
  total: number; // risposte giuste totali: sbloccano le sorprese
  jokes: number; // barzellette già raccontate
  seen: number; // sorprese già viste nella collezione
  facts: Facts; // come va ogni singola moltiplicazione
}
const fresh = (): Saved => ({ level: 1, total: 0, jokes: 0, seen: 0, facts: {} });

let player: Profile;
let stats = fresh();
const save = () => {
  if (game) stats.level = game.level;
  getStore().set(player.id, 'tabelline', stats);
};

let game: Game;
let q: Question;
let typed = '';
let busy = false;
let mode: 'keypad' | 'choices' = 'keypad';

// --- Il gufo parla ---

let bubbleTimer = 0;
function say(text: string, ms = 2600): Promise<void> {
  const b = $('bubble');
  b.textContent = text;
  b.hidden = false;
  clearTimeout(bubbleTimer);
  return Promise.all([speak(text), pause(ms)]).then(() => {
    if (b.textContent === text) bubbleTimer = window.setTimeout(() => (b.hidden = true), 400);
  });
}

function mood(m: '' | 'happy' | 'sad' | 'laugh') {
  owl.classList.remove('happy', 'sad', 'laugh');
  void owl.getBoundingClientRect(); // riavvia l'animazione
  if (m) owl.classList.add(m);
}

// --- Avvio ---

const inGame = ['game', 'level', 'player', 'table-btn', 'album-btn'];

async function start() {
  speechSynthesis?.cancel();
  inGame.forEach((id) => ($(id).hidden = true));
  $('start').hidden = false;
  player = await chooseProfile($('profiles'));
  stats = { ...fresh(), ...(await getStore().get<Saved>(player.id, 'tabelline')) };
  game = new Game(stats.level);
  $('player').innerHTML = avatar(player, 44);
  
// --- Tabella: quanto bene si sa ogni moltiplicazione ---

function openMastery() {
  const f = stats.facts;
  const head = (n: number | string) => `<div class="m-head">${n}</div>`;
  let cells = head('×');
  for (let b = 1; b <= 10; b++) cells += head(b);
  for (let a = 1; a <= 10; a++) {
    cells += head(a);
    for (let b = 1; b <= 10; b++) {
      const fact = f[factKey(a, b)];
      cells += `<button class="m-cell" style="background:${colorFor(fact)}" data-a="${a}" data-b="${b}">${a * b}</button>`;
    }
  }
  $('mastery-grid').innerHTML = cells;
  $('mastery-legend').innerHTML = [...LEVELS, UNSEEN].map((l) => `<span><i style="background:${l.color}"></i>${l.label}</span>`).join('');
  $('mastery-grid').querySelectorAll<HTMLElement>('.m-cell').forEach((c) => {
    c.onclick = () => {
      const a = Number(c.dataset.a), b = Number(c.dataset.b);
      const fact = f[factKey(a, b)];
      const s = score(fact);
      speak(`${a} per ${b} fa ${a * b}. ` + (s === null ? 'Non te l\'ho ancora chiesta.'
        : `Giuste ${[...fact!.last].filter((x) => x === '1').length} delle ultime ${fact!.last.length}.`));
    };
  });
  $('mastery').hidden = false;
}

$('table-btn').onclick = openMastery;
$('mastery-close').onclick = () => { $('mastery').hidden = true; speechSynthesis?.cancel(); };
$('mastery').onclick = (e) => { if (e.target === $('mastery')) $('mastery').hidden = true; };
  $('start').hidden = true;
  inGame.forEach((id) => ($(id).hidden = false));
  sfx.levelUp();
  renderProgress();
  ask(false);
  await say(stats.total ? `Ciao ${player.name}! Ripartiamo dal livello ${game.level}.` : `Ciao ${player.name}! Iniziamo!`, 1800);
  speak(`Quanto fa ${questionText()}?`);
}

$('player').onclick = () => { if (!busy) start(); };

// Vite: cuori pieni a sinistra, quelli persi diventano grigi da destra.
function renderProgress(popStar = -1, popHeart = -1) {
  $('level').querySelector('b')!.textContent = String(game.level);
  $('stars').innerHTML = Array.from({ length: game.needed }, (_, i) => STAR(i < game.correct)).join('');
  $('misses').innerHTML = Array.from({ length: game.maxErrors }, (_, i) => HEART(i < game.maxErrors - game.wrong)).join('');
  $('stars').children[popStar]?.classList.add('pop');
  $('misses').children[popHeart]?.classList.add('pop');
}

const questionText = () => `${q.a} per ${q.b}`;

function ask(read = true) {
  q = game.next();
  typed = '';
  $('qa').textContent = String(q.a);
  $('qb').textContent = String(q.b);
  answerEl.textContent = '';
  answerEl.classList.remove('hint');
  card.classList.remove('ok', 'ko');
  mood('');
  mode = Math.random() < CHOICE_RATE ? 'choices' : 'keypad';
  $('keypad').hidden = mode !== 'keypad';
  $('choices').hidden = mode !== 'choices';
  answerEl.hidden = mode !== 'keypad';
  if (mode === 'choices') buildChoices();
  busy = false;
  if (read) speak(`Quanto fa ${questionText()}?`);
}

// --- Risposta multipla, a volte con una risposta assurda ---

function buildChoices() {
  const box = $('choices');
  box.innerHTML = '';
  const unlocked = SURPRISES.slice(0, unlockedCount(stats.total));
  const silly = Math.random() < SURPRISE_RATE ? pick(unlocked) : undefined;
  const nums = choices(q, silly ? 3 : 4);
  const slots: (number | Surprise)[] = [...nums];
  if (silly) slots.splice(Math.floor(Math.random() * 4), 0, silly);
  for (const s of slots) {
    const b = document.createElement('button');
    b.className = 'choice';
    if (typeof s === 'number') {
      b.textContent = String(s);
      b.onclick = () => { if (!busy) { b.classList.add(s === q.a * q.b ? 'good' : 'bad'); submit(s); } };
    } else {
      b.innerHTML = `${drawing(s)}<span class="label">${s.name}</span>`;
      b.onclick = () => sillyPick(b, s);
    }
    box.append(b);
  }
}

// Scegliere la sorpresa non conta come errore: è uno scherzo, poi si riprova.
async function sillyPick(b: HTMLElement, s: Surprise) {
  if (busy) return;
  pick(sillySounds)();
  mood('laugh');
  b.classList.add('poof');
  setTimeout(() => { sfx.poof(); b.remove(); }, 350);
  await say(`${s.joke} Riprova!`, 2200);
  if (!busy) mood('');
}

// --- Tastierino ---

function type(d: string) {
  if (busy || mode !== 'keypad' || typed.length >= 3) return;
  sfx.tap();
  typed = (typed === '0' ? '' : typed) + d;
  answerEl.textContent = typed;
}

function erase() {
  if (busy || mode !== 'keypad') return;
  sfx.tap();
  typed = typed.slice(0, -1);
  answerEl.textContent = typed;
}

// --- Correzione ---

async function submit(value = Number(typed)) {
  if (busy || (mode === 'keypad' && typed === '')) return;
  busy = true;
  const before = { correct: game.correct, wrong: game.wrong };
  const outcome = game.answer(q, value);
  const result = q.a * q.b;
  const said = `${questionText()} fa ${result}`;
  const unlockedBefore = unlockedCount(stats.total);
  if (value === result) stats.total++;
  stats.facts = record(stats.facts, q.a, q.b, value === result);
  save();

  if (outcome === 'correct' || outcome === 'levelUp') {
    card.classList.add('ok');
    mood('happy');
    sfx.correct();
    const cheer = Math.random() < CHEER_RATE ? ` ${pick(CHEERS)}` : '';
    if (outcome === 'correct') renderProgress(before.correct);
    await Promise.all([speak(`${pick(PRAISE)} ${said}.${cheer}`), pause(900)]);
    if (unlockedCount(stats.total) > unlockedBefore) await reveal(SURPRISES[unlockedBefore]);
    if (outcome === 'levelUp') {
      sfx.levelUp();
      confetti();
      await banner('up', `Livello ${game.level}!`, `Evviva! Sei al livello ${game.level}!`);
      await tellJoke();
      renderProgress();
    }
  } else {
    card.classList.add('ko');
    mood('sad');
    sfx.wrong();
    answerEl.hidden = false;
    answerEl.textContent = String(result);
    answerEl.classList.add('hint');
    if (outcome === 'wrong') {
      renderProgress(-1, game.maxErrors - game.wrong);
      await Promise.all([speak(`No, ${said}`), pause(1800)]);
    } else {
      await Promise.all([speak(`No, ${said}`), pause(1500)]);
      sfx.levelDown();
      await banner('down', `Livello ${game.level}`, `Niente paura! Ci alleniamo ancora un po' al livello ${game.level}.`);
      renderProgress();
    }
  }
  ask();
}

async function tellJoke() {
  mood('laugh');
  await say(JOKES[stats.jokes % JOKES.length], 3500);
  sfx.boing();
  stats.jokes++;
  save();
  await pause(600);
}

async function reveal(s: Surprise) {
  sfx.sparkle();
  confetti();
  $('album-new').hidden = false;
  await banner('up', `${drawing(s)}<div>Nuova sorpresa!</div><small>${s.name}</small>`,
    `Nuova sorpresa! Hai sbloccato ${s.name}! Cercala tra le risposte.`, true);
}

async function banner(kind: 'up' | 'down', content: string, spoken: string, html = false) {
  const el = $('banner');
  el.className = `banner ${kind}`;
  if (html) el.innerHTML = `<div class="banner-inner">${content}</div>`;
  else el.textContent = content;
  el.hidden = false;
  await Promise.all([speak(spoken), pause(html ? 2600 : 1600)]);
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

// --- Collezione delle sorprese ---

function openAlbum() {
  const n = unlockedCount(stats.total);
  stats.seen = n;
  save();
  $('album-new').hidden = true;
  const next = nextUnlock(stats.total);
  $('album-next').innerHTML = next
    ? `Prossima sorpresa tra <b>${next.at - stats.total}</b> risposte giuste<div class="bar"><i style="width:${Math.round(((stats.total - next.from) / (next.at - next.from)) * 100)}%"></i></div>`
    : 'Le hai trovate tutte! Sei un campione!';
  $('album-grid').innerHTML = SURPRISES.map((s, i) =>
    i < n
      ? `<button class="album-item" data-i="${i}">${drawing(s)}${s.name}</button>`
      : `<div class="album-item locked">${drawing(s)}???</div>`).join('');
  $('album-grid').querySelectorAll<HTMLElement>('button.album-item').forEach((b) => {
    b.onclick = () => { pick(sillySounds)(); speak(SURPRISES[Number(b.dataset.i)].joke); };
  });
  $('album').hidden = false;
  sfx.sparkle();
}

$('album-btn').onclick = openAlbum;
$('album-close').onclick = () => { $('album').hidden = true; speechSynthesis?.cancel(); };
$('album').onclick = (e) => { if (e.target === $('album')) $('album').hidden = true; };

// --- Tabella: quanto bene si sa ogni moltiplicazione ---

function openMastery() {
  const f = stats.facts;
  const head = (n: number | string) => `<div class="m-head">${n}</div>`;
  let cells = head('×');
  for (let b = 1; b <= 10; b++) cells += head(b);
  for (let a = 1; a <= 10; a++) {
    cells += head(a);
    for (let b = 1; b <= 10; b++) {
      const fact = f[factKey(a, b)];
      cells += `<button class="m-cell" style="background:${colorFor(fact)}" data-a="${a}" data-b="${b}">${a * b}</button>`;
    }
  }
  $('mastery-grid').innerHTML = cells;
  $('mastery-legend').innerHTML = [...LEVELS, UNSEEN].map((l) => `<span><i style="background:${l.color}"></i>${l.label}</span>`).join('');
  $('mastery-grid').querySelectorAll<HTMLElement>('.m-cell').forEach((c) => {
    c.onclick = () => {
      const a = Number(c.dataset.a), b = Number(c.dataset.b);
      const fact = f[factKey(a, b)];
      const s = score(fact);
      speak(`${a} per ${b} fa ${a * b}. ` + (s === null ? 'Non te l\'ho ancora chiesta.'
        : `Giuste ${[...fact!.last].filter((x) => x === '1').length} delle ultime ${fact!.last.length}.`));
    };
  });
  $('mastery').hidden = false;
}

$('table-btn').onclick = openMastery;
$('mastery-close').onclick = () => { $('mastery').hidden = true; speechSynthesis?.cancel(); };
$('mastery').onclick = (e) => { if (e.target === $('mastery')) $('mastery').hidden = true; };

// --- Controlli ---

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
  if ($('game').hidden || !$('album').hidden || !$('mastery').hidden) return;
  if (/^\d$/.test(e.key)) type(e.key);
  else if (e.key === 'Backspace') erase();
  else if (e.key === 'Enter' && mode === 'keypad') submit();
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
start();
