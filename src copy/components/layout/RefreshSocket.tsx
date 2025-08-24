"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { RefreshCcw } from "lucide-react";
import { reconnectWhatsappSocket } from "@/lib/whatsappSocket";

const RefreshSocket = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="flex-grow sm:flex-grow-0"
          onClick={() => reconnectWhatsappSocket()} // Refresh halaman untuk memicu koneksi ulang socket
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Refresh Koneksi Socket</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default RefreshSocket;
