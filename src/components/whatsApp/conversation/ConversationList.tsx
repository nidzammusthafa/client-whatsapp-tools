"use client";

import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { Badge } from "@/components/ui/badge";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { cn } from "@/lib/utils";

/**
 * Sidebar yang menampilkan daftar chat.
 */
const ConversationList = () => {
  const {
    labeledChats,
    selectedChatId,
    setSelectedChatId,
    isSocketConnected,
    messagesByChatId,
    loadAllConversationMessages,
  } = useWhatsAppStore();

  // Muat semua pesan saat pertama kali render
  useEffect(() => {
    if (isSocketConnected) {
      loadAllConversationMessages();
    }
  }, [isSocketConnected, loadAllConversationMessages]);

  const getChatLabel = (chatId: string) => {
    return labeledChats.find((chat) => chat.chatId === chatId)?.label;
  };

  // Handle pembaruan pesan baru real-time dari Socket.IO
  useEffect(() => {
    const socket = getWhatsappSocket();

    const onNewMessage = () => {
      loadAllConversationMessages();
    };

    socket.on("whatsapp-new-message", onNewMessage);

    return () => {
      socket.off("whatsapp-new-message", onNewMessage);
    };
  }, [loadAllConversationMessages]);

  const allChats = Object.keys(messagesByChatId)
    .flatMap((chatId) => {
      const messages = messagesByChatId[chatId];

      // Group messages by clientId to separate conversations
      const messagesByClient = messages.reduce((acc, message) => {
        if (!acc[message.clientId]) {
          acc[message.clientId] = [];
        }
        acc[message.clientId].push(message);
        return acc;
      }, {} as Record<string, typeof messages>);

      // Create a chat object for each client-specific message group
      return Object.values(messagesByClient).map((clientMessages) => {
        // Perbaikan: Buat salinan array sebelum mengurutkan
        const latestMessage = [...clientMessages].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];

        return {
          chatId,
          clientId: clientMessages[0].clientId,
          latestMessage,
        };
      });
    })
    .sort(
      (a, b) =>
        new Date(b.latestMessage.timestamp).getTime() -
        new Date(a.latestMessage.timestamp).getTime()
    );

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const getSenderName = (chatId: string) => {
    const messages = messagesByChatId[chatId];
    if (messages && messages.length > 0) {
      const lastMessage = [...messages].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      /* Ganti nama pengirim jika message chat labelId */
      /* jika salah satu pesan isFromMe=true, ganti nama chat dengan nama pengirim bukan nama saya */

      const isAnyMessageFromMe = messages.some((msg) => msg.isFromMe);
      if (isAnyMessageFromMe) {
        const firstMessageNotFromMe = messages.find((msg) => !msg.isFromMe);
        if (firstMessageNotFromMe) {
          return firstMessageNotFromMe.sender.split("@")[0];
        }
      }

      return lastMessage.sender.split("@")[0];
    }
    return chatId.split("@")[0];
  };

  return (
    <Card className="min-sm:w-1/3 min-w-[300px] max-w-sm min-sm:rounded-r-none min-sm:border-r-0">
      {/* Mengukur ukuran div berdasarkan jumlah item */}
      <CardContent className={cn("p-0 h-full overflow-y-auto scrollbar-none")}>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Semua Chat ({allChats.length})
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadAllConversationMessages}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        {allChats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Tidak ada chat yang tersedia.
          </div>
        ) : (
          allChats.map((chat) => {
            const label = getChatLabel(chat.chatId);
            const clientId = chat.latestMessage.clientId;

            return (
              <div
                key={`${chat.chatId}-${clientId}`}
                onClick={() => handleSelectChat(chat.chatId)}
                className={`flex items-center gap-4 p-4 border-b cursor-pointer hover:bg-muted ${
                  selectedChatId === chat.chatId ? "bg-muted" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate flex justify-between">
                    <Badge
                      variant={label ? "default" : "outline"}
                      style={{
                        backgroundColor: `#${
                          label ? label.color.toString(16).padStart(6, "0") : ""
                        }`,
                      }}
                    >
                      {getSenderName(chat.chatId)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {clientId}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground truncate justify-between flex mt-1 ">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {chat.latestMessage.isMedia
                        ? "MEDIA"
                        : chat.latestMessage.isAudio
                        ? "AUDIO"
                        : chat.latestMessage.location
                        ? "LOKASI"
                        : chat.latestMessage.type === "vcard"
                        ? "KONTAK"
                        : chat.latestMessage.type === "sticker"
                        ? "STIKER"
                        : chat.latestMessage.type === "document"
                        ? "DOKUMEN"
                        : chat.latestMessage.body}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(chat.latestMessage.timestamp).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationList;
