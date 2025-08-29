"use client";

import { useSidebar } from "@/components/ui/sidebar";
import WABlastSection from "@/components/whatsApp/whatsappBlast/WaBlastSection";
import React from "react";

const Page = () => {
  const { open } = useSidebar();
  return (
    <div
      className={`container ${
        open ? "max-w-[calc(100vw-16rem)]" : "max-w-screen"
      } px-2 sm:px-4 py-4`}
    >
      <WABlastSection />
    </div>
  );
};

export default Page;
