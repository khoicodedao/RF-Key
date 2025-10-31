// app/api/units/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
const BASE_URL = process.env.BASE_URL || "http://localhost:5000"; // fallback
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
  try {
    // Lấy token từ header gốc
    const authHeader = req.headers.get("authorization");

    // Lấy body request để forward
    const body = await req.json();

    // Gửi request đến server đích
    const response = await axios.post(`${BASE_URL}/api/units/paginate`, body, {
      headers: {
        Authorization: authHeader || "",
        "Content-Type": "application/json",
      },
    });

    // Trả response từ server đích về client
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("Forward error:", error.message);

    return NextResponse.json(
      {
        ok: false,
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 },
    );
  }
}
