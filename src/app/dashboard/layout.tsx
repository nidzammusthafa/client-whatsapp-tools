"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { Terminal } from "lucide-react";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const globalError = useWhatsAppStore((state) => state.globalError);

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex flex-col w-full">
        <SidebarTrigger className="fixed z-40" />
        {globalError && (
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Alert variant="destructive" className="mb-6 max-w-11/12 w-full">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Kesalahan!</AlertTitle>
                <AlertDescription>{globalError}</AlertDescription>
              </Alert>
            </div>
          </header>
        )}
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;
