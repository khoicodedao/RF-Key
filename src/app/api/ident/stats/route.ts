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
      // ignore
    }
  }
  return null;
}

// simple in-memory cache with TTL (node dev server only)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __ident_stats_cache: any;
}

const getCache = () => {
  if (!globalThis.__ident_stats_cache) globalThis.__ident_stats_cache = {};
  return globalThis.__ident_stats_cache;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days") || "7";
    const days = Math.max(1, Math.min(90, Number(daysParam || 7)));

    const cache = getCache();
    const key = `days:${days}`;
    const now = Date.now();
    const ttl = 30 * 1000; // 30 seconds cache
    if (cache[key] && now - cache[key].ts < ttl) {
      return NextResponse.json({
        ok: true,
        fromCache: true,
        data: cache[key].data,
      });
    }

    const incomingAuth = req.headers.get("authorization");
    const cookieBearer = await getBearerFromCookies();
    const bearer =
      (incomingAuth && incomingAuth.startsWith("Bearer ")
        ? incomingAuth
        : null) || cookieBearer;

    // request many items - tune limit as needed
    const limit = 10000;
    const r = await axios.post(
      `${BASE_URL}/api/ident/paginate`,
      { filter: "", page: 1, limit },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(bearer ? { Authorization: bearer } : {}),
        },
        withCredentials: true,
      },
    );

    const items = r.data?.items || [];

    // build last N days array
    const dayjs = (await import("dayjs")).default;
    const daysArr: string[] = [];
    for (let i = days - 1; i >= 0; i--)
      daysArr.push(dayjs().subtract(i, "day").format("YYYY-MM-DD"));

    const map: Record<string, number> = {};
    daysArr.forEach((d) => (map[d] = 0));
    for (const it of items) {
      const d = it.created_at
        ? dayjs(it.created_at).format("YYYY-MM-DD")
        : null;
      if (d && map[d] !== undefined) map[d] += 1;
    }

    const result = daysArr.map((d) => ({ date: d, count: map[d] || 0 }));

    cache[key] = { ts: now, data: result };

    return NextResponse.json({ ok: true, fromCache: false, data: result });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const err = error.response?.data || { message: error.message };
    console.error("ident/stats error:", err);
    return NextResponse.json({ ok: false, error: err }, { status });
  }
}
