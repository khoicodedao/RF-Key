// app/admin/license/features/types.ts

export interface License {
  id: string;
  unit_code: string | null;
  license: string | null;
  status: string | null;
  mac: string | null;
  ip: string | null;
  actived_at: string | null;
  reactived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  device_name: string | null;
  manager_name: string | null;
  unit: string | null;
  region: number | null;
  uid: string | null;
  token_info: string | null;
  token_domain: string | null;
  isSend: number | null;
  sent_at: string | null;
  resent_at: string | null;
  reissue_count: number | null;
}

// Response paginate từ backend
export interface LicensePaginateResponse {
  countTotal: number;
  items: License[];
}
