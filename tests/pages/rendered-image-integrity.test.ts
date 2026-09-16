import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parse, type HTMLElement } from 'node-html-parser';

const projectRoot = resolve(__dirname, '..', '..');
const distDir = join(projectRoot, 'dist');

function collectHtmlFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const images: { page: string; el: HTMLElement }[] = [];

beforeAll(() => {
  if (!existsSync(join(distDir, 'index.html'))) {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  }

  const htmlFiles = collectHtmlFiles(distDir);
  for (const file of htmlFiles) {
    const root = parse(readFileSync(file, 'utf8'));
    // Only images actually rendered with a source. The lightbox uses an
    // inert <img data-lightbox-image> template with no src whose attributes are
    // filled by JS at open time; it is not a rendered content image.
    for (const el of root.querySelectorAll('img[src]')) {
      images.push({ page: file, el });
    }
  }
}, 180_000);

describe('rendered image integrity', () => {
  // Feature: sandra-cabedo-fotografia, Property 5: Rendered image integrity
  it('every built <img> has non-empty alt and positive explicit width/height', () => {
    expect(images.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...images), ({ page, el }) => {
        const alt = el.getAttribute('alt');
        const width = el.getAttribute('width');
        const height = el.getAttribute('height');
        const where = `${page} :: ${el.toString().slice(0, 120)}`;

        expect(alt, `missing alt on ${where}`).toBeTypeOf('string');
        expect((alt ?? '').trim().length, `empty alt on ${where}`).toBeGreaterThan(0);

        expect(width, `missing width on ${where}`).toMatch(/^\d+$/);
        expect(height, `missing height on ${where}`).toMatch(/^\d+$/);
        expect(Number(width), `non-positive width on ${where}`).toBeGreaterThan(0);
        expect(Number(height), `non-positive height on ${where}`).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});
