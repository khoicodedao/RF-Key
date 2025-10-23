import { NextResponse } from "next/server";

let units: any[] = [];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const idx = units.findIndex((x) => x.unit_code === params.id);
  if (idx >= 0) {
    units[idx] = {
      ...units[idx],
      ...body,
      updated_at: new Date().toISOString(),
    };
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  units = units.filter((x) => x.unit_code !== params.id);
  return NextResponse.json({ ok: true });
}
