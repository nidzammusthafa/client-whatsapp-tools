import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, FilePlus, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadZone } from "@/components/UploadZone";
import { WABlastMessageBlock } from "@/types";
import MessageBlockInput from "./MessageBlockInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StoredMessageManagement from "../message/StoredMessageManagement";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { DatePicker } from "@/components/ui/date-picker";

interface WAFormControlsProps {
  newJobId: string;
  setNewJobId: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadedExcelData: any[] | null;
  uploadedFileName: string | undefined;
  handleFileUpload: (files: File[] | File) => void;
  excelColumns: string[];
  selectedPhoneNumberColumn: string;
  setSelectedPhoneNumberColumn: (column: string) => void;
  selectedSenderAccountIds: string[];
  handleSenderAccountSelection: (accountId: string, checked: boolean) => void;
  isBlastRunning: boolean;
  messageBlocks: WABlastMessageBlock[];
  handleAddMessageBlock: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleUpdateMessageBlock: (
    index: number,
    updatedBlock: WABlastMessageBlock
  ) => void;
  handleRemoveMessageBlock: (index: number) => void;
  minDelay: number;
  setMinDelay: (delay: number) => void;
  maxDelay: number;
  setMaxDelay: (delay: number) => void;
  delayAfterNRecipients: number;
  setDelayAfterNRecipients: (n: number) => void;
  delayAfterNRecipientsSeconds: number;
  setDelayAfterNRecipientsSeconds: (seconds: number) => void;
  scheduledAt: Date | undefined;
  setScheduledAt: (date: Date | undefined) => void;
  isSocketConnected: boolean;
}

const WAFormControls: React.FC<WAFormControlsProps> = ({
  newJobId,
  setNewJobId,
  uploadedExcelData,
  handleFileUpload,
  excelColumns,
  selectedPhoneNumberColumn,
  setSelectedPhoneNumberColumn,
  selectedSenderAccountIds,
  handleSenderAccountSelection,
  isBlastRunning,
  messageBlocks,
  handleAddMessageBlock,
  activeTab,
  setActiveTab,
  handleUpdateMessageBlock,
  handleRemoveMessageBlock,
  minDelay,
  setMinDelay,
  maxDelay,
  setMaxDelay,
  delayAfterNRecipients,
  setDelayAfterNRecipients,
  delayAfterNRecipientsSeconds,
  setDelayAfterNRecipientsSeconds,
  scheduledAt,
  setScheduledAt,
  isSocketConnected,
}) => {
  const {
    clients,
    storedMessages,
    enableWhatsappWarmer,
    whatsappWarmerMinMessages,
    whatsappWarmerMaxMessages,
    whatsappWarmerDelayMs,
    whatsappWarmerLanguage,
    warmerJobId,
    setWarmerJobId,
    waWarmerJobs,
    setOriginalData,
    setEnableWhatsappWarmer,
    setWhatsappWarmerMinMessages,
    setWhatsappWarmerMaxMessages,
    setWhatsappWarmerDelayMs,
    setWhatsappWarmerLanguage,
  } = useWhatsAppStore();
  const { setSelectedSenderAccountIds } = useWhatsAppStore();

  const activeClients = clients.filter(
    (c) => c.status === "ready" || c.status === "authenticated"
  );
  const [isStoredMessageDialogOpen, setIsStoredMessageDialogOpen] =
    useState(false);

  return (
    <>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Mulai Pekerjaan WA Blast Baru
      </h3>
      {!uploadedExcelData ? (
        <UploadZone
          onFilesSelected={handleFileUpload}
          accept=".xlsx,.xls"
          label="Seret atau klik untuk mengunggah file Excel (.xlsx, .xls)"
          disabled={isBlastRunning}
        />
      ) : (
        <div className="flex flex-col md:flex-row gap-4 w-full items-center justify-between">
          <div className="flex-1 space-y-2 w-full">
            <Label htmlFor="sender-accounts" className="text-foreground">
              Pilih Akun Pengirim (Bisa Lebih Dari Satu)
            </Label>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="select-all-senders"
                checked={selectedSenderAccountIds.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSenderAccountIds(
                      activeClients
                        .filter((client) => !client.isBlastActive)
                        .map((client) => client.accountId)
                    );
                  } else {
                    setSelectedSenderAccountIds([]);
                  }
                }}
                disabled={
                  isBlastRunning || !isSocketConnected || !activeClients.length
                }
              />
              <Label htmlFor="select-all-senders">Pilih Semua</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {activeClients.length === 0 ? (
                <p className="text-muted-foreground col-span-full">
                  Tidak ada klien aktif yang tersedia.
                </p>
              ) : (
                activeClients.map((client) => (
                  <div
                    key={client.accountId}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`sender-client-${client.accountId}`}
                      checked={selectedSenderAccountIds.includes(
                        client.accountId
                      )}
                      onCheckedChange={(checked) =>
                        handleSenderAccountSelection(
                          client.accountId,
                          checked as boolean
                        )
                      }
                      disabled={
                        isBlastRunning ||
                        !isSocketConnected ||
                        client.isBlastActive
                      }
                    />
                    <Label
                      htmlFor={`sender-client-${client.accountId}`}
                      className="text-sm"
                    >
                      {client.accountId} ({client.phoneNumber || "N/A"})
                    </Label>
                  </div>
                ))
              )}
            </div>
            {selectedSenderAccountIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Terpilih: {selectedSenderAccountIds.length} akun.
              </p>
            )}
            {selectedSenderAccountIds.length === 0 && (
              <p className="text-sm text-destructive">
                Pilih setidaknya satu akun WhatsApp pengirim yang aktif.
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setOriginalData(null)}
            className="mt-4 md:mt-0"
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Ganti File
          </Button>
        </div>
      )}

      {uploadedExcelData && excelColumns.length > 0 && (
        <div className="flex gap-2 w-full">
          <div className="space-y-2">
            <Label htmlFor="column-select" className="text-foreground">
              Pilih Kolom Nomor Telepon
            </Label>
            <Select
              onValueChange={setSelectedPhoneNumberColumn}
              value={selectedPhoneNumberColumn}
              disabled={isBlastRunning}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kolom..." />
              </SelectTrigger>
              <SelectContent>
                {excelColumns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Jumlah baris data: {uploadedExcelData.length}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-id-display" className="text-foreground">
              ID Pekerjaan
            </Label>
            <Input
              id="job-id-display"
              type="text"
              value={newJobId}
              onChange={(e) => setNewJobId(e.target.value.trim())}
              className="w-full bg-muted-foreground/10"
            />
            <p className="text-sm text-muted-foreground">
              ID unik untuk pekerjaan WA Blast ini.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-date" className="text-foreground">
              Jadwalkan Blast (Opsional)
            </Label>
            <DatePicker date={scheduledAt} setDate={setScheduledAt} />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Dialog
          open={isStoredMessageDialogOpen}
          onOpenChange={setIsStoredMessageDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-2">
              <Settings className="mr-2 h-4 w-4" /> Atur Pesan Tersimpan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manajemen Pesan Tersimpan</DialogTitle>
            </DialogHeader>
            <StoredMessageManagement />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 border rounded-md p-4 bg-muted">
        <Label className="text-foreground">
          Konfigurasi Pesan yang Akan Dikirim
        </Label>
        {messageBlocks.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Tekan &quot;Tambah Pesan&quot; untuk mulai membuat pesan.
          </p>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full overflow-x-auto justify-start">
              {messageBlocks.map((block, index) => (
                <TabsTrigger key={block.id} value={`message-${index}`}>
                  Pesan {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            {messageBlocks.map((block, index) => (
              <TabsContent
                key={block.id}
                value={`message-${index}`}
                className="mt-4"
              >
                <MessageBlockInput
                  block={block}
                  index={index}
                  onUpdate={handleUpdateMessageBlock}
                  onRemove={handleRemoveMessageBlock}
                  excelColumns={excelColumns}
                  storedMessages={storedMessages}
                  isBlastRunning={isBlastRunning}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
        <Button
          onClick={handleAddMessageBlock}
          variant="outline"
          disabled={isBlastRunning}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Pesan
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Anda dapat menambahkan beberapa pesan yang akan dikirim secara
          berurutan ke setiap penerima. Gunakan opsi &quot;Pilih acak&quot; jika
          Anda ingin mengirim salah satu dari daftar pesan yang berbeda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted">
        <div className="space-y-2">
          <Label htmlFor="min-delay-blast" className="text-foreground">
            Jeda Minimal Antar Pesan (detik)
          </Label>
          <Input
            id="min-delay-blast"
            type="number"
            value={minDelay}
            onChange={(e) => setMinDelay(Number(e.target.value))}
            min={0}
            disabled={isBlastRunning || !isSocketConnected}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-delay-blast" className="text-foreground">
            Jeda Maksimal Antar Pesan (detik)
          </Label>
          <Input
            id="max-delay-blast"
            type="number"
            value={maxDelay}
            onChange={(e) => setMaxDelay(Number(e.target.value))}
            min={0}
            disabled={isBlastRunning || !isSocketConnected}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="delay-n-recipients" className="text-foreground">
            Jeda Setelah Setiap N Penerima
          </Label>
          <Input
            id="delay-n-recipients"
            type="number"
            value={delayAfterNRecipients}
            onChange={(e) => setDelayAfterNRecipients(Number(e.target.value))}
            min={0}
            disabled={isBlastRunning || !isSocketConnected}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="delay-n-recipients-seconds"
            className="text-foreground"
          >
            Durasi Jeda (detik)
          </Label>
          <Input
            id="delay-n-recipients-seconds"
            type="number"
            value={delayAfterNRecipientsSeconds}
            onChange={(e) =>
              setDelayAfterNRecipientsSeconds(Number(e.target.value))
            }
            min={0}
            disabled={isBlastRunning || !isSocketConnected}
            className="w-full"
          />
        </div>
        <p className="md:col-span-2 text-sm text-muted-foreground">
          Proses akan menjeda secara acak antara {minDelay}-{maxDelay} detik
          setelah setiap pesan terkirim ke satu penerima. Tambahan jeda{" "}
          {delayAfterNRecipientsSeconds} detik akan diterapkan setiap{" "}
          {delayAfterNRecipients} penerima.
        </p>
      </div>

      <div className="space-y-4 p-4 border rounded-md bg-muted">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-inter-chat"
            checked={enableWhatsappWarmer}
            onCheckedChange={(checked) =>
              setEnableWhatsappWarmer(checked as boolean)
            }
            disabled={
              isBlastRunning ||
              !isSocketConnected ||
              selectedSenderAccountIds.length < 2
            }
          />
          <Label htmlFor="enable-inter-chat" className="text-foreground">
            Aktifkan Obrolan Antar Akun Pengirim (Setelah N Pesan Terkirim)
          </Label>
        </div>
        {enableWhatsappWarmer && selectedSenderAccountIds.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label
                htmlFor="inter-chat-min-messages"
                className="text-foreground"
              >
                Min Pesan Terkirim Sebelum Obrolan
              </Label>
              <Input
                id="inter-chat-min-messages"
                type="number"
                value={whatsappWarmerMinMessages}
                onChange={(e) =>
                  setWhatsappWarmerMinMessages(Number(e.target.value))
                }
                min={1}
                disabled={isBlastRunning || !isSocketConnected}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="inter-chat-max-messages"
                className="text-foreground"
              >
                Max Pesan Terkirim Sebelum Obrolan
              </Label>
              <Input
                id="inter-chat-max-messages"
                type="number"
                value={whatsappWarmerMaxMessages}
                onChange={(e) =>
                  setWhatsappWarmerMaxMessages(Number(e.target.value))
                }
                min={1}
                disabled={isBlastRunning || !isSocketConnected}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="inter-chat-delay-seconds"
                className="text-foreground"
              >
                Durasi Obrolan (detik)
              </Label>
              <Input
                id="inter-chat-delay-seconds"
                type="number"
                value={whatsappWarmerDelayMs}
                onChange={(e) =>
                  setWhatsappWarmerDelayMs(Number(e.target.value))
                }
                min={0}
                disabled={isBlastRunning || !isSocketConnected}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inter-chat-language" className="text-foreground">
                Bahasa Obrolan
              </Label>
              <Select
                value={whatsappWarmerLanguage}
                onValueChange={(value: "en" | "id") =>
                  setWhatsappWarmerLanguage(value)
                }
                disabled={isBlastRunning || !isSocketConnected}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Bahasa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bahasa">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warmer-job-id" className="text-foreground">
                Hubungkan WAWarmer
              </Label>
              <Select
                value={warmerJobId}
                onValueChange={(value: string) => setWarmerJobId(value)}
                disabled={isBlastRunning || !isSocketConnected}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih WaWarmer..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(waWarmerJobs).map((job, idx) => {
                    return (
                      <SelectItem key={idx} value={job.jobId}>
                        {job.jobId}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <p className="md:col-span-3 text-sm text-muted-foreground">
              Setelah setiap antara {whatsappWarmerMinMessages} hingga{" "}
              {whatsappWarmerMaxMessages} pesan terkirim ke penerima, dua akun
              pengirim yang dipilih akan saling mengobrol selama sekitar{" "}
              {whatsappWarmerDelayMs} detik menggunakan bahasa yang dipilih. Ini
              membantu menjaga reputasi akun.
            </p>
          </div>
        )}
        {enableWhatsappWarmer && selectedSenderAccountIds.length < 2 && (
          <p className="text-sm text-destructive">
            Pilih setidaknya dua akun pengirim untuk mengaktifkan obrolan antar
            akun.
          </p>
        )}
      </div>
    </>
  );
};

export default WAFormControls;
