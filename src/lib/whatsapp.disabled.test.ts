import { afterEach, describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';

const whitespaceChar = fc.constantFrom('', ' ', '\t', '\n', '\r', '\f', '\v', '\u00a0');
const whitespaceOnlyPhone = fc.array(whitespaceChar, { maxLength: 12 }).map((parts) => parts.join(''));

afterEach(() => {
  vi.resetModules();
  vi.doUnmock('../config/site');
});

describe('WhatsApp disabled path', () => {
  // Feature: sandra-cabedo-fotografia, Property 4: WhatsApp disabled path and hidden phone
  it('is disabled and yields no url for empty or whitespace-only phones', async () => {
    await fc.assert(
      fc.asyncProperty(whitespaceOnlyPhone, fc.string(), async (phone, message) => {
        vi.resetModules();
        vi.doMock('../config/site', () => ({
          site: {
            whatsapp: { phone, message },
          },
        }));
        const { isWhatsAppEnabled, whatsappUrl } = await import('./whatsapp.ts');

        expect(isWhatsAppEnabled()).toBe(false);
        expect(whatsappUrl()).toBe(null);
      }),
      { numRuns: 100 },
    );
  });
});
