"use client";

import React, { useEffect } from "react";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { MessageCircleMore } from "lucide-react";
import ConversationList from "./ConversationList";
import ConversationWindow from "./ConversationWindow";

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
    <div className="flex w-full h-[calc(100vh-4rem)] overflow-hidden top-0">
      {/* Tampilan default untuk desktop/layar lebar */}
      <div className="hidden md:flex flex-1 w-full h-full">
        {/* Sidebar untuk Daftar Chat Berlabel */}
        <ConversationList />

        {/* Tampilan Obrolan */}
        <div className="flex-1 bg-card flex flex-col">
          {selectedChatId ? (
            <ConversationWindow chatId={selectedChatId} clientId="" />
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
          <ConversationWindow chatId={selectedChatId} clientId="" />
        ) : (
          <ConversationList />
        )}
      </div>
    </div>
  );
};
