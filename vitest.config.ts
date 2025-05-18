import { defineConfig } from 'vitest/config';

const isCI = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    environment: 'node',
    globals: true,
    sequence: {
      concurrent: false,
      shuffle: false,
    },
    testTimeout: isCI ? 30000 : 10000,
    pool: isCI ? 'forks' : 'threads',
    poolOptions: {
      threads: {
        singleThread: isCI,
      },
      forks: {
        isolate: true,
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.spec.ts', '**/*.test.ts'],
    },
  },
}); 