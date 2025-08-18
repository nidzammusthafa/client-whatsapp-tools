"use client";

import React, { useEffect } from "react";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { MessageCircleMore } from "lucide-react";
import ConversationList from "./ConversationList";
import ConversationWindow from "./ConversationWindow";

/**
 * Komponen utama untuk fitur Conservation.
 * Menampilkan daftar chat berlabel dan jendela obrolan yang interaktif.
 */
export const ConversationDashboard = () => {
  const {
    selectedChatId,
    loadLabeledChats,
    loadInitialSettings,
    initialSettingsLoaded,
    isSocketConnected,
  } = useWhatsAppStore();

  // Cari klien utama yang aktif
  useEffect(() => {
    if (initialSettingsLoaded) {
      loadLabeledChats();
    }
  }, [loadLabeledChats, initialSettingsLoaded]);

  // Muat pengaturan awal jika socket terhubung
  useEffect(() => {
    if (isSocketConnected && !initialSettingsLoaded) {
      loadInitialSettings();
    }
  }, [isSocketConnected, initialSettingsLoaded, loadInitialSettings]);

  return (
    <div className="flex w-full h-[calc(100vh-10rem)] rounded-lg overflow-hidden">
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
  );
};
