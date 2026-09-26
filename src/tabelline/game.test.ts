import { describe, expect, it } from 'vitest';
import { Game } from './game';

describe('Game', () => {
  it('sale di livello dopo N risposte giuste al livello N', () => {
    const g = new Game([3]);
    expect(g.answer({ a: 3, b: 4 }, 12)).toBe('levelUp');
    expect(g.level).toBe(2);
    expect(g.answer({ a: 3, b: 4 }, 12)).toBe('correct');
    expect(g.answer({ a: 3, b: 5 }, 15)).toBe('levelUp');
    expect(g.level).toBe(3);
  });

  it('scende di livello dopo 2N errori', () => {
    const g = new Game([3]);
    g.answer({ a: 3, b: 1 }, 3); // -> livello 2
    for (let i = 0; i < 3; i++) expect(g.answer({ a: 3, b: 2 }, 5)).toBe('wrong');
    expect(g.answer({ a: 3, b: 2 }, 5)).toBe('levelDown');
    expect(g.level).toBe(1);
  });

  it('non scende sotto il livello 1', () => {
    const g = new Game([2]);
    g.answer({ a: 2, b: 2 }, 5);
    g.answer({ a: 2, b: 2 }, 5);
    expect(g.level).toBe(1);
    expect(g.wrong).toBe(0);
  });

  it('usa solo le tabelline scelte e non ripete la stessa domanda di fila', () => {
    const g = new Game([7]);
    let prev = g.next();
    for (let i = 0; i < 200; i++) {
      const q = g.next();
      expect(q.a === 7 || q.b === 7).toBe(true);
      expect(q.a === prev.a && q.b === prev.b).toBe(false);
      prev = q;
    }
  });
});
