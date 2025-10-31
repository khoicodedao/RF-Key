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
