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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { WhatsAppNumberCheckResult } from "@/types";

// Deklarasi global untuk library XLSX yang dimuat dari CDN
declare const XLSX: typeof import("xlsx");

// --- Komponen Paginasi Tabel ---
interface DataTablePaginationProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
}

function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-y-4 gap-x-6 px-2 py-4">
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
            {[25, 50, 100, 200].map((pageSize) => (
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

// --- Komponen Tabel Utama ---
interface DataTableProps {
  data: WhatsAppNumberCheckResult[];
  excelColumns: string[]; // Prop baru untuk kolom Excel asli
}

const DataTable: React.FC<DataTableProps> = ({ data, excelColumns }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sorting, setSorting] = React.useState<any>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Mendapatkan semua kunci unik dari originalData untuk membuat kolom dinamis
  // Menggunakan prop excelColumns untuk memastikan urutan dan hanya kolom yang diunggah
  const dynamicOriginalColumns = useMemo(() => {
    // Filter out 'phoneNumber' column if it's already a static column
    // For NumberCheckResultsTable, 'phoneNumber' is usually part of originalData,
    // but the main 'phoneNumber' column is also explicitly shown.
    // We will make sure 'phoneNumber' is always the first column, then dynamic columns.
    return excelColumns.filter(
      (col) => col !== "phoneNumber" && col !== "status"
    ); // 'status' juga kolom statis
  }, [excelColumns]);

  const columns: ColumnDef<WhatsAppNumberCheckResult>[] = useMemo(() => {
    const staticColumns: ColumnDef<WhatsAppNumberCheckResult>[] = [
      // Kolom "Nomor Telepon" dihapus dari sini.
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status WA
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          let icon;
          let colorClass;
          switch (status) {
            case "active":
              icon = <CheckCircle className="h-4 w-4" />;
              colorClass = "text-green-600";
              break;
            case "inactive":
              icon = <XCircle className="h-4 w-4" />;
              colorClass = "text-red-600";
              break;
            case "error":
              icon = <HelpCircle className="h-4 w-4" />;
              colorClass = "text-yellow-600";
              break;
            case "unknown":
              icon = <HelpCircle className="h-4 w-4" />;
              colorClass = "text-muted-foreground";
              break;
            default:
              icon = <HelpCircle className="h-4 w-4" />;
              colorClass = "text-muted-foreground";
          }
          return (
            <div
              className={`flex items-center gap-2 font-semibold min-w-[100px] ${colorClass}`}
            >
              {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          );
        },
      },
    ];

    const dynamicColumns: ColumnDef<WhatsAppNumberCheckResult>[] =
      dynamicOriginalColumns.map((key) => ({
        accessorKey: `originalData.${key}`, // Akses properti di dalam originalData
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.original.originalData[key];
          return (
            <div className="text-sm truncate min-w-[120px]">
              {String(value || "")}
            </div>
          );
        },
      }));

    // Gabungkan kolom statis dan dinamis.
    return [...staticColumns, ...dynamicColumns];
  }, [dynamicOriginalColumns]);

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
    initialState: { pagination: { pageSize: 25 } }, // Default 25 baris per halaman
  });

  // Efek untuk menggulir ke halaman terakhir saat data diperbarui
  useEffect(() => {
    if (data.length > 0) {
      table.setPageIndex(table.getPageCount() - 1);
    }
  }, [data, table]); // Dependensi: data dan objek table

  const handleExportExcel = (exportActiveOnly: boolean) => {
    let dataToExport = data;
    if (exportActiveOnly) {
      dataToExport = data.filter((item) => item.status === "active");
    }

    if (dataToExport.length === 0) {
      toast.warning(
        `Tidak ada data ${exportActiveOnly ? "aktif" : ""} untuk diekspor.`
      );
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

    // Gabungkan originalData dengan status untuk ekspor
    const finalDataForExport = dataToExport.map((item) => ({
      ...item.originalData,
      "Status WA": item.status.charAt(0).toUpperCase() + item.status.slice(1), // Tambahkan kolom status
    }));

    const worksheet = XLSX.utils.json_to_sheet(finalDataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Hasil Cek Nomor WA ${exportActiveOnly ? "Aktif" : "Semua"}`
    );

    const fileName = `whatsapp-number-check-results-${
      exportActiveOnly ? "active-" : ""
    }${formattedDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success(
      `Data ${exportActiveOnly ? "aktif" : "semua"} berhasil diekspor ke Excel!`
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <Input
          placeholder="Cari..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm flex-grow"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => handleExportExcel(true)} // Ekspor hanya yang aktif
            disabled={
              data.filter((item) => item.status === "active").length === 0
            }
            variant="outline"
            size="sm"
            className="cursor-pointer flex-grow"
          >
            <Download className="mr-2 h-4 w-4" /> Ekspor Aktif (
            {data.filter((item) => item.status === "active").length})
          </Button>
          <Button
            onClick={() => handleExportExcel(false)} // Ekspor semua
            disabled={data.length === 0}
            variant="default"
            size="sm"
            className="cursor-pointer flex-grow"
          >
            <Download className="mr-2 h-4 w-4" /> Ekspor Semua ({data.length})
          </Button>
        </div>
      </div>
      <div className="mx-auto rounded-md border overflow-auto max-h-[45vh]">
        {" "}
        {/* Tambahkan max-h dan overflow-auto */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
        </Table>
      </div>
      <DataTablePagination table={table} />{" "}
      {/* Gunakan komponen paginasi baru */}
    </div>
  );
};

export default DataTable; // Ekspor sebagai DataTable
