"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWhatsAppStore } from "@/stores/whatsapp";

export const DelayConfiguration = ({
  isCheckingNumbers,
}: {
  isCheckingNumbers: boolean;
}) => {
  const {
    minDelay,
    setMinDelay,
    maxDelay,
    setMaxDelay,
    delayAfterNNumbers,
    setDelayAfterNNumbers,
  } = useWhatsAppStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted">
      <div className="space-y-2">
        <Label htmlFor="min-delay" className="text-foreground">
          Jeda Minimal (detik)
        </Label>
        <Input
          id="min-delay"
          type="number"
          value={minDelay}
          onChange={(e) => setMinDelay(Number(e.target.value))}
          min={0}
          disabled={isCheckingNumbers}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="max-delay" className="text-foreground">
          Jeda Maksimal (detik)
        </Label>
        <Input
          id="max-delay"
          type="number"
          value={maxDelay}
          onChange={(e) => setMaxDelay(Number(e.target.value))}
          min={0}
          disabled={isCheckingNumbers}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="delay-after-n" className="text-foreground">
          Jeda Setelah N Nomor
        </Label>
        <Input
          id="delay-after-n"
          type="number"
          value={delayAfterNNumbers}
          onChange={(e) => setDelayAfterNNumbers(Number(e.target.value))}
          min={1}
          disabled={isCheckingNumbers}
          className="w-full"
        />
      </div>
      <p className="md:col-span-3 text-sm text-muted-foreground">
        Proses akan menjeda secara acak antara {minDelay}-{maxDelay} detik
        setelah memeriksa setiap {delayAfterNNumbers} nomor.
      </p>
    </div>
  );
};
