import { NextRequest, NextResponse } from 'next/server';
import { normalizeLocalProxyUrl } from '@/lib/utils/proxy-url';

export async function POST(request: NextRequest) {
  let body: { proxyUrl?: string };
  try {
    body = (await request.json()) as { proxyUrl?: string };
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const proxyUrl = body.proxyUrl ? normalizeLocalProxyUrl(body.proxyUrl) : null;

  if (!proxyUrl) {
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
