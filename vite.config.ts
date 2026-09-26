import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Ogni app è una pagina a sé: aggiungerla qui e in index.html.
export default defineConfig({
  base: '/simpleteach/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tabelline: resolve(__dirname, 'tabelline/index.html'),
      },
    },
  },
});
