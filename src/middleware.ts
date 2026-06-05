import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if device_id cookie exists
  let deviceId = request.cookies.get('device_id')?.value;

  if (!deviceId) {
    // Generate a new UUID for this device
    deviceId = crypto.randomUUID();

    // Set the cookie on the response so the browser saves it
    // Using a 10 year expiry to make it virtually permanent for this device
    response.cookies.set('device_id', deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  }

  // Attach device_id to the response headers so the client can read it
  response.headers.set('X-Device-Id', deviceId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|icon.*|.*\\.png|.*\\.jpg).*)',
  ],
};
