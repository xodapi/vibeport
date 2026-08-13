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
