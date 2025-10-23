import { NextResponse } from "next/server";

let users: any[] = [];

export async function PATCH(
  req: Request,
  { params }: { params: { username: string } },
) {
  const body = await req.json();
  const idx = users.findIndex((x) => x.username === params.username);
  if (idx >= 0) {
    users[idx] = {
      ...users[idx],
      ...body,
      updated_at: new Date().toISOString(),
    };
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { username: string } },
) {
  users = users.filter((x) => x.username !== params.username);
  return NextResponse.json({ ok: true });
}
