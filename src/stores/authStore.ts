import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  isAuthChecked: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
  setToken: (token: string | null) => void;
  checkLoginStatus: () => void; // Untuk memeriksa status login dari localStorage saat inisialisasi
}

const decodeJwtAndCheckExp = (token: string | null): boolean => {
  if (!token) {
    return false; // No token, so not valid
  }
  try {
    // JWT has three parts: header, payload, signature, separated by dots.
    // We only need the payload (second part).
    const base64Url = token.split(".")[1];
    // Decode base64url to base64, then decode base64 to string, then parse JSON
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    // 'exp' is the expiration time in seconds since epoch
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      return currentTime < expirationTime; // Return true if not expired
    }
    return false; // No expiration time found in token
  } catch (error) {
    console.error("Error decoding JWT or checking expiration:", error);
    return false; // Token is malformed or invalid
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false, // Default state: belum login
  isAuthChecked: false,
  token: null,
  login: () => {
    set({ isLoggedIn: true }); // Mengatur state isLoggedIn menjadi true
    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true"); // Menyimpan status login di localStorage
    }
  },
  logout: () => {
    set({ isLoggedIn: false, token: null }); // Mengatur state isLoggedIn menjadi false
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn"); // Menghapus status login dari localStorage
      localStorage.removeItem("authToken");
    }
  },
  setToken: (token) => {
    set({ token });
  },
  checkLoginStatus: () => {
    if (typeof window !== "undefined") {
      const storedStatus = localStorage.getItem("isLoggedIn");
      const storedToken = localStorage.getItem("authToken");

      // Periksa apakah token valid dan belum kedaluwarsa
      const isTokenValid = decodeJwtAndCheckExp(storedToken);

      if (storedStatus === "true" && isTokenValid) {
        set({
          isLoggedIn: true,
          token: storedToken,
          isAuthChecked: true,
        });
      } else {
        // Jika status tidak 'true', token tidak valid, atau sudah kedaluwarsa,
        // pastikan pengguna di-logout dan hapus token/status dari localStorage.
        set({
          isLoggedIn: false,
          token: null,
          isAuthChecked: true,
        });
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("authToken");
      }
    } else {
      // Untuk lingkungan non-browser (SSR), asumsikan belum login
      set({ isLoggedIn: false, isAuthChecked: true });
    }
  },
}));
