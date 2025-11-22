import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/api/:path*"],
};

export default async function middleware(req: NextRequest) {
  // Skip auth check for these endpoints
  if (
    req.nextUrl.pathname === "/api/auth/sign-in" ||
    req.nextUrl.pathname.includes("/api/og") ||
    req.nextUrl.pathname.includes("/api/webhook") || 
    req.nextUrl.pathname.includes("/api/drdunk")
  ) {
    return NextResponse.next();
  }

  // For other API routes, let them handle Quick Auth token validation themselves
  // Quick Auth tokens are validated in each route using the Authorization header
  return NextResponse.next();
}
