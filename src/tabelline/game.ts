// Logica pura del gioco delle tabelline (senza DOM, testabile).
//
// Regola dei livelli: al livello N servono N risposte giuste per salire;
// le vite sono sempre 3: al terzo errore nel livello si scende di un livello (minimo 1).
// Vite fisse, non legate al livello: altrimenti sbagliare apposta diventa una scorciatoia.
//
// Le tabelline le sceglie il gioco: si parte dalle più facili e a ogni
// livello se ne aggiunge una, fino ad averle tutte dal livello 8.

const ORDER = [1, 2, 10, 5, 3, 4, 6, 9, 7, 8];

export function tablesFor(level: number): number[] {
  return ORDER.slice(0, Math.min(ORDER.length, level + 2));
}

export interface Question {
  a: number;
  b: number;
}

export const LIVES = 3;

export type Outcome = 'correct' | 'wrong' | 'levelUp' | 'levelDown';

export class Game {
  level = 1;
  correct = 0;
  wrong = 0;
  private last?: Question;

  constructor(private rand: () => number = Math.random) {}

  get tables(): number[] {
    return tablesFor(this.level);
  }

  get needed(): number {
    return this.level;
  }

  get maxErrors(): number {
    return LIVES;
  }

  next(): Question {
    let q: Question;
    do {
      const tables = this.tables;
      // La tabellina più nuova esce più spesso, così si impara.
      const a = this.rand() < 0.4 ? tables[tables.length - 1] : tables[Math.floor(this.rand() * tables.length)];
      const b = 1 + Math.floor(this.rand() * 10);
      q = this.rand() < 0.5 ? { a, b } : { a: b, b: a };
    } while (this.last && q.a === this.last.a && q.b === this.last.b);
    this.last = q;
    return q;
  }

  answer(q: Question, value: number): Outcome {
    if (value === q.a * q.b) {
      this.correct++;
      if (this.correct >= this.needed) {
        this.setLevel(this.level + 1);
        return 'levelUp';
      }
      return 'correct';
    }
    this.wrong++;
    if (this.wrong >= this.maxErrors) {
      if (this.level > 1) {
        this.setLevel(this.level - 1);
        return 'levelDown';
      }
      this.setLevel(1);
    }
    return 'wrong';
  }

  private setLevel(level: number) {
    this.level = level;
    this.correct = 0;
    this.wrong = 0;
  }
}

const shuffle = <T>(xs: T[], rand: () => number): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// n numeri mescolati: il risultato giusto più errori plausibili (tabellina vicina, ±1, cifre invertite).
export function choices(q: Question, n: number, rand: () => number = Math.random): number[] {
  const r = q.a * q.b;
  const near = [r + q.a, r - q.a, r + q.b, r - q.b, r + 1, r - 1, r + 10, r - 10,
    (q.a + 1) * (q.b + 1), Number([...String(r)].reverse().join(''))];
  const wrong = new Set<number>();
  for (const c of shuffle(near, rand)) if (c > 0 && c !== r && wrong.size < n - 1) wrong.add(c);
  for (let k = 2; wrong.size < n - 1; k++) wrong.add(r + k);
  return shuffle([r, ...wrong], rand);
}
