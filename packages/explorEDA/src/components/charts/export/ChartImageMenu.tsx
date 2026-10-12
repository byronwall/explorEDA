import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionTooltip } from "@/components/ui/tooltip";
import { ClipboardCopy, Download, ImageDown } from "lucide-react";
import { createPortal } from "react-dom";
import {
  useChartImageActions,
  type ChartImageActions,
} from "./chartImageContext";

/** Copy image and Download image, for any of a chart's dropdown menus. */
export function ChartImageMenuItems({
  copy,
  download,
  reason,
}: ChartImageActions) {
  return (
    <>
      <DropdownMenuItem disabled={!!reason} onSelect={copy}>
        <ClipboardCopy aria-hidden="true" />
        <span className="flex-1">Copy image</span>
        <kbd className="ml-auto text-xs text-muted-foreground">E</kbd>
      </DropdownMenuItem>
      <DropdownMenuItem disabled={!!reason} onSelect={download}>
        <Download aria-hidden="true" />
        <span className="flex-1">Download image</span>
        <kbd className="ml-auto text-xs text-muted-foreground">⇧E</kbd>
      </DropdownMenuItem>
      {reason && (
        <p className="px-2 py-1.5 text-xs text-muted-foreground">{reason}</p>
      )}
    </>
  );
}

/**
 * The image items at the end of another chart menu, such as an axis, title,
 * or table cell menu. It reads the chart from where the menu is drawn, so
 * menus built by hooks above the chart's provider still find it.
 */
export function ChartImageMenuSection() {
  const actions = useChartImageActions();
  if (!actions) {
    return null;
  }
  return (
    <>
      <DropdownMenuSeparator />
      <ChartImageMenuItems {...actions} />
    </>
  );
}

/** The header's image menu: copy or download the chart as drawn. */
export function ChartImageMenu({
  chartTitle,
  ...actions
}: ChartImageActions & { chartTitle: string }) {
  return (
    <DropdownMenu modal={false}>
      <ActionTooltip content="Export image: copy or download this chart as a PNG, as shown (E, Shift+E)">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Export image of ${chartTitle}`}
          >
            <ImageDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
      </ActionTooltip>
      <DropdownMenuContent
        align="end"
        collisionPadding={12}
        aria-label={`Image of ${chartTitle}`}
        className="w-56"
      >
        <ChartImageMenuItems {...actions} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The menu a right-click on a chart opens where nothing more specific
 * answers it, such as the plot area or the legend.
 */
export function ChartImageContextMenu({
  chartTitle,
  at,
  onClose,
  ...actions
}: ChartImageActions & {
  chartTitle: string;
  at: { x: number; y: number };
  onClose: () => void;
}) {
  return createPortal(
    <DropdownMenu
      open
      modal={false}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden="true"
          className="pointer-events-none fixed h-0 w-0"
          style={{ left: at.x, top: at.y }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        collisionPadding={12}
        aria-label={`Actions for ${chartTitle}`}
        className="w-56"
      >
        <ChartImageMenuItems {...actions} />
      </DropdownMenuContent>
    </DropdownMenu>,
    document.body
  );
}
