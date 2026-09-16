// @vitest-environment happy-dom
import { describe, it, beforeAll, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import axe from 'axe-core';

// Feature: sandra-cabedo-fotografia, Task 15.6 (axe-core accessibility checks)
// Requirements: 17.1 (color contrast / WCAG AA), 17.2 (full keyboard navigation),
// 17.3 (alt text on informative images)
//
// This is a static Astro site, so we run axe-core against the built dist/ HTML
// loaded into a happy-dom document. happy-dom does not compute layout, colours
// or geometry, so rules that depend on real rendering cannot run reliably here.
// Those are excluded and documented below; the remaining rules still cover the
// structural accessibility guarantees (alt text, landmarks, names, roles, valid
// attributes, etc.). Colour contrast (17.1) is verified separately at the token
// level in tests/styles/tokens.test.ts.
//
// Rules excluded and why:
//   - color-contrast: needs computed colours + layout, which happy-dom lacks.
//     Contrast is covered by tokens.test.ts (task 3.4).
const LAYOUT_DEPENDENT_RULES = ['color-contrast'] as const;

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const distDir = join(projectRoot, 'dist');

// Home page and one representative session page.
const pages = [
  { name: 'Home', file: join(distDir, 'index.html') },
  { name: 'Newborn session', file: join(distDir, 'newborn', 'index.html') },
] as const;

function loadIntoDocument(html: string): void {
  // Replace the whole document so <html lang>, <head> landmarks and <body>
  // structure are all present for axe to inspect. Strip the external stylesheet
  // links first: happy-dom would try to fetch them over HTTP (no server is
  // running), which floods the run with harmless 404/abort noise. The CSS is
  // read from disk directly for the focus-visible check instead.
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*?<html[^>]*>/i, '')
    .replace(/<\/html>[\s\S]*$/i, '')
    .replace(/<link\b[^>]*\brel="stylesheet"[^>]*>/gi, '');

  // Preserve lang from the source <html> so the html-has-lang rule can pass.
  const langMatch = /<html[^>]*\blang="([^"]*)"/i.exec(html);
  if (langMatch) {
    document.documentElement.setAttribute('lang', langMatch[1]);
  }
}

async function runAxe(html: string): Promise<axe.AxeResults> {
  loadIntoDocument(html);
  return axe.run(document, {
    resultTypes: ['violations'],
    rules: Object.fromEntries(
      LAYOUT_DEPENDENT_RULES.map((id) => [id, { enabled: false }]),
    ),
  });
}

function interactiveElements(html: string): Element[] {
  loadIntoDocument(html);
  return Array.from(document.querySelectorAll('a[href], button'));
}

// The disabled WhatsApp CTA is intentionally inert: it carries
// aria-disabled="true" and tabindex="-1" and has no href. Any other element
// with tabindex="-1" would be an unreachable interactive control.
function isIntentionallyInert(el: Element): boolean {
  return el.getAttribute('aria-disabled') === 'true';
}

beforeAll(() => {
  if (!existsSync(join(distDir, 'index.html'))) {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  }
  for (const { file } of pages) {
    expect(existsSync(file), `expected built page at ${file}`).toBe(true);
  }
}, 180_000);

describe('axe-core accessibility over built pages', () => {
  for (const { name, file } of pages) {
    it(`${name}: no serious or critical axe violations`, async () => {
      const html = readFileSync(file, 'utf8');
      const results = await runAxe(html);

      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );

      const summary = blocking
        .map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`)
        .join('\n');

      expect(blocking, `serious/critical violations on ${name}:\n${summary}`).toEqual([]);
    });

    it(`${name}: every interactive element is keyboard reachable (no stray tabindex="-1")`, () => {
      const html = readFileSync(file, 'utf8');
      const elements = interactiveElements(html);
      expect(elements.length).toBeGreaterThan(0);

      const unreachable = elements.filter(
        (el) => el.getAttribute('tabindex') === '-1' && !isIntentionallyInert(el),
      );

      const where = unreachable
        .map((el) => el.outerHTML.slice(0, 120))
        .join('\n');

      expect(
        unreachable,
        `interactive elements removed from tab order on ${name}:\n${where}`,
      ).toEqual([]);
    });
  }

  it('the skip-to-content link is present and focusable on every page', () => {
    for (const { name, file } of pages) {
      const html = readFileSync(file, 'utf8');
      loadIntoDocument(html);

      const skip = document.querySelector<HTMLAnchorElement>('a.skip-link[href="#main"]');
      expect(skip, `missing skip link on ${name}`).not.toBeNull();
      expect(
        skip!.getAttribute('tabindex'),
        `skip link should not be removed from tab order on ${name}`,
      ).not.toBe('-1');

      const mainTarget = document.querySelector('#main');
      expect(mainTarget, `skip link target #main missing on ${name}`).not.toBeNull();
    }
  });

  it('a :focus-visible style rule is present in the loaded CSS (visible focus)', () => {
    // Collect the CSS the pages link to and any inline <style> blocks, then
    // assert a focus-visible rule exists so focused controls stay visible.
    const cssSources: string[] = [];
    for (const { file } of pages) {
      const html = readFileSync(file, 'utf8');

      // Inline <style> blocks from the raw HTML.
      for (const [, css] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
        cssSources.push(css);
      }
      // Linked stylesheets: resolve the base-prefixed href back onto dist/.
      for (const [, href] of html.matchAll(
        /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/gi,
      )) {
        const assetPath = join(distDir, href.replace(/^.*(_astro\/)/, '_astro/'));
        if (existsSync(assetPath)) {
          cssSources.push(readFileSync(assetPath, 'utf8'));
        }
      }
    }

    const allCss = cssSources.join('\n');
    expect(allCss.length, 'expected to load some CSS from the built pages').toBeGreaterThan(0);
    expect(allCss, 'no :focus-visible rule found in the loaded CSS').toMatch(/:focus-visible/);
  });
});
