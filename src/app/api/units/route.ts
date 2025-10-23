import { NextResponse } from "next/server";

let units = [
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
];

export async function GET() {
  return NextResponse.json({ items: units });
}

export async function POST(req: Request) {
  const body = await req.json();
  body.created_at = new Date().toISOString();
  body.updated_at = new Date().toISOString();
  units.push(body);
  return NextResponse.json({ ok: true, item: body });
}
