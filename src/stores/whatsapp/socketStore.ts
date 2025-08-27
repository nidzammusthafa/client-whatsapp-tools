import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SocketState {
  socketUrl: string | null;
  setSocketUrl: (url: string) => void;
}

export const useSocketStore = create<SocketState>()(
  persist(
    (set) => ({
      socketUrl: null,
      /**
       * Mengatur URL untuk koneksi Socket.IO.
       * @param {string} url - URL socket yang akan disimpan.
       */
      setSocketUrl: (url: string) => {
        set({ socketUrl: url });
      },
    }),
    {
      name: "socket-url-storage", // Nama key di localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
