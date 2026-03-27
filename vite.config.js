import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        brasil: resolve(__dirname, 'brasil.html'),
        custody: resolve(__dirname, 'custody.html'),
        cases: resolve(__dirname, 'cases.html'),
        case: resolve(__dirname, 'case.html'),
        contribuir: resolve(__dirname, 'contribuir.html'),
      },
    },
  },
});
