import React, { useMemo, useEffect } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { WABlastMessageLogEntry } from "@/types";

// Komponen Paginasi Tabel (diambil dari data-table.tsx)
function DataTablePagination({
  table,
}: {
  table: ReturnType<typeof useReactTable<WABlastMessageLogEntry>>;
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

interface WABlastMessagesTableProps {
  data: WABlastMessageLogEntry[];
  excelColumns: string[]; // Tambahkan prop untuk kolom Excel asli
}

/**
 * Komponen tabel untuk menampilkan log pesan yang dikirim oleh fitur WA Blast.
 * Menampilkan detail seperti waktu, pengirim, penerima, konten pesan, status, dan error.
 * Kini juga menampilkan kolom data asli dari Excel dan memiliki fitur pencarian/paginasi.
 * Ukuran tabel diatur agar tetap (max-height dan overflow-auto) untuk scroll vertikal dan horizontal.
 */
const WABlastMessagesTable: React.FC<WABlastMessagesTableProps> = ({
  data,
  excelColumns, // Terima prop excelColumns
}) => {
  // State untuk mengelola pengurutan kolom tabel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sorting, setSorting] = React.useState<any>([]);
  const [globalFilter, setGlobalFilter] = React.useState(""); // State untuk global filter

  // Definisi kolom-kolom untuk tabel log pesan
  const columns: ColumnDef<WABlastMessageLogEntry>[] = useMemo(
    () => {
      const staticColumns: ColumnDef<WABlastMessageLogEntry>[] = [
        {
          accessorKey: "timestamp",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Waktu
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => {
            // Format timestamp menjadi waktu lokal yang mudah dibaca
            const date = new Date(row.getValue("timestamp"));
            return date.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          },
          minSize: 100, // Ukuran minimum kolom
          maxSize: 120, // Ukuran maksimum kolom
        },
        {
          accessorKey: "senderAccountId",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Pengirim
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => (
            // Memotong teks jika terlalu panjang
            <div className="truncate max-w-[150px]">
              {row.getValue("senderAccountId")}
            </div>
          ),
          minSize: 150,
        },
        {
          accessorKey: "recipientPhoneNumber",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Penerima
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => (
            // Memotong teks jika terlalu panjang
            <div className="truncate max-w-[150px]">
              {row.getValue("recipientPhoneNumber")}
            </div>
          ),
          minSize: 150,
        },
        {
          accessorKey: "messageContent",
          header: "Pesan",
          cell: ({ row }) => (
            // Memotong teks jika terlalu panjang
            <div className="truncate max-w-[250px]">
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
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => {
            // Menentukan warna teks berdasarkan status pesan
            const status = row.getValue("status");
            const colorClass =
              status === "SENT" ? "text-green-600" : "text-red-600";
            return (
              <span className={`font-semibold ${colorClass}`}>
                {status === "SENT" ? "Terkirim" : "Gagal"}
              </span>
            );
          },
          minSize: 100,
        },
        {
          accessorKey: "error",
          header: "Error",
          cell: ({ row }) => (
            // Menampilkan pesan error atau "-" jika tidak ada
            <div className="text-sm text-destructive truncate max-w-[150px]">
              {row.getValue("error") || "-"}
            </div>
          ),
          minSize: 150,
        },
      ];

      const dynamicColumns: ColumnDef<WABlastMessageLogEntry>[] = [];

      const allOriginalDataKeys = new Set<string>();
      data.forEach((entry) => {
        if (entry.originalData) {
          Object.keys(entry.originalData).forEach((key) => {
            allOriginalDataKeys.add(key);
          });
        }
      });

      // Gunakan excelColumns sebagai sumber utama jika tersedia, jika tidak, gunakan semua kunci unik yang ditemukan
      const uniqueKeys = Array.from(allOriginalDataKeys);
      const finalColumnsToUse =
        excelColumns && excelColumns.length > 0 ? excelColumns : uniqueKeys;

      // Tambahkan kolom dari excelColumns yang relevan
      // Urutkan kolom dinamis berdasarkan excelColumns agar konsisten
      finalColumnsToUse.forEach((key) => {
        dynamicColumns.push({
          accessorKey: `originalData.${key}`, // Akses properti di dalam originalData
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {key.charAt(0).toUpperCase() + key.slice(1)} {/* Format header */}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => {
            const value = row.original.originalData?.[key]; // Akses originalData dengan aman
            return (
              <div className="text-sm truncate min-w-[120px]">
                {String(value || "")}
              </div>
            );
          },
          minSize: 120,
        });
      });

      // Gabungkan kolom statis dan dinamis. Kolom dinamis (data asli) akan muncul setelah kolom 'error'.
      return [...staticColumns, ...dynamicColumns];
    },
    [excelColumns, data] // Bergantung pada excelColumns untuk kolom dinamis
  );

  // Menginisialisasi tabel menggunakan useReactTable hook
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter, // Tambahkan global filter ke state tabel
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter, // Tambahkan handler untuk global filter
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Tambahkan ini untuk global filter
    initialState: { pagination: { pageSize: 10 } }, // Menampilkan 10 baris per halaman secara default
  });

  // Efek untuk menggulir ke halaman terakhir saat data diperbarui
  const { setPageIndex, getState } = table;

  useEffect(() => {
    // Ambil pageSize dari state tabel saat ini
    const { pageSize } = getState().pagination;

    // Hitung jumlah halaman secara manual berdasarkan panjang data baru
    const pageCount = Math.ceil(data.length / pageSize);

    // Pastikan ada halaman sebelum mengatur indeks
    if (pageCount > 0) {
      // Atur halaman ke halaman terakhir (indeks berbasis 0)
      setPageIndex(pageCount - 1);
    }
    // Dependensi yang lebih stabil: efek hanya berjalan jika panjang data berubah,
    // atau jika fungsi `setPageIndex` dan `getState` berubah (yang mana jarang terjadi).
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

    // Siapkan data untuk ekspor
    const dataToExport = data.map((entry) => {
      const baseData = {
        Waktu: new Date(entry.timestamp).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        Pengirim: entry.senderAccountIds,
        Penerima: entry.recipientPhoneNumber,
        Pesan: entry.messageContent,
        Status: entry.status === "SENT" ? "Terkirim" : "Gagal",
        Error: entry.error || "-",
      };

      // Gabungkan data asli dari Excel
      const originalExcelData = entry.originalData || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flattenedOriginalData: Record<string, any> = {};
      for (const key in originalExcelData) {
        if (Object.prototype.hasOwnProperty.call(originalExcelData, key)) {
          flattenedOriginalData[`Excel_${key}`] = String(
            originalExcelData[key] || ""
          );
        }
      }

      return { ...baseData, ...flattenedOriginalData };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log WA Blast");

    const fileName = `wa-blast-log-${formattedDate}.xlsx`;
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

export default WABlastMessagesTable;
