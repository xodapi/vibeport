import { describe, expect, it } from 'vitest';
import { extractOpenAiTextDelta } from './sse';

describe('extractOpenAiTextDelta', () => {
  it('extracts a text delta from an OpenAI SSE frame', () => {
    expect(extractOpenAiTextDelta('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n')).toBe('Hello');
  });

  it('returns empty output for the completion sentinel', () => {
    expect(extractOpenAiTextDelta('data: [DONE]\n\n')).toBe('');
  });

  it('returns null for malformed stream payloads', () => {
    expect(extractOpenAiTextDelta('data: not-json\n\n')).toBeNull();
  });
});
