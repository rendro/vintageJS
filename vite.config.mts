import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const min = mode === 'min';
  return {
    build: {
      // First (default) build wipes dist and emits readable UMD + ESM.
      // Second build (mode=min) appends the minified UMD bundle.
      emptyOutDir: !min,
      minify: min,
      lib: {
        entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
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
