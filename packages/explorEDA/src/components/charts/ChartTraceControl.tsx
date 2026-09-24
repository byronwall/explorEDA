import { useEffect, useState, type ReactNode } from "react";
import { Waypoints } from "lucide-react";
import { ActionTooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ChartTraceControlProps {
  selection: unknown;
  onClear: () => void;
  children: ReactNode;
  heading?: string;
  emptyText?: string;
  ariaLabel?: string;
}

export function ChartTraceControl({
  selection,
  onClear,
  children,
  heading = "Chart trace",
  emptyText = "Alt-click a chart object to trace it.",
  ariaLabel = "Chart trace inspector",
}: ChartTraceControlProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (selection) setOpen(true);
  }, [selection]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onClear();
      }}
    >
      <ActionTooltip content="Trace chart objects">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Trace chart objects">
            <Waypoints className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </ActionTooltip>
      <PopoverContent
        align={
          typeof window !== "undefined" && window.innerWidth < 700
            ? "start"
            : "end"
        }
        side={
          typeof window !== "undefined" && window.innerWidth < 700
            ? "bottom"
            : "left"
        }
        collisionPadding={12}
        className="w-[min(18rem,calc(100vw-1.5rem))] max-h-[min(70vh,var(--radix-popover-content-available-height))] overflow-y-auto"
        aria-label={ariaLabel}
      >
        <div className="space-y-3 text-xs">
          <div>
            <h3 className="text-sm font-semibold">{heading}</h3>
            {!selection && <p className="text-muted-foreground">{emptyText}</p>}
          </div>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}
