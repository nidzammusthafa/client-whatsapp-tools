"use client";

import { useSidebar } from "@/components/ui/sidebar";
import ClientListSection from "@/components/whatsApp/client/ClientListSection";
import QrCodeDialog from "@/components/whatsApp/client/QRCodeDialog";
import { useWhatsAppStore } from "@/stores/whatsapp";
import React from "react";

const Page = () => {
  const { open } = useSidebar();
  const { showQrDialog } = useWhatsAppStore();

  return (
    <div
      className={`container ${
        open ? "max-w-[calc(100vw-16.75rem)]" : "max-w-screen"
      } px-2 sm:px-4 py-8`}
    >
      <ClientListSection />
      {showQrDialog && <QrCodeDialog />}
    </div>
  );
};

export default Page;
