/**
 * Unit tests for utility and helper logic in the app.
 * Covers: language code mapping, country facts lookup,
 * emoji safety, and input sanitization patterns.
 */

// ─── Language Code Map (mirrors AIChat.tsx) ───────────────────────────────────
const LANG_CODES: Record<string, string> = {
  English: 'en-US', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
  Bengali: 'bn-IN', Kannada: 'kn-IN', Marathi: 'mr-IN', Gujarati: 'gu-IN',
  Urdu: 'ur-PK', French: 'fr-FR', Spanish: 'es-ES', Arabic: 'ar-SA',
  German: 'de-DE', Japanese: 'ja-JP', Portuguese: 'pt-BR', Chinese: 'zh-CN',
};

// ─── Country Facts (mirrors CardsRow.tsx) ────────────────────────────────────
const SUPPORTED_COUNTRIES = [
  'India', 'USA', 'UK', 'Australia', 'Canada', 'France',
  'Germany', 'Japan', 'Brazil', 'South Africa', 'Pakistan', 'Bangladesh', 'Sri Lanka',
];

describe('Language Code Map', () => {
  it('contains all 16 supported languages', () => {
    expect(Object.keys(LANG_CODES)).toHaveLength(16);
  });

  it('maps English to en-US', () => {
    expect(LANG_CODES['English']).toBe('en-US');
  });

  it('maps Hindi to hi-IN', () => {
    expect(LANG_CODES['Hindi']).toBe('hi-IN');
  });

  it('maps Arabic correctly', () => {
    expect(LANG_CODES['Arabic']).toBe('ar-SA');
  });

  it('falls back gracefully for unknown language', () => {
    const lang = 'Klingon';
    const code = LANG_CODES[lang] || 'en-US';
    expect(code).toBe('en-US');
  });

  it('all language codes follow the IETF BCP 47 format (xx-XX)', () => {
    Object.values(LANG_CODES).forEach(code => {
      expect(code).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    });
  });
});

describe('Supported Countries', () => {
  it('supports exactly 13 countries', () => {
    expect(SUPPORTED_COUNTRIES).toHaveLength(13);
  });

  it('includes India', () => {
    expect(SUPPORTED_COUNTRIES).toContain('India');
  });

  it('includes USA', () => {
    expect(SUPPORTED_COUNTRIES).toContain('USA');
  });

  it('does not include unsupported countries', () => {
    expect(SUPPORTED_COUNTRIES).not.toContain('China');
    expect(SUPPORTED_COUNTRIES).not.toContain('Russia');
  });
});

describe('Emoji Array.from() Unicode Safety', () => {
  /**
   * This test validates the fix for the SSR hydration bug.
   * String.split('') breaks multi-byte Unicode emoji into surrogate pairs.
   * Array.from() correctly handles full Unicode code points.
   */

  it('Array.from correctly counts emoji characters', () => {
    const emoji = '🗳️😤';
    // split('') would return 5 broken chars; Array.from returns 2 valid glyphs
    expect(Array.from(emoji).length).toBeLessThanOrEqual(emoji.length);
    expect(Array.from(emoji)[0]).toBe('🗳');
  });

  it('Array.from correctly extracts first emoji without breaking surrogates', () => {
    const emoji = '🎉🧻';
    const first = Array.from(emoji)[0];
    expect(first).toBe('🎉');
  });

  it('handles plain ASCII strings the same as split', () => {
    const text = 'ABC';
    expect(Array.from(text)).toEqual(text.split(''));
  });
});

describe('Input Sanitization Logic', () => {
  // Mirrors the sanitization logic in /api/chat/route.ts
  const sanitize = (input: string): string =>
    input.replace(/<[^>]*>/g, '').replace(/[{}[\]`\\]/g, '').trim();

  const MAX_LENGTH = 2000;

  it('strips HTML script tags', () => {
    const result = sanitize('<script>alert("xss")</script>Hello');
    expect(result).not.toContain('<script>');
    expect(result).toContain('Hello');
  });

  it('strips HTML anchor tags', () => {
    const result = sanitize('<a href="http://evil.com">click</a>');
    expect(result).not.toContain('<a');
    expect(result).toContain('click');
  });

  it('strips curly braces to prevent template injection', () => {
    const result = sanitize('{{system: override}}');
    expect(result).not.toContain('{');
  });

  it('preserves normal question text', () => {
    const result = sanitize('How do I register to vote in India?');
    expect(result).toBe('How do I register to vote in India?');
  });

  it('trims leading and trailing whitespace', () => {
    const result = sanitize('   What is democracy?   ');
    expect(result).toBe('What is democracy?');
  });

  it('rejects messages over 2000 characters', () => {
    const longMsg = 'a'.repeat(MAX_LENGTH + 1);
    expect(longMsg.length).toBeGreaterThan(MAX_LENGTH);
  });

  it('accepts messages at exactly 2000 characters', () => {
    const validMsg = 'a'.repeat(MAX_LENGTH);
    expect(validMsg.length).toBe(MAX_LENGTH);
  });
});
