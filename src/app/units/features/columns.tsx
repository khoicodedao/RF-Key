// features/units/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { TrashIcon } from "@/assets/icons";
import { PreviewIcon } from "@/components/Tables/icons"; // hoặc đường dẫn sẵn của sếp
import { DownloadIcon } from "@/components/Tables/icons";
import { Button } from "@/components/ui-elements/button";
import { Unit } from "./types";

export const unitColumns = (
  onView: (u: Unit) => void,
  onEdit: (u: Unit) => void,
  onDelete: (u: Unit) => void,
): ColumnDef<Unit>[] => [
  {
    accessorKey: "unit_code",
    header: "Unit Code",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.unit_code}</span>
    ),
  },
  { accessorKey: "unit_name", header: "Unit Name" },
  { accessorKey: "full_name", header: "Full Name" },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ getValue }) => {
      const v = getValue<string>();
      const label = v === "bac" ? "Bắc" : v === "trung" ? "Trung" : "Nam";
      return (
        <span className="rounded-full bg-[#F7F9FC] px-3 py-1 text-sm">
          {label}
        </span>
      );
    },
  },
  { accessorKey: "level", header: "Level" },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) =>
      getValue<string>()
        ? dayjs(getValue<string>()).format("YYYY-MM-DD HH:mm")
        : "-",
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
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
          <button className="hover:text-primary" onClick={() => onView(u)}>
            <span className="sr-only">View</span>
            <PreviewIcon />
          </button>
          <button className="hover:text-primary" onClick={() => onEdit(u)}>
            <span className="sr-only">Edit</span>
            ✏️
          </button>
          <button className="hover:text-primary" onClick={() => onDelete(u)}>
            <span className="sr-only">Delete</span>
            <TrashIcon />
          </button>
          <Button
            variant="green"
            size="default"
            onClick={() => navigator.clipboard.writeText(u.unit_code)}
            label={""}
          >
            <DownloadIcon />
            {/* dùng tạm icon download để demo export/copy */}
          </Button>
        </div>
      );
    },
  },
];
