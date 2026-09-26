// Salvataggio dei dati dei giocatori, astratto dal posto in cui finiscono.
// Oggi: localStorage del browser. Domani: un altro backend che implementa Store
// (cloud, file, ...) attivato con useStore(), senza toccare le app.

export interface Profile {
  id: string;
  name: string;
  color: string;
}

export interface Store {
  listProfiles(): Promise<Profile[]>;
  saveProfile(p: Profile): Promise<void>;
  deleteProfile(id: string): Promise<void>;
  /** Dati di un'app per un giocatore, es. get(id, 'tabelline'). */
  get<T>(profileId: string, key: string): Promise<T | undefined>;
  set<T>(profileId: string, key: string, value: T): Promise<void>;
}

const PREFIX = 'simpleteach';

function read<T>(k: string): T | undefined {
  try {
    const v = localStorage.getItem(k);
    return v == null ? undefined : (JSON.parse(v) as T);
  } catch {
    return undefined;
  }
}

function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch { /* spazio pieno o modalità privata: si gioca senza salvare */ }
}

export class LocalStore implements Store {
  async listProfiles() {
    return read<Profile[]>(`${PREFIX}.profiles`) ?? [];
  }
  async saveProfile(p: Profile) {
    const all = (await this.listProfiles()).filter((x) => x.id !== p.id);
    write(`${PREFIX}.profiles`, [...all, p]);
  }
  async deleteProfile(id: string) {
    write(`${PREFIX}.profiles`, (await this.listProfiles()).filter((x) => x.id !== id));
    for (const k of Object.keys(localStorage))
      if (k.startsWith(`${PREFIX}.data.${id}.`)) localStorage.removeItem(k);
  }
  async get<T>(profileId: string, key: string) {
    return read<T>(`${PREFIX}.data.${profileId}.${key}`);
  }
  async set<T>(profileId: string, key: string, value: T) {
    write(`${PREFIX}.data.${profileId}.${key}`, value);
  }
}

let store: Store = new LocalStore();
export const useStore = (s: Store) => { store = s; };
export const getStore = () => store;

// Ultimo giocatore su questo dispositivo: preferenza locale, non dato del giocatore.
export const lastProfileId = {
  get: () => read<string>(`${PREFIX}.lastProfile`),
  set: (id: string) => write(`${PREFIX}.lastProfile`, id),
};
