import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, Hash } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatBadgeProps {
  fieldLabel: string;
  type: "min" | "max" | "common";
  value: string | number;
  count?: number;
  icon?: LucideIcon;
}

const defaultIcons: Record<StatBadgeProps["type"], LucideIcon> = {
  min: ArrowDown,
  max: ArrowUp,
  common: Hash,
};

export function StatBadge({
  type,
  fieldLabel,
  value,
  count,
  icon: IconProp,
}: StatBadgeProps) {
  const Icon = IconProp || defaultIcons[type];
  const tooltipContent =
    count !== undefined
      ? `Most common value · ${count.toLocaleString()} rows`
      : type === "min"
        ? "Minimum value"
        : "Maximum value";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className="max-w-full gap-1 whitespace-normal"
          >
            <Icon className="h-3 w-3" />
            <span className="min-w-0 max-w-full break-words text-left">
              {value}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {fieldLabel} · {tooltipContent}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
