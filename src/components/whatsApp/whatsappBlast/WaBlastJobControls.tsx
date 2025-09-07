import React from "react";
import { Button } from "@/components/ui/button";
import {
  Pause,
  Play,
  StopCircle,
  MessageCircleMore,
  Terminal,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WABlastProgressUpdate, WABlastMessageBlock } from "@/types";
import { useWhatsAppStore } from "@/stores/whatsapp";

interface WABlastJobControlsProps {
  currentJob: WABlastProgressUpdate | undefined;
  currentSelectedWABlastJobId: string | null;
  setCurrentSelectedWABlastJobId: (id: string | null) => void;
  newJobId: string;
  selectedSenderAccountIds: string[];
  messageBlocks: WABlastMessageBlock[];
  minDelay: number;
  maxDelay: number;
  delayAfterNRecipients: number;
  delayAfterNRecipientsSeconds: number;
  uploadedFileName: string | undefined;
  scheduledAt: Date | undefined;
  handleStartBlast: (
    newJobId: string,
    selectedSenderAccountIds: string[],
    messageBlocks: WABlastMessageBlock[],
    delayConfig: {
      minDelayMs: number;
      maxDelayMs: number;
      delayAfterNRecipients: number;
      delayAfterNRecipientsMs: number;
      enableWhatsappWarmer: boolean;
      whatsappWarmerMinMessages: number;
      whatsappWarmerMaxMessages: number;
      whatsappWarmerDelayMs: number;
      whatsappWarmerLanguage: "en" | "id";
      warmerJobId: string;
      scheduledAt: string | undefined;
    },
    uploadedFileName: string | undefined,
    scheduledAt: Date | undefined
  ) => void;
  handlePauseResumeStop: (
    action: "pause" | "resume" | "stop",
    currentSelectedWABlastJobId: string | null
  ) => void;
}

const WABlastJobControls: React.FC<WABlastJobControlsProps> = ({
  currentJob,
  currentSelectedWABlastJobId,
  newJobId,
  selectedSenderAccountIds,
  messageBlocks,
  minDelay,
  maxDelay,
  delayAfterNRecipients,
  delayAfterNRecipientsSeconds,
  uploadedFileName,
  scheduledAt,
  handleStartBlast,
  handlePauseResumeStop,
}) => {
  const {
    isSocketConnected,
    uploadedExcelData,
    selectedPhoneNumberColumn,
    enableWhatsappWarmer,
    whatsappWarmerMinMessages,
    whatsappWarmerMaxMessages,
    whatsappWarmerDelayMs,
    whatsappWarmerLanguage,
    warmerJobId,
  } = useWhatsAppStore();

  return (
    <>
      <div className="flex gap-2 w-full">
        {currentJob &&
        (currentJob.status === "IN_PROGRESS" ||
          currentJob.status === "PAUSED") ? (
          currentJob.status === "IN_PROGRESS" ? (
            <Button
              variant="secondary"
              onClick={() =>
                handlePauseResumeStop("pause", currentSelectedWABlastJobId)
              }
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={!isSocketConnected || !currentSelectedWABlastJobId}
            >
              <Pause className="mr-2 h-4 w-4" /> Jeda Blast (
              {currentJob.currentRecipients}/{currentJob.totalRecipients})
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() =>
                handlePauseResumeStop("resume", currentSelectedWABlastJobId)
              }
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={!isSocketConnected || !currentSelectedWABlastJobId}
            >
              <Play className="mr-2 h-4 w-4" /> Lanjutkan Blast (
              {currentJob.currentRecipients}/{currentJob.totalRecipients})
            </Button>
          )
        ) : (
          <Button
            onClick={() =>
              handleStartBlast(
                newJobId,
                selectedSenderAccountIds,
                messageBlocks,
                {
                  minDelayMs: minDelay,
                  maxDelayMs: maxDelay,
                  delayAfterNRecipients: delayAfterNRecipients,
                  delayAfterNRecipientsMs: delayAfterNRecipientsSeconds,
                  enableWhatsappWarmer: enableWhatsappWarmer,
                  whatsappWarmerMinMessages: whatsappWarmerMinMessages,
                  whatsappWarmerMaxMessages: whatsappWarmerMaxMessages,
                  whatsappWarmerDelayMs: whatsappWarmerDelayMs,
                  whatsappWarmerLanguage: whatsappWarmerLanguage,
                  warmerJobId: warmerJobId,
                  scheduledAt: scheduledAt
                    ? scheduledAt.toISOString()
                    : undefined,
                },
                uploadedFileName,
                scheduledAt
              )
            }
            className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            disabled={
              !isSocketConnected ||
              selectedSenderAccountIds.length === 0 ||
              (enableWhatsappWarmer && selectedSenderAccountIds.length < 2) ||
              !uploadedExcelData ||
              !selectedPhoneNumberColumn ||
              messageBlocks.length === 0 ||
              messageBlocks.some((block) => {
                if (block.type === "text") {
                  if (block.randomize) {
                    const selectedRandomMessages = (
                      block.randomMessageOptions || []
                    ).filter(
                      (opt) => opt.selected && opt.content.trim() !== ""
                    );
                    return selectedRandomMessages.length === 0;
                  } else {
                    return !block.textMessage?.trim();
                  }
                }
                return !block.mediaData;
              })
            }
          >
            <MessageCircleMore className="mr-2 h-4 w-4" /> Mulai WA Blast
          </Button>
        )}

        {currentJob &&
          (currentJob.status === "IN_PROGRESS" ||
            currentJob.status === "PAUSED" ||
            currentJob.status === "FAILED") && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() =>
                    handlePauseResumeStop("stop", currentSelectedWABlastJobId)
                  }
                  variant="destructive"
                  className="w-auto"
                  disabled={!isSocketConnected || !currentSelectedWABlastJobId}
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hentikan dan Hapus Blast</p>
              </TooltipContent>
            </Tooltip>
          )}
      </div>

      {currentJob && (
        <Alert variant="default">
          <Terminal />
          <AlertTitle>Status Pekerjaan</AlertTitle>
          <AlertDescription>{currentJob.message}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default WABlastJobControls;
