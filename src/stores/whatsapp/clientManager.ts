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
  LogoutRequestPayload,
  RenameClientPayload,
  DeleteClientPayload,
  DisconnectClientPayload,
  SetMainClientPayload,
  InitializeMultipleClientsPayload,
  SetNotificationSenderPayload,
} from "@/types";

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
  notificationSenderAccountId: null,
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

      // Logic untuk mengatur klien utama default saat klien baru terautentikasi
      // Hanya jika belum ada klien utama yang ditandai dari backend (dari DB)
      if (
        (update.status === "ready" || update.status === "authenticated") &&
        !Array.from(newClientsMap.values()).some((c) => c.isMainClient) &&
        get().initialSettingsLoaded // Pastikan pengaturan awal sudah dimuat
      ) {
        newClientsMap.get(update.accountId)!.isMainClient = true;
        // PENTING: Kirim event ke backend untuk menyimpan ini sebagai klien utama persisten
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

      // Jika pengaturan awal sudah dimuat dan tidak ada klien utama dari backend,
      // coba atur klien pertama yang siap/terautentikasi sebagai klien utama.
      if (!hasMainClientFromBackend && get().initialSettingsLoaded) {
        const firstReadyClient = Array.from(newClientsMap.values()).find(
          (c) => c.status === "ready" || c.status === "authenticated"
        );
        if (firstReadyClient) {
          newClientsMap.get(firstReadyClient.accountId)!.isMainClient = true;
          // PENTING: Kirim event ke backend untuk menyimpan ini sebagai klien utama persisten
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
        // Jika klien utama dihapus, dan ada klien lain yang siap,
        // atur klien pertama yang siap/terautentikasi sebagai klien utama yang baru.
        const firstReadyClient = updatedClients.find(
          (c) => c.status === "ready" || c.status === "authenticated"
        );
        if (firstReadyClient) {
          firstReadyClient.isMainClient = true;
          // PENTING: Kirim event ke backend untuk menyimpan ini sebagai klien utama persisten
          get().setClientAsMain(firstReadyClient.accountId);
        } else {
          // Jika tidak ada klien lain yang siap, reset klien utama di backend
          get().setClientAsMain(""); // Kirim string kosong atau null untuk mereset
        }
      }
      return { clients: updatedClients };
    }),

  setShowQrDialog: (show) => set({ showQrDialog: show }),
  setCurrentQrCode: (qrCode) => set({ currentQrCode: qrCode }),
  setCurrentQrAccountId: (accountId) => set({ currentQrAccountId: accountId }),

  setNewClientAccountId: (id) => set({ newClientAccountId: id }),
  setIsHeadlessMode: (headless) => set({ isHeadlessMode: headless }),

  setClientAsMain: (accountId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const payload: SetMainClientPayload = { accountId };
    socket.emit("whatsapp-set-main-client", payload);
    get().resetGlobalError();
    // Optimistic update: Perbarui di frontend segera
    set((state) => {
      const updatedClients = state.clients.map((client) => ({
        ...client,
        isMainClient: client.accountId === accountId,
      }));
      return { clients: updatedClients };
    });
  },

  loadInitialSettings: () => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      console.warn("Socket not connected, cannot load initial settings yet.");
      return;
    }
    socket.emit("whatsapp-get-initial-settings");
  },

  setInitialSettings: (payload: InitialSettingsPayload) => {
    set((state) => {
      const newClientsMap = new Map(state.clients.map((c) => [c.accountId, c]));
      // Perbarui status isMainClient pada klien yang sudah ada di memori
      if (payload.mainClientAccountId) {
        const mainClient = newClientsMap.get(payload.mainClientAccountId);
        if (mainClient) {
          mainClient.isMainClient = true;
          newClientsMap.set(payload.mainClientAccountId, mainClient);
        }
      }

      return {
        clients: Array.from(newClientsMap.values()),
        // whitelistNumbers: payload.whitelistNumbers, // This belongs to NumberCheckState
        initialSettingsLoaded: true,
        notificationSenderAccountId: payload.notificationSenderAccountId,
      };
    });
    // Also update whitelist numbers via numberCheckManager's action
  },

  setWhitelistNumbers: (numbers) => set({ whitelistNumbers: numbers }),
  addWhitelistNumbers: (numbers) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const currentWhitelist = get().whitelistNumbers;
    const uniqueNewNumbers = numbers.filter(
      (num) => !currentWhitelist.includes(num)
    );
    const updatedWhitelist = [...currentWhitelist, ...uniqueNewNumbers];
    socket.emit("whatsapp-set-whitelist", { numbers: updatedWhitelist });
    get().resetGlobalError();
    set({ whitelistNumbers: updatedWhitelist }); // Optimistic update
    toast.success(`Menambahkan ${uniqueNewNumbers.length} nomor ke whitelist.`);
  },
  removeWhitelistNumber: (number) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-remove-whitelist-number", { number });
    get().resetGlobalError();
    set((state) => ({
      whitelistNumbers: state.whitelistNumbers.filter((num) => num !== number),
    })); // Optimistic update
    toast.success(`Nomor '${number}' dihapus dari whitelist.`);
  },
  resetWhitelistNumbers: () => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-reset-whitelist");
    get().resetGlobalError();
    set({ whitelistNumbers: [] }); // Optimistic update
    toast.success("Daftar whitelist direset.");
  },

  // Socket Emitters (actions yang akan memicu event ke backend)
  loginClient: (accountId, headless) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    console.log(
      "Frontend: Attempting to emit whatsapp-login-qr. Socket connected:",
      socket.connected,
      "Payload:",
      { accountId, headless }
    );
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
    console.log(
      "Frontend: Attempting to emit whatsapp-logout. Socket connected:",
      socket.connected,
      "Payload:",
      { accountId }
    );
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
    console.log(
      "Frontend: Attempting to emit whatsapp-rename-client. Socket connected:",
      socket.connected,
      "Payload:",
      { oldAccountId, newAccountId }
    );
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
          status: "loading", // Set ke loading karena backend akan re-init
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
    console.log(
      "Frontend: Attempting to emit whatsapp-delete-client. Socket connected:",
      socket.connected,
      "Payload:",
      { accountId }
    );
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
    console.log(
      "Frontend: Attempting to emit whatsapp-disconnect-client. Socket connected:",
      socket.connected,
      "Payload:",
      { accountId }
    );
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
    socket.emit("whatsapp-disconnect-all-clients", {}); // Payload kosong
    get().resetGlobalError();
    // Optimistic update: Set semua klien ke disconnected di frontend
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
    console.log(
      "Frontend: Attempting to emit whatsapp-initialize-multiple-clients. Socket connected:",
      socket.connected,
      "Payload:",
      { accountIds, headless }
    );
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
    // Optimistic update: Set klien yang dipilih ke loading
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
  setNotificationSenderAccountId: (accountId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    console.log(
      "Frontend: Attempting to emit whatsapp-set-notification-sender. Socket connected:",
      socket.connected,
      "Payload:",
      { accountId }
    );
    const payload: SetNotificationSenderPayload = { accountId };
    socket.emit("whatsapp-set-notification-sender", payload);
    get().resetGlobalError();
    set({ notificationSenderAccountId: accountId });
  },
});
