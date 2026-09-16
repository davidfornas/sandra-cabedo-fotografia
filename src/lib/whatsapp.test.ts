import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

// whatsapp.ts reads `site` from ../config/site at module scope. To vary the
// configured phone/message per generated sample we mock that module with a
// mutable object and mutate it before each call.
const mockSite = {
  whatsapp: { phone: '', message: '' },
};

vi.mock('../config/site', () => ({
  get site() {
    return mockSite;
  },
}));

import { whatsappUrl } from './whatsapp';

// A phone string that mixes real digits with arbitrary formatting characters
// (spaces, +, dashes, parentheses) and always contains at least one digit.
const formattedPhoneArb = fc
  .array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 15 })
  .chain((digits) => {
    const separators = [' ', '+', '-', '(', ')', '.', ''];
    return fc
      .array(fc.constantFrom(...separators), {
        minLength: digits.length + 1,
        maxLength: digits.length + 1,
      })
      .map((seps) => {
        let out = seps[0];
        for (let i = 0; i < digits.length; i++) {
          out += String(digits[i]) + seps[i + 1];
        }
        return { formatted: out, digits: digits.join('') };
      });
  });

describe('whatsappUrl round trip', () => {
  beforeEach(() => {
    mockSite.whatsapp = { phone: '', message: '' };
  });

  // Feature: sandra-cabedo-fotografia, Property 3: WhatsApp URL preserves the
  // configured number and message.
  it('Property 3: preserves digits-only phone and round-trips the message', () => {
    fc.assert(
      fc.property(formattedPhoneArb, fc.string(), (phone, message) => {
        mockSite.whatsapp = { phone: phone.formatted, message };

        const url = whatsappUrl() as string;
        expect(url).not.toBeNull();

        // Read the raw (still-encoded) parts directly. URLSearchParams would
        // decode `text` for us, defeating the point of an explicit
        // encode/decode round trip against the value whatsappUrl() emitted.
        const [, pathSegment, rawText] =
          /^https:\/\/wa\.me\/([^?]*)\?text=(.*)$/.exec(url) as RegExpExecArray;

        expect(pathSegment).toBe(phone.digits);
        expect(decodeURIComponent(rawText)).toBe(message);
      }),
      { numRuns: 200 },
    );
  });
});
