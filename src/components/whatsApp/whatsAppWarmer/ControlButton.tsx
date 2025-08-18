import { Button } from "@/components/ui/button";
import { MessageCircleMore, Pause, Play, StopCircle } from "lucide-react";

export const ControlButtons: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warmerJobStatus: any;
  handleStartWarmer: () => void;
  handlePauseWarmer: () => void;
  handleResumeWarmer: () => void;
  handleStopWarmer: () => void;
  isSocketConnected: boolean;
  isStartDisabled: boolean;
  isControlDisabled: boolean;
}> = ({
  warmerJobStatus,
  handleStartWarmer,
  handlePauseWarmer,
  handleResumeWarmer,
  handleStopWarmer,
  isStartDisabled,
  isControlDisabled,
}) => (
  <div className="flex gap-2 w-full">
    {warmerJobStatus?.status === "RUNNING" ? (
      <Button
        variant="secondary"
        onClick={handlePauseWarmer}
        className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        disabled={isControlDisabled}
      >
        <Pause className="mr-2 h-4 w-4" /> Jeda Warmer (
        {warmerJobStatus.currentMessages}/{warmerJobStatus.totalMessages})
      </Button>
    ) : warmerJobStatus?.status === "PAUSED" ? (
      <Button
        variant="default"
        onClick={handleResumeWarmer}
        className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        disabled={isControlDisabled}
      >
        <Play className="mr-2 h-4 w-4" /> Lanjutkan Warmer (
        {warmerJobStatus.currentMessages}/{warmerJobStatus.totalMessages})
      </Button>
    ) : (
      <Button
        onClick={handleStartWarmer}
        className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        disabled={isStartDisabled}
      >
        <MessageCircleMore className="mr-2 h-4 w-4" /> Mulai WhatsApp Warmer
      </Button>
    )}
    {(warmerJobStatus?.status === "RUNNING" ||
      warmerJobStatus?.status === "PAUSED" ||
      warmerJobStatus?.status === "ERROR") && (
      <Button
        onClick={handleStopWarmer}
        variant="destructive"
        className="w-auto"
        disabled={isControlDisabled}
      >
        <StopCircle className="h-4 w-4" />
      </Button>
    )}
  </div>
);
