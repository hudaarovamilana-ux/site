import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasValidSessionJwt } from "@/lib/session-jwt-edge";

const SESSION_COOKIE = "zk_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (token && (await hasValidSessionJwt(token))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/api/ask",
    "/api/trust-chat",
    "/api/health-assessment",
  ],
};
