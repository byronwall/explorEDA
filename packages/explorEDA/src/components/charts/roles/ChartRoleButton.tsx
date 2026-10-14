import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { CHART_ROLES, type ChartRole } from "./chartRoles";
import { RoleFieldPicker } from "./RoleFieldPicker";
import { useRoleEdit } from "./useRoleEdit";

const RoleScopeContext = createContext<{
  settings: ChartSettings;
  role: ChartRole;
} | null>(null);

/**
 * Holds one role's field picker. A preview can redraw what contains the
 * role's button, such as a legend that appears with its first color field,
 * so the picker lives here, above the redraw, and stays open while the
 * button underneath it is replaced.
 */
export function ChartRoleScope({
  settings,
  role,
  children,
}: {
  settings: ChartSettings;
  role: ChartRole;
  children: ReactNode;
}) {
  const spec = CHART_ROLES[role];
  const { preview, choose, cancel } = useRoleEdit(settings.id);
  const markerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const button = () =>
    markerRef.current?.parentElement?.querySelector<HTMLElement>(
      `.eda-role-button[data-role="${role}"]`
    );
  // Inside chart details the popover mounts in the dialog, whose focus trap
  // would otherwise keep the search field from taking focus.
  const container = open
    ? button()?.closest<HTMLElement>("[role='dialog']")
    : undefined;

  return (
    // Modal, so the press that dismisses it never reaches the chart and
    // filters it.
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Escape or a press outside abandons any preview.
        if (!next) cancel();
        setOpen(next);
      }}
      modal
    >
      <span ref={markerRef} hidden />
      <RoleScopeContext.Provider value={{ settings, role }}>
        {children}
      </RoleScopeContext.Provider>
      <PopoverContent
        container={container}
        align="start"
        className="eda-role-popover w-[min(20rem,calc(100vw-1.5rem))] p-0"
        aria-label={`${spec.label} field`}
        onCloseAutoFocus={(event) => {
          // The button may be a new one by now; focus whichever shows the
          // role.
          event.preventDefault();
          requestAnimationFrame(() => button()?.focus({ preventScroll: true }));
        }}
      >
        <RoleFieldPicker
          settings={settings}
          role={role}
          onPreview={(field) => preview(role, field)}
          onChoose={(field) => {
            setOpen(false);
            choose(role, field);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * A chart role's field shown on the chart, such as the color legend's title.
 * Activating it opens the picker of the surrounding `ChartRoleScope`.
 * Alt-click or Alt-Enter runs `onAltActivate`, such as tracing the scale.
 */
export function ChartRoleButton({
  onAltActivate,
}: {
  onAltActivate?: () => void;
}) {
  const scope = useContext(RoleScopeContext)!;
  const spec = CHART_ROLES[scope.role];
  const field = spec.field(scope.settings);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const label = field ? getFieldLabel(field) : "None";

  return (
    <ActionTooltip
      content={`Change the field that sets ${spec.label.toLowerCase()} for this chart`}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="eda-role-button"
          data-role={scope.role}
          data-empty={field ? undefined : ""}
          aria-label={`${spec.label}: ${label}. Change field`}
          aria-description={
            onAltActivate
              ? "Alt-click or Alt-Enter to trace the color scale"
              : undefined
          }
          onClick={(event) => {
            if (!event.altKey || !onAltActivate) return;
            event.preventDefault();
            onAltActivate();
          }}
          onKeyDown={(event) => {
            if (!event.altKey || event.key !== "Enter" || !onAltActivate)
              return;
            event.preventDefault();
            onAltActivate();
          }}
        >
          {!field && <span className="eda-role-name">{spec.label}:</span>}{" "}
          <span className="eda-role-field">{label}</span>
          <ChevronDown aria-hidden="true" />
        </button>
      </PopoverTrigger>
    </ActionTooltip>
  );
}
