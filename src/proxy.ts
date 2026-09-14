import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const adminRoutes = ["/admin"];
const apiAdminRoutes = ["/api/admin"];

// Routes that require specific roles
const orderManagerRoutes = ["/admin/orders"];
const contentManagerRoutes = [
  "/admin/content",
  "/admin/brands",
  "/admin/media",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAdminApiRoute = apiAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  // Allow login page without auth
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // For now, check for NextAuth session token in cookie
  // NextAuth v5 beta uses different cookie names — check common patterns
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    // Redirect to login or return 401
    if (isAdminApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: Full role-based access control requires decoding the JWT.
  // For MVP, the token presence check prevents unauthenticated access.
  // Role checks happen at the page/component level via requireRole().
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
