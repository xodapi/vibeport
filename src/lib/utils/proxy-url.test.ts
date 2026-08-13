import { describe, expect, it } from 'vitest';
import { normalizeLocalProxyUrl } from './proxy-url';

describe('normalizeLocalProxyUrl', () => {
  it.each([
    ['http://127.0.0.1:3001', 'http://127.0.0.1:3001'],
    ['http://localhost:3001/', 'http://localhost:3001'],
    ['https://localhost:3001/proxy/', 'https://localhost:3001/proxy'],
  ])('accepts safe local proxy URL %s', (input, expected) => {
    expect(normalizeLocalProxyUrl(input)).toBe(expected);
  });

  it.each([
    'https://example.com',
    'ftp://127.0.0.1:3001',
    'http://user:password@127.0.0.1:3001',
    'not-a-url',
  ])('rejects unsafe proxy URL %s', (input) => {
    expect(normalizeLocalProxyUrl(input)).toBeNull();
  });
});
