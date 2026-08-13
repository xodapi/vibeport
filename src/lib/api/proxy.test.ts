import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProxyApiError, proxyApi } from './proxy';

describe('proxyApi', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns typed health data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    ));

    await expect(proxyApi.health()).resolves.toEqual({ status: 'ok' });
    expect(fetch).toHaveBeenCalledWith('/api/proxy/health', expect.any(Object));
  });

  it('throws a typed API error with the proxy message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'provider-1: 429' }), { status: 429 }),
    ));

    await expect(proxyApi.health()).rejects.toMatchObject({
      name: 'ProxyApiError',
      status: 429,
      message: 'provider-1: 429',
    });
  });
});
