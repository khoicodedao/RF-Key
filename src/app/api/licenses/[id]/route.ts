import { NextResponse } from "next/server";

let licenses: any[] = [];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const idx = licenses.findIndex((x) => x.license === params.id);
  if (idx >= 0) {
    licenses[idx] = {
      ...licenses[idx],
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
  licenses = licenses.filter((x) => x.license !== params.id);
  return NextResponse.json({ ok: true });
}
