"use client";

import { getDialogValue } from "@/components/providers/DialogProvider";

// fungsi global untuk ambil URL
export const getServerUrl = (defaultUrl = ""): Promise<string> => {
  return getDialogValue({
    title: "Masukkan URL:",
    description: "Masukkan URL Backend",
    placeholder: "http://localhost:5000",
  }).then((url) => url ?? defaultUrl);
};
