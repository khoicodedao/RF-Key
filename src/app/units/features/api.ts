// features/units/api.ts
import axios from "axios";
import type { Unit } from "./types";

// Lấy Bearer token từ localStorage (ưu tiên "auth.token", fallback "token")
function getAuthHeader() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("auth");
    const parsed = raw ? JSON.parse(raw) : null;
    const token = parsed?.token || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

/**
 * Fetch units (paginate/filter)
 * Server Next API: POST /api/units  -> forward /api/units/paginate
 * @param params tuỳ chọn: { page, limit, search, filters... }
 */
export async function fetchUnits(
  params?: Record<string, any>,
): Promise<Unit[]> {
  const { data } = await axios.post(
    "/api/units",
    params ?? {}, // body rỗng hoặc filter/pagination
    {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    },
  );

  // Giả định backend trả { items: [...] }
  return data?.items ?? [];
}

/**
 * Create unit
 * -> tuỳ backend: /api/units (POST) hoặc /api/units/create (POST)
 * Ở đây dùng POST /api/units/create để tách bạch với paginate.
 */
export async function createUnit(payload: Unit) {
  const { data } = await axios.post("/api/units/create", payload, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
  });
  return data;
}

/**
 * Update unit
 * -> method chuẩn: PUT /api/units/:id
 * Body: phần trường thay đổi
 */
export async function updateUnit(id: string, payload: Partial<Unit>) {
  const { data } = await axios.put(`/api/units/${id}`, payload, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
  });
  return data;
}

/**
 * Delete unit
 * -> method chuẩn: DELETE /api/units/:id
 */
export async function deleteUnit(id: string) {
  const { data } = await axios.delete(`/api/units/${id}`, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
  });
  return data;
}
