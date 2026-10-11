import { Button } from "@/components/ui/button";
import { useWorkspaceLicense } from "./LicenseContext";
import type { LicenseState } from "./token";

const LABELS: Record<Exclude<LicenseState, "licensed">, string> = {
  unlicensed: "Unlicensed",
  invalid: "License key not valid",
  expired: "Trial ended",
  "updates-ended": "License needs renewal",
};

/**
 * A small notice at the end of the status bar while the workspace has no
 * valid license. It never blocks anything; it opens the License panel.
 */
export function LicenseNotice({ onOpen }: { onOpen: () => void }) {
  const status = useWorkspaceLicense();
  if (!status || status.state === "licensed") return null;
  return (
    <Button
      variant="ghost"
      className="eda-license-notice"
      data-state={status.state}
      tooltip={`${status.message} Click for details.`}
      onClick={onOpen}
    >
      {LABELS[status.state]}
    </Button>
  );
}
