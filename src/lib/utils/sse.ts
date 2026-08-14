export function extractOpenAiTextDelta(frame: string): string | null {
  const lines = frame.split('\n');
  let text = '';

  for (const line of lines) {
    if (!line.startsWith('data:')) continue;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') continue;

    try {
      const payload = JSON.parse(data) as {
        choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
      };
      text += payload.choices?.[0]?.delta?.content ?? payload.choices?.[0]?.message?.content ?? '';
    } catch {
      return null;
    }
  }

  return text;
}

export function extractOpenAiCompletionText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== 'object') return null;

  const message = (choices[0] as { message?: unknown }).message;
  if (!message || typeof message !== 'object') return null;

  const content = (message as { content?: unknown }).content;
  return typeof content === 'string' ? content : null;
}
