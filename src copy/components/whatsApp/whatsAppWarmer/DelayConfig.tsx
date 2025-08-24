import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const DelayConfig: React.FC<{
  minDelay: number;
  setMinDelay: (value: number) => void;
  maxDelay: number;
  setMaxDelay: (value: number) => void;
  delayAfterNMessages: number;
  setDelayAfterNMessages: (value: number) => void;
  delayAfterNMessagesSeconds: number;
  setDelayAfterNMessagesSeconds: (value: number) => void;
  estimatedTime: string;
  isWarmerRunning: boolean;
  isSocketConnected: boolean;
}> = ({
  minDelay,
  setMinDelay,
  maxDelay,
  setMaxDelay,
  delayAfterNMessages,
  setDelayAfterNMessages,
  delayAfterNMessagesSeconds,
  setDelayAfterNMessagesSeconds,
  estimatedTime,
  isWarmerRunning,
  isSocketConnected,
}) => (
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
      <Label htmlFor="delay-n-messages-seconds" className="text-foreground">
        Durasi Jeda (detik)
      </Label>
      <Input
        id="delay-n-messages-seconds"
        type="number"
        value={delayAfterNMessagesSeconds}
        onChange={(e) => setDelayAfterNMessagesSeconds(Number(e.target.value))}
        min={0}
        disabled={isWarmerRunning || !isSocketConnected}
        className="w-full"
      />
    </div>
    <p className="md:col-span-2 text-sm text-muted-foreground">
      Proses akan menjeda secara acak antara {minDelay}-{maxDelay} detik setelah
      setiap pesan. Tambahan jeda {delayAfterNMessagesSeconds} detik akan
      diterapkan setiap {delayAfterNMessages} pesan terkirim.
    </p>
    <p className="md:col-span-2 text-sm text-muted-foreground font-semibold">
      Perkiraan Total Waktu: {estimatedTime}
    </p>
  </div>
);
