import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Pause, Play, StopCircle, MessageCircleMore } from "lucide-react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { WarmerMessageLogEntry } from "@/types";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bahasa, english } from "@/constants/chat";
import { useWhatsAppStore } from "@/stores/whatsapp";

// Komponen Tabel Log Pesan Warmer
interface WarmerMessagesTableProps {
  data: WarmerMessageLogEntry[];
}

const WarmerMessagesTable: React.FC<WarmerMessagesTableProps> = ({ data }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sorting, setSorting] = React.useState<any>([]);

  const columns: ColumnDef<WarmerMessageLogEntry>[] = useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Waktu
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("timestamp"));
          return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        },
        minSize: 100,
        maxSize: 120,
      },
      {
        accessorKey: "senderAccountId",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pengirim
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="truncate max-w-[150px]">
            {row.getValue("senderAccountId")}
          </div>
        ),
        minSize: 150,
      },
      {
        accessorKey: "recipientAccountId",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Penerima
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="truncate max-w-[150px]">
            {row.getValue("recipientAccountId")}
          </div>
        ),
        minSize: 150,
      },
      {
        accessorKey: "messageContent",
        header: "Pesan",
        cell: ({ row }) => (
          <div className="truncate max-w-[250px]">
            {row.getValue("messageContent")}
          </div>
        ),
        minSize: 200,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status");
          const colorClass =
            status === "sent" ? "text-green-600" : "text-red-600";
          return (
            <span className={`font-semibold ${colorClass}`}>
              {status === "sent" ? "Terkirim" : "Gagal"}
            </span>
          );
        },
        minSize: 100,
      },
      {
        accessorKey: "error",
        header: "Error",
        cell: ({ row }) => (
          <div className="text-sm text-destructive truncate max-w-[150px]">
            {row.getValue("error") || "-"}
          </div>
        ),
        minSize: 150,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <div className="w-full rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Total {table.getFilteredRowModel().rows.length} hasil.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const WarmerSection: React.FC = () => {
  const {
    clients,
    isSocketConnected,
    startWarmer,
    warmerJobStatus,
    pauseWarmer,
    resumeWarmer,
    stopWarmer,
    warmerMessagesLog, // Ambil log pesan dari store
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
    warmerJobStatus?.status === "running" ||
    warmerJobStatus?.status === "paused";

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
      <CardHeader className="p-4 rounded-t-lg bg-muted">
        <CardTitle className="text-xl font-bold text-foreground">
          WhatsApp Warmer (Pemanasan Akun)
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Buat akun WhatsApp Anda saling mengobrol secara otomatis untuk
          meningkatkan reputasi akun.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-foreground">
            Pilih Akun yang Akan Dipanaskan
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
            {availableClients.length === 0 ? (
              <p className="text-muted-foreground col-span-full">
                Tidak ada klien aktif yang tersedia.
              </p>
            ) : (
              availableClients.map((client) => (
                <div
                  key={client.accountId}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`warmer-client-${client.accountId}`}
                    checked={selectedClientIds.includes(client.accountId)}
                    onCheckedChange={(checked) =>
                      handleClientSelection(
                        client.accountId,
                        checked as boolean
                      )
                    }
                    disabled={isWarmerRunning || !isSocketConnected}
                  />
                  <Label
                    htmlFor={`warmer-client-${client.accountId}`}
                    className="text-sm"
                  >
                    {client.accountId} ({client.phoneNumber || "N/A"})
                  </Label>
                </div>
              ))
            )}
          </div>
          {selectedClientIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Terpilih: {selectedClientIds.length} akun.
            </p>
          )}
        </div>

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
              onClick={() => handleLoadMessages("en")}
              disabled={isWarmerRunning || !isSocketConnected}
            >
              Muat Pesan Inggris
            </Button>
            <Button
              variant="outline"
              onClick={() => handleLoadMessages("id")}
              disabled={isWarmerRunning || !isSocketConnected}
            >
              Muat Pesan Bahasa Indonesia
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Jumlah pesan dalam daftar:{" "}
            {
              messagesInput.split("\n").filter((m) => m.trim().length > 0)
                .length
            }
          </p>
        </div>

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

        {/* Konfigurasi Jeda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted">
          <div className="space-y-2">
            <Label htmlFor="min-delay-warmer" className="text-foreground">
              Jeda Minimal Antar Pesan (detik)
            </Label>
            <Input
              id="min-delay-warmer"
              type="number"
              value={minDelay}
              onChange={(e) => setMinDelay(Number(e.target.value))}
              min={0}
              disabled={isWarmerRunning || !isSocketConnected}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-delay-warmer" className="text-foreground">
              Jeda Maksimal Antar Pesan (detik)
            </Label>
            <Input
              id="max-delay-warmer"
              type="number"
              value={maxDelay}
              onChange={(e) => setMaxDelay(Number(e.target.value))}
              min={0}
              disabled={isWarmerRunning || !isSocketConnected}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delay-n-messages" className="text-foreground">
              Jeda Setelah Setiap N Pesan
            </Label>
            <Input
              id="delay-n-messages"
              type="number"
              value={delayAfterNMessages}
              onChange={(e) => setDelayAfterNMessages(Number(e.target.value))}
              min={0}
              disabled={isWarmerRunning || !isSocketConnected}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="delay-n-messages-seconds"
              className="text-foreground"
            >
              Durasi Jeda (detik)
            </Label>
            <Input
              id="delay-n-messages-seconds"
              type="number"
              value={delayAfterNMessagesSeconds}
              onChange={(e) =>
                setDelayAfterNMessagesSeconds(Number(e.target.value))
              }
              min={0}
              disabled={isWarmerRunning || !isSocketConnected}
              className="w-full"
            />
          </div>
          <p className="md:col-span-2 text-sm text-muted-foreground">
            Proses akan menjeda secara acak antara {minDelay}-{maxDelay} detik
            setelah setiap pesan. Tambahan jeda {delayAfterNMessagesSeconds}{" "}
            detik akan diterapkan setiap {delayAfterNMessages} pesan terkirim.
          </p>
          <p className="md:col-span-2 text-sm text-muted-foreground font-semibold">
            Perkiraan Total Waktu: {calculateEstimatedTime()}
          </p>
        </div>

        {/* Tombol Kontrol Warmer */}
        <div className="flex gap-2 w-full">
          {warmerJobStatus?.status === "running" ? (
            <Button
              variant="secondary"
              onClick={() => handlePauseResumeStop("pause")}
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={!isSocketConnected || !warmerJobStatus?.jobId}
            >
              <Pause className="mr-2 h-4 w-4" /> Jeda Warmer (
              {warmerJobStatus.currentMessages}/{warmerJobStatus.totalMessages})
            </Button>
          ) : warmerJobStatus?.status === "paused" ? (
            <Button
              variant="default"
              onClick={() => handlePauseResumeStop("resume")}
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={!isSocketConnected || !warmerJobStatus?.jobId}
            >
              <Play className="mr-2 h-4 w-4" /> Lanjutkan Warmer (
              {warmerJobStatus.currentMessages}/{warmerJobStatus.totalMessages})
            </Button>
          ) : (
            <Button
              onClick={handleStartWarmer}
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={
                !isSocketConnected ||
                selectedClientIds.length < 2 ||
                totalMessages <= 0 ||
                messagesInput.split("\n").filter((m) => m.trim().length > 0)
                  .length === 0
              }
            >
              <MessageCircleMore className="mr-2 h-4 w-4" /> Mulai WhatsApp
              Warmer
            </Button>
          )}
          {(warmerJobStatus?.status === "running" ||
            warmerJobStatus?.status === "paused" ||
            warmerJobStatus?.status === "error") && (
            <Button
              onClick={() => handlePauseResumeStop("stop")}
              variant="destructive"
              className="w-auto"
              disabled={!isSocketConnected || !warmerJobStatus?.jobId}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

        {warmerJobStatus && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            Status Pekerjaan: {warmerJobStatus.message}
          </p>
        )}

        {warmerMessagesLog.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Log Pesan Terkirim:
            </h3>
            <WarmerMessagesTable data={warmerMessagesLog} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WarmerSection;
