// features/licenses/types.ts
export type License = {
  license: string;
  status: "Active" | "Inactive" | "Revoked";
  unit_code: string;
  uid?: string | null;
  mac?: string | null;
  ip?: string | null;
  actived_at?: string | null;
  reactived_at?: string | null;
  created_at?: string;
  updated_at?: string;
  device_name?: string | null;
  manager_name?: string | null;
  unit?: string | null;
  region?: "bac" | "trung" | "nam";
};
