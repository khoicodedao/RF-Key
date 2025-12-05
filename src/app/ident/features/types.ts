export type Ident = {
  id: string;
  unit_code: string | null;
  license: string | null;
  status: "actived" | "deactived" | string;
  mac: string | null;
  ip: string | null;
  actived_at: string | null;
  reactived_at: string | null;
  created_at: string;
  updated_at: string;
  device_name: string | null;
  manager_name: string | null;
  unit: string | null;
  region: number | string | null;
  uid: string | null;
  token_info: string | null;
  token_domain: string | null;
  isSend: number;
  sent_at: string | null;
};

export type IdentPaginateRequest = {
  // ví dụ: "status like 'act'"
  filter?: string;
  // tuỳ BE có hỗ trợ thêm page/limit/sort không:
  page?: number;
  limit?: number;
  // offset-based pagination (optional)
  offset?: number;
  sort?: string;
};

export type IdentPaginateResponse = {
  countTotal: number;
  items: Ident[];
};
// features/types.ts
export type Unit = {
  unit_code: string;
  parent_unit_code: string | null;
  unit_name: string;
  full_name: string;
  region: number | "bac" | "trung" | "nam"; // chấp nhận số (API) hoặc chuỗi (mock)
  level: number;
  created_at: string;
  updated_at: string;
  // các trường mới từ API thật:
  domains_log?: string[];
  domains_update?: string[];
  domains_control?: string[];
};
