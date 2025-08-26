"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationState } from "@tanstack/react-table";

import ClientListSection from "./client/ClientListSection";
import NumberCheckSection from "./numberChecker/NumberCheckSection";
import WarmerSection from "./whatsAppWarmer/WarmerSection";
import StoredMessageManagement from "./message/StoredMessageManagement";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import QrCodeDialog from "./client/QRCodeDialog";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { ConversationDashboard } from "./conversation/ConversationDashboard"; // Assuming this import is correct
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { showNotification } from "@/lib/notificationUtils";
import { ConversationMessage } from "@/types";
import { toast } from "sonner";
import WABlastSection from "./whatsappBlast/WaBlastSection";
import { Address } from "@/types/whatsapp/address";
import AddressDialog from "./address/AddressDialog";
import AddressTable from "./address/AddressTable";

import { SortingState } from "@tanstack/react-table";
const NEXT_PUBLIC_WHATSAPP_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000/api/whatsapp";

export const WhatsAppDashboard = () => {
  // Ambil state dari store Zustand
  const globalError = useWhatsAppStore((state) => state.globalError);
  const isSocketConnected = useWhatsAppStore(
    (state) => state.isSocketConnected
  );
  const currentQrClient = useWhatsAppStore((state) =>
    state.clients.find((client) => client.status === "qr" && client.qrCode)
  );
  const setShowQrDialog = useWhatsAppStore((state) => state.setShowQrDialog);
  const setCurrentQrCode = useWhatsAppStore((state) => state.setCurrentQrCode);
  const setCurrentQrAccountId = useWhatsAppStore(
    (state) => state.setCurrentQrAccountId
  );
  const showQrDialog = useWhatsAppStore((state) => state.showQrDialog);
  const loadInitialSettings = useWhatsAppStore(
    (state) => state.loadInitialSettings
  );
  const initialSettingsLoaded = useWhatsAppStore(
    (state) => state.initialSettingsLoaded
  );

  // State lokal untuk manajemen alamat
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

  // Efek untuk memantau klien dengan status 'qr' dan menampilkan dialog
  useEffect(() => {
    if (currentQrClient && currentQrClient.qrCode) {
      setCurrentQrCode(currentQrClient.qrCode);
      setCurrentQrAccountId(currentQrClient.accountId);
      setShowQrDialog(true);
    } else if (!currentQrClient && showQrDialog) {
      setShowQrDialog(false);
      setCurrentQrCode(undefined);
      setCurrentQrAccountId(undefined);
    }
  }, [
    currentQrClient,
    showQrDialog,
    setCurrentQrCode,
    setCurrentQrAccountId,
    setShowQrDialog,
  ]);

  // Muat pengaturan awal saat komponen pertama kali dimuat dan socket terhubung
  useEffect(() => {
    if (isSocketConnected && !initialSettingsLoaded) {
      loadInitialSettings();
    }
  }, [isSocketConnected, initialSettingsLoaded, loadInitialSettings]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    const socket = getWhatsappSocket();

    const onNewMessage = (payload: { message: ConversationMessage }) => {
      if (typeof window !== "undefined" && !payload.message.isFromMe) {
        showNotification(
          `Pesan baru dari ${payload.message.sender.split("@")[0]}`,
          payload.message.body
        );

        toast.success(
          <div>
            <p className="text-sm font-semibold mb-2">Pesan Baru</p>
            <div className="flex gap-2">
              <p className="text-sm text-muted-foreground">
                {payload.message.sender.split("@")[0]}:
              </p>
              <p className="text-sm text-muted-foreground">
                {payload.message.body}
              </p>
            </div>
          </div>,
          {
            position: "top-right",
            duration: 5000,
          }
        );
      }
    };

    socket.on("whatsapp-new-message", onNewMessage);

    return () => {
      socket.off("whatsapp-new-message", onNewMessage);
    };
  }, []);

  // Cek apakah ada pekerjaan yang sedang berjalan
  const isAnyJobRunning = useWhatsAppStore((state) => {
    const numberCheckJob = state.numberCheckJobStatus;
    const numberCheckStatus = numberCheckJob?.status === "RUNNING";
    const whatsappWarmerJob = state.warmerJobStatus;
    const whatsappWarmerStatus = whatsappWarmerJob?.status === "RUNNING";
    const waBlastJobs = Object.values(state.waBlastJobs).some(
      (job) => job.status === "IN_PROGRESS"
    );
    return numberCheckStatus || whatsappWarmerStatus || waBlastJobs;
  });

  useEffect(() => {
    const handleExit = () => {
      if (isAnyJobRunning) {
        return "Some WhatsApp jobs are still running. Are you sure you want to exit?";
      }
    };
    window.onbeforeunload = handleExit;

    return () => {
      window.onbeforeunload = null;
    };
  }, [isAnyJobRunning]);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {globalError && (
            <Alert variant="destructive" className="mb-6 max-w-11/12 w-full">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Kesalahan!</AlertTitle>
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          )}
        </div>
      </header>

      <Tabs defaultValue="client-manager" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 h-auto flex-wrap gap-1">
          <TabsTrigger
            className="border-muted-foreground/10"
            value="client-manager"
          >
            Client Manager
          </TabsTrigger>
          <TabsTrigger
            className="border-muted-foreground/10"
            value="check-numbers"
          >
            Check Numbers
          </TabsTrigger>
          <TabsTrigger
            className="border-muted-foreground/10"
            value="whatsapp-warmer"
          >
            WhatsApp Warmer
          </TabsTrigger>
          <TabsTrigger
            className="border-muted-foreground/10"
            value="whatsapp-blast"
          >
            WhatsApp Blast
          </TabsTrigger>
          <TabsTrigger
            className="border-muted-foreground/10"
            value="conversation"
          >
            Conversation
          </TabsTrigger>
          <TabsTrigger
            className="border-muted-foreground/10"
            value="stored-messages"
          >
            Stored Messages
          </TabsTrigger>
          <TabsTrigger
            className="border-muted-foreground/10"
            value="address-management"
          >
            Kelola Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client-manager" className="mt-4">
          <div className="space-y-6">
            <ClientListSection />
          </div>
        </TabsContent>

        <TabsContent value="check-numbers" className="mt-4">
          <NumberCheckSection />
        </TabsContent>

        <TabsContent value="whatsapp-warmer" className="mt-4">
          <WarmerSection />
        </TabsContent>

        <TabsContent value="whatsapp-blast" className="mt-4">
          <WABlastSection />
        </TabsContent>

        <TabsContent value="conversation" className="mt-4">
          <ConversationDashboard />
        </TabsContent>

        <TabsContent value="stored-messages" className="mt-4">
          <StoredMessageManagement />
        </TabsContent>

        {/* Konten untuk Manajemen Alamat */}
        <TabsContent value="address-management" className="mt-4">
          <div className="space-y-6">
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
        </TabsContent>
      </Tabs>
      <QrCodeDialog />
    </main>
  );
};
