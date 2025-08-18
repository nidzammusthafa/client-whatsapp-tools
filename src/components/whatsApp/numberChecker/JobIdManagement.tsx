"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { PlusCircle, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const JobIdManagement = ({
  isCheckingNumbers,
}: {
  isCheckingNumbers: boolean;
}) => {
  const {
    currentNumberCheckJobId,
    availableNumberCheckJobs,
    generateNewNumberCheckJobId,
    setNumberCheckJobStatus,
  } = useWhatsAppStore();

  const [jobIdInput, setJobId] = useState<string>(currentNumberCheckJobId);
  const [selectedJobIdFromDropdown, setSelectedJobIdFromDropdown] =
    useState<string>("");

  useEffect(() => {
    setJobId(currentNumberCheckJobId);
    setSelectedJobIdFromDropdown("");
  }, [currentNumberCheckJobId]);

  const handleLoadJob = () => {
    const jobToLoad = availableNumberCheckJobs.find(
      (job) => job.jobId === selectedJobIdFromDropdown
    );
    if (jobToLoad) {
      setNumberCheckJobStatus({
        jobId: jobToLoad.jobId,
        current: jobToLoad.current,
        total: jobToLoad.total,
        status: jobToLoad.status,
        message: `Pekerjaan dimuat: ${jobToLoad.status}`,
      });
      useWhatsAppStore.setState({
        currentNumberCheckJobId: jobToLoad.jobId,
        uploadedExcelData: null,
        excelColumns: [],
        selectedPhoneNumberColumn: "",
        minDelay: 2,
        maxDelay: 4,
        delayAfterNNumbers: 10,
        numberCheckResults: [],
      });
      toast.success(`Pekerjaan '${jobToLoad.jobId}' berhasil dimuat.`);
    } else {
      toast.error("Pekerjaan tidak ditemukan.");
    }
  };

  const handleDeleteJob = () => {
    if (!selectedJobIdFromDropdown) {
      toast.error("Pilih pekerjaan yang ingin dihapus.");
      return;
    }
    if (
      window.confirm(
        `Anda yakin ingin menghapus pekerjaan '${selectedJobIdFromDropdown}'?`
      )
    ) {
      useWhatsAppStore.getState().stopNumberChecking(selectedJobIdFromDropdown);
      toast.success(
        `Permintaan penghapusan pekerjaan '${selectedJobIdFromDropdown}' dikirim.`
      );
      setSelectedJobIdFromDropdown("");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="job-id-input">ID Pekerjaan Baru / Aktif</Label>
        <Input
          id="job-id-input"
          type="text"
          value={jobIdInput}
          onChange={(e) => setJobId(e.target.value)}
          placeholder="Masukkan ID pekerjaan unik"
          disabled={isCheckingNumbers}
        />
        <Button
          onClick={() => {
            const newId = uuidv4();
            setJobId(newId);
            generateNewNumberCheckJobId();
            toast.info(`ID Pekerjaan baru dibuat: ${newId}`);
          }}
          variant="outline"
          size="sm"
          className="w-full"
          disabled={isCheckingNumbers}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Generate ID Baru
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="load-job-select">Muat Pekerjaan Tersimpan</Label>
        <div className="flex gap-2">
          <Select
            onValueChange={setSelectedJobIdFromDropdown}
            value={selectedJobIdFromDropdown}
            disabled={
              isCheckingNumbers || availableNumberCheckJobs.length === 0
            }
          >
            <SelectTrigger className="flex-grow">
              <SelectValue placeholder="Pilih pekerjaan..." />
            </SelectTrigger>
            <SelectContent>
              {availableNumberCheckJobs.map((job) => (
                <SelectItem key={job.jobId} value={job.jobId}>
                  {job.jobId} ({job.status}) - {job.current}/{job.total}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleLoadJob}
            disabled={!selectedJobIdFromDropdown || isCheckingNumbers}
            variant="outline"
            size="icon"
            title="Muat Pekerjaan"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDeleteJob}
            disabled={!selectedJobIdFromDropdown || isCheckingNumbers}
            variant="destructive"
            size="icon"
            title="Hapus Pekerjaan"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
