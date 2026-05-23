import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect dash routes (except login)
  if (pathname.startsWith("/dash")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // If they are on the login page but already have a token, redirect to dashboard
    if (pathname.startsWith("/dash/login")) {
      if (token) {
        return NextResponse.redirect(new URL("/dash", req.url));
      }
    } else {
      // If they are on any other dash page and don't have a token, redirect to login
      if (!token) {
        return NextResponse.redirect(new URL("/dash/login", req.url));
      }
    }
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/dash")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: ["/dash", "/dash/:path*", "/api/admin/:path*", "/api/dash/:path*"],
};
