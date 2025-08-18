// components/WABlastSection.tsx

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  List, // New icon for job list
  Plus,
} from "lucide-react";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { useWABlastForm } from "./hooks/useWABlastForm";
import { useWABlastActions } from "./hooks/useWABlastActions";
import WAFormControls from "./WaFormControls";
import WABlastJobControls from "./WaBlastJobControls";
import WABlastMessagesTable from "./WABlastMessagesTable";

/**
 * Main component for the WhatsApp Blast feature.
 * (Komponen utama untuk fitur WhatsApp Blast.)
 */
const WABlastSection: React.FC = () => {
  const {
    waBlastJobs,
    setWaBlastJobs,
    currentSelectedWABlastJobId,
    setCurrentSelectedWABlastJobId,
    removeWaBlastJob,
  } = useWhatsAppStore();

  const {
    newJobId,
    setNewJobId,
    selectedSenderAccountIds,
    minDelay,
    setMinDelay,
    maxDelay,
    setMaxDelay,
    delayAfterNRecipients,
    setDelayAfterNRecipients,
    delayAfterNRecipientsSeconds,
    setDelayAfterNRecipientsSeconds,
    messageBlocks,
    activeTab,
    setActiveTab,
    scheduledAt,
    setScheduledAt,
    uploadedFileName,
    uploadedExcelData,
    excelColumns,
    selectedPhoneNumberColumn,
    setSelectedPhoneNumberColumn,
    handleFileUpload,
    handleAddMessageBlock,
    handleUpdateMessageBlock,
    handleRemoveMessageBlock,
    handleSenderAccountSelection,
    handleEditButton,
    isSocketConnected,
  } = useWABlastForm();

  const { handleStartBlast, handlePauseResumeStop } = useWABlastActions();

  const currentJob = currentSelectedWABlastJobId
    ? waBlastJobs[currentSelectedWABlastJobId]
    : undefined;

  return (
    <Card className="w-full mx-auto rounded-lg shadow-xl border">
      <CardContent className="p-6 space-y-6">
        {/* Active WA Blast Jobs List Section */}
        {Object.keys(waBlastJobs).length > 0 && (
          <div className="space-y-4 border rounded-md p-4 bg-muted">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <List className="h-5 w-5" /> Pekerjaan WA Blast Aktif
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(waBlastJobs).map((job) => (
                <Card
                  key={job.jobId}
                  className={`p-3 border rounded-md cursor-pointer transition-all ${
                    currentSelectedWABlastJobId === job.jobId
                      ? "border-primary-foreground shadow-md bg-primary/10"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => setCurrentSelectedWABlastJobId(job.jobId)}
                >
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="truncate flex-1">{job.jobId}</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        job.status === "IN_PROGRESS"
                          ? "bg-green-500/20 text-green-600"
                          : job.status === "PAUSED"
                          ? "bg-yellow-500/20 text-yellow-600"
                          : "bg-gray-500/20 text-gray-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {job.currentRecipients}/{job.totalRecipients} Penerima
                  </p>
                  <p className="text-xs text-muted-foreground max-h-1">
                    Status:{" "}
                    {job.status === "CANCELED"
                      ? "Job dibatalkan karena server restart."
                      : job.message}
                  </p>
                  <div className="flex justify-end gap-2 mt-2">
                    {job.status !== "IN_PROGRESS" && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            removeWaBlastJob(job.jobId);
                            const newJobs = Object.values(waBlastJobs).filter(
                              (j) => j.jobId !== job.jobId
                            );
                            setWaBlastJobs(
                              Object.fromEntries(
                                newJobs.map((j) => [j.jobId, j])
                              )
                            );
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
                    {currentSelectedWABlastJobId === job.jobId && (
                      <div className="flex">
                        <Button variant="secondary" size="sm">
                          <ArrowRight className="mr-2 h-4 w-4" /> Sedang Dilihat
                        </Button>
                      </div>
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

        {/* WA Blast Form Input (hidden if a running/paused job is selected) */}
        {!currentJob ||
        currentJob.status === "COMPLETED" ||
        currentJob.status === "FAILED" ? (
          <WAFormControls
            newJobId={newJobId}
            setNewJobId={setNewJobId}
            uploadedExcelData={uploadedExcelData}
            uploadedFileName={uploadedFileName}
            handleFileUpload={handleFileUpload}
            excelColumns={excelColumns}
            selectedPhoneNumberColumn={selectedPhoneNumberColumn}
            setSelectedPhoneNumberColumn={setSelectedPhoneNumberColumn}
            selectedSenderAccountIds={selectedSenderAccountIds}
            handleSenderAccountSelection={handleSenderAccountSelection}
            isBlastRunning={
              currentJob?.status === "IN_PROGRESS" ||
              currentJob?.status === "PAUSED"
            }
            messageBlocks={messageBlocks}
            handleAddMessageBlock={handleAddMessageBlock}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleUpdateMessageBlock={handleUpdateMessageBlock}
            handleRemoveMessageBlock={handleRemoveMessageBlock}
            minDelay={minDelay}
            setMinDelay={setMinDelay}
            maxDelay={maxDelay}
            setMaxDelay={setMaxDelay}
            delayAfterNRecipients={delayAfterNRecipients}
            setDelayAfterNRecipients={setDelayAfterNRecipients}
            delayAfterNRecipientsSeconds={delayAfterNRecipientsSeconds}
            setDelayAfterNRecipientsSeconds={setDelayAfterNRecipientsSeconds}
            scheduledAt={scheduledAt}
            setScheduledAt={setScheduledAt}
            isSocketConnected={isSocketConnected}
          />
        ) : (
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Detail Pekerjaan: {currentSelectedWABlastJobId?.substring(0, 8)}...
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => setCurrentSelectedWABlastJobId(null)}
            >
              <Plus className="mr-2 h-4 w-4" /> Buat Pekerjaan Baru
            </Button>
          </h3>
        )}

        {/* WA Blast Control Buttons Section */}
        <WABlastJobControls
          currentJob={currentJob}
          currentSelectedWABlastJobId={currentSelectedWABlastJobId}
          setCurrentSelectedWABlastJobId={setCurrentSelectedWABlastJobId}
          newJobId={newJobId}
          selectedSenderAccountIds={selectedSenderAccountIds}
          messageBlocks={messageBlocks}
          minDelay={minDelay}
          maxDelay={maxDelay}
          delayAfterNRecipients={delayAfterNRecipients}
          delayAfterNRecipientsSeconds={delayAfterNRecipientsSeconds}
          uploadedFileName={uploadedFileName}
          scheduledAt={scheduledAt}
          handleStartBlast={handleStartBlast}
          handlePauseResumeStop={handlePauseResumeStop}
        />

        {/* Sent Message Log Table Section */}
        {currentJob &&
          currentJob.messages &&
          currentJob.messages.length > 0 && (
            <WABlastMessagesTable
              data={currentJob.messages}
              excelColumns={excelColumns}
            />
          )}
      </CardContent>
    </Card>
  );
};

export default WABlastSection;
