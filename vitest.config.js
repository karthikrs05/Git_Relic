import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Default environment for server-side tests
    environment: 'node',
    // Switch to jsdom for anything under src/
    environmentMatchGlobs: [
      ['src/**/*.test.{js,jsx}', 'jsdom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        'src/data/**',
        '**/*.config.*',
        'dist/**',
      ],
    },
  },
});
