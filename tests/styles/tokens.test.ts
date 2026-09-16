import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Feature: sandra-cabedo-fotografia, Task 3.4 (token/example tests)

const here = dirname(fileURLToPath(import.meta.url));
const stylesDir = resolve(here, '../../src/styles');

const tokensCss = readFileSync(resolve(stylesDir, 'tokens.css'), 'utf8');
const baseCss = readFileSync(resolve(stylesDir, 'base.css'), 'utf8');
const utilitiesCss = readFileSync(resolve(stylesDir, 'utilities.css'), 'utf8');

/**
 * Read a custom-property value from CSS text. Only the first declaration is
 * returned, which is what we want for the single :root token block.
 */
function readToken(css: string, name: string): string {
  const match = css.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  if (!match) throw new Error(`token --${name} not found`);
  return match[1].trim();
}

/** Parse a #RGB or #RRGGBB hex color into 0-255 channels. */
function parseHex(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`invalid hex color: ${hex}`);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** WCAG 2.x relative luminance for an sRGB color (0..1). */
function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG contrast ratio between two colors (1..21). */
function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(parseHex(a));
  const lb = relativeLuminance(parseHex(b));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** HSV saturation (0..1) of an sRGB color. */
function hsvSaturation({ r, g, b }: { r: number; g: number; b: number }): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/** Parse the numeric pixel value from a token like "44px". */
function pxValue(token: string): number {
  const match = token.match(/^(\d+(?:\.\d+)?)px$/);
  if (!match) throw new Error(`expected a px value, got: ${token}`);
  return Number(match[1]);
}

describe('tokens.css — color luminance, saturation, and contrast', () => {
  const bg = readToken(tokensCss, 'color-bg');
  const surface = readToken(tokensCss, 'color-surface');
  const surface2 = readToken(tokensCss, 'color-surface-2');
  const text = readToken(tokensCss, 'color-text');
  const textSecondary = readToken(tokensCss, 'color-text-secondary');

  it('background has relative luminance >= 90% (Req 1.1)', () => {
    expect(relativeLuminance(parseHex(bg))).toBeGreaterThanOrEqual(0.9);
  });

  it('secondary surfaces have HSV saturation <= 20% (Req 1.2)', () => {
    expect(hsvSaturation(parseHex(surface))).toBeLessThanOrEqual(0.2);
    expect(hsvSaturation(parseHex(surface2))).toBeLessThanOrEqual(0.2);
  });

  it('main text token has >= 4.5:1 contrast against the background (Req 1.3, 17.1)', () => {
    expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('secondary text token has >= 4.5:1 contrast against the background (Req 1.3, 17.1)', () => {
    expect(contrastRatio(textSecondary, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('tokens.css — touch sizing (Req 2.7)', () => {
  it('--touch-min is >= 44px', () => {
    expect(pxValue(readToken(tokensCss, 'touch-min'))).toBeGreaterThanOrEqual(44);
  });

  it('--touch-gap is >= 8px', () => {
    expect(pxValue(readToken(tokensCss, 'touch-gap'))).toBeGreaterThanOrEqual(8);
  });
});

describe('utilities.css — touch targets consume the sizing tokens (Req 2.7)', () => {
  it('.touch-target enforces the minimum width and height from tokens', () => {
    const block = utilitiesCss.match(/\.touch-target\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(block).toMatch(/min-width:\s*var\(--touch-min\)/);
    expect(block).toMatch(/min-height:\s*var\(--touch-min\)/);
  });

  it('touch groups keep at least the token gap between adjacent controls', () => {
    const row = utilitiesCss.match(/\.touch-row\s*\{([^}]*)\}/)?.[1] ?? '';
    const stack = utilitiesCss.match(/\.touch-stack\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(row).toMatch(/gap:\s*var\(--touch-gap\)/);
    expect(stack).toMatch(/gap:\s*var\(--touch-gap\)/);
  });
});

describe('utilities.css — responsive layout structure (Req 2.2-2.4)', () => {
  it('grid helpers start as a single column at the 320px base', () => {
    // A structural assertion: unit tests cannot render a real viewport, so we
    // assert the base grid declarations are single-column before any @media.
    for (const selector of ['\\.grid', '\\.grid-2', '\\.grid-3']) {
      const block = utilitiesCss.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
      expect(block).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    }
  });

  it('defines the tablet (768px) and desktop (1024px) breakpoints', () => {
    expect(utilitiesCss).toMatch(/@media\s*\(min-width:\s*768px\)/);
    expect(utilitiesCss).toMatch(/@media\s*\(min-width:\s*1024px\)/);
  });

  it('tablet breakpoint promotes multi-column grids', () => {
    const tabletBlocks = utilitiesCss.match(/@media\s*\(min-width:\s*768px\)\s*\{[\s\S]*?repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    expect(tabletBlocks).not.toBeNull();
  });

  it('desktop breakpoint promotes the three-column grid', () => {
    const desktop = utilitiesCss.match(/@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    expect(desktop).not.toBeNull();
  });

  it('uses minmax(0, 1fr) tracks and overflow guards so tracks never force horizontal scroll', () => {
    expect(utilitiesCss).toMatch(/minmax\(0,\s*1fr\)/);
    expect(utilitiesCss).toMatch(/overflow-x:\s*hidden/);
  });
});

describe('base.css — reduced motion (Req 17.4)', () => {
  it('has a prefers-reduced-motion: reduce block', () => {
    expect(baseCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it('reduces transition and animation durations inside that block', () => {
    const block = baseCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*)\}\s*$/)?.[1] ?? '';
    expect(block).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
    expect(block).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
  });
});
