import { defineConfig } from 'vitest/config';
import astroConfig from './astro.config.mjs';

// Single source of truth for the deployment base. Read it from astro.config.mjs
// rather than repeating the literal here (Property 2 forbids the base literal
// outside the config).
const BASE = (astroConfig as { base?: string }).base ?? '/';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
    // Vitest exposes BASE_URL="/" on process.env inside workers, which leaks
    // into child `astro build` processes and overrides the base from
    // astro.config.mjs (Vite honours the BASE_URL env var). That would emit
    // pages whose nav/asset URLs drop the base prefix and break the base-safe
    // page-invariant tests. Pin it to the configured base so any build spawned
    // from a test inherits the correct value.
    env: {
      BASE_URL: BASE,
    },
    // Build the static site once before any worker runs so the dist-consuming
    // property tests share a single clean dist/ (avoids concurrent builds
    // corrupting the shared output directory).
    globalSetup: ['./tests/global-setup.ts'],
    // Run test files one at a time. The page-invariant property tests read the
    // shared dist/, and any test file that rebuilds it must not overlap with a
    // build from another file (concurrent `astro build`s into one directory
    // produce corrupted HTML, e.g. nav hrefs rendered without the base).
    fileParallelism: false,
  },
});
