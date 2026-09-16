import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // house-number-generator's ESM build does `import opentype from
      // 'opentype.js'`, but opentype.js's own ESM entry (dist/opentype.mjs)
      // has no default export - only its UMD build synthesizes one. Force
      // resolution to the UMD build so Rollup's CJS interop can provide it.
      'opentype.js': path.resolve(
        __dirname,
        'node_modules/opentype.js/dist/opentype.js',
      ),
    },
  },
});
