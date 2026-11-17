import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import appConfig from './vite.config.mts';

const root = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(appConfig, defineConfig({
  base: './',
  css: { preprocessorMaxWorkers: 0 },
  build: {
    outDir: path.join(root, 'docs/assets/topology-flow'),
    emptyOutDir: false,
    rollupOptions: {
      input: path.join(root, 'docs/topology-flow-preview.html'),
    },
  },
}));
