import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WhatsAppClientStatusUpdate } from "@/types";

export const ClientSelection: React.FC<{
  availableClients: WhatsAppClientStatusUpdate[];
  selectedClientIds: string[];
  handleClientSelection: (accountId: string, checked: boolean) => void;
  isWarmerRunning: boolean;
  isSocketConnected: boolean;
}> = ({
  availableClients,
  selectedClientIds,
  handleClientSelection,
  isWarmerRunning,
  isSocketConnected,
}) => (
  <div className="space-y-2">
    <Label className="text-foreground">Pilih Akun yang Akan Dipanaskan</Label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
      {availableClients.length === 0 ? (
        <p className="text-muted-foreground col-span-full">
          Tidak ada klien aktif yang tersedia.
        </p>
      ) : (
        availableClients.map((client) => (
          <div key={client.accountId} className="flex items-center space-x-2">
            <Checkbox
              id={`warmer-client-${client.accountId}`}
              checked={selectedClientIds.includes(client.accountId)}
              onCheckedChange={(checked) =>
                handleClientSelection(client.accountId, checked as boolean)
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
);
