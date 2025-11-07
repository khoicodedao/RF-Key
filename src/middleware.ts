// middleware.ts
import { NextResponse, NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/auth/sign-in",
  "/auth/login", // 👉 thêm đường dẫn login mới
  "/auth/forgot-password",
  "/api/auth/login",
  "/api/login",
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

/**
 * Giải mã payload JWT (không verify chữ ký) và kiểm tra exp
 * Trả về true nếu token đã hết hạn hoặc không hợp lệ.
 */
function isJwtExpired(token?: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    // atob edge-safe: dùng Buffer khi có sẵn, fallback globalThis
    const payloadStr = Buffer.from(
      parts[1].replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const payload = JSON.parse(payloadStr || "{}");
    const exp = payload?.exp; // giây kể từ epoch
    if (!exp || typeof exp !== "number") return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return nowSec >= exp;
  } catch {
    return true;
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Public routes bỏ qua
  if (isPublic(pathname)) return NextResponse.next();

  // Lấy token từ cookie (ưu tiên) hoặc header Authorization
  const cookieToken = req.cookies.get("token")?.value || null;
  const authHeader = req.headers.get("authorization") || "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  // Ưu tiên cookieToken, nếu không có mới dùng headerToken
  const token = cookieToken || headerToken;
  const hasToken = Boolean(token);

  // === API routes ===
  if (pathname.startsWith("/api")) {
    if (!hasToken) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    if (isJwtExpired(token)) {
      return NextResponse.json(
        { ok: false, message: "Token expired", code: "token_expired" },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // === Pages ===
  if (!hasToken || isJwtExpired(token)) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in"; // 👉 điều hướng về /auth/login
    const callbackUrl = `${pathname}${search || ""}`;

    const res = NextResponse.redirect(url);

    // Xoá cookie token nếu tồn tại (tránh lặp)
    if (cookieToken) {
      res.cookies.set("token", "", { path: "/", maxAge: 0 });
    }
    return res;
  }

  return NextResponse.next();
}

// ✅ Áp middleware cho mọi đường dẫn trừ static
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|fonts).*)",
  ],
};
