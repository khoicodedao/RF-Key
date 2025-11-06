// app/api/units/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

export type Unit = {
  unit_code: string;
  parent_unit_code: string | null;
  unit_name: string;
  full_name: string;
  region: "bac" | "trung" | "nam";
  level: number;
  created_at: string;
  updated_at: string;
};

// ⬇️ make it async + await cookies()
async function getBearerFromCookies(): Promise<string | null> {
  const jar = await cookies();

  // 1) cookie 'token'
  const tk = jar.get("token")?.value;
  if (tk) return `Bearer ${tk}`;

  // 2) cookie 'auth' chứa JSON {"token": "..."}
  const rawAuth = jar.get("auth")?.value;
  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth); // nếu bạn đã encode, dùng decodeURIComponent trước
      if (parsed?.token) return `Bearer ${parsed.token}`;
    } catch {
      // ignore
    }
  }
  return null;
}

// export async function GET() {
//   return NextResponse.json({ items: units });
// }

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ưu tiên Authorization sẵn có; nếu không có thì lấy từ cookie (await!)
    const incomingAuth = req.headers.get("authorization");
    const cookieBearer = await getBearerFromCookies();
    const bearer =
      (incomingAuth && incomingAuth.startsWith("Bearer ")
        ? incomingAuth
        : null) || cookieBearer;

    const response = await axios.post(`${BASE_URL}/api/units/paginate`, body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(bearer ? { Authorization: bearer } : {}),
      },
      withCredentials: true,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const errData = error.response?.data || { message: error.message };
    console.error("Forward error:", status, errData);
    return NextResponse.json({ ok: false, error: errData }, { status });
  }
}
