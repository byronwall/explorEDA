import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Palette, ScanSearch } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { getChartTitle } from "../chartAccessibility";
import { ChartImageMenuSection } from "../export/ChartImageMenu";
import { CHART_ROLES, hasRoleLabels } from "./chartRoles";
import { RoleFieldPicker } from "./RoleFieldPicker";
import { useRoleEdit } from "./useRoleEdit";

/** Where a plot menu opens, and the mark under the pointer, if any. */
export interface PlotMenuTarget {
  x: number;
  y: number;
  /** Traces the record under the pointer. */
  trace?: () => void;
}

/**
 * The plot's right-click menu: chart actions such as Color by…, an action
 * for the record under the pointer, then the image items. Modal, so the
 * press that dismisses it never reaches the chart and filters it.
 */
export function ChartPlotMenu({
  settings,
  target,
  onClose,
}: {
  settings: ChartSettings;
  target: PlotMenuTarget;
  onClose: () => void;
}) {
  const [picking, setPicking] = useState(false);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const chartTitle = getChartTitle(settings, getFieldLabel);
  const { preview, choose, cancel } = useRoleEdit(settings.id);
  // Focus goes back where it was, usually the plot, when the menu or the
  // picker closes.
  const returnTo = useRef(document.activeElement as HTMLElement | null);
  const close = () => {
    onClose();
    requestAnimationFrame(() =>
      returnTo.current?.focus({ preventScroll: true })
    );
  };
  // A trace opens its own panel and takes focus; moving focus back to the
  // plot would dismiss it.
  const handOff = (action: () => void) => {
    returnTo.current = null;
    action();
    onClose();
  };
  const anchor = (
    <span
      aria-hidden="true"
      className="pointer-events-none fixed h-0 w-0"
      style={{ left: target.x, top: target.y }}
    />
  );
  const color = CHART_ROLES.color;

  if (picking) {
    return createPortal(
      <Popover
        open
        onOpenChange={(open) => {
          if (open) return;
          // Escape or a press outside abandons any preview.
          cancel();
          close();
        }}
        modal
      >
        <PopoverAnchor asChild>{anchor}</PopoverAnchor>
        <PopoverContent
          align="start"
          className="eda-role-popover w-[min(20rem,calc(100vw-1.5rem))] p-0"
          aria-label={`${color.label} field`}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <RoleFieldPicker
            settings={settings}
            role="color"
            onPreview={(field) => preview("color", field)}
            onChoose={(field) => {
              close();
              choose("color", field);
            }}
          />
        </PopoverContent>
      </Popover>,
      document.body
    );
  }

  return createPortal(
    <DropdownMenu open onOpenChange={(open) => !open && close()}>
      <DropdownMenuTrigger asChild>{anchor}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        collisionPadding={12}
        aria-label={`Actions for ${chartTitle}`}
        // The trigger is an empty anchor; name the menu by its label.
        aria-labelledby={undefined}
        className="w-56"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {hasRoleLabels(settings) && (
          <DropdownMenuItem
            onSelect={(event) => {
              // The picker replaces the menu at the same spot.
              event.preventDefault();
              setPicking(true);
            }}
          >
            <Palette aria-hidden="true" />
            Color by…
          </DropdownMenuItem>
        )}
        {target.trace && (
          <DropdownMenuItem onSelect={() => handOff(target.trace!)}>
            <ScanSearch aria-hidden="true" />
            Trace this point
          </DropdownMenuItem>
        )}
        <ChartImageMenuSection />
      </DropdownMenuContent>
    </DropdownMenu>,
    document.body
  );
}
