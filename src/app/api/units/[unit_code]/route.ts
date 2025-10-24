// app/api/units/[unit_code]/route.ts
import { NextResponse } from "next/server";
import type { Unit } from "../route";

export async function GET(
  _req: Request,
  { params }: { params: { unit_code: string } },
) {
  const code = decodeURIComponent(params.unit_code);
  const item = (global as any).units?.find?.((u: Unit) => u.unit_code === code);
  // Khi import chéo khó, ta truy cập trực tiếp module khác không tiện,
  // nên lặp lại "units" bằng cache toàn cục hoặc tách ra 1 module shared.
  // Ở đây đơn giản: sử dụng require cache fallback.
  let units: Unit[];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    units = require("../../route").units as Unit[];
  } catch {
    return NextResponse.json(
      { ok: false, error: "Units store not accessible" },
      { status: 500 },
    );
  }

  const found = units.find((u) => u.unit_code === code);
  if (!found)
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 },
    );
  return NextResponse.json({ item: found });
}

export async function PATCH(
  req: Request,
  { params }: { params: { unit_code: string } },
) {
  const code = decodeURIComponent(params.unit_code);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const shared = require("../../route") as { units: Unit[] };
  const idx = shared.units.findIndex((u) => u.unit_code === code);
  if (idx === -1)
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 },
    );

  const patch = (await req.json()) as Partial<Unit>;
  const now = new Date().toISOString();
  const current = shared.units[idx];

  const updated: Unit = {
    ...current,
    ...patch,
    parent_unit_code:
      patch.parent_unit_code === undefined
        ? current.parent_unit_code
        : (patch.parent_unit_code as string | null),
    region: (patch.region ?? current.region) as Unit["region"],
    level: typeof patch.level === "number" ? patch.level : current.level,
    updated_at: now,
  };

  shared.units[idx] = updated;
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { unit_code: string } },
) {
  const code = decodeURIComponent(params.unit_code);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const shared = require("../../route") as { units: Unit[] };

  const before = shared.units.length;
  shared.units = shared.units.filter((u) => u.unit_code !== code);
  // Xóa luôn các node con (nếu muốn)
  shared.units = shared.units.filter((u) => u.parent_unit_code !== code);

  const after = shared.units.length;
  if (after === before)
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 },
    );

  return NextResponse.json({ ok: true });
}
