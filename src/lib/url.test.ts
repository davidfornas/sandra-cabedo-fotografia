import { afterEach, describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';

const BASES = ['/', '/sandra-cabedo-fotografia/'] as const;

async function loadWithBase(base: string) {
  vi.stubEnv('BASE_URL', base);
  vi.resetModules();
  const mod = await import('./url.ts');
  return mod.withBase;
}

// Site-relative paths as they actually occur: segments joined by single slashes,
// optionally leading and/or trailing slash. This is the real input space withBase
// composes against (route constants and asset paths), so the join slash is the
// only slash that can be duplicated by the composition.
const sitePath = fc
  .array(
    fc.stringMatching(/^[A-Za-z0-9._-]+$/).filter((s) => s.length > 0),
    { minLength: 0, maxLength: 5 },
  )
  .chain((segments) =>
    fc.tuple(fc.boolean(), fc.boolean()).map(([leadingSlash, trailingSlash]) => {
      const body = segments.join('/');
      const withLead = leadingSlash ? `/${body}` : body;
      return trailingSlash && body.length > 0 ? `${withLead}/` : withLead;
    }),
  );

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('withBase', () => {
  // Feature: sandra-cabedo-fotografia, Property 1: Base-safe internal URLs
  it('starts with the active base and has no duplicate slash at the join', async () => {
    for (const base of BASES) {
      const withBase = await loadWithBase(base);
      const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
      const expectedPrefix = normalizedBase === '' ? '/' : normalizedBase;

      fc.assert(
        fc.property(sitePath, (path) => {
          const result = withBase(path);

          expect(result.startsWith(expectedPrefix)).toBe(true);

          const joinStart = normalizedBase.length;
          expect(result.slice(joinStart, joinStart + 2)).not.toBe('//');
        }),
        { numRuns: 100 },
      );
    }
  });
});
