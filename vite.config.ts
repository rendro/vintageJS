import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const min = mode === 'min';
  return {
    build: {
      // First (default) build wipes dist and emits readable UMD + ESM.
      // Second build (mode=min) appends the minified UMD bundle.
      emptyOutDir: !min,
      minify: min ? 'esbuild' : false,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'vintagejs',
        formats: min ? ['umd'] : ['umd', 'es'],
        fileName: (format) =>
          format === 'es'
            ? 'vintage.mjs'
            : min
              ? 'vintage.min.js'
              : 'vintage.js',
      },
    },
    test: {
      environment: 'node',
    },
  };
});
