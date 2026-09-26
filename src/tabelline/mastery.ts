// Quanto bene si conosce ogni singola moltiplicazione (es. 3×7).
// Conta le ultime risposte, così il colore segue i progressi recenti.

export interface Fact {
  n: number; // risposte totali
  ok: number; // risposte giuste totali
  last: string; // ultime risposte, '1' giusta '0' sbagliata, la più recente in fondo
}

export type Facts = Record<string, Fact>;

const RECENT = 5;

export const factKey = (a: number, b: number) => `${a}x${b}`;

export function record(facts: Facts, a: number, b: number, right: boolean): Facts {
  const f = facts[factKey(a, b)] ?? { n: 0, ok: 0, last: '' };
  return {
    ...facts,
    [factKey(a, b)]: {
      n: f.n + 1,
      ok: f.ok + (right ? 1 : 0),
      last: (f.last + (right ? '1' : '0')).slice(-RECENT),
    },
  };
}

/** Da 0 a 1, oppure null se non è mai stata chiesta. */
export function score(f: Fact | undefined): number | null {
  if (!f || !f.last) return null;
  return [...f.last].filter((c) => c === '1').length / f.last.length;
}

export const LEVELS = [
  { min: 0.95, color: '#3ec5a3', label: 'La sai benissimo' },
  { min: 0.75, color: '#9be8cf', label: 'La sai bene' },
  { min: 0.5, color: '#ffe066', label: 'Quasi' },
  { min: 0.25, color: '#ffa94d', label: 'Da ripassare' },
  { min: 0, color: '#ff6f69', label: 'Ancora difficile' },
];
export const UNSEEN = { color: '#ece7f7', label: 'Non ancora chiesta' };

export function colorFor(f: Fact | undefined): string {
  const s = score(f);
  return s === null ? UNSEEN.color : LEVELS.find((l) => s >= l.min)!.color;
}
