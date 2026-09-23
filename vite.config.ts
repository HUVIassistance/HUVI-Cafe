import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR désactivable via DISABLE_HMR=true (utile pour éviter le flicker pendant une passe d'édition).
      hmr: process.env.DISABLE_HMR !== 'true',
      // Désactive la surveillance de fichiers quand DISABLE_HMR est vrai (économise le CPU).
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
