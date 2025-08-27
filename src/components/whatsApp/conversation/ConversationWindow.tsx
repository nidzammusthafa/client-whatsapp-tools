"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardTitle } from "@/components/ui/card";
import {
  CheckCheck,
  Loader2,
  Tag,
  XCircle,
  ArrowLeft,
  SendHorizonal,
} from "lucide-react";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { ConversationMessage } from "@/types";
import MessageBubble from "./MessageBubble";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Tooltip } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationWindowProps {
  chatId: string;
  clientId: string | undefined;
}

const LabelSelector = ({
  chatId,
  currentLabelIds,
  availableLabels,
  onSetLabel,
}: {
  chatId: string;
  currentLabelIds: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableLabels: any[];
  onSetLabel: (chatId: string, labelIds: string[]) => void;
}) => {
  const [selectedLabelIds, setSelectedLabelIds] =
    useState<string[]>(currentLabelIds);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setSelectedLabelIds(currentLabelIds);
  }, [currentLabelIds]);

  const handleCheckedChange = (labelId: string, checked: boolean) => {
    setSelectedLabelIds((prev) =>
      checked ? [...prev, labelId] : prev.filter((id) => id !== labelId)
    );
  };

  const handleApplyLabel = () => {
    onSetLabel(chatId, selectedLabelIds);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atur Label Chat</DialogTitle>
          <DialogDescription>
            Pilih label yang ingin diterapkan pada chat ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {availableLabels.length > 0 ? (
            availableLabels.map((label) => (
              <div key={label.labelId} className="flex items-center space-x-2">
                <Checkbox
                  id={`label-${label.labelId}`}
                  checked={selectedLabelIds.includes(label.labelId)}
                  onCheckedChange={(checked) =>
                    handleCheckedChange(label.labelId, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`label-${label.labelId}`}
                  className="flex items-center gap-2"
                >
                  <span
                    className="px-2 py-0.5 rounded-full text-xs text-white"
                    style={{
                      backgroundColor: `#${label.color
                        .toString(16)
                        .padStart(6, "0")}`,
                    }}
                  >
                    {label.name}
                  </span>
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Tidak ada label tersedia.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleApplyLabel}>Terapkan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Jendela utama untuk menampilkan riwayat obrolan dan mengirim pesan.
 */
const ConversationWindow = ({ chatId, clientId }: ConversationWindowProps) => {
  const {
    messagesByChatId,
    loadMessagesForChat,
    sendMessage,
    sendReply,
    markChatAsRead,
    addMessageToChat,
    isSocketConnected,
    setSelectedChatId, // Tambahkan setSelectedChatId
  } = useWhatsAppStore(
    useShallow((state) => ({
      messagesByChatId: state.messagesByChatId,
      loadMessagesForChat: state.loadMessagesForChat,
      sendMessage: state.sendMessage,
      sendReply: state.sendReply,
      markChatAsRead: state.markChatAsRead,
      addMessageToChat: state.addMessageToChat,
      isSocketConnected: state.isSocketConnected,
      setSelectedChatId: state.setSelectedChatId,
    }))
  );
  const { allLabels, setLabelForChat, loadAllLabels } = useWhatsAppStore(
    useShallow((state) => ({
      loadAllLabels: state.loadAllLabels,
      allLabels: state.allLabels,
      setLabelForChat: state.setLabelForChat,
    }))
  );

  // Muat semua label saat komponen dimuat
  useEffect(() => {
    if (isSocketConnected) {
      loadAllLabels();
    }
  }, [isSocketConnected, loadAllLabels]);

  const [messageInput, setMessageInput] = useState<string>("");
  const [replyToMessage, setReplyToMessage] =
    useState<ConversationMessage | null>(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = messagesByChatId[chatId] || [];

  const lastMessage = messages[messages.length - 1];

  // Muat pesan saat chat dipilih dan tandai sebagai terbaca
  useEffect(() => {
    if (chatId) {
      loadMessagesForChat(chatId, clientId);
    }
  }, [chatId, loadMessagesForChat, clientId]);

  // Gulir ke bawah saat pesan baru datang
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle pembaruan real-time dari Socket.IO dan scroll
  useEffect(() => {
    const socket = getWhatsappSocket();
    const onNewMessage = (payload: { message: ConversationMessage }) => {
      if (payload.message.chatId === chatId) {
        addMessageToChat(payload.message);
      }
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
  }, [chatId, addMessageToChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) {
      toast.warning("Pesan tidak boleh kosong.");
      return;
    }

    try {
      if (replyToMessage) {
        await sendReply({
          chatId,
          originalMessageId: replyToMessage.messageId,
          replyBody: messageInput,
        });
        setReplyToMessage(null);
      } else {
        await sendMessage({
          chatId,
          messageBody: messageInput,
          lastMessage,
        });
      }
      setMessageInput("");

      loadMessagesForChat(chatId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim pesan.");
    }
  };

  const handleSetReply = (message: ConversationMessage) => {
    setReplyToMessage(message);
  };

  const handleBack = () => {
    setSelectedChatId(null);
  };

  // FIX: Tambahkan fungsi handleEmojiClick
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prevInput) => prevInput + emojiData.emoji);
    setIsEmojiOpen(false);
  };

  const currentChatLabel = useMemo(() => {
    // Perbaikan: Buat salinan array pesan sebelum mengurutkan
    const sortedMessages = [...messages].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastMessage = sortedMessages[0];

    if (lastMessage && lastMessage.labelId) {
      return allLabels.find((label) => label.id === lastMessage.labelId);
    }
    return null;
  }, [messages, allLabels]);

  return (
    <div className="h-full flex flex-col">
      <header
        className={`p-1 px-3 border-b flex justify-between items-center transition-transform duration-300 ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full hidden"
        }`}
      >
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`https://ui.shadcn.com/avatars/0${
                (chatId.charCodeAt(0) % 5) + 1
              }.png`}
              alt={chatId}
            />
            <AvatarFallback>
              {chatId.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle>{chatId.split("@")[0]}</CardTitle>
        </div>

        {/* Header desktop */}
        <div className="hidden md:flex flex-1 justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage
                src={`https://ui.shadcn.com/avatars/0${
                  (chatId.charCodeAt(0) % 5) + 1
                }.png`}
                alt={chatId}
              />
              <AvatarFallback>
                {chatId.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{chatId.split("@")[0]}</CardTitle>
          </div>
          <div className="flex gap-2">
            {/* Buka klien dalam mode non-headless */}
            <Button
              onClick={() => {
                if (clientId) {
                  const socket = getWhatsappSocket();
                  socket.emit("open-client-in-browser", { clientId });
                  toast.info("Membuka klien di browser...");
                } else {
                  toast.error("Client ID tidak tersedia.");
                }
              }}
              variant="outline"
              size="sm"
            >
              Buka Klien
            </Button>

            <LabelSelector
              chatId={chatId}
              currentLabelIds={
                currentChatLabel ? [currentChatLabel.labelId] : []
              }
              availableLabels={allLabels}
              onSetLabel={(chatId, labelIds) =>
                setLabelForChat(chatId, labelIds, lastMessage)
              }
            />
            <Button
              onClick={() => markChatAsRead(chatId, lastMessage)}
              variant="outline"
              size="sm"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <CardContent
        ref={scrollContainerRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-none space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {isSocketConnected ? (
              "Tidak ada pesan di obrolan ini."
            ) : (
              <Loader2 className="animate-spin" />
            )}
          </div>
        ) : (
          messages.map((msg, index) => (
            <Tooltip key={index}>
              <MessageBubble
                message={msg}
                isFromMe={msg.isFromMe}
                onReply={handleSetReply}
              />
            </Tooltip>
          ))
        )}

        <div ref={messagesEndRef} />
      </CardContent>
      <div className="px-4">
        {replyToMessage && (
          <div className="mb-2 p-2 rounded-lg bg-muted border relative">
            <p className="text-sm font-semibold">
              Membalas{" "}
              {replyToMessage.isFromMe ? "Anda" : replyToMessage.sender}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {replyToMessage.body}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReplyToMessage(null)}
              className="absolute top-1 right-1 h-6 w-6"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsEmojiOpen((prev) => !prev)}
          >
            <span role="img" aria-label="emoji" className="text-xl">
              😊
            </span>
          </Button>
          <div className="w-full flex items-center rounded-lg my-1">
            {isEmojiOpen && (
              <div className="absolute bottom-14 left-0 z-10">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <Textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Ketik pesan..."
              rows={1}
              className="resize-none block w-full text-sm text-gray-900 bg-white rounded-lg dark:placeholder-gray-400 dark:text-white"
              disabled={!isSocketConnected}
            />
          </div>
          <Button
            disabled={!messageInput.trim() || !isSocketConnected}
            className="cursor-pointer"
            variant="ghost"
            size="sm"
          >
            <SendHorizonal className="h-8 w-8" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConversationWindow;
