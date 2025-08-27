"use client";

import { useWhatsAppManager } from "@/hooks/useWhatsappManager";

const Layout = ({ children }: { children: React.ReactNode }) => {
  useWhatsAppManager();

  return <div>{children}</div>;
};

export default Layout;
