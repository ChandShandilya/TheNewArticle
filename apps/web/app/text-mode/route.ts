import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Toggle low-bandwidth "text-only" mode via a cookie, then redirect back.
 * Implemented as a plain GET link so it works with zero client-side JS.
 */
export function GET(): NextResponse {
  const jar = cookies();
  const on = jar.get('textOnly')?.value === '1';
  const referer = headers().get('referer') ?? '/';

  const res = NextResponse.redirect(referer);
  if (on) {
    res.cookies.set('textOnly', '', { path: '/', maxAge: 0 });
  } else {
    res.cookies.set('textOnly', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  return res;
}
