"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { WarmerMessageLogEntry } from "@/types";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
} from "lucide-react";
import React, { useMemo, useEffect } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// Komponen Paginasi Tabel yang disamakan dengan WABlastMessagesTable
function DataTablePagination({
  table,
}: {
  table: ReturnType<typeof useReactTable<WarmerMessageLogEntry>>;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-y-4 gap-x-6 px-2">
      <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
        Total {table.getFilteredRowModel().rows.length} baris data.
      </div>
      <div className="flex items-center justify-center flex-wrap gap-y-2 gap-x-4">
        <div className="flex items-center gap-x-2">
          <p className="text-sm font-medium">Baris/hal</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 w-[75px] text-sm rounded-md border border-input bg-background px-2 py-1 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {[20, 50, 100, 200].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[120px] items-center justify-center text-sm font-medium text-nowrap">
          Hal {table.getState().pagination.pageIndex + 1} dari{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hidden lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hidden lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Komponen untuk menampilkan tabel log pesan warmer.
 * @param {object} props
 * @param {WarmerMessageLogEntry[]} props.data
 */
export const WarmerMessagesTable: React.FC<{
  data: WarmerMessageLogEntry[];
}> = ({ data }) => {
  // State untuk mengelola pengurutan kolom dan filter global
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sorting, setSorting] = React.useState<any>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<WarmerMessageLogEntry>[] = useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Waktu
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("timestamp"));
          return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        },
        minSize: 100,
        maxSize: 120,
      },
      {
        accessorKey: "senderAccountId",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pengirim
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="truncate max-w-[210px]">
            {row.getValue("senderAccountId")}
          </div>
        ),
        minSize: 150,
      },
      {
        accessorKey: "recipientAccountId",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Penerima
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="truncate max-w-[210px]">
            {row.getValue("recipientAccountId")}
          </div>
        ),
        minSize: 150,
      },
      {
        accessorKey: "messageContent",
        header: "Pesan",
        cell: ({ row }) => (
          <div className="truncate max-w-[500px]">
            {row.getValue("messageContent")}
          </div>
        ),
        minSize: 200,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status");
          const colorClass =
            status === "sent" ? "text-green-600" : "text-red-600";
          return (
            <span className={`font-semibold ${colorClass}`}>
              {status === "sent" ? "Terkirim" : "Gagal"}
            </span>
          );
        },
        minSize: 100,
      },
      {
        accessorKey: "error",
        header: "Error",
        cell: ({ row }) => (
          <div className="text-sm text-destructive truncate max-w-[150px]">
            {row.getValue("error") || "-"}
          </div>
        ),
        minSize: 150,
      },
    ],
    []
  );

  // Menginisialisasi tabel menggunakan useReactTable hook
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const { setPageIndex, getState } = table;

  // Efek untuk menggulir ke halaman terakhir saat data diperbarui
  useEffect(() => {
    const { pageSize } = getState().pagination;
    const pageCount = Math.ceil(data.length / pageSize);
    if (pageCount > 0) {
      setPageIndex(pageCount - 1);
    }
  }, [data.length, setPageIndex, getState]);

  const handleExportExcel = () => {
    if (data.length === 0) {
      toast.warning("Tidak ada data untuk diekspor.");
      return;
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;

    if (typeof XLSX === "undefined") {
      toast.error(
        "Pustaka ekspor (XLSX) tidak ditemukan. Coba muat ulang halaman."
      );
      return;
    }

    const dataToExport = data.map((entry) => ({
      Waktu: new Date(entry.timestamp).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      Pengirim: entry.senderAccountIds,
      Penerima: entry.recipientAccountId,
      Pesan: entry.messageContent,
      Status: entry.status === "sent" ? "Terkirim" : "Gagal",
      Error: entry.error || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log WA Warmer");

    const fileName = `wa-warmer-log-${formattedDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("Data log berhasil diekspor ke Excel!");
  };

  return (
    <div className="space-y-4 w-full p-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Cari di semua kolom..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        <Button
          onClick={handleExportExcel}
          disabled={data.length === 0}
          variant="default"
          size="sm"
          className="cursor-pointer flex-grow sm:flex-grow-0"
        >
          <Download className="mr-2 h-4 w-4" /> Ekspor Log Excel ({data.length})
        </Button>
      </div>
      <div className="relative rounded-md border w-full max-h-[45vh] overflow-auto">
        <table>
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-neutral-900/90">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </thead>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
        <div className="sticky bottom-0 z-10 border-t bg-slate-50 p-2 dark:bg-neutral-900/90">
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  );
};
