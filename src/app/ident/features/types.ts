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
  sort?: string;
};

export type IdentPaginateResponse = {
  countTotal: number;
  items: Ident[];
};
