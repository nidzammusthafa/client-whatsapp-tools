"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { Badge } from "@/components/ui/badge";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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

    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const currentScrollY = container.scrollTop;
        if (currentScrollY > lastScrollY.current) {
          setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", handleScroll);

    return () => {
      socket.off("whatsapp-new-message", onNewMessage);
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [loadAllConversationMessages]);

  const allChats = Object.keys(messagesByChatId)
    .flatMap((chatId) => {
      const messages = messagesByChatId[chatId];

      // Group messages by clientId to separate conversations
      const messagesByClient = messages.reduce((acc, message) => {
        if (!acc[message.clientName]) {
          acc[message.clientName] = [];
        }
        acc[message.clientName].push(message);
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
          clientId: clientMessages[0].clientName,
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
    <Card className="min-sm:w-1/3 min-w-[300px] max-sm:min-w-screen rounded-none max-w-sm min-sm:border-r-1 min-sm:border-r-neutral-800/30 border-t-0 py-0">
      <CardContent
        ref={scrollContainerRef}
        className={cn("p-0 h-full overflow-y-auto scrollbar-none")}
      >
        <div
          className={`sticky top-0 bg-accent/70 p-2 border-b flex justify-between items-center transition-transform duration-300 ${
            isHeaderVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
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
            const clientId = chat.latestMessage.clientName;

            return (
              <div
                key={`${chat.chatId}-${clientId}`}
                onClick={() => handleSelectChat(chat.chatId)}
                className={`flex items-center gap-4 p-4 border-b cursor-pointer hover:bg-muted ${
                  selectedChatId === chat.chatId ? "bg-muted" : ""
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://ui.shadcn.com/avatars/0${
                      (chat.chatId.charCodeAt(0) % 5) + 1
                    }.png`}
                    alt={chat.latestMessage.sender}
                  />
                  <AvatarFallback>
                    {chat.latestMessage.sender.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
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