// features/licenses/api.ts
import axios from "axios";
import type { License } from "./types";

export async function fetchLicenses(): Promise<License[]> {
  const { data } = await axios.get("/api/licenses");
  return data.items;
}
export async function createLicense(payload: License) {
  const { data } = await axios.post("/api/licenses", payload);
  return data;
}
export async function updateLicense(id: string, payload: Partial<License>) {
  const { data } = await axios.patch(`/api/licenses/${id}`, payload);
  return data;
}
export async function deleteLicense(id: string) {
  const { data } = await axios.delete(`/api/licenses/${id}`);
  return data;
}
