import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';

// Feature: sandra-cabedo-fotografia, Property 7

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '../..');
const distDir = join(projectRoot, 'dist');

interface ParsedPage {
  file: string;
  head: HTMLElement;
}

const pages: ParsedPage[] = [];
let canonicalPrefix = '';

function collectHtmlFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

async function readSiteAndBase(): Promise<{ site: string; base: string }> {
  const config = (await import(join(projectRoot, 'astro.config.mjs'))).default;
  const site = String(config.site);
  const base = String(config.base ?? '/');
  return { site, base };
}

beforeAll(async () => {
  execSync('npm run build', {
    cwd: projectRoot,
    stdio: 'ignore',
  });

  const { site, base } = await readSiteAndBase();
  canonicalPrefix = new URL(base, site).toString();

  for (const file of collectHtmlFiles(distDir)) {
    const html = readFileSync(file, 'utf8');
    const root = parse(html);
    const head = root.querySelector('head');
    if (!head) throw new Error(`No <head> in built page: ${file}`);
    pages.push({ file, head });
  }

  if (pages.length === 0) throw new Error(`No built pages found under ${distDir}`);
}, 180_000);

function metaContent(head: HTMLElement, attr: 'name' | 'property', value: string): string | null {
  const el = head.querySelector(`meta[${attr}="${value}"]`);
  return el ? (el.getAttribute('content') ?? null) : null;
}

const REQUIRED_OG_TAGS = ['og:title', 'og:description', 'og:url', 'og:type'] as const;

describe('Property 7: Per-page SEO head is complete', () => {
  it('every built page declares title, meta description, canonical, and OpenGraph tags', () => {
    const files = pages.map((p) => p.file);

    fc.assert(
      fc.property(fc.constantFrom(...files), (file) => {
        const page = pages.find((p) => p.file === file)!;
        const { head } = page;

        const title = head.querySelector('title')?.text.trim() ?? '';
        expect(title, `non-empty <title> in ${file}`).not.toBe('');

        const description = metaContent(head, 'name', 'description');
        expect(description, `<meta name="description"> present in ${file}`).not.toBeNull();
        expect((description ?? '').trim(), `non-empty description in ${file}`).not.toBe('');

        const canonicalEl = head.querySelector('link[rel="canonical"]');
        expect(canonicalEl, `<link rel="canonical"> present in ${file}`).not.toBeNull();
        const canonicalHref = canonicalEl?.getAttribute('href') ?? '';
        expect(() => new URL(canonicalHref), `canonical is absolute URL in ${file}`).not.toThrow();
        expect(
          canonicalHref.startsWith(canonicalPrefix),
          `canonical "${canonicalHref}" starts with base-safe prefix "${canonicalPrefix}" in ${file}`,
        ).toBe(true);

        for (const tag of REQUIRED_OG_TAGS) {
          const content = metaContent(head, 'property', tag);
          expect(content, `<meta property="${tag}"> present in ${file}`).not.toBeNull();
          expect((content ?? '').trim(), `non-empty ${tag} in ${file}`).not.toBe('');
        }

        expect(metaContent(head, 'property', 'og:url')).toBe(canonicalHref);
      }),
      { numRuns: 100 },
    );
  });
});
