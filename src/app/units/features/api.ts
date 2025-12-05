// features/units/api.ts
import { api } from "@/app/utils/api";
import type { Unit } from "./types";

export type CreateUnitRequest = {
  parent_unit_code?: string | null;
  region: Unit["region"];
  full_name?: string;
  level?: number | null;
  unit_name: string;
};

export type FetchUnitsParams = {
  limit?: number;
  offset?: number;
  [k: string]: any;
};

export async function fetchUnits(params?: FetchUnitsParams) {
  const { data } = await api.post("/units", params ?? {});
  return data?.items ?? [];
}
export async function createUnit(payload: CreateUnitRequest) {
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
