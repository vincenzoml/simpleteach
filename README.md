# SimpleTeach

Piccole app didattiche per bambini, semplici e giocose. Tutto gira nel browser, niente account, niente pubblicità.

**Giocale qui:** https://vincenzoml.github.io/simpleteach/

## App

| App | Per chi | Cosa fa |
|---|---|---|
| [Tabelline](https://vincenzoml.github.io/simpleteach/tabelline/) | Terza elementare | Domande sulle tabelline lette ad alta voce. Al livello N servono N risposte giuste per salire; con 2N errori si torna al livello precedente. |

## Sviluppo

```bash
npm install
npm run dev     # server locale
npm test        # test della logica di gioco
npm run build   # compila in dist/
```

Ogni push su `main` compila e pubblica su GitHub Pages (`.github/workflows/pages.yml`).

Per aggiungere un'app: una cartella con `index.html`, il codice in `src/<app>/`, una voce in `vite.config.ts` e una scheda in `index.html`.
