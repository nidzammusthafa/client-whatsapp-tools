"use client";

import React, { useEffect } from "react";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { MessageCircleMore } from "lucide-react";
import ConversationList from "./ConversationList";
import ConversationWindow from "./ConversationWindow";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Komponen utama untuk fitur Conservation, diadaptasi untuk tampilan mobile.
 * Menampilkan daftar chat berlabel atau jendela obrolan yang interaktif.
 */
export const ConversationDashboard = () => {
  const {
    selectedChatId,
    loadLabeledChats,
    loadInitialSettings,
    initialSettingsLoaded,
    isSocketConnected,
  } = useWhatsAppStore();
  const { open } = useSidebar();

  // Muat data awal saat terhubung ke socket
  useEffect(() => {
    if (isSocketConnected && !initialSettingsLoaded) {
      loadInitialSettings();
    }
  }, [isSocketConnected, initialSettingsLoaded, loadInitialSettings]);

  // Muat chat berlabel setelah pengaturan awal dimuat
  useEffect(() => {
    if (initialSettingsLoaded) {
      loadLabeledChats();
    }
  }, [loadLabeledChats, initialSettingsLoaded]);

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden top-0 ${
        open ? "max-w-[calc(100vw-16rem)]" : "max-w-[calc(100vw-3rem)]"
      }`}
    >
      <div className="hidden md:flex flex-1 w-full h-full">
        <ConversationList />

        <div className="flex-1 bg-card flex flex-col">
          {selectedChatId ? (
            <ConversationWindow chatId={selectedChatId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <MessageCircleMore className="h-24 w-24 text-muted-foreground opacity-50" />
              <p className="mt-4 text-xl font-semibold text-muted-foreground">
                Pilih obrolan untuk memulai percakapan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tampilan obrolan mobile */}
      <div className="md:hidden flex flex-1 w-full h-full">
        {selectedChatId ? (
          <ConversationWindow chatId={selectedChatId} />
        ) : (
          <ConversationList />
        )}
      </div>
    </div>
  );
};
