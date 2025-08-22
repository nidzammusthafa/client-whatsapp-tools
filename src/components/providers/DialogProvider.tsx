"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DialogPromptOptions = {
  title?: string;
  description?: string;
  placeholder?: string;
};

let openDialogFn: (options: DialogPromptOptions) => Promise<string | null>;

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<DialogPromptOptions>({});
  const [resolveFn, setResolveFn] =
    React.useState<(value: string | null) => void>();
  const [inputValue, setInputValue] = React.useState("");

  const openPrompt = (opts: DialogPromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setOptions(opts);
      setInputValue("");
      setResolveFn(() => resolve);
      setIsOpen(true);
    });
  };

  // simpan ref global
  openDialogFn = openPrompt;

  const handleClose = () => {
    resolveFn?.(null);
    setIsOpen(false);
  };

  const handleSubmit = () => {
    resolveFn?.(inputValue);
    setIsOpen(false);
  };

  return (
    <>
      {children}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{options.title ?? "Masukkan Data"}</DialogTitle>
            {options.description && (
              <DialogDescription>{options.description}</DialogDescription>
            )}
          </DialogHeader>
          <Input
            placeholder={options.placeholder ?? "Tulis sesuatu..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// fungsi ini bisa dipanggil dari mana saja
export function getDialogValue(options: DialogPromptOptions) {
  if (!openDialogFn) {
    throw new Error("DialogProvider belum di-mount.");
  }
  return openDialogFn(options);
}
