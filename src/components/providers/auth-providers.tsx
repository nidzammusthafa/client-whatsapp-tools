"use client";

import { useAuthStore } from "@/stores/authStore";
import { usePathname } from "next/navigation"; // Impor usePathname
import { useCallback, useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Menambahkan prop untuk rute yang dilindungi
interface AuthProviderProps {
  children: React.ReactNode;
  protectedRoutes: string[];
}

export const AuthProvider = ({
  children,
  protectedRoutes,
}: AuthProviderProps) => {
  const { isLoggedIn, isAuthChecked, login, checkLoginStatus, setToken } =
    useAuthStore();
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname(); // Mendapatkan path URL saat ini

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const handlePasswordSubmit = useCallback(async () => {
    if (passwordInput.length !== 8) {
      setErrorMessage("Kata sandi harus 8 digit.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        login();
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          setToken(data.token);
        }
        setErrorMessage("");
        setPasswordInput("");
      } else {
        setErrorMessage(data.message || "Verifikasi kata sandi gagal.");
        setPasswordInput("");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setErrorMessage("Terjadi kesalahan jaringan atau server.");
    } finally {
      setIsLoading(false);
    }
  }, [passwordInput, login, setToken]);

  useEffect(() => {
    if (passwordInput.length === 8 && !isLoading) {
      handlePasswordSubmit();
    }
  }, [passwordInput, isLoading, handlePasswordSubmit]);

  if (!isAuthChecked) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Memuat...</p>
      </div>
    );
  }

  // Cek apakah rute saat ini termasuk rute yang dilindungi
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Jika ini adalah rute yang dilindungi dan pengguna belum login, tampilkan layar kunci
  if (isProtectedRoute && !isLoggedIn) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-card p-10 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-4">Akses Terbatas</h2>
          <p className="mb-8 text-muted-foreground">
            Untuk mengakses halaman ini, silakan masukkan 8 digit kata sandi
            Anda.
          </p>
          <InputOTP
            maxLength={8}
            value={passwordInput}
            onChange={(value) => setPasswordInput(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
              <InputOTPSlot index={6} />
              <InputOTPSlot index={7} />
            </InputOTPGroup>
          </InputOTP>
          {errorMessage && (
            <p className="text-destructive mt-4 text-sm font-medium">
              {errorMessage}
            </p>
          )}
          <Button
            onClick={handlePasswordSubmit}
            disabled={isLoading || passwordInput.length !== 8}
            className="mt-10 w-full"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Memverifikasi..." : "Masuk Aplikasi"}
          </Button>
        </div>
      </div>
    );
  }

  // Jika tidak, tampilkan konten halaman
  return <>{children}</>;
};
