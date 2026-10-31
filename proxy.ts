import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/src/modules/auth/constants";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const contentType = request.headers.get("content-type") || "";
  const accept = request.headers.get("accept") || "";
  const isJsonRequest =
    contentType.includes("application/json") ||
    accept.includes("application/json");

  // API convenience rewrites: If client POSTs JSON to /signup or /login, rewrite to the API route
  if (request.method === "POST" && isJsonRequest) {
    if (pathname === "/signup") {
      return NextResponse.rewrite(new URL("/api/auth/register", request.url));
    }
    if (pathname === "/login") {
      return NextResponse.rewrite(new URL("/api/auth/login", request.url));
    }
  }

  // Protected route authorization check
  const protectedPaths = ["/dashboard", "/workspaces", "/projects", "/tasks"];
  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected) {
    const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspaces/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/signup/:path*",
    "/signup",
    "/login/:path*",
    "/login",
  ],
};
