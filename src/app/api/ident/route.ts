import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { getHttpsAgentIfPresent } from "../backend-agent";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000"; // fallback

async function getBearerFromCookies(): Promise<string | null> {
  const jar = await cookies();

  // 1) cookie 'token'
  const tk = jar.get("token")?.value;
  if (tk) return `Bearer ${tk}`;

  // 2) cookie 'auth' có thể chứa JSON {"token": "..."}
  const rawAuth = jar.get("auth")?.value;
  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth); // nếu bạn encode, decodeURIComponent trước
      if (parsed?.token) return `Bearer ${parsed.token}`;
    } catch {
      // ignore
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Nếu request gốc đã có Authorization thì dùng luôn; không thì lấy từ cookie
    const incomingAuth = req.headers.get("authorization");
    const cookieBearer = await getBearerFromCookies();
    const bearer =
      (incomingAuth && incomingAuth.startsWith("Bearer ")
        ? incomingAuth
        : null) || cookieBearer;

    const httpsAgent = getHttpsAgentIfPresent();
    const r = await axios.post(`${BASE_URL}/api/ident/paginate`, body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(bearer ? { Authorization: bearer } : {}),
      },
      // withCredentials: không cần thiết ở server, nhưng để rõ ràng:
      withCredentials: true,
      httpsAgent,
    });

    return NextResponse.json(r.data, { status: r.status });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const err = error.response?.data || { message: error.message };
    console.error("ident/paginate forward error:", status, err);
    return NextResponse.json({ ok: false, error: err }, { status });
  }
}
