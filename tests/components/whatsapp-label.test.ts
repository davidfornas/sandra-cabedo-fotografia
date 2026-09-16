import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Feature: sandra-cabedo-fotografia, Task 6.9 (WhatsApp label constraint unit test)

const here = dirname(fileURLToPath(import.meta.url));
const componentPath = resolve(here, '../../src/components/WhatsAppCTA.astro');
const componentSource = readFileSync(componentPath, 'utf8');

const ALLOWED_LABELS = [
  'Reserva tu sesión',
  'Hablemos',
  'Consultar disponibilidad',
  'Hablemos por WhatsApp',
] as const;

/**
 * Extract the string-literal members of the `WhatsAppLabel` type union from
 * the component frontmatter. The declaration spans from `WhatsAppLabel =` up to
 * the terminating semicolon, and each member is a single-quoted string literal.
 */
function parseWhatsAppLabelUnion(source: string): string[] {
  const declaration = source.match(/type\s+WhatsAppLabel\s*=([\s\S]*?);/);
  if (!declaration) throw new Error('WhatsAppLabel type declaration not found');
  const members = declaration[1].match(/'([^']*)'/g) ?? [];
  return members.map((literal) => literal.slice(1, -1));
}

describe('WhatsAppCTA label constraint', () => {
  it('accepts exactly the four allowed labels', () => {
    const parsed = parseWhatsAppLabelUnion(componentSource);
    expect(new Set(parsed)).toEqual(new Set(ALLOWED_LABELS));
    expect(parsed).toHaveLength(ALLOWED_LABELS.length);
  });

  it('does not accept any label outside the allowed set', () => {
    const parsed = new Set(parseWhatsAppLabelUnion(componentSource));
    const disallowed = ['Contáctanos', 'Enviar mensaje', 'WhatsApp', ''];
    for (const label of disallowed) {
      expect(parsed.has(label)).toBe(false);
    }
  });

  it('exposes each allowed label as an accepted member', () => {
    const parsed = new Set(parseWhatsAppLabelUnion(componentSource));
    for (const label of ALLOWED_LABELS) {
      expect(parsed.has(label)).toBe(true);
    }
  });
});

/**
 * Type-level assertion: the runtime allowed-label tuple must be assignable to
 * the compile-time `WhatsAppLabel` union. This mirrors the frontmatter type so
 * a drift between the two is caught by `tsc` even though `.astro` frontmatter
 * cannot be imported directly here.
 */
type WhatsAppLabel =
  | 'Reserva tu sesión'
  | 'Hablemos'
  | 'Consultar disponibilidad'
  | 'Hablemos por WhatsApp';

type AssertAllowedAreLabels = (typeof ALLOWED_LABELS)[number] extends WhatsAppLabel
  ? true
  : never;
type AssertLabelsAreAllowed = WhatsAppLabel extends (typeof ALLOWED_LABELS)[number]
  ? true
  : never;

const _allowedAreLabels: AssertAllowedAreLabels = true;
const _labelsAreAllowed: AssertLabelsAreAllowed = true;
void _allowedAreLabels;
void _labelsAreAllowed;
