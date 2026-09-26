import { describe, expect, it } from 'vitest';
import { Game, tablesFor } from './game';

describe('Game', () => {
  it('sale di livello dopo N risposte giuste al livello N', () => {
    const g = new Game();
    expect(g.answer({ a: 3, b: 4 }, 12)).toBe('levelUp');
    expect(g.level).toBe(2);
    expect(g.answer({ a: 3, b: 4 }, 12)).toBe('correct');
    expect(g.answer({ a: 3, b: 5 }, 15)).toBe('levelUp');
    expect(g.level).toBe(3);
  });

  it('scende di livello dopo 2N errori', () => {
    const g = new Game();
    g.answer({ a: 3, b: 1 }, 3); // -> livello 2
    for (let i = 0; i < 3; i++) expect(g.answer({ a: 3, b: 2 }, 5)).toBe('wrong');
    expect(g.answer({ a: 3, b: 2 }, 5)).toBe('levelDown');
    expect(g.level).toBe(1);
  });

  it('non scende sotto il livello 1', () => {
    const g = new Game();
    g.answer({ a: 2, b: 2 }, 5);
    g.answer({ a: 2, b: 2 }, 5);
    expect(g.level).toBe(1);
    expect(g.wrong).toBe(0);
  });

  it('sceglie le tabelline in base al livello', () => {
    expect(tablesFor(1)).toEqual([1, 2, 10]);
    expect(tablesFor(8).length).toBe(10);
    expect(tablesFor(20).length).toBe(10);
  });

  it('usa solo le tabelline del livello e non ripete la stessa domanda di fila', () => {
    const g = new Game();
    let prev = g.next();
    for (let i = 0; i < 200; i++) {
      const q = g.next();
      expect([1, 2, 10].includes(q.a) || [1, 2, 10].includes(q.b)).toBe(true);
      expect(q.a === prev.a && q.b === prev.b).toBe(false);
      prev = q;
    }
  });
});
