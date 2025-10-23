// app/admin/licenses/page.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable/data-table";
import { licenseColumns } from "./features/columns";
import { LicenseFormDialog } from "./features/license-form";
import {
  fetchLicenses,
  createLicense,
  updateLicense,
  deleteLicense,
} from "./features/api";
import type { License } from "./features/types";

export default function LicensesPage() {
  const [items, setItems] = React.useState<License[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<License | null>(null);

  const load = React.useCallback(
    async () => setItems(await fetchLicenses()),
    [],
  );
  React.useEffect(() => {
    load();
  }, [load]);

  const columns = licenseColumns(
    (r) => alert(JSON.stringify(r, null, 2)),
    (r) => {
      setEditItem(r);
      setOpen(true);
    },
    async (r) => {
      await deleteLicense(r.license);
      load();
    },
  );

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Licenses</h1>
        <Button
          onClick={() => {
            setEditItem(null);
            setOpen(true);
          }}
        >
          New License
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={items}
        globalFilterPlaceholder="Search license/UID/MAC/IP…"
      />
      <LicenseFormDialog
        open={open}
        onOpenChange={setOpen}
        defaultValues={editItem ?? undefined}
        onSubmit={async (v) => {
          editItem
            ? // @ts-ignore
              await updateLicense(editItem.license, v)
            : await createLicense(v as License);
          load();
        }}
      />
    </div>
  );
}
