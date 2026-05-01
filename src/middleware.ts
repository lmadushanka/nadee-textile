import { NextResponse, type NextRequest } from "next/server";

/**
 * Do not verify JWT here: Edge middleware bundles env at **build** time, while the
 * Node server reads `AUTH_SECRET` at **runtime** (e.g. Cloud Run). Using `getToken`
 * here caused signed-in users to look logged out and loop on `/login`.
 *
 * Admin auth runs in `admin/layout.tsx` via `auth()` (Node / RSC).
 * Checkout already uses `auth()` in `checkout/page.tsx`.
 *
 * We only forward the current path so login can return to deep admin links.
 */
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname + req.nextUrl.search;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nadee-login-callback", path);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
