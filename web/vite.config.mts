import { fileURLToPath } from 'node:url';
import { transformAsync } from '@babel/core';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

/**
 * Reanimated's worklet transform, for the browser. On native, Metro's Babel
 * runs `react-native-worklets/plugin`; Vite 8 has no Babel, so run just that
 * one plugin ourselves. (The package's Oxc build targets Metro bundle mode and
 * `require`s emitted files, which does not work in a browser.)
 * Only app source needs it; TypeScript/JSX are parsed and left for Vite to strip.
 */
const WORKLET_HINT =
  /worklet|useAnimated|useDerivedValue|useFrameCallback|runOnUI|runOnJS|scheduleOn/;

function workletsPlugin(): Plugin {
  return {
    name: 'mynaksh:worklets',
    enforce: 'pre',
    async transform(code, id) {
      const file = id.split('?')[0];
      if (
        file.includes('node_modules') ||
        !/\.[jt]sx?$/.test(file) ||
        !WORKLET_HINT.test(code)
      ) {
        return null;
      }
      const result = await transformAsync(code, {
        filename: file,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        parserOpts: { plugins: ['typescript', 'jsx'] },
        plugins: ['react-native-worklets/plugin'],
      });
      return result?.code
        ? { code: result.code, map: result.map ?? undefined }
        : null;
    },
  };
}

// Platform files first, so `clipboard.web.ts` wins over `clipboard.ts`.
const WEB_EXTENSIONS = [
  '.web.tsx',
  '.web.ts',
  '.web.js',
  '.tsx',
  '.ts',
  '.js',
  '.json',
];

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [workletsPlugin(), react()],
  resolve: {
    alias: { 'react-native': 'react-native-web' },
    extensions: WEB_EXTENSIONS,
  },
  // Pre-bundled dependencies need the same platform-first resolution (e.g. safe-area-context).
  optimizeDeps: {
    rolldownOptions: { resolve: { extensions: WEB_EXTENSIONS } },
  },
  define: {
    __DEV__: JSON.stringify(true),
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  server: { port: 5173, fs: { allow: [projectRoot] } },
});
