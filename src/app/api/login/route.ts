// app/api/login/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backend = await axios.post(`${BASE_URL}/api/auth/login`, body, {
      headers: { "Content-Type": "application/json" },
    });

    const data = backend.data; // { code, message, data: [{ token, ... }] }
    const token = data?.data?.[0]?.token;

    const res = NextResponse.json(data, { status: backend.status });

    // 🔐 Set cookie để middleware đọc được
    if (token) {
      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
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
