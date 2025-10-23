// features/users/columns.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { TrashIcon } from "@/assets/icons";
import type { AppUser } from "./types";

export const userColumns = (
  onEdit: (u: AppUser) => void,
  onDelete: (u: AppUser) => void,
): ColumnDef<AppUser>[] => [
  { accessorKey: "username", header: "Username" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => (
      <span className="rounded-full bg-[#F7F9FC] px-3 py-1 text-sm">
        {getValue<string>()}
      </span>
    ),
  },
  { accessorKey: "unit_code", header: "Unit" },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) =>
      getValue<string>()
        ? dayjs(getValue<string>()).format("YYYY-MM-DD HH:mm")
        : "-",
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex items-center justify-end gap-x-3.5">
          <button onClick={() => onEdit(u)}>✏️</button>
          <button onClick={() => onDelete(u)}>
            <TrashIcon />
          </button>
        </div>
      );
    },
  },
];
