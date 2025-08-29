"use client";

import { useSidebar } from "@/components/ui/sidebar";
import WarmerSection from "@/components/whatsApp/whatsAppWarmer/WarmerSection";
import React from "react";

const Page = () => {
  const { open } = useSidebar();

  return (
    <div
      className={`container ${
        open ? "max-w-[calc(100vw-16rem)]" : "max-w-screen"
      } p-8`}
    >
      <WarmerSection />
    </div>
  );
};

export default Page;
