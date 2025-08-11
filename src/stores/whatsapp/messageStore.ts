import { StateCreator } from "zustand";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { toast } from "sonner";
import {
  MessageStoreState,
  MessageStoreActions,
  WhatsAppState,
  WhatsAppActions,
} from "@/types/store/whatsappState";
import {
  SaveStoredMessagePayload,
  DeleteStoredMessagePayload,
  UpdateStoredMessagePayload,
} from "@/types";

export const createMessageStoreSlice: StateCreator<
  WhatsAppState & WhatsAppActions,
  [],
  [],
  MessageStoreState & MessageStoreActions
> = (set, get) => ({
  // Initial State for Message Store
  storedMessages: [],

  // Actions for Message Store
  setStoredMessages: (messages) => set({ storedMessages: messages }),
  loadStoredMessages: () => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      console.warn("Socket not connected, cannot load stored messages yet.");
      return;
    }
    socket.emit("whatsapp-get-stored-messages");
  },
  saveNewStoredMessage: async (name, content) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const payload: SaveStoredMessagePayload = { name, content };
    socket.emit("whatsapp-save-stored-message", payload);
    get().resetGlobalError();
  },
  deleteExistingStoredMessage: (id) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const payload: DeleteStoredMessagePayload = { id };
    socket.emit("whatsapp-delete-stored-message", payload);
    get().resetGlobalError();
    set((state) => ({
      storedMessages: state.storedMessages.filter((msg) => msg.id !== id),
    }));
  },
  updateExistingStoredMessage: async (id, name, content) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const payload: UpdateStoredMessagePayload = { id, name, content };
    socket.emit("whatsapp-update-stored-message", payload);
    get().resetGlobalError();
    set((state) => ({
      storedMessages: state.storedMessages.map((msg) =>
        msg.id === id
          ? { ...msg, name, content, updatedAt: new Date().toISOString() }
          : msg
      ),
    }));
  },
});
