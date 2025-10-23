import { NextResponse } from "next/server";

let licenses = [
  {
    license: "LIC-001",
    status: "Active",
    unit_code: "U001",
    uid: "UID-1234",
    mac: "28-C5-C8-61-16-FE",
    ip: "192.168.1.10",
    device_name: "KHOI-PC",
    manager_name: "Dũng",
    unit: "Phòng Kinh Doanh",
    region: "bac",
    actived_at: "2025-09-30T14:33:57Z",
    reactived_at: "2025-10-08T03:17:30Z",
    created_at: "2025-09-30T14:33:57Z",
    updated_at: "2025-10-08T03:17:30Z",
  },
];

export async function GET() {
  return NextResponse.json({ items: licenses });
}

export async function POST(req: Request) {
  const body = await req.json();
  body.created_at = new Date().toISOString();
  body.updated_at = new Date().toISOString();
  licenses.push(body);
  return NextResponse.json({ ok: true, item: body });
}
