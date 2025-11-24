import axios from "axios";
import type {
  Ident,
  IdentPaginateRequest,
  IdentPaginateResponse,
} from "./types";

/**
 * Paginate idents qua Next API (BFF).
 * Body mẫu: { filter: "status like 'act'" }
 */
export async function fetchIdents(
  params: IdentPaginateRequest,
): Promise<IdentPaginateResponse> {
  const { data } = await axios.post<IdentPaginateResponse>(
    "/api/ident",
    params,
    {
      withCredentials: true, // 🔥 gửi cookie HttpOnly
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  );
  return data;
}

// ---- Create idents (batch) ----
export interface CreateIdentRequest {
  unit_code: string;
  quantity: number;
  region?: number | string;
}

export async function createIdents(params: CreateIdentRequest): Promise<any> {
  const { data } = await axios.post<any>("/api/ident/create", params, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return data;
}
