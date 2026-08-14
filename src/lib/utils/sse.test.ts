import { describe, expect, it } from 'vitest';
import { extractOpenAiCompletionText, extractOpenAiTextDelta } from './sse';

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

describe('extractOpenAiCompletionText', () => {
  it('extracts assistant text from a non-streaming completion', () => {
    expect(extractOpenAiCompletionText({ choices: [{ message: { content: 'Hello!' } }] })).toBe('Hello!');
  });

  it('returns null for unknown response shapes', () => {
    expect(extractOpenAiCompletionText({ choices: [] })).toBeNull();
    expect(extractOpenAiCompletionText('not a completion')).toBeNull();
  });
});
