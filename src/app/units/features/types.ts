// features/units/types.ts
export type Unit = {
  unit_code: string;
  parent_unit_code?: string | null;
  unit_name: string;
  full_name?: string | null;
  region: "bac" | "trung" | "nam";
  level?: number | null;
  created_at?: string;
  updated_at?: string;
};
