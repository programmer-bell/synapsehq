import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/src/modules/auth/constants";

export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspaces/:path*",
    "/projects/:path*",
    "/tasks/:path*",
  ],
};
