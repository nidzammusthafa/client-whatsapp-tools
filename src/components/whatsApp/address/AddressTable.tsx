"use client";

import React, { useMemo, useState, useCallback } from "react";
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
  Edit,
  Trash2,
  Loader2,
  RefreshCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import { Address } from "@/types/whatsapp/address";

interface DataTablePaginationProps {
  table: ReturnType<typeof useReactTable<Address>>;
  totalData: number;
}

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
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);

  console.log(data);
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
        accessorKey: "businessName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Bisnis
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.businessName}</div>,
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
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" /> Hapus
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
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  return (
    <div className="space-y-4 w-full p-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <Input
          placeholder="Cari data..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
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
      </div>
      <div className="relative rounded-md border w-full max-h-[60vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-neutral-900/90">
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
          </TableHeader>
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
                <TableRow key={row.id}>
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
        </Table>
      </div>
      <div className="sticky bottom-0 z-10 bg-slate-50 p-2 dark:bg-neutral-900/90">
        <DataTablePagination table={table} totalData={totalData} />
      </div>
    </div>
  );
};

export default AddressTable;
