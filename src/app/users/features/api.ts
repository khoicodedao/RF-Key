// features/users/api.ts
import axios from "axios";
import type { AppUser } from "./types";

export async function fetchUsers(): Promise<AppUser[]> {
  const { data } = await axios.get("/api/users");
  return data.items;
}
export async function createUser(payload: AppUser) {
  const { data } = await axios.post("/api/users", payload);
  return data;
}
export async function updateUser(username: string, payload: Partial<AppUser>) {
  const { data } = await axios.patch(`/api/users/${username}`, payload);
  return data;
}
export async function deleteUser(username: string) {
  const { data } = await axios.delete(`/api/users/${username}`);
  return data;
}
