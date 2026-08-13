import { NextRequest, NextResponse } from 'next/server';

function isAllowedProxyUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      ['127.0.0.1', 'localhost', '::1'].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  let body: { proxyUrl?: string };
  try {
    body = (await request.json()) as { proxyUrl?: string };
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const proxyUrl = body.proxyUrl?.trim().replace(/\/+$/, '');

  if (!proxyUrl || !isAllowedProxyUrl(proxyUrl)) {
    return NextResponse.json(
      { error: 'Proxy URL must use http(s) and point to localhost.' },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ proxyUrl });
  response.cookies.set('vibeport_proxy_url', proxyUrl, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
