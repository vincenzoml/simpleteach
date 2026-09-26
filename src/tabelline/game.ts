// Logica pura del gioco delle tabelline (senza DOM, testabile).
//
// Regola dei livelli: al livello N servono N risposte giuste per salire;
// se gli errori nel livello arrivano a 2N si scende di un livello (minimo 1).

export interface Question {
  a: number;
  b: number;
}

export type Outcome = 'correct' | 'wrong' | 'levelUp' | 'levelDown';

export class Game {
  level = 1;
  correct = 0;
  wrong = 0;
  private last?: Question;

  constructor(
    public tables: number[],
    private rand: () => number = Math.random,
  ) {}

  get needed(): number {
    return this.level;
  }

  get maxErrors(): number {
    return this.level * 2;
  }

  next(): Question {
    let q: Question;
    do {
      const a = this.tables[Math.floor(this.rand() * this.tables.length)];
      const b = 1 + Math.floor(this.rand() * 10);
      q = this.rand() < 0.5 ? { a, b } : { a: b, b: a };
    } while (
      this.last && q.a === this.last.a && q.b === this.last.b &&
      this.tables.length * 10 > 1
    );
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
