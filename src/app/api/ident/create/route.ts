import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

async function getBearerFromCookies(): Promise<string | null> {
  const jar = await cookies();

  const tk = jar.get("token")?.value;
  if (tk) return `Bearer ${tk}`;

  const rawAuth = jar.get("auth")?.value;
  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth);
      if (parsed?.token) return `Bearer ${parsed.token}`;
    } catch {
      // ignore parse errors
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // preserve Authorization header if provided, otherwise use cookie
    const incomingAuth = req.headers.get("authorization");
    const cookieBearer = await getBearerFromCookies();
    const bearer =
      (incomingAuth && incomingAuth.startsWith("Bearer ")
        ? incomingAuth
        : null) || cookieBearer;

    const r = await axios.post(`${BASE_URL}/api/ident/create`, body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(bearer ? { Authorization: bearer } : {}),
      },
      withCredentials: true,
    });

    return NextResponse.json(r.data, { status: r.status });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const err = error.response?.data || { message: error.message };
    console.error("ident/create forward error:", status, err);
    return NextResponse.json({ ok: false, error: err }, { status });
  }
}
