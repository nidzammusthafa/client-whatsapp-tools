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
import { List, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const WarmerSection: React.FC = () => {
  const {
    clients,
    isSocketConnected,
    startWarmer,
    warmerJobStatus,
    setWarmerJobStatus,
    setCurrentWarmerJobId,
    waWarmerJobs,
    pauseWarmer,
    resumeWarmer,
    stopWarmer,
    removeWarmerJob,
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

  const warmerJobs = Object.values(waWarmerJobs).map((job) => ({
    ...job,
    currentMessages:
      warmerJobStatus?.jobId === job.jobId
        ? warmerJobStatus.currentMessages
        : job.currentMessages,
    totalMessages:
      warmerJobStatus?.jobId === job.jobId
        ? warmerJobStatus.totalMessages
        : job.totalMessages,
    message:
      warmerJobStatus?.jobId === job.jobId
        ? warmerJobStatus.message
        : job.error || "",
    sentMessagesLog:
      warmerJobStatus?.jobId === job.jobId
        ? warmerJobStatus.sentMessagesLog
        : job.sentMessagesLog || [],
  }));

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

  const handleWarmerActions = (action: "pause" | "resume" | "stop") => {
    const jobId = warmerJobStatus?.jobId;
    if (!jobId) {
      toast.error("Tidak ada pekerjaan warmer yang sedang berjalan.");
      return;
    }
    if (action === "pause") pauseWarmer(jobId);
    if (action === "resume") resumeWarmer(jobId);
    if (action === "stop") stopWarmer(jobId);
  };

  const handleEditButton = () => {
    /* Mengisi semua data form dengan data dari database */
    if (warmerJobStatus) {
      setSelectedClientIds(
        waWarmerJobs[warmerJobStatus.jobId].selectedAccountIds
      );
      setTotalMessages(warmerJobStatus.totalMessages);
      setDelayAfterNMessages(
        waWarmerJobs[warmerJobStatus.jobId].delayAfterNMessages
      );
      setDelayAfterNMessagesSeconds(
        waWarmerJobs[warmerJobStatus.jobId].delayAfterNMessagesMs / 1000
      );
      setMinDelay(waWarmerJobs[warmerJobStatus.jobId].minDelayMs / 1000);
      setMaxDelay(waWarmerJobs[warmerJobStatus.jobId].maxDelayMs / 1000);
      setMessagesInput(waWarmerJobs[warmerJobStatus.jobId].messages.join("\n"));
    }
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
        {/* Bagian daftar Pekerjaan WaWarmer */}
        {Object.keys(waWarmerJobs).length > 0 && (
          <div className="space-y-4 border rounded-md p-4 bg-muted">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <List className="h-5 w-5" /> Pekerjaan WA Warmer Aktif
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(warmerJobs).map((job) => (
                <Card
                  key={job.jobId}
                  className={`p-3 border rounded-md cursor-pointer transition-all ${
                    warmerJobStatus?.jobId === job.jobId
                      ? "border-primary-foreground shadow-md bg-primary/10"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => {
                    setWarmerJobStatus({
                      jobId: job.jobId,
                      currentMessages: job.currentMessages,
                      totalMessages: job.totalMessages,
                      status: job.status,
                      message: job.error || "",
                      sentMessagesLog: job.sentMessagesLog || [],
                    });
                    setCurrentWarmerJobId(job.jobId);
                  }}
                >
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="truncate flex-1">{job.jobId}</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        job.status === "RUNNING"
                          ? "bg-green-500/20 text-green-600"
                          : job.status === "PAUSED"
                          ? "bg-yellow-500/20 text-yellow-600"
                          : "bg-gray-500/20 text-gray-600"
                      }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {job.currentMessages}/{job.totalMessages} Penerima
                  </p>
                  <div className="flex justify-end gap-2 mt-2">
                    {job.status !== "RUNNING" && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            removeWarmerJob(job.jobId);
                            setWarmerJobStatus(null);
                          }}
                        >
                          Hapus
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleEditButton}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Pilih pekerjaan di atas untuk melihat detail progres dan log.
            </p>
          </div>
        )}
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
          handlePauseWarmer={() => handleWarmerActions("pause")}
          handleResumeWarmer={() => handleWarmerActions("resume")}
          handleStopWarmer={() => handleWarmerActions("stop")}
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
