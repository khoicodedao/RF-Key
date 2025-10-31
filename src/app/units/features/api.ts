// features/units/api.ts
import axios from "axios";
import type { Unit } from "./types";
export async function fetchUnits(token?: string): Promise<Unit[]> {
  const { data } = await axios.post(
    "/api/units/",
    {}, // body rỗng hoặc có thể thêm filter/pagination tùy server backend
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    },
  );

  // Giả định backend trả về { items: [...] }
  return data.items || [];
}
export async function createUnit(payload: Unit) {
  const { data } = await axios.post("/api/units", payload);
  return data;
}
export async function updateUnit(id: string, payload: Partial<Unit>) {
  const { data } = await axios.post(`/api/units/${id}`, payload);
  return data;
}
export async function deleteUnit(id: string) {
  const { data } = await axios.post(`/api/units/${id}`);
  return data;
}
