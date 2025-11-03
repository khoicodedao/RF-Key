// middleware.ts
import { NextResponse, NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/auth/sign-in",
  "/auth/forgot-password",
  "/api/auth/login", // nếu sếp tách auth route
  "/api/login", // route login ở trên
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  // Bỏ qua static assets / Next internal
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/api/public")
  ) {
    return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Bỏ qua public routes
  if (isPublic(pathname)) return NextResponse.next();

  // Lấy token từ cookie (ưu tiên) hoặc header Authorization
  const cookieToken = req.cookies.get("token")?.value;
  const authHeader = req.headers.get("authorization") || "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const hasToken = Boolean(cookieToken || headerToken);

  // Nếu là API request và không có token -> trả 401 JSON
  if (pathname.startsWith("/api")) {
    if (!hasToken) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // Nếu là page và không có token -> redirect login với callbackUrl
  if (!hasToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    const callbackUrl = `${pathname}${search || ""}`;
    url.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ Áp middleware cho mọi đường dẫn trừ static
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|fonts).*)",
  ],
};
