"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMemo } from "react";

export const MessageConfig: React.FC<{
  messagesInput: string;
  setMessagesInput: React.Dispatch<React.SetStateAction<string>>;
  handleLoadMessagesEn: () => void;
  handleLoadMessagesId: () => void;
  isWarmerRunning: boolean;
  isSocketConnected: boolean;
}> = ({
  messagesInput,
  setMessagesInput,
  handleLoadMessagesEn,
  handleLoadMessagesId,
  isWarmerRunning,
  isSocketConnected,
}) => {
  const messageCount = useMemo(
    () => messagesInput.split("\n").filter((m) => m.trim().length > 0).length,
    [messagesInput]
  );
  return (
    <div className="space-y-2">
      <Label htmlFor="warmer-messages" className="text-foreground">
        Daftar Pesan untuk Obrolan (pisahkan dengan enter)
      </Label>
      <Textarea
        id="warmer-messages"
        value={messagesInput}
        onChange={(e) => setMessagesInput(e.target.value)}
        rows={8}
        placeholder="Masukkan pesan, satu per baris. Contoh:&#10;Halo, apa kabar?&#10;Baik, kamu?"
        disabled={isWarmerRunning || !isSocketConnected}
        className="w-full max-h-32 leading-6"
      />
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          onClick={handleLoadMessagesEn}
          disabled={isWarmerRunning || !isSocketConnected}
        >
          Muat Pesan Inggris
        </Button>
        <Button
          variant="outline"
          onClick={handleLoadMessagesId}
          disabled={isWarmerRunning || !isSocketConnected}
        >
          Muat Pesan Bahasa Indonesia
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Jumlah pesan dalam daftar: {messageCount}
      </p>
    </div>
  );
};
