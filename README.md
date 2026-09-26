# SimpleTeach

Piccole app didattiche per bambini, semplici e giocose. Tutto gira nel browser, niente account, niente pubblicità.

**Giocale qui:** https://vincenzoml.github.io/simpleteach/

## App

| App | Per chi | Cosa fa |
|---|---|---|
| [Tabelline](https://vincenzoml.github.io/simpleteach/tabelline/) | Terza elementare | Domande lette ad alta voce, suoni, battute del gufo. Livello N: N risposte giuste per salire, 3 vite per livello, al terzo errore si scende. Le tabelline le sceglie il livello. A volte risposta multipla con una risposta assurda disegnata (unicorno, fiorellini…): le sorprese si sbloccano poco alla volta e si ritrovano nella collezione. |

## Sviluppo

```bash
npm install
npm run dev     # server locale
npm test        # test della logica di gioco
npm run build   # compila in dist/
```

Ogni push su `main` compila e pubblica su GitHub Pages (`.github/workflows/pages.yml`).

Per aggiungere un'app: una cartella con `index.html`, il codice in `src/<app>/`, una voce in `vite.config.ts` e una scheda in `index.html`.
