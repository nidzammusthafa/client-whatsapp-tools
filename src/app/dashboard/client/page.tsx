"use client";

import { useSidebar } from "@/components/ui/sidebar";
import ClientListSection from "@/components/whatsApp/client/ClientListSection";
import React from "react";

const Page = () => {
  const { open } = useSidebar();

  return (
    <div
      className={`container px-2 sm:px-4 ${
        open ? "max-w-[calc(100vw-16rem)]" : "max-w-screen"
      } px-2 sm:px-4 py-8`}
    >
      <ClientListSection />
    </div>
  );
};

export default Page;
