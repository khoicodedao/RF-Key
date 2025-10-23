// features/units/api.ts
import axios from "axios";
import type { Unit } from "./types";

export async function fetchUnits(): Promise<Unit[]> {
  const { data } = await axios.get("/api/units");
  return data.items;
}
export async function createUnit(payload: Unit) {
  const { data } = await axios.post("/api/units", payload);
  return data;
}
export async function updateUnit(id: string, payload: Partial<Unit>) {
  const { data } = await axios.patch(`/api/units/${id}`, payload);
  return data;
}
export async function deleteUnit(id: string) {
  const { data } = await axios.delete(`/api/units/${id}`);
  return data;
}
