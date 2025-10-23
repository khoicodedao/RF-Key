// app/admin/units/page.tsx
"use client";

import * as React from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable/data-table";
import { unitColumns } from "./features/columns";
import { UnitFormDialog } from "./features/unit-form";
import { fetchUnits, createUnit, updateUnit, deleteUnit } from "./features/api";
import type { Unit } from "./features/types";

export default function UnitsPage() {
  const [items, setItems] = React.useState<Unit[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<Unit | null>(null);

  const load = React.useCallback(async () => {
    const res = await fetchUnits();
    setItems(res);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const columns = unitColumns(
    (u) => alert(JSON.stringify(u, null, 2)),
    (u) => {
      setEditItem(u);
      setOpen(true);
    },
    async (u) => {
      await deleteUnit(u.unit_code);
      load();
    },
  );

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Units</h1>
        <Button
          onClick={() => {
            setEditItem(null);
            setOpen(true);
          }}
        >
          New Unit
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        globalFilterPlaceholder="Search unit code/name…"
      />

      <UnitFormDialog
        open={open}
        onOpenChange={setOpen}
        // @ts-ignore
        defaultValues={editItem ?? undefined}
        onSubmit={async (v) => {
          if (editItem) await updateUnit(editItem.unit_code, v);
          else
            await createUnit({
              ...v,
              created_at: dayjs().toISOString(),
            } as Unit);
          load();
        }}
      />
    </div>
  );
}
