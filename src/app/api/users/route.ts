import { NextResponse } from "next/server";

let users = [
  {
    username: "admin",
    password: "12345678",
    role: "admin",
    unit_code: "U001",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    username: "staff1",
    password: "12345678",
    role: "editor",
    unit_code: "U001",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ items: users });
}

export async function POST(req: Request) {
  const body = await req.json();
  body.created_at = new Date().toISOString();
  body.updated_at = new Date().toISOString();
  users.push(body);
  return NextResponse.json({ ok: true, item: body });
}
