"use client";
import * as React from "react";
import { DataTable } from "@/components/DataTable/data-table";
import { userColumns } from "./features/columns";
import { UserFormDialog } from "./features/user-form";
import { fetchUsers, createUser, updateUser, deleteUser } from "./features/api";
import type { AppUser } from "./features/types";

export default function UsersPage() {
  const [items, setItems] = React.useState<AppUser[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<AppUser | null>(null);

  const load = React.useCallback(async () => setItems(await fetchUsers()), []);
  React.useEffect(() => {
    load();
  }, [load]);

  const columns = userColumns(
    (u) => {
      setEditItem(u);
      setOpen(true);
    },
    async (u) => {
      await deleteUser(u.username);
      load();
    },
  );

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <button
          onClick={() => {
            setEditItem(null);
            setOpen(true);
          }}
          className="h-9 rounded-md bg-blue-600 px-3 text-sm text-white hover:bg-blue-700"
        >
          New User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        globalFilterPlaceholder="Search username/role/unit…"
      />

      <UserFormDialog
        open={open}
        onOpenChange={setOpen}
        defaultValues={editItem ?? undefined}
        onSubmit={async (v) => {
          editItem
            ? await updateUser(editItem.username, v)
            : await createUser(v as AppUser);
          load();
        }}
      />
    </div>
  );
}
