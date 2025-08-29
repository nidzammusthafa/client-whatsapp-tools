"use client";

import AddressDialog from "@/components/whatsApp/address/AddressDialog";
import AddressTable from "@/components/whatsApp/address/AddressTable";
import { Address } from "@/types/whatsapp/address";
import { PaginationState, SortingState } from "@tanstack/react-table";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

const NEXT_PUBLIC_WHATSAPP_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000/api/whatsapp";

const Page = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pageCount, setPageCount] = useState<number>(0);
  const [totalData, setTotalData] = useState<number>(0);

  const [sorting, setSorting] = useState<SortingState>([]);
  // Fungsi untuk mengambil data alamat dari API
  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
        search: globalFilter,
        sortBy: sorting.length > 0 ? sorting[0].id : "",
        sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "",
      });
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/address?${params.toString()}`,
        { cache: "no-store" } // Tambahkan ini untuk memastikan data selalu baru
      );
      const result = await response.json();
      if (response.ok && result.data) {
        setAddresses(result.data || []);
        setPageCount(
          Math.ceil(result.pagination.total / result.pagination.limit) || 0
        );
        setTotalData(result.pagination.total || 0);
      } else {
        toast.error(result.message || "Gagal mengambil data alamat.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengambil data alamat.");
    } finally {
      setIsLoading(false); // Pastikan isLoading diatur ke false setelah selesai
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, sorting]);

  const handleAddressEdited = async (
    id: string,
    updatedData: Partial<Address>
  ) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/address/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        toast.success("Data berhasil diperbarui.");
        fetchAddresses();
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal memperbarui data.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui data.");
    }
  };

  const handleAddressDeleted = async (id: string) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/address/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Data berhasil dihapus.");
        fetchAddresses();
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal menghapus data.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus data.");
    }
  };

  return (
    <div className="container max-w-screen px-2 sm:px-4">
      <AddressDialog onDataSubmitted={fetchAddresses} />
      <AddressTable
        data={addresses}
        isLoading={isLoading}
        onRefresh={fetchAddresses}
        onDataDeleted={handleAddressDeleted}
        onDataEdited={handleAddressEdited}
        pageCount={pageCount}
        totalData={totalData}
        pagination={pagination}
        setPagination={setPagination}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        sorting={sorting}
        setSorting={setSorting}
      />
    </div>
  );
};

export default Page;
