import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    next: 'src/adapters/next.tsx',
    react: 'src/adapters/react.tsx',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['react', 'react-dom', 'next'],
  treeshake: true,
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    }
  },
})
