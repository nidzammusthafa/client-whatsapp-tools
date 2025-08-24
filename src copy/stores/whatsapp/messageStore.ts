import { StateCreator } from "zustand";
import { toast } from "sonner";
import {
  MessageStoreState,
  MessageStoreActions,
  WhatsAppState,
  WhatsAppActions,
} from "@/types/store/whatsappState";
import {
  StoredMessage,
  SaveStoredMessagePayload,
  UpdateStoredMessagePayload,
} from "@/types";

const NEXT_PUBLIC_WHATSAPP_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000/api/whatsapp";

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
  loadStoredMessages: async () => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/stored-message/stored-messages`
      );
      if (!response.ok) {
        throw new Error("Gagal memuat pesan tersimpan.");
      }
      const messages: StoredMessage[] = await response.json();
      set({ storedMessages: messages });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat pesan tersimpan.");
    }
  },
  saveNewStoredMessage: async (name, content) => {
    try {
      const payload: SaveStoredMessagePayload = { name, content };
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/stored-message/stored-messages`,
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
      toast.success(`Pesan '${name}' berhasil disimpan.`);
      get().loadStoredMessages(); // Muat ulang daftar pesan untuk update UI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan pesan.");
    }
  },
  deleteExistingStoredMessage: async (id) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/stored-message/stored-messages/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      toast.success(`Pesan berhasil dihapus.`);
      get().loadStoredMessages(); // Muat ulang daftar pesan untuk update UI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus pesan.");
    }
  },
  updateExistingStoredMessage: async (id, name, content) => {
    try {
      const payload: UpdateStoredMessagePayload = { id, name, content };
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/stored-message/stored-messages/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      toast.success(`Pesan '${name}' berhasil diperbarui.`);
      get().loadStoredMessages(); // Muat ulang daftar pesan untuk update UI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui pesan.");
    }
  },
});
