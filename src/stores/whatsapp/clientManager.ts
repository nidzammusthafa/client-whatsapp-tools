import { StateCreator } from "zustand";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { toast } from "sonner";
import {
  ClientState,
  ClientActions,
  WhatsAppState,
  WhatsAppActions,
  InitialSettingsPayload,
} from "@/types/store/whatsappState";
import {
  WhatsAppClientStatusUpdate,
  LoginRequestPayload,
  RenameClientPayload,
  DeleteClientPayload,
  DisconnectClientPayload,
  InitializeMultipleClientsPayload,
  LogoutRequestPayload,
} from "@/types";
import { useUrlStore } from "./socketStore";

const NEXT_PUBLIC_WHATSAPP_SERVER_URL = `${
  useUrlStore.getState().url
}/api/whatsapp`;
export const createClientManagerSlice: StateCreator<
  WhatsAppState & WhatsAppActions,
  [],
  [],
  ClientState & ClientActions
> = (set, get) => ({
  // Initial State for Client Manager
  clients: [],
  isSocketConnected: false,
  globalError: null,
  currentQrCode: undefined,
  currentQrAccountId: undefined,
  showQrDialog: false,
  newClientAccountId: "",
  isHeadlessMode: false,
  initialSettingsLoaded: false,
  whitelistNumbers: [],

  // Actions for Client Manager
  setSocketConnected: (connected) => set({ isSocketConnected: connected }),
  setGlobalError: (error) => set({ globalError: error }),
  resetGlobalError: () => set({ globalError: null }),

  updateClientStatus: (update: WhatsAppClientStatusUpdate) =>
    set((state) => {
      const newClientsMap = new Map(
        state.clients.map((client) => [client.accountId, client])
      );
      const existingClient = newClientsMap.get(update.accountId);
      newClientsMap.set(update.accountId, {
        ...existingClient,
        ...update,
        isMainClient:
          update.isMainClient !== undefined
            ? update.isMainClient
            : existingClient?.isMainClient || false,
      });

      if (update.status === "qr" && update.qrCode) {
        console.log(
          `[Frontend Store] QR Code received for ${update.accountId}:`,
          update.qrCode
        );
      }

      if (
        (update.status === "ready" || update.status === "authenticated") &&
        !Array.from(newClientsMap.values()).some((c) => c.isMainClient) &&
        get().initialSettingsLoaded
      ) {
        newClientsMap.get(update.accountId)!.isMainClient = true;
        get().setClientAsMain(update.accountId);
      }

      return { clients: Array.from(newClientsMap.values()) };
    }),

  setExistingClients: (existingClients: WhatsAppClientStatusUpdate[]) =>
    set((state) => {
      const newClientsMap = new Map(
        state.clients.map((client) => [client.accountId, client])
      );
      let hasMainClientFromBackend = false;
      existingClients.forEach((client) => {
        const existing = newClientsMap.get(client.accountId);
        const updatedClient = {
          ...existing,
          ...client,
          isMainClient:
            client.isMainClient !== undefined
              ? client.isMainClient
              : existing?.isMainClient || false,
        };
        newClientsMap.set(client.accountId, updatedClient);
        if (updatedClient.isMainClient) {
          hasMainClientFromBackend = true;
        }
      });

      if (!hasMainClientFromBackend && get().initialSettingsLoaded) {
        const firstReadyClient = Array.from(newClientsMap.values()).find(
          (c) => c.status === "ready" || c.status === "authenticated"
        );
        if (firstReadyClient) {
          newClientsMap.get(firstReadyClient.accountId)!.isMainClient = true;
          get().setClientAsMain(firstReadyClient.accountId);
        }
      }

      return { clients: Array.from(newClientsMap.values()) };
    }),

  removeClient: (accountId: string) =>
    set((state) => {
      const updatedClients = state.clients.filter(
        (client) => client.accountId !== accountId
      );
      const wasMainClient = state.clients.find(
        (c) => c.accountId === accountId
      )?.isMainClient;
      if (wasMainClient) {
        const firstReadyClient = updatedClients.find(
          (c) => c.status === "ready" || c.status === "authenticated"
        );
        if (firstReadyClient) {
          firstReadyClient.isMainClient = true;
          get().setClientAsMain(firstReadyClient.accountId);
        } else {
          get().setClientAsMain("");
        }
      }
      return { clients: updatedClients };
    }),

  setShowQrDialog: (show) => set({ showQrDialog: show }),
  setCurrentQrCode: (qrCode) => set({ currentQrCode: qrCode }),
  setCurrentQrAccountId: (accountId) => set({ currentQrAccountId: accountId }),

  setNewClientAccountId: (id) => set({ newClientAccountId: id }),
  setIsHeadlessMode: (headless) => set({ isHeadlessMode: headless }),

  setClientAsMain: async (accountId) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/setting/main-client`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      get().resetGlobalError();
      // Optimistic update: Perbarui di frontend segera
      set((state) => {
        const updatedClients = state.clients.map((client) => ({
          ...client,
          isMainClient: client.accountId === accountId,
        }));
        return { clients: updatedClients };
      });
      toast.success("Klien utama berhasil diatur.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal mengatur klien utama.");
    }
  },

  loadInitialSettings: async () => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/setting/initial`
      );
      if (!response.ok) throw new Error("Gagal memuat pengaturan awal.");
      const payload: InitialSettingsPayload = await response.json();
      set({
        initialSettingsLoaded: true,
        whitelistNumbers: payload.whitelistNumbers,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat pengaturan awal.");
    }
  },

  setInitialSettings: (payload: InitialSettingsPayload) => {
    set((state) => {
      const newClientsMap = new Map(state.clients.map((c) => [c.accountId, c]));
      if (payload.mainClientAccountId) {
        const mainClient = newClientsMap.get(payload.mainClientAccountId);
        if (mainClient) {
          mainClient.isMainClient = true;
          newClientsMap.set(payload.mainClientAccountId, mainClient);
        }
      }

      return {
        clients: Array.from(newClientsMap.values()),
        initialSettingsLoaded: true,
        whitelistNumbers: payload.whitelistNumbers,
      };
    });
  },

  setWhitelistNumbers: (numbers) => set({ whitelistNumbers: numbers }),
  addWhitelistNumbers: async (numbers) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/setting/whitelist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numbers }),
        }
      );
      if (!response.ok)
        throw new Error("Gagal menambahkan nomor ke whitelist.");
      const updatedSettings = await response.json();
      set({ whitelistNumbers: updatedSettings.whitelistNumbers });
      toast.success("Nomor berhasil ditambahkan ke whitelist.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan nomor ke whitelist.");
    }
  },
  removeWhitelistNumber: async (number) => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/setting/whitelist/${number}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok)
        throw new Error("Gagal menghapus nomor dari whitelist.");
      const updatedSettings = await response.json();
      set({ whitelistNumbers: updatedSettings.whitelistNumbers });
      toast.success(`Nomor '${number}' dihapus dari whitelist.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus nomor dari whitelist.");
    }
  },
  resetWhitelistNumbers: async () => {
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/setting/whitelist/reset`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Gagal mereset whitelist.");
      const updatedSettings = await response.json();
      set({ whitelistNumbers: updatedSettings.whitelistNumbers });
      toast.success("Daftar whitelist berhasil direset.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal mereset whitelist.");
    }
  },

  // Socket Emitters (actions yang akan memicu event ke backend)
  loginClient: (accountId, headless) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const payload: LoginRequestPayload = {
      accountId,
      method: "qr",
      headless,
    };
    socket.emit("whatsapp-login-qr", payload);
    get().resetGlobalError();
    set((state) => {
      const newClientsMap = new Map(state.clients.map((c) => [c.accountId, c]));
      newClientsMap.set(accountId, {
        accountId,
        status: "loading",
        message: "Meminta QR Code...",
        requestedLoginMethod: "qr",
        isMainClient: false,
      });
      return { clients: Array.from(newClientsMap.values()) };
    });
  },

  logoutClient: (accountId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const payload: LogoutRequestPayload = { accountId };
    socket.emit("whatsapp-logout", payload);
    get().resetGlobalError();
    set((state) => {
      const newClientsMap = new Map(state.clients.map((c) => [c.accountId, c]));
      const clientToUpdate = newClientsMap.get(accountId);
      if (clientToUpdate) {
        newClientsMap.set(accountId, {
          ...clientToUpdate,
          status: "disconnected",
          message: "Meminta logout...",
        });
      }
      return { clients: Array.from(newClientsMap.values()) };
    });
  },

  renameClient: (oldAccountId, newAccountId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    if (!oldAccountId || !newAccountId || oldAccountId === newAccountId) {
      toast.error("Nama akun baru tidak valid atau sama dengan nama lama.");
      return;
    }

    const payload: RenameClientPayload = { oldAccountId, newAccountId };
    socket.emit("whatsapp-rename-client", payload);
    get().resetGlobalError();
    set((state) => {
      const newClientsMap = new Map(state.clients.map((c) => [c.accountId, c]));
      const oldClient = newClientsMap.get(oldAccountId);
      if (oldClient) {
        newClientsMap.delete(oldAccountId);
        newClientsMap.set(newAccountId, {
          ...oldClient,
          accountId: newAccountId,
          status: "loading",
          message: "Mengganti nama klien...",
        });
      }
      return { clients: Array.from(newClientsMap.values()) };
    });
  },

  deleteClient: (accountId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    if (!accountId) {
      toast.error("Account ID wajib diisi untuk penghapusan.");
      return;
    }
    const payload: DeleteClientPayload = { accountId };
    socket.emit("whatsapp-delete-client", payload);
    get().resetGlobalError();
    set((state) => ({
      clients: state.clients.filter((client) => client.accountId !== accountId),
    }));
  },

  disconnectClient: (accountId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    if (!accountId) {
      toast.error("Account ID wajib diisi untuk memutuskan koneksi.");
      return;
    }
    const payload: DisconnectClientPayload = { accountId };
    socket.emit("whatsapp-disconnect-client", payload);
    get().resetGlobalError();
    set((state) => {
      const newClientsMap = new Map(state.clients.map((c) => [c.accountId, c]));
      const clientToUpdate = newClientsMap.get(accountId);
      if (clientToUpdate) {
        newClientsMap.set(accountId, {
          ...clientToUpdate,
          status: "disconnected",
          message: "Memutuskan koneksi...",
        });
      }
      return { clients: Array.from(newClientsMap.values()) };
    });
  },

  disconnectAllClients: () => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-disconnect-all-clients", {});
    get().resetGlobalError();
    set((state) => ({
      clients: state.clients.map((client) => ({
        ...client,
        status: "disconnected",
        message: "Memutuskan semua klien...",
      })),
    }));
  },

  initializeMultipleClients: (accountIds, headless) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    if (accountIds.length === 0) {
      toast.error("Pilih setidaknya satu akun untuk dijalankan.");
      return;
    }
    const payload: InitializeMultipleClientsPayload = {
      accountIds,
      headless,
    };
    socket.emit("whatsapp-initialize-multiple-clients", payload);
    get().resetGlobalError();
    set((state) => ({
      clients: state.clients.map((client) => {
        if (accountIds.includes(client.accountId)) {
          return {
            ...client,
            status: "loading",
            message: "Mencoba menyambungkan...",
          };
        }
        return client;
      }),
    }));
  },
});
