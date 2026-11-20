import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import appConfig from './vite.config.mts';

const root = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(appConfig, defineConfig({
  base: './',
  publicDir: false,
  css: { preprocessorMaxWorkers: 0 },
  build: {
    outDir: path.join(root, 'dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        preview: path.join(root, 'topology-flow-preview.html'),
        playground: path.join(root, 'topology-playground.html'),
      },
    },
  },
}));
