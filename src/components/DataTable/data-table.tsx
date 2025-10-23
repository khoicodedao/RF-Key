// components/datatable/data-table.tsx
"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // giữ nguyên nếu sếp đang có component Table

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  globalFilterPlaceholder?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  globalFilterPlaceholder = "Search…",
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder={globalFilterPlaceholder}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-10 w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 text-sm outline-none ring-0 focus:border-gray-400 dark:border-dark-3 dark:bg-gray-900 dark:text-white"
        />
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="h-9 rounded-md border border-gray-300 px-3 text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-gray-800"
            onClick={() => table.resetSorting()}
          >
            Reset sort
          </button>
          <button
            type="button"
            className="h-9 rounded-md border border-gray-300 px-3 text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-gray-800"
            onClick={() => {
              setGlobalFilter("");
              table.resetColumnFilters();
            }}
          >
            Reset filter
          </button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow
              key={hg.id}
              className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white"
            >
              {hg.headers.map((h) => (
                <TableHead
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {{
                    asc: " ▲",
                    desc: " ▼",
                  }[h.column.getIsSorted() as string] ?? null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="border-[#eee] dark:border-dark-3">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length}>No data</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm opacity-70">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="h-9 rounded-md border border-gray-300 px-3 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-dark-3 dark:hover:bg-gray-800"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <button
            type="button"
            className="h-9 rounded-md border border-gray-300 px-3 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-dark-3 dark:hover:bg-gray-800"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
