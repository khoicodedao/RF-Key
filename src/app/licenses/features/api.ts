// app/admin/license/features/api.ts

import type { LicensePaginateResponse } from "./types";

export interface FetchLicensesParams {
  filter?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export async function fetchLicenses(
  params: FetchLicensesParams,
): Promise<LicensePaginateResponse> {
  const res = await fetch("/api/licenses/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Không tải được danh sách license");
  }

  return res.json();
}
