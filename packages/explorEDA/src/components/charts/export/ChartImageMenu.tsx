import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionTooltip } from "@/components/ui/tooltip";
import { ClipboardCopy, Download, ImageDown } from "lucide-react";

/** The header's image menu: copy or download the chart as drawn. */
export function ChartImageMenu({
  chartTitle,
  copy,
  download,
  reason,
}: {
  chartTitle: string;
  copy: () => void;
  download: () => void;
  reason?: string;
}) {
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
