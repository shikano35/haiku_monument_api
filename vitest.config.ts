import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    environment: 'node',
    globals: true,
    sequence: {
      concurrent: false,
    },
  },
}); 