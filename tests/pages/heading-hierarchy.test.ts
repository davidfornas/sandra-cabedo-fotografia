import { describe, it, beforeAll, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse } from 'node-html-parser';
import fc from 'fast-check';

// Feature: sandra-cabedo-fotografia, Property 8
//
// Property 8: Valid heading hierarchy
// For all built pages, there is exactly one <h1> and no heading level is skipped
// (a level-N heading is only followed by headings of level <= N+1).
// Validates: Requirements 16.3

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const distDir = join(projectRoot, 'dist');

let pages: string[] = [];

function findHtmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

function collectHeadingLevels(html: string): number[] {
  const root = parse(html);
  return root
    .querySelectorAll('h1, h2, h3, h4, h5, h6')
    .map((el) => Number(el.tagName.slice(1)));
}

beforeAll(() => {
  if (!existsSync(join(distDir, 'index.html'))) {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  }
  pages = findHtmlFiles(distDir);
  expect(pages.length).toBeGreaterThan(0);
}, 180_000);

describe('Property 8: valid heading hierarchy over built pages', () => {
  it('has exactly one <h1> and never skips a heading level on any page', () => {
    fc.assert(
      fc.property(fc.constantFrom(...pages), (pagePath) => {
        const levels = collectHeadingLevels(readFileSync(pagePath, 'utf8'));

        const h1Count = levels.filter((level) => level === 1).length;
        expect(h1Count, `expected exactly one <h1> in ${pagePath}`).toBe(1);

        for (let i = 1; i < levels.length; i++) {
          expect(
            levels[i],
            `heading level ${levels[i]} skips from ${levels[i - 1]} in ${pagePath}`,
          ).toBeLessThanOrEqual(levels[i - 1] + 1);
        }
      }),
      { numRuns: 100 },
    );
  });
});
