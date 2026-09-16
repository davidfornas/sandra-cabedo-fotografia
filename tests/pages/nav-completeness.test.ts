import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, sep } from 'node:path';
import fc from 'fast-check';
import { parse, type HTMLElement } from 'node-html-parser';
import { site } from '../../src/config/site';
import astroConfig from '../../astro.config.mjs';

// Feature: sandra-cabedo-fotografia, Property 6: Navigation exposes exactly the
// configured sections. Over all built pages, the header nav (the [data-nav-menu]
// list in Header.astro) exposes exactly the configured items in order with
// base-safe hrefs, and at most one item is active (aria-current="page"), and
// exactly one active when the page corresponds to a nav destination.
// Validates: Requirements 3.2, 3.3

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..', '..');
const distDir = join(projectRoot, 'dist');

// The configured deployment base (astro.config.mjs). Every internal href is
// derived from it, so base-safe means "starts with this prefix". Read from the
// single config source so the domain switch (base -> '/') needs no test edit.
const BASE = (astroConfig as { base?: string }).base ?? '/';

const expectedLabels = site.nav.map((item) => item.label);
// The site-relative path a nav item targets, resolved against the base exactly
// as withBase() / astro:assets would produce it in the emitted HTML.
const expectedHrefByLabel = new Map(
  site.nav.map((item) => {
    const right = item.path.startsWith('/') ? item.path.slice(1) : item.path;
    return [item.label, `${BASE}${right}`];
  }),
);
const navTargetHrefs = new Set(expectedHrefByLabel.values());

interface BuiltPage {
  route: string; // dist-relative directory route, e.g. "/", "/newborn/"
  html: string;
}

function collectHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_astro') continue;
      out.push(...collectHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function routeForHtmlFile(file: string): string {
  // dist/index.html -> "/", dist/newborn/index.html -> "/newborn/"
  const rel = relative(distDir, file).split(sep).join('/');
  const withoutIndex = rel.replace(/index\.html$/, '');
  const route = `/${withoutIndex}`.replace(/\/{2,}/g, '/');
  return route;
}

// The href a nav link uses to point at the page currently being rendered.
function expectedSelfHref(route: string): string {
  const right = route.startsWith('/') ? route.slice(1) : route;
  return `${BASE}${right}`;
}

function getNavLinks(html: string): HTMLElement[] {
  const root = parse(html);
  const menu = root.querySelector('[data-nav-menu]');
  if (!menu) return [];
  return menu.querySelectorAll('a.site-header__link');
}

let pages: BuiltPage[] = [];

beforeAll(() => {
  if (!existsSync(join(distDir, 'index.html'))) {
    execFileSync('npm', ['run', 'build'], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
  }
  const files = collectHtmlFiles(distDir);
  pages = files.map((file) => ({
    route: routeForHtmlFile(file),
    html: readFileSync(file, 'utf8'),
  }));
  // Guard: the build must have produced the nine expected pages.
  expect(pages.length).toBeGreaterThanOrEqual(9);
}, 180_000);

describe('Property 6: Navigation exposes exactly the configured sections (Req 3.2, 3.3)', () => {
  it('every built page carries a header nav', () => {
    for (const page of pages) {
      expect(getNavLinks(page.html), `nav missing on ${page.route}`).toHaveLength(
        expectedLabels.length,
      );
    }
  });

  it('all nine pages parse to the expected routes', () => {
    const routes = pages.map((p) => p.route).sort();
    expect(routes).toEqual(
      [
        '/',
        '/aviso-legal/',
        '/contacto/',
        '/crecer-juntos/',
        '/embarazo/',
        '/familia/',
        '/newborn/',
        '/politica-de-privacidad/',
        '/sobre-mi/',
      ].sort(),
    );
  });

  it('nav labels, order, base-safe hrefs, and active state hold for all built pages', () => {
    fc.assert(
      fc.property(fc.constantFrom(...pages), (page) => {
        const links = getNavLinks(page.html);

        // Exactly the configured items, in order.
        const labels = links.map((a) => a.text.replace(/\s+/g, ' ').trim());
        expect(labels).toEqual(expectedLabels);

        for (const link of links) {
          const href = link.getAttribute('href') ?? '';
          // Base-safe: every internal nav href starts with the configured base.
          expect(href.startsWith(BASE), `href not base-safe on ${page.route}: ${href}`).toBe(
            true,
          );
        }

        // Each label maps to its configured base-safe destination.
        for (const link of links) {
          const label = link.text.replace(/\s+/g, ' ').trim();
          expect(link.getAttribute('href')).toBe(expectedHrefByLabel.get(label));
        }

        // Active-state rule: at most one aria-current="page" on any page, and
        // exactly one when the page is itself a nav destination.
        const activeLinks = links.filter(
          (a) => a.getAttribute('aria-current') === 'page',
        );
        expect(activeLinks.length).toBeLessThanOrEqual(1);

        const selfHref = expectedSelfHref(page.route);
        const isNavDestination = navTargetHrefs.has(selfHref);
        if (isNavDestination) {
          expect(
            activeLinks.length,
            `expected exactly one active nav item on ${page.route}`,
          ).toBe(1);
          expect(activeLinks[0].getAttribute('href')).toBe(selfHref);
        }
      }),
      { numRuns: 100 },
    );
  });
});
