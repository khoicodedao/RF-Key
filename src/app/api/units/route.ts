// app/api/units/route.ts
import { NextResponse } from "next/server";

export type Unit = {
  unit_code: string;
  parent_unit_code: string | null;
  unit_name: string;
  full_name: string;
  region: "bac" | "trung" | "nam";
  level: number;
  created_at: string;
  updated_at: string;
};

let units: Unit[] = [
  {
    unit_code: "U001",
    parent_unit_code: null,
    unit_name: "Phòng Kinh Doanh",
    full_name: "Phòng Kinh Doanh Trung Tâm",
    region: "bac",
    level: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    unit_code: "U001-01",
    parent_unit_code: "U001",
    unit_name: "Nhóm KD 01",
    full_name: "Nhóm Kinh Doanh 01",
    region: "bac",
    level: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    unit_code: "U002",
    parent_unit_code: null,
    unit_name: "Phòng Kỹ Thuật",
    full_name: "Phòng Kỹ Thuật Hệ Thống",
    region: "trung",
    level: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ items: units });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Unit>;
  const now = new Date().toISOString();

  if (!body.unit_code || !body.unit_name || !body.full_name || !body.region) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 },
    );
  }
  if (units.some((u) => u.unit_code === body.unit_code)) {
    return NextResponse.json(
      { ok: false, error: "unit_code already exists" },
      { status: 400 },
    );
  }

  const item: Unit = {
    unit_code: body.unit_code,
    parent_unit_code:
      typeof body.parent_unit_code === "string" ? body.parent_unit_code : null,
    unit_name: body.unit_name,
    full_name: body.full_name,
    region: body.region as Unit["region"],
    level: typeof body.level === "number" ? body.level : 1,
    created_at: now,
    updated_at: now,
  };

  units.push(item);
  return NextResponse.json({ ok: true, item });
}
