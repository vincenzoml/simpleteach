// Le "sorprese": risposte assurde disegnate che compaiono tra le risposte multiple.
// Se ne sbloccano poche alla volta, man mano che si risponde giusto,
// così per vederle tutte bisogna continuare a giocare.

export interface Surprise {
  id: string;
  name: string; // con l'articolo, per la collezione e la voce
  joke: string; // cosa dice il gufo quando la si sceglie
  svg: string; // disegno in viewBox 0 0 100 100
}

const S = 'stroke="#3b2f5c" stroke-width="3" stroke-linejoin="round"';
const eye = (x: number, y: number, r = 4) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#3b2f5c"/><circle cx="${x + r / 3}" cy="${y - r / 3}" r="${r / 3}" fill="#fff"/>`;

const flower = (x: number, y: number, color: string, stem = 95) => {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2;
    return `<circle cx="${(x + Math.cos(a) * 9).toFixed(1)}" cy="${(y + Math.sin(a) * 9).toFixed(1)}" r="8" fill="${color}"/>`;
  }).join('');
  return `<path d="M${x} ${y} Q${x - 6} ${(y + stem) / 2} ${x} ${stem}" stroke="#3ec5a3" stroke-width="4" fill="none"/>${petals}<circle cx="${x}" cy="${y}" r="6" fill="#ffc93c"/>`;
};

export const SURPRISES: Surprise[] = [
  {
    id: 'unicorno', name: 'un unicorno',
    joke: 'Un unicorno? Ahah! Gli unicorni sanno solo brillare, non contare!',
    svg: `<circle cx="34" cy="34" r="9" fill="#9b6bff"/><circle cx="26" cy="47" r="9" fill="#5fa8ff"/><circle cx="24" cy="61" r="9" fill="#3ec5a3"/><circle cx="28" cy="74" r="8" fill="#ffc93c"/>
      <circle cx="52" cy="58" r="28" fill="#fff" ${S}/><path d="M40 34 L35 15 L51 29Z" fill="#fff" ${S}/>
      <path d="M50 32 L60 4 L66 33Z" fill="#ffc93c" stroke="#d9a51f" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="68" cy="72" rx="15" ry="11" fill="#ffd6e0"/><circle cx="64" cy="72" r="2" fill="#3b2f5c"/><circle cx="73" cy="72" r="2" fill="#3b2f5c"/>
      ${eye(58, 52)}<circle cx="44" cy="66" r="4" fill="#ff8fa3" opacity=".7"/>`,
  },
  {
    id: 'fiorellini', name: 'dei fiorellini',
    joke: 'Fiorellini? Che profumo! Ma i fiori non sono numeri!',
    svg: flower(24, 55, '#ff8fa3') + flower(52, 34, '#9b6bff') + flower(78, 58, '#5fa8ff'),
  },
  {
    id: 'gelato', name: 'un gelato',
    joke: 'Un gelato? Gnam gnam! Ma la matematica non si mangia!',
    svg: `<path d="M32 52 L50 96 L68 52Z" fill="#f4b860" ${S}/><path d="M38 60 L60 60 M42 72 L57 72 M46 84 L54 84" stroke="#d98f3a" stroke-width="2.5"/>
      <circle cx="39" cy="47" r="14" fill="#ff8fa3" ${S}/><circle cx="61" cy="47" r="14" fill="#9be8cf" ${S}/><circle cx="50" cy="32" r="15" fill="#fff3c4" ${S}/>
      <path d="M50 18 Q54 8 60 6" stroke="#3ec5a3" stroke-width="3" fill="none"/><circle cx="50" cy="16" r="6" fill="#ff4d4d" ${S}/>`,
  },
  {
    id: 'calzino', name: 'un calzino puzzolente',
    joke: 'Un calzino puzzolente? Bleah! Tappati il naso e riprova!',
    svg: `<path d="M42 8 H66 V58 Q66 70 56 76 L38 88 Q24 96 18 84 Q14 74 26 68 L42 58Z" fill="#fff" ${S}/>
      <path d="M42 20 H66 M42 32 H66" stroke="#ff6f69" stroke-width="6"/>
      <path d="M74 20 q6 6 0 12 q-6 6 0 12 M82 36 q6 6 0 12 q-6 6 0 12 M12 40 q6 6 0 12 q-6 6 0 12" stroke="#7cc46a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="84" cy="14" r="3" fill="#3b2f5c"/><ellipse cx="81" cy="10" rx="4" ry="2.5" fill="#cfe8ff"/><ellipse cx="88" cy="10" rx="4" ry="2.5" fill="#cfe8ff"/>`,
  },
  {
    id: 'dinosauro', name: 'un dinosauro',
    joke: 'Un dinosauro? Roaaar! I dinosauri non hanno mai studiato le tabelline!',
    svg: `<path d="M20 70 L2 56 L24 60Z" fill="#6fd08c" ${S}/><path d="M30 44 l6 -10 6 10 6 -10 6 10 6 -10 6 10" fill="#ffc93c" ${S}/>
      <rect x="30" y="72" width="10" height="18" rx="4" fill="#6fd08c" ${S}/><rect x="56" y="72" width="10" height="18" rx="4" fill="#6fd08c" ${S}/>
      <ellipse cx="48" cy="62" rx="30" ry="20" fill="#6fd08c" ${S}/><path d="M66 50 Q70 36 76 30" stroke="#3b2f5c" stroke-width="16" stroke-linecap="round" fill="none"/>
      <path d="M66 50 Q70 36 76 30" stroke="#6fd08c" stroke-width="10" stroke-linecap="round" fill="none"/>
      <ellipse cx="82" cy="28" rx="15" ry="12" fill="#6fd08c" ${S}/>${eye(84, 24, 3.5)}<path d="M80 34 Q88 38 94 32" stroke="#3b2f5c" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'fantasmino', name: 'un fantasmino',
    joke: 'Un fantasmino? Buuuh! Mi hai fatto paura! Riprova!',
    svg: `<path d="M24 90 V46 a26 26 0 0 1 52 0 V90 l-9 -9 -8.5 9 -8.5 -9 -8.5 9 -8.5 -9Z" fill="#fff" ${S}/>
      <ellipse cx="40" cy="46" rx="5" ry="7" fill="#3b2f5c"/><ellipse cx="60" cy="46" rx="5" ry="7" fill="#3b2f5c"/>
      <ellipse cx="50" cy="64" rx="6" ry="8" fill="#3b2f5c"/><circle cx="32" cy="58" r="4" fill="#ff8fa3" opacity=".6"/><circle cx="68" cy="58" r="4" fill="#ff8fa3" opacity=".6"/>`,
  },
  {
    id: 'pizza', name: 'una pizza',
    joke: 'Una pizza? Buonissima! Ma adesso niente merenda, prima le tabelline!',
    svg: `<path d="M50 94 L14 24 Q50 6 86 24Z" fill="#ffd166" ${S}/><path d="M14 24 Q50 6 86 24" stroke="#d98f3a" stroke-width="9" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="36" r="7" fill="#ff4d4d"/><circle cx="60" cy="40" r="7" fill="#ff4d4d"/><circle cx="50" cy="62" r="6" fill="#ff4d4d"/>
      <ellipse cx="46" cy="50" rx="5" ry="3" fill="#3ec5a3" transform="rotate(-30 46 50)"/>`,
  },
  {
    id: 'gatto', name: 'un gatto col cappello',
    joke: 'Un gatto col cappello? Miao! Il gatto dice che lo hai scelto apposta!',
    svg: `<path d="M26 50 L28 26 L44 40Z M74 50 L72 26 L56 40Z" fill="#ffa94d" ${S}/><circle cx="50" cy="62" r="28" fill="#ffa94d" ${S}/>
      ${eye(40, 58)}${eye(60, 58)}<path d="M46 68 L54 68 L50 73Z" fill="#ff8fa3"/>
      <path d="M50 73 Q46 79 41 76 M50 73 Q54 79 59 76 M30 68 L14 64 M30 72 L14 74 M70 68 L86 64 M70 72 L86 74" stroke="#3b2f5c" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="36" y="8" width="28" height="26" rx="3" fill="#3b2f5c"/><rect x="26" y="32" width="48" height="6" rx="3" fill="#3b2f5c"/><rect x="36" y="26" width="28" height="5" fill="#ff6f69"/>`,
  },
  {
    id: 'razzo', name: 'un razzo',
    joke: 'Un razzo? Tre, due, uno, decollo! Ma la risposta giusta è rimasta a terra!',
    svg: `<path d="M42 76 Q50 100 58 76Z" fill="#ffc93c"/><path d="M45 76 Q50 90 55 76Z" fill="#ff6f69"/>
      <path d="M36 56 L22 76 L38 72Z M64 56 L78 76 L62 72Z" fill="#ff6f69" ${S}/>
      <path d="M50 6 C68 22 68 60 62 76 L38 76 C32 60 32 22 50 6Z" fill="#eef1ff" ${S}/>
      <circle cx="50" cy="40" r="9" fill="#5fa8ff" ${S}/><path d="M42 22 Q50 14 58 22" stroke="#ff6f69" stroke-width="4" fill="none"/>`,
  },
  {
    id: 'banana', name: 'una banana ballerina',
    joke: 'Una banana ballerina? Guarda come gira! Ma non sa fare le moltiplicazioni.',
    svg: `<path d="M34 12 Q20 50 44 78 Q60 90 70 84 Q46 70 44 40 Q44 22 40 12Z" fill="#ffe066" ${S}/>
      <path d="M22 60 L30 50 L36 60 L44 50 L50 60 L58 52 L64 62 Q44 74 22 60Z" fill="#ff8fa3" ${S}/>
      <path d="M38 70 L32 92 M50 74 L58 94" stroke="#3b2f5c" stroke-width="3" stroke-linecap="round"/>
      ${eye(36, 32, 3)}${eye(46, 32, 3)}<path d="M36 40 Q41 45 46 40" stroke="#3b2f5c" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'arcobaleno', name: 'un arcobaleno',
    joke: 'Un arcobaleno? Che bello! Ha sette colori, ma non il numero giusto!',
    svg: ['#ff6f69', '#ffc93c', '#3ec5a3', '#5fa8ff', '#9b6bff'].map((c, i) =>
      `<path d="M${10 + i * 7} 76 A${40 - i * 7} ${40 - i * 7} 0 0 1 ${90 - i * 7} 76" stroke="${c}" stroke-width="7.5" fill="none"/>`).join('') +
      `<circle cx="14" cy="78" r="10" fill="#fff" ${S}/><circle cx="24" cy="80" r="9" fill="#fff" ${S}/><circle cx="86" cy="78" r="10" fill="#fff" ${S}/><circle cx="76" cy="80" r="9" fill="#fff" ${S}/>`,
  },
  {
    id: 'mostriciattolo', name: 'un mostriciattolo',
    joke: 'Un mostriciattolo? Ha un occhio solo e non vede il numero giusto!',
    svg: `<path d="M30 30 L24 10 L40 24Z M70 30 L76 10 L60 24Z" fill="#ffc93c" ${S}/>
      <path d="M20 60 Q20 20 50 20 Q80 20 80 60 L80 88 L70 80 L60 88 L50 80 L40 88 L30 80 L20 88Z" fill="#9be8cf" ${S}/>
      <circle cx="50" cy="46" r="14" fill="#fff" ${S}/>${eye(52, 48, 7)}
      <path d="M36 66 Q50 76 64 66" stroke="#3b2f5c" stroke-width="3" fill="#fff"/><path d="M42 68 L44 73 L47 69 M53 69 L56 73 L58 68" fill="#fff" stroke="#3b2f5c" stroke-width="1.5"/>`,
  },
  {
    id: 'pinguino', name: 'un pinguino con gli occhiali',
    joke: 'Un pinguino con gli occhiali da sole? Troppo figo per la matematica!',
    svg: `<ellipse cx="50" cy="56" rx="30" ry="38" fill="#3b2f5c"/><ellipse cx="50" cy="64" rx="20" ry="28" fill="#fff"/>
      <path d="M30 40 H70 M32 38 h16 v8 q-8 6 -16 0Z M52 38 h16 v8 q-8 6 -16 0Z" stroke="#111" stroke-width="3" fill="#111"/>
      <path d="M44 50 L56 50 L50 58Z" fill="#ffa94d"/><ellipse cx="38" cy="94" rx="9" ry="4" fill="#ffa94d"/><ellipse cx="62" cy="94" rx="9" ry="4" fill="#ffa94d"/>`,
  },
  {
    id: 'cupcake', name: 'un cupcake',
    joke: 'Un cupcake? È il compleanno di qualcuno? Di sicuro non del risultato!',
    svg: `<path d="M26 56 L32 92 H68 L74 56Z" fill="#5fa8ff" ${S}/><path d="M38 58 L40 92 M50 58 V92 M62 58 L60 92" stroke="#3b2f5c" stroke-width="2"/>
      <path d="M22 58 Q18 44 32 42 Q34 28 50 30 Q66 28 68 42 Q82 44 78 58Z" fill="#ffd6e0" ${S}/>
      <rect x="47" y="12" width="6" height="18" rx="2" fill="#fff" ${S}/><path d="M50 2 Q56 8 50 12 Q44 8 50 2Z" fill="#ffc93c"/>
      <circle cx="36" cy="48" r="2" fill="#ff6f69"/><circle cx="58" cy="40" r="2" fill="#3ec5a3"/><circle cx="66" cy="52" r="2" fill="#9b6bff"/><circle cx="46" cy="42" r="2" fill="#ffc93c"/>`,
  },
];

// Sbloccate fin dall'inizio: una prima risata arriva subito.
export const START_UNLOCKED = 2;

// Risposte giuste totali per sbloccare l'i-esima sorpresa oltre quelle iniziali:
// 5, 12, 21, 32, ... (ogni volta ne servono 2 in più).
export function unlockAt(i: number): number {
  return (i + 1) * (i + 5);
}

export function unlockedCount(totalCorrect: number): number {
  let n = START_UNLOCKED;
  while (n < SURPRISES.length && totalCorrect >= unlockAt(n - START_UNLOCKED)) n++;
  return n;
}

export function nextUnlock(totalCorrect: number): { at: number; from: number } | null {
  const n = unlockedCount(totalCorrect);
  if (n >= SURPRISES.length) return null;
  const i = n - START_UNLOCKED;
  return { at: unlockAt(i), from: i === 0 ? 0 : unlockAt(i - 1) };
}

export const CHEERS = [
  'Sei una forza della natura!',
  'Il mio cervello da gufo è impressionato!',
  'Più veloce di un ghepardo in monopattino!',
  'Anche i numeri ti applaudono!',
  'Hai i superpoteri delle tabelline!',
  'Batti il cinque! Anzi, batti il cinque per due!',
  'Uh uh! Il gufo è fiero di te!',
];

// Barzellette raccontate ai cambi di livello, una nuova ogni volta.
export const JOKES = [
  "Sai cosa dice lo zero all'otto? Bella cintura!",
  'Perché il libro di matematica è sempre triste? Perché ha tanti problemi!',
  "Perché il pomodoro non riesce a dormire? Perché l'insalata russa!",
  'Cosa fa una mucca che studia? Muuuultiplicazioni!',
  'Qual è il colmo per un matematico? Avere i giorni contati!',
  'Qual è il colmo per un elettricista? Non essere al corrente!',
  'Perché i fantasmi non sanno dire le bugie? Perché gli si vede attraverso!',
  'Qual è il colmo per un orologiaio? Perdere tempo!',
  'Cosa fa un pesce al computer? Naviga in rete!',
  'Qual è il colmo per un giardiniere? Piantare in asso gli amici!',
];
