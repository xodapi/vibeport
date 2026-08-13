import { NextRequest, NextResponse } from 'next/server';

const allowedPaths = new Set([
  'health',
  'diag',
  'metrics',
  'usage',
  'providers',
  'v1/models',
  'v1/chat/completions',
]);

function upstreamBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_PROXY_URL ?? 'http://127.0.0.1:3001').replace(/\/+$/, '');
}

async function forward(request: NextRequest, segments: string[]): Promise<Response> {
  const path = segments.join('/');
  if (!allowedPaths.has(path) && !/^export\/usage\.(csv|json)$/.test(path)) {
    return NextResponse.json({ error: 'Unsupported proxy endpoint' }, { status: 404 });
  }

  const url = new URL(`${upstreamBaseUrl()}/${path}`);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const upstream = await fetch(url, {
      method: request.method,
      headers: {
        Accept: request.headers.get('accept') ?? 'application/json',
        'Content-Type': request.headers.get('content-type') ?? 'application/json',
      },
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
      cache: 'no-store',
    });

    const headers = new Headers();
    const contentType = upstream.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    for (const name of ['x-model-used', 'x-provider', 'x-request-id', 'retry-after']) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return NextResponse.json(
      { error: `Unable to reach proxyrs at ${upstreamBaseUrl()}` },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await context.params).path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await context.params).path);
}
