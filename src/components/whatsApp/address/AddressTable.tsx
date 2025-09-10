"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  SortingState,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  PaginationState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  Loader2,
  RefreshCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileDown,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Address } from "@/types/whatsapp/address";
import { formatDate } from "@/lib/utils";
import { useUrlStore } from "@/stores/whatsapp/socketStore";

// Deklarasi global untuk library XLSX
declare const XLSX: typeof import("xlsx");

const NEXT_PUBLIC_WHATSAPP_SERVER_URL = `${
  useUrlStore.getState().url
}/api/whatsapp`;
// Asumsikan AddressService diimpor dari file terpisah yang berisi fungsi API
// Ini adalah mock API client, Anda perlu mengimplementasikannya sesuai server Express Anda
const AddressService = {
  deleteMany: async (ids: string[]) => {
    const response = await fetch(
      `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/address?/delete-many`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }
    );
    if (!response.ok) {
      throw new Error("Gagal menghapus data.");
    }
    return response.json();
  },
  updateReceivedMessageStatus: async (ids: string[], status: boolean) => {
    const response = await fetch(
      `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/address?/update-status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status }),
      }
    );
    if (!response.ok) {
      throw new Error("Gagal memperbarui status.");
    }
    return response.json();
  },
  getAll: async (
    page: number,
    limit: number,
    skip: number,
    search: string,
    sortBy: string,
    sortOrder: "asc" | "desc"
  ) => {
    const response = await fetch(
      `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/address?/get-all?page=${page}&limit=${limit}&skip=${skip}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
    if (!response.ok) {
      throw new Error("Gagal mengambil data.");
    }
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(
      `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/address?/delete/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Gagal menghapus data.");
    }
    return response.json();
  },
  update: async (id: string, data: Partial<Address>) => {
    const response = await fetch(
      `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/address?/update/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error("Gagal memperbarui data.");
    }
    return response.json();
  },
};

interface DataTablePaginationProps {
  table: ReturnType<typeof useReactTable<Address>>;
  totalData: number;
}

// Asumsikan DataTablePagination ada di file ini atau diimpor
function DataTablePagination({ table, totalData }: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-y-4 gap-x-6 px-2">
      <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
        Total {totalData} baris data.
      </div>
      <div className="flex items-center justify-end flex-wrap gap-y-2 gap-x-4">
        <div className="flex items-center gap-x-2">
          <p className="text-sm font-medium">Baris/hal</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 w-[75px] text-sm rounded-md border border-input bg-background px-2 py-1 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {[10, 20, 50, 100, 200].map((pageSize) => (
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

interface AddressTableProps {
  data: Address[];
  isLoading: boolean;
  onRefresh: () => void;
  onDataDeleted: (id: string) => void;
  onDataEdited: (id: string, updatedData: Partial<Address>) => void;
  pageCount: number;
  totalData: number;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
}

const AddressTable: React.FC<AddressTableProps> = ({
  data,
  isLoading,
  onRefresh,
  onDataDeleted,
  onDataEdited,
  pageCount,
  totalData,
  pagination,
  setPagination,
  globalFilter,
  setGlobalFilter,
  sorting,
  setSorting,
}) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isExporting, setIsExporting] = useState(false);

  // Memuat library XLSX dari CDN saat komponen dimuat
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleEdit = (row: Address) => {
    setEditingRow(row.id);
  };

  const handleSaveEdit = useCallback(
    (id: string, newAddress: string, newName: string) => {
      onDataEdited(id, { address: newAddress, name: newName });
      setEditingRow(null);
    },
    [onDataEdited]
  );

  const handleCancelEdit = () => {
    setEditingRow(null);
  };

  const columns: ColumnDef<Address>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Pilih semua"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Pilih baris"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "phoneNumber",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nomor Telepon
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.phoneNumber}</div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) =>
          editingRow === row.original.id ? (
            <Input
              defaultValue={row.original.name}
              onBlur={(e) =>
                handleSaveEdit(
                  row.original.id,
                  row.original.address,
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveEdit(
                    row.original.id,
                    row.original.address,
                    e.currentTarget.value
                  );
                }
              }}
              onKeyUp={(e) => {
                if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
          ) : (
            <div>{row.original.name}</div>
          ),
      },
      {
        accessorKey: "address",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Alamat
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) =>
          editingRow === row.original.id ? (
            <Input
              defaultValue={row.original.address}
              onBlur={(e) =>
                handleSaveEdit(
                  row.original.id,
                  e.target.value,
                  row.original.name
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveEdit(
                    row.original.id,
                    e.currentTarget.value,
                    row.original.name
                  );
                }
              }}
              onKeyUp={(e) => {
                if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
          ) : (
            <div>{row.original.address}</div>
          ),
      },
      {
        accessorKey: "businessCategory",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.businessCategory}</div>,
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
          const status = row.original.status;
          const colorClass =
            status === "ACTIVE" ? "text-green-600" : "text-red-600";
          return (
            <span className={`font-semibold ${colorClass}`}>{status}</span>
          );
        },
      },
      {
        accessorKey: "hasReceivedMessage",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pesan Diterima
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>{row.original.hasReceivedMessage ? "Ya" : "Tidak"}</div>
        ),
      },

      {
        accessorKey: "rating",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rating
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.rating}</div>,
      },
      {
        accessorKey: "reviews",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reviews
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.reviews}</div>,
      },
      {
        accessorKey: "website",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Website
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.website}</div>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.email}</div>,
      },
      {
        accessorKey: "latitude",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Latitude
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.latitude}</div>,
      },
      {
        accessorKey: "longitude",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Longitude
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.longitude}</div>,
      },
      {
        accessorKey: "postalCode",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Code Pos
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.postalCode}</div>,
      },
      {
        accessorKey: "odp",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ODP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.odp}</div>,
      },
      {
        accessorKey: "distance",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Distance
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.distance}</div>,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {formatDate(row.original.createdAt as string)}
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Updated At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {formatDate(row.original.updatedAt as string)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus data secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDataDeleted(row.original.id)}
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ),
      },
    ],
    [editingRow, onDataDeleted, handleSaveEdit]
  );

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      pagination,
      globalFilter,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const isAnySelected = selectedRows.length > 0;

  const handleMassDelete = async () => {
    const idsToDelete = selectedRows.map((row) => row.original.id);
    await AddressService.deleteMany(idsToDelete);
    setRowSelection({});
    onRefresh();
  };

  const handleMassUpdateStatus = async (status: boolean) => {
    const idsToUpdate = selectedRows.map((row) => row.original.id);
    await AddressService.updateReceivedMessageStatus(idsToUpdate, status);
    setRowSelection({});
    onRefresh();
  };

  const handleExportExcel = async (exportType: "all" | "filtered") => {
    if (typeof XLSX === "undefined") {
      alert("Pustaka ekspor (XLSX) tidak ditemukan. Coba muat ulang halaman.");
      return;
    }

    setIsExporting(true);
    let dataToExport = [];

    try {
      if (exportType === "all") {
        const allData = await AddressService.getAll(
          1,
          totalData,
          0,
          globalFilter,
          sorting[0]?.id as string,
          sorting[0]?.desc ? "desc" : "asc"
        );
        dataToExport = allData.data;
      } else {
        // Cukup gunakan data yang sudah dimuat di tabel
        dataToExport = data;
      }

      if (dataToExport.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        setIsExporting(false);
        return;
      }

      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(
        2,
        "0"
      )}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${today.getFullYear()}`;

      // Perbaikan: Ubah format tanggal di data yang akan diekspor
      const formattedDataToExport = dataToExport.map(
        (entry: { createdAt: string | Date; updatedAt: string | Date }) => ({
          ...entry,
          createdAt: entry.createdAt ? formatDate(entry.createdAt) : null,
          updatedAt: entry.updatedAt ? formatDate(entry.updatedAt) : null,
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(formattedDataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Alamat");

      const fileName = `data-alamat-${formattedDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      alert("Data berhasil diekspor ke Excel!");
    } catch (error) {
      console.error("Export error:", error);
      alert("Terjadi kesalahan saat mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 w-full p-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <Input
          placeholder="Cari data..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {isAnySelected && (
            <>
              <Button
                onClick={() => handleMassUpdateStatus(true)}
                variant="outline"
                size="sm"
              >
                Tandai Diterima
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Hapus Terpilih ({selectedRows.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan menghapus {selectedRows.length} data
                      yang terpilih secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleMassDelete}>
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Muat Ulang
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                Ekspor
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Opsi Ekspor Data</AlertDialogTitle>
                <AlertDialogDescription>
                  Pilih opsi ekspor yang Anda inginkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleExportExcel("filtered")}
                  disabled={isExporting}
                >
                  Ekspor Data Terfilter (
                  {table.getFilteredRowModel().rows.length} baris)
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleExportExcel("all")}
                  disabled={isExporting}
                >
                  Ekspor Semua Data ({totalData} baris)
                </Button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="relative rounded-md border w-full max-h-[60vh] overflow-auto">
        <table>
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-neutral-900/90">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/${row.getValue(
                        "address"
                      )}/@${row.getValue("latitude")},${row.getValue(
                        "longitude"
                      )}`
                    )
                  }
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
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>
      <div className="sticky bottom-0 z-10 bg-slate-50 p-2 dark:bg-neutral-900/90 rounded-sm">
        <DataTablePagination table={table} totalData={totalData} />
      </div>
    </div>
  );
};

export default AddressTable;
