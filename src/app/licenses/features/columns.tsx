// features/licenses/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { TrashIcon } from "@/assets/icons";
import { License } from "./types";

export const licenseColumns = (
  onView: (r: License) => void,
  onEdit: (r: License) => void,
  onDelete: (r: License) => void,
): ColumnDef<License>[] => [
  { accessorKey: "license", header: "License" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const v = getValue<"Active" | "Inactive" | "Revoked">();
      const color =
        v === "Active"
          ? "text-[#219653] bg-[#219653]/[0.08]"
          : v === "Inactive"
            ? "text-[#FFA70B] bg-[#FFA70B]/[0.08]"
            : "text-[#D34053] bg-[#D34053]/[0.08]";
      return (
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${color}`}>
          {v}
        </span>
      );
    },
  },
  { accessorKey: "unit_code", header: "Unit" },
  { accessorKey: "device_name", header: "Device" },
  { accessorKey: "manager_name", header: "Manager" },
  { accessorKey: "mac", header: "MAC" },
  { accessorKey: "ip", header: "IP" },
  {
    accessorKey: "reactived_at",
    header: "Re-activated",
    cell: ({ getValue }) =>
      getValue<string>()
        ? dayjs(getValue<string>()).format("YYYY-MM-DD HH:mm")
        : "-",
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div className="flex items-center justify-end gap-x-3.5">
          <button onClick={() => onView(r)}>👁️</button>
          <button onClick={() => onEdit(r)}>✏️</button>
          <button onClick={() => onDelete(r)}>
            <TrashIcon />
          </button>
        </div>
      );
    },
  },
];
