"use client";

import React, { useEffect } from "react";
import { Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

import ClientListSection from "./client/ClientListSection";
import NumberCheckSection from "./numberChecker/NumberCheckSection";
import WarmerSection from "./whatsAppWarmer/WarmerSection";
import WABlastSection from "./whatsappBlast/WaBlastSection";
import StoredMessageManagement from "./message/StoredMessageManagement";
import { useWhatsAppManager } from "@/hooks/useWhatsappManager";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import QrCodeDialog from "./client/QRCodeDialog";
import { useWhatsAppStore } from "@/stores/whatsapp";

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

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Dashboard Sesi WhatsApp
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola semua sesi WhatsApp Anda dari satu tempat.
          </p>
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 h-auto flex-wrap">
          <TabsTrigger value="client-manager">Client Manager</TabsTrigger>
          <TabsTrigger value="check-numbers">
            Check WhatsApp Numbers
          </TabsTrigger>
          <TabsTrigger value="whatsapp-warmer">WhatsApp Warmer</TabsTrigger>
          <TabsTrigger value="whatsapp-blast">WhatsApp Blast</TabsTrigger>
          <TabsTrigger value="stored-messages">Stored Messages</TabsTrigger>
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

        {/* Konten untuk Stored Messages */}
        <TabsContent value="stored-messages" className="mt-4">
          <StoredMessageManagement />
        </TabsContent>
      </Tabs>
      <QrCodeDialog />
    </main>
  );
};
