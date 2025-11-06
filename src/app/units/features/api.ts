// features/units/api.ts
import { api } from "@/app/utils/api";
import type { Unit } from "./types";

export async function fetchUnits(params?: Record<string, any>) {
  const { data } = await api.post("/units", params ?? {});
  return data?.items ?? [];
}
export async function createUnit(payload: Unit) {
  const { data } = await api.post("/units/create", payload);
  return data;
}
export async function updateUnit(id: string, payload: Partial<Unit>) {
  const { data } = await api.put(`/units/${id}`, payload);
  return data;
}
export async function deleteUnit(id: string) {
  const { data } = await api.delete(`/units/${id}`);
  return data;
}
