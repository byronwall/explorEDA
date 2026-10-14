import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Palette, ScanSearch } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { getChartTitle } from "../chartAccessibility";
import { ChartImageMenuSection } from "../export/ChartImageMenu";
import { hasRoleLabels } from "./chartRoles";
import { RolePickerPopover } from "./RolePickerPopover";

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

  if (picking) {
    return (
      <RolePickerPopover
        settings={settings}
        role="color"
        at={target}
        onClose={close}
      />
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
