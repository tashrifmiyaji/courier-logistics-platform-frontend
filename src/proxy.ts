import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/dashboard"];

export function proxy(request: NextRequest) {
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  const hasSession =
    request.cookies.has("accessToken") || request.cookies.has("refreshToken");

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
