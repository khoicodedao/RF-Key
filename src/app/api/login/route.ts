// app/api/login/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { getHttpsAgentIfPresent } from "../backend-agent";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const httpsAgent = getHttpsAgentIfPresent();
    const backend = await axios.post(`${BASE_URL}/api/auth/login`, body, {
      headers: { "Content-Type": "application/json" },
      httpsAgent,
    });

    const data = backend.data; // { code, message, data: [{ token, ... }] }
    const token = data?.data?.[0]?.token;

    const res = NextResponse.json(data, { status: backend.status });

    if (token) {
      // ❗ Chỉ bật secure khi chắc chắn chạy HTTPS
      const cookieSecure =
        process.env.NODE_ENV === "production" &&
        process.env.NEXT_PUBLIC_APP_URL?.startsWith("https");

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: cookieSecure, // 👈 dùng biến này
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.response?.data || error.message },
      { status: error.response?.status || 500 },
    );
  }
}
