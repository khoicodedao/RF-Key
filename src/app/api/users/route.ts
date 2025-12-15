import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { getHttpsAgentIfPresent } from "../backend-agent";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000"; // fallback khi chưa set env

/**
 * Lấy Bearer token từ cookie (ưu tiên token -> auth)
 */
async function getBearerFromCookies(): Promise<string | null> {
  const jar = await cookies();

  // 1️⃣ cookie 'token'
  const tk = jar.get("token")?.value;
  if (tk) return `Bearer ${tk}`;

  // 2️⃣ cookie 'auth' (JSON chứa token)
  const rawAuth = jar.get("auth")?.value;
  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth);
      if (parsed?.token) return `Bearer ${parsed.token}`;
    } catch {
      // ignore parse error
    }
  }

  return null;
}

/**
 * POST /api/users/paginate
 * Forward request từ Next đến backend /api/users/paginate
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Kiểm tra header Authorization có sẵn chưa
    const incomingAuth = req.headers.get("authorization");
    const cookieBearer = await getBearerFromCookies();

    const bearer =
      (incomingAuth && incomingAuth.startsWith("Bearer ")
        ? incomingAuth
        : null) || cookieBearer;

    // Forward sang backend
    const httpsAgent = getHttpsAgentIfPresent();
    const resp = await axios.post(`${BASE_URL}/api/users/paginate`, body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(bearer ? { Authorization: bearer } : {}),
      },
      withCredentials: true,
      httpsAgent,
    });

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const err = error.response?.data || { message: error.message };
    console.error("users/paginate forward error:", status, err);
    return NextResponse.json({ ok: false, error: err }, { status });
  }
}
