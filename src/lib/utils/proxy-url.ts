export function normalizeLocalProxyUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const validProtocol = url.protocol === 'http:' || url.protocol === 'https:';
    const localHost = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);

    if (!validProtocol || !localHost || url.username || url.password) return null;
    return url.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
}
