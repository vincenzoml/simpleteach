import { describe, expect, it } from 'vitest';
import { START_UNLOCKED, SURPRISES, nextUnlock, unlockedCount } from './surprises';
import { Game, choices, tablesFor } from './game';

describe('Game', () => {
  it('sale di livello dopo N risposte giuste al livello N', () => {
    const g = new Game();
    expect(g.answer({ a: 3, b: 4 }, 12)).toBe('levelUp');
    expect(g.level).toBe(2);
    expect(g.answer({ a: 3, b: 4 }, 12)).toBe('correct');
    expect(g.answer({ a: 3, b: 5 }, 15)).toBe('levelUp');
    expect(g.level).toBe(3);
  });

  it('scende di livello dopo 3 errori, a qualunque livello', () => {
    const g = new Game();
    for (let i = 0; i < 6; i++) g.answer({ a: 3, b: 1 }, 3); // -> livello 4
    expect(g.level).toBe(4);
    for (let i = 0; i < 2; i++) expect(g.answer({ a: 3, b: 2 }, 5)).toBe('wrong');
    expect(g.answer({ a: 3, b: 2 }, 5)).toBe('levelDown');
    expect(g.level).toBe(3);
  });

  it('non scende sotto il livello 1', () => {
    const g = new Game();
    for (let i = 0; i < 3; i++) g.answer({ a: 2, b: 2 }, 5);
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

describe('choices', () => {
  it('contiene il risultato giusto e numeri diversi e positivi', () => {
    for (let a = 1; a <= 10; a++)
      for (let b = 1; b <= 10; b++) {
        const c = choices({ a, b }, 4);
        expect(c).toHaveLength(4);
        expect(c).toContain(a * b);
        expect(new Set(c).size).toBe(4);
        expect(c.every((x) => x > 0)).toBe(true);
      }
  });
});

describe('sorprese', () => {
  it('si sbloccano poco alla volta', () => {
    expect(unlockedCount(0)).toBe(START_UNLOCKED);
    expect(unlockedCount(4)).toBe(START_UNLOCKED);
    expect(unlockedCount(5)).toBe(START_UNLOCKED + 1);
    expect(unlockedCount(12)).toBe(START_UNLOCKED + 2);
    expect(unlockedCount(10_000)).toBe(SURPRISES.length);
    expect(nextUnlock(7)).toEqual({ at: 12, from: 5 });
    expect(nextUnlock(10_000)).toBeNull();
  });
});
