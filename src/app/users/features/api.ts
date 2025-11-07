// features/users/api.ts
import axios from "axios";
import type { AppUser } from "./types";

export interface UserPaginateResponse {
  countTotal: number;
  items: AppUser[];
}

export interface UserPaginateRequest {
  page?: number;
  limit?: number;
  q?: string;
  region?: number;
}

/**
 * Lấy danh sách người dùng (gọi API /api/users/paginate)
 */
export async function fetchUsers(
  params: UserPaginateRequest = {},
): Promise<UserPaginateResponse> {
  const { data } = await axios.post<UserPaginateResponse>(
    "/api/users",
    params,
    {
      withCredentials: true, // gửi cookie xác thực
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  );

  // Đảm bảo luôn trả về object có items và countTotal
  return {
    countTotal: data?.countTotal ?? data?.items?.length ?? 0,
    items: data?.items ?? [],
  };
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
