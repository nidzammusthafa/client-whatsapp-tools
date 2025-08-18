"use client";

import React, { useEffect } from "react";
import { Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

import ClientListSection from "./client/ClientListSection";
import NumberCheckSection from "./numberChecker/NumberCheckSection";
import WarmerSection from "./whatsAppWarmer/WarmerSection";
import StoredMessageManagement from "./message/StoredMessageManagement";
import { useWhatsAppManager } from "@/hooks/useWhatsappManager";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import QrCodeDialog from "./client/QRCodeDialog";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { ConversationDashboard } from "./conversation/ConversationDashboard";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { showNotification } from "@/lib/notificationUtils";
import { ConversationMessage } from "@/types";
import { toast } from "sonner";
import WABlastSection from "./whatsappBlast/WaBlastSection";

export const WhatsAppDashboard = () => {
  useWhatsAppManager();

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

  // State untuk mengontrol dialog

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
    const socket = getWhatsappSocket();

    const onNewMessage = (payload: { message: ConversationMessage }) => {
      if (typeof window !== "undefined" && !payload.message.isFromMe) {
        showNotification(
          `Pesan baru dari ${payload.message.sender.split("@")[0]}`,
          payload.message.body
        );

        /* Munculkan toast di sebelah kanan atas browser */
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
    // Lakukan konfirmasi sebelum mengakhiri aplikasi
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

        {/* Dialog untuk menambah sesi baru telah dipindahkan ke ClientListSection.tsx */}
      </header>

      {/* Implementasi Tabs untuk mengorganisir fitur-fitur */}
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
            Check WhatsApp Numbers
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
        </TabsList>

        {/* Konten untuk Client Manager */}
        <TabsContent value="client-manager" className="mt-4">
          <div className="space-y-6">
            <ClientListSection />
          </div>
        </TabsContent>

        {/* Konten untuk Check WhatsApp Numbers */}
        <TabsContent value="check-numbers" className="mt-4">
          <NumberCheckSection />
        </TabsContent>

        {/* Konten untuk WhatsApp Warmer */}
        <TabsContent value="whatsapp-warmer" className="mt-4">
          <WarmerSection />
        </TabsContent>

        {/* Konten untuk WhatsApp Blast */}
        <TabsContent value="whatsapp-blast" className="mt-4">
          <WABlastSection />
        </TabsContent>

        {/* Konten untuk Conservation */}
        <TabsContent value="conversation" className="mt-4">
          <ConversationDashboard />
        </TabsContent>

        {/* Konten untuk Stored Messages */}
        <TabsContent value="stored-messages" className="mt-4">
          <StoredMessageManagement />
        </TabsContent>
      </Tabs>
      <QrCodeDialog />
    </main>
  );
};
