import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isCheckout = path.startsWith("/checkout");

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });
  const isLoggedIn = Boolean(token?.sub);
  const role = (token?.role as "user" | "admin" | undefined) ?? "user";

  if (!isLoggedIn && (isAdmin || isCheckout)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", path + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (isAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/checkout/:path*"],
};
