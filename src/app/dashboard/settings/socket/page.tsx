import { SocketConfigurator } from "@/components/whatsApp/SocketConfigurator";
import React from "react";

const page = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <SocketConfigurator />;
    </div>
  );
};

export default page;
