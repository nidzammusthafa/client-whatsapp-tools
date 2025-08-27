import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SocketState {
  url: string | null;
  setUrl: (url: string) => void;
}

export const useUrlStore = create<SocketState>()(
  persist(
    (set) => ({
      url: null,
      /**
       * Mengatur URL untuk koneksi Socket.IO.
       * @param {string} url - URL socket yang akan disimpan.
       */
      setUrl: (url: string) => {
        set({ url: url });
      },
    }),
    {
      name: "url-storage", // Nama key di localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
