import { createPortal } from "react-dom";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { ChartSettings } from "@/types/ChartTypes";
import { CHART_ROLES, type ChartRole } from "./chartRoles";
import { RoleFieldPicker } from "./RoleFieldPicker";
import { useRoleEdit } from "./useRoleEdit";

/**
 * A role's field picker opened from a menu, at the spot the menu was. It
 * previews, applies, and cancels like the picker on a role's label.
 */
export function RolePickerPopover({
  settings,
  role,
  at,
  side = "bottom",
  container,
  onClose,
}: {
  settings: ChartSettings;
  role: ChartRole;
  at: { x: number; y: number };
  /** Which side of `at` the picker opens on. */
  side?: "top" | "bottom";
  /** Inside chart details, the dialog, so its focus trap lets search focus. */
  container?: HTMLElement | null;
  onClose: () => void;
}) {
  const { preview, choose, cancel } = useRoleEdit(settings.id);
  return createPortal(
    // Modal, so the press that dismisses it never reaches the chart and
    // filters it.
    <Popover
      open
      onOpenChange={(open) => {
        if (open) return;
        // Escape or a press outside abandons any preview.
        cancel();
        onClose();
      }}
      modal
    >
      <PopoverAnchor asChild>
        <span
          aria-hidden="true"
          className="pointer-events-none fixed h-0 w-0"
          style={{ left: at.x, top: at.y }}
        />
      </PopoverAnchor>
      <PopoverContent
        container={container}
        side={side}
        align="start"
        className="eda-role-popover w-[min(20rem,calc(100vw-1.5rem))] p-0"
        aria-label={`${CHART_ROLES[role].label} field`}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <RoleFieldPicker
          settings={settings}
          role={role}
          onPreview={(field) => preview(role, field)}
          onChoose={(field) => {
            onClose();
            choose(role, field);
          }}
        />
      </PopoverContent>
    </Popover>,
    document.body
  );
}
