import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { site } from '../src/config/site.ts';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const BASE_LITERAL = '/sandra-cabedo-fotografia/';
// Read the phone from the single config source instead of hardcoding it here,
// so this test does not itself become a place the phone literal lives.
const PHONE_LITERAL = site.whatsapp.phone;

// Config exceptions: the one place each literal is legitimately allowed to live.
// - astro.config.mjs owns the deployment `base`.
// - src/config/site.ts owns the WhatsApp phone.
// - public/robots.txt is the single static artifact holding the absolute sitemap
//   URL (which necessarily includes the base); it is config-like, not a component
//   that should derive the base, so it is exempt from the base-literal check.
const ALLOWED_FILES = new Set(
  [
    'astro.config.mjs',
    path.join('src', 'config', 'site.ts'),
    path.join('public', 'robots.txt'),
  ].map((p) => path.normalize(p)),
);

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  '.astro',
  '.git',
  '.github',
  '.kiro',
  'assets',
]);

const SOURCE_EXTENSIONS = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.css']);

function isTestFile(relativePath: string): boolean {
  return /\.test\.[cm]?tsx?$/.test(relativePath) || relativePath.split(path.sep).includes('tests');
}

function collectFiles(dir: string, acc: string[]): void {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    const rel = path.relative(projectRoot, abs);
    if (statSync(abs).isDirectory()) {
      if (!IGNORED_DIRS.has(entry)) collectFiles(abs, acc);
      continue;
    }
    if (isTestFile(rel)) continue;
    if (ALLOWED_FILES.has(path.normalize(rel))) continue;

    const ext = path.extname(entry);
    const inPublic = rel.split(path.sep)[0] === 'public';
    if (SOURCE_EXTENSIONS.has(ext) || inPublic) acc.push(rel);
  }
}

function collectRootConfigFiles(acc: string[]): void {
  for (const entry of readdirSync(projectRoot)) {
    const abs = path.join(projectRoot, entry);
    if (statSync(abs).isDirectory()) continue;
    if (isTestFile(entry)) continue;
    if (ALLOWED_FILES.has(path.normalize(entry))) continue;
    if (SOURCE_EXTENSIONS.has(path.extname(entry))) acc.push(entry);
  }
}

const sourceFiles: string[] = [];
collectFiles(path.join(projectRoot, 'src'), sourceFiles);
collectFiles(path.join(projectRoot, 'public'), sourceFiles);
collectFiles(path.join(projectRoot, 'scripts'), sourceFiles);
collectRootConfigFiles(sourceFiles);

describe('no hardcoded base or phone literal in source', () => {
  it('has a non-empty phone literal to check against', () => {
    expect(PHONE_LITERAL.length).toBeGreaterThan(0);
  });

  it('found source files to scan', () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  // Feature: sandra-cabedo-fotografia, Property 2: No hardcoded base or phone literal in source
  it('never contains the base literal or the phone literal outside the config exceptions', () => {
    fc.assert(
      fc.property(fc.constantFrom(...sourceFiles), (relativePath) => {
        const text = readFileSync(path.join(projectRoot, relativePath), 'utf8');
        expect(
          text.includes(BASE_LITERAL),
          `${relativePath} hardcodes the base literal "${BASE_LITERAL}"`,
        ).toBe(false);
        expect(
          text.includes(PHONE_LITERAL),
          `${relativePath} hardcodes the phone literal "${PHONE_LITERAL}"`,
        ).toBe(false);
      }),
      { numRuns: Math.max(100, sourceFiles.length) },
    );
  });
});
