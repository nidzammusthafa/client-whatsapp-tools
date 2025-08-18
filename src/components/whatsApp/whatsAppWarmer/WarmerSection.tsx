import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { bahasa, english } from "@/constants/chat";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { WarmerMessagesTable } from "./WarmerMessagesTable";
import { ClientSelection } from "./ClientSelection";
import { MessageConfig } from "./MessageConfig";
import { DelayConfig } from "./DelayConfig";
import { ControlButtons } from "./ControlButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const WarmerSection: React.FC = () => {
  const {
    clients,
    isSocketConnected,
    startWarmer,
    warmerJobStatus,
    pauseWarmer,
    resumeWarmer,
    stopWarmer,
  } = useWhatsAppStore();

  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [totalMessages, setTotalMessages] = useState<number>(1000);
  const [messagesInput, setMessagesInput] = useState<string>(
    english.join("\n")
  ); // Default ke pesan English
  const [minDelay, setMinDelay] = useState<number>(2); // detik
  const [maxDelay, setMaxDelay] = useState<number>(5); // detik
  const [delayAfterNMessages, setDelayAfterNMessages] = useState<number>(100); // pesan
  const [delayAfterNMessagesSeconds, setDelayAfterNMessagesSeconds] =
    useState<number>(10); // detik

  const availableClients = clients.filter(
    (c) => c.status === "ready" || c.status === "authenticated"
  );

  const handleClientSelection = (accountId: string, checked: boolean) => {
    setSelectedClientIds((prev) =>
      checked ? [...prev, accountId] : prev.filter((id) => id !== accountId)
    );
  };

  const handleLoadMessages = (lang: "en" | "id") => {
    if (lang === "en") {
      setMessagesInput(english.join("\n"));
      toast.info("Pesan bahasa Inggris dimuat.");
    } else {
      setMessagesInput(bahasa.join("\n"));
      toast.info("Pesan bahasa Indonesia dimuat.");
    }
  };

  const handleStartWarmer = () => {
    const messages = messagesInput
      .split("\n")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    if (selectedClientIds.length < 2) {
      toast.error("Pilih setidaknya dua akun untuk pemanasan.");
      return;
    }
    if (totalMessages <= 0) {
      toast.error("Jumlah total pesan harus lebih dari 0.");
      return;
    }
    if (messages.length === 0) {
      toast.error("Daftar pesan tidak boleh kosong.");
      return;
    }
    if (
      minDelay < 0 ||
      maxDelay < 0 ||
      delayAfterNMessages < 0 ||
      delayAfterNMessagesSeconds < 0
    ) {
      toast.error("Nilai jeda tidak boleh negatif.");
      return;
    }
    if (minDelay > maxDelay) {
      toast.error("Jeda minimal tidak boleh lebih besar dari jeda maksimal.");
      return;
    }

    startWarmer(selectedClientIds, totalMessages, messages, {
      minDelayMs: minDelay * 1000,
      maxDelayMs: maxDelay * 1000,
      delayAfterNMessages: delayAfterNMessages,
      delayAfterNMessagesMs: delayAfterNMessagesSeconds * 1000,
    });
  };

  const handlePauseResumeStop = (action: "pause" | "resume" | "stop") => {
    const jobId = warmerJobStatus?.jobId;
    if (!jobId) {
      toast.error("Tidak ada pekerjaan warmer yang sedang berjalan.");
      return;
    }
    if (action === "pause") pauseWarmer(jobId);
    if (action === "resume") resumeWarmer(jobId);
    if (action === "stop") stopWarmer(jobId);
  };

  const isWarmerRunning =
    warmerJobStatus?.status === "RUNNING" ||
    warmerJobStatus?.status === "PAUSED";

  // Hitung perkiraan total waktu
  const calculateEstimatedTime = () => {
    if (totalMessages <= 0 || selectedClientIds.length < 2) return "N/A";

    const avgPerMessageDelay = (minDelay + maxDelay) / 2;
    let totalDelaySeconds = totalMessages * avgPerMessageDelay;

    if (delayAfterNMessages > 0 && delayAfterNMessagesSeconds > 0) {
      const intermittentDelaysCount = Math.floor(
        totalMessages / delayAfterNMessages
      );
      totalDelaySeconds += intermittentDelaysCount * delayAfterNMessagesSeconds;
    }

    const minutes = Math.floor(totalDelaySeconds / 60);
    const seconds = Math.floor(totalDelaySeconds % 60);

    return `${minutes}m ${seconds}s (perkiraan)`;
  };

  return (
    <Card className="w-full mx-auto rounded-lg shadow-xl border">
      <CardContent className="p-6 space-y-6">
        <ClientSelection
          availableClients={availableClients}
          selectedClientIds={selectedClientIds}
          handleClientSelection={handleClientSelection}
          isWarmerRunning={isWarmerRunning}
          isSocketConnected={isSocketConnected}
        />

        <MessageConfig
          messagesInput={messagesInput}
          setMessagesInput={setMessagesInput}
          handleLoadMessagesEn={() => handleLoadMessages("en")}
          handleLoadMessagesId={() => handleLoadMessages("id")}
          isWarmerRunning={isWarmerRunning}
          isSocketConnected={isSocketConnected}
        />
        <div className="space-y-2">
          <Label htmlFor="total-messages-warmer" className="text-foreground">
            Jumlah Total Pesan yang Akan Dikirim
          </Label>
          <Input
            id="total-messages-warmer"
            type="number"
            value={totalMessages}
            onChange={(e) => setTotalMessages(Number(e.target.value))}
            min={1}
            disabled={isWarmerRunning || !isSocketConnected}
            className="w-full"
          />
        </div>
        <DelayConfig
          minDelay={minDelay}
          setMinDelay={setMinDelay}
          maxDelay={maxDelay}
          setMaxDelay={setMaxDelay}
          delayAfterNMessages={delayAfterNMessages}
          setDelayAfterNMessages={setDelayAfterNMessages}
          delayAfterNMessagesSeconds={delayAfterNMessagesSeconds}
          setDelayAfterNMessagesSeconds={setDelayAfterNMessagesSeconds}
          estimatedTime={calculateEstimatedTime()}
          isWarmerRunning={isWarmerRunning}
          isSocketConnected={isSocketConnected}
        />
        <ControlButtons
          warmerJobStatus={warmerJobStatus}
          handleStartWarmer={handleStartWarmer}
          handlePauseWarmer={() => handlePauseResumeStop("pause")}
          handleResumeWarmer={() => handlePauseResumeStop("resume")}
          handleStopWarmer={() => handlePauseResumeStop("stop")}
          isSocketConnected={isSocketConnected}
          isStartDisabled={
            !isSocketConnected ||
            selectedClientIds.length < 2 ||
            totalMessages <= 0 ||
            messagesInput.split("\n").filter((m) => m.trim().length > 0)
              .length === 0
          }
          isControlDisabled={!isSocketConnected || !warmerJobStatus?.jobId}
        />

        {warmerJobStatus && (
          <Alert variant="default">
            <Terminal />
            <AlertTitle>Status Pekerjaan</AlertTitle>
            <AlertDescription>{warmerJobStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6">
          {warmerJobStatus?.sentMessagesLog &&
            warmerJobStatus.sentMessagesLog.length > 0 && (
              <WarmerMessagesTable data={warmerJobStatus?.sentMessagesLog} />
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WarmerSection;
