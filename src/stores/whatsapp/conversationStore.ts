import { StateCreator } from "zustand";
import { toast } from "sonner";
import {
  ConversationState,
  ConversationActions,
  WhatsAppState,
  WhatsAppActions,
  LabeledChat,
  ConversationMessage,
} from "@/types";
import { useUrlStore } from "./socketStore";

const NEXT_PUBLIC_WHATSAPP_SERVER_URL = `${
  useUrlStore.getState().url
}/api/whatsapp`;
export const createConversationSlice: StateCreator<
  WhatsAppState & WhatsAppActions,
  [],
  [],
  ConversationState & ConversationActions
> = (set) => ({
  // Initial State
  labeledChats: [],
  selectedChatId: null,
  messagesByChatId: {},
  allLabels: [],

  // Actions
  loadLabeledChats: async () => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/label/chats`
      );
      if (!response.ok) {
        throw new Error("Gagal memuat daftar chat berlabel.");
      }
      const chats: LabeledChat[] = await response.json();
      set({ labeledChats: chats });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal memuat chat berlabel.");
    }
  },

  loadMessagesForChat: async (chatId, clientId = undefined) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/conservation/${chatId}/messages`
      );
      if (!response.ok) {
        throw new Error(`Gagal memuat pesan untuk chat '${chatId}'.`);
      }
      const messages: ConversationMessage[] = await response.json();

      if (clientId) {
        const filteredMessages = messages.filter(
          (message) => message.clientName === clientId
        );
        set((state) => ({
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: filteredMessages,
          },
        }));
        return;
      }
      set((state) => ({
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: messages,
        },
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal memuat pesan.");
    }
  },

  loadAllConversationMessages: async () => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/conservation`
      );
      if (!response.ok) {
        throw new Error("Gagal memuat semua pesan percakapan.");
      }
      const messages: ConversationMessage[] = await response.json();

      const chatsMap = messages.reduce((acc, message) => {
        const chatId = message.chatId;
        if (!acc[chatId]) {
          acc[chatId] = [];
        }
        acc[chatId].push(message);
        return acc;
      }, {} as Record<string, ConversationMessage[]>);

      set({ messagesByChatId: chatsMap });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal memuat semua pesan percakapan.");
    }
  },

  loadAllLabels: async () => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/label`);
      if (!response.ok) {
        throw new Error("Gagal memuat semua label.");
      }
      const labels: unknown[] = await response.json();
      set({ allLabels: labels });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal memuat semua label.");
    }
  },

  setLabelForChat: async (chatId, labelIds, lastMessage) => {
    try {
      const payload = { labelIds, lastMessage };
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/label/${chatId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      toast.success("Label berhasil diterapkan!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal menerapkan label.");
    }
  },

  sendMessage: async (payload) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/conservation/${payload.chatId}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageBody: payload.messageBody,
            lastMessage: payload.lastMessage,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      toast.success("Pesan berhasil dikirim!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal mengirim pesan.");
    }
  },

  sendReply: async (payload) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/conservation/${payload.chatId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalMessageId: payload.originalMessageId,
            replyBody: payload.replyBody,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      toast.success("Balasan berhasil dikirim!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal mengirim balasan.");
    }
  },

  markChatAsRead: async (chatId, lastMessage) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/conservation/${chatId}/read`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lastMessage }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      console.log(`Chat ${chatId} berhasil ditandai sudah dibaca.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        `Gagal menandai chat sebagai sudah dibaca: ${error.message}`
      );
    }
  },

  setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),

  addMessageToChat: (message) => {
    set((state) => {
      const updatedMessages = { ...state.messagesByChatId };
      const chatMessages = updatedMessages[message.chatId] || [];
      const messageExists = chatMessages.some(
        (msg) => msg.messageId === message.messageId
      );

      if (!messageExists) {
        updatedMessages[message.chatId] = [...chatMessages, message];
      }

      return { messagesByChatId: updatedMessages };
    });
  },
});
