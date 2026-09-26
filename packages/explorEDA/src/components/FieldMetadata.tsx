import type { datum } from "@/types/ChartTypes";
import { buildFieldProfile, type FieldProfile } from "@/lib/fieldProfiles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CalendarDays, Hash, ToggleLeft, Type } from "lucide-react";

const typeLabels: Record<FieldProfile["dataType"], string> = {
  numeric: "Number",
  categorical: "Text",
  datetime: "Date",
  boolean: "Boolean",
};
const typeIcons = {
  numeric: Hash,
  categorical: Type,
  datetime: CalendarDays,
  boolean: ToggleLeft,
};

const valueLabel = (value: unknown) => {
  if (value == null || value === "") return "—";
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(
      value
    );
  }
  return String(value);
};

export function resolveFieldProfile(
  name: string,
  profiles: FieldProfile[],
  getColumnData: (field: string) => Record<number, datum>
) {
  const profile = profiles.find((item) => item.name === name);
  if (profile) return profile;

  const columnData = getColumnData(name);
  return Object.keys(columnData).length
    ? buildFieldProfile(name, columnData)
    : undefined;
}

function dateRange(profile: FieldProfile) {
  if (profile.dataType !== "datetime") return undefined;

  let first: datum | undefined;
  let last: datum | undefined;
  let firstTime = Infinity;
  let lastTime = -Infinity;
  for (const { value } of profile.categories?.distribution ?? []) {
    const time = Date.parse(String(value));
    if (!Number.isFinite(time)) continue;
    if (time < firstTime) {
      first = value;
      firstTime = time;
    }
    if (time > lastTime) {
      last = value;
      lastTime = time;
    }
  }
  if (first == null || last == null) return undefined;

  const start = String(first);
  const end = String(last);
  return start === end ? start : `${start}–${end}`;
}

export function fieldMetadata(profile: FieldProfile) {
  const range = profile.statistics
    ? `${valueLabel(profile.statistics.min)}–${valueLabel(profile.statistics.max)}`
    : dateRange(profile);
  const sample = profile.categories?.topValues[0]
    ? valueLabel(profile.categories.topValues[0].value)
    : undefined;
  return {
    type: typeLabels[profile.dataType],
    detail: range ?? (sample ? `e.g. ${sample}` : "No sample"),
    detailLabel: range ? "Range" : "Sample",
    nulls: `${profile.nullCount.toLocaleString()} null${profile.nullCount === 1 ? "" : "s"}`,
    excluded: profile.excludedCount
      ? `${profile.excludedCount.toLocaleString()} not finite`
      : undefined,
  };
}

export function FieldMetadata({
  profile,
  label,
  compact = false,
  showDetail = true,
  className,
  tooltipSide = "bottom",
}: {
  profile?: FieldProfile;
  label?: string;
  compact?: boolean;
  showDetail?: boolean;
  className?: string;
  tooltipSide?: "bottom" | "left" | "top";
}) {
  if (!profile) return <span className={className}>{label}</span>;
  const metadata = fieldMetadata(profile);
  const description = [
    metadata.type,
    metadata.detail,
    metadata.nulls,
    metadata.excluded,
  ]
    .filter(Boolean)
    .join("; ");
  const TypeIcon = typeIcons[profile.dataType];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              compact
                ? "inline-flex min-w-0 items-center gap-1"
                : "inline-flex min-w-0 items-baseline gap-1.5",
              className
            )}
            aria-label={`${label ?? profile.name}: ${description}`}
          >
            {compact && (
              <TypeIcon
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            {label && <span className="truncate font-medium">{label}</span>}
            {!compact && (
              <span className="flex min-w-0 gap-1.5 text-[10px] text-muted-foreground">
                <span className="shrink-0">{metadata.type}</span>
                {showDetail && (
                  <span className="truncate">{metadata.detail}</span>
                )}
                <span className="shrink-0">{metadata.nulls}</span>
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} align="start" collisionPadding={12}>
          <p className="mb-2 font-semibold">{label ?? profile.name}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{metadata.type}</dd>
            <dt className="text-muted-foreground">{metadata.detailLabel}</dt>
            <dd>{metadata.detail}</dd>
            <dt className="text-muted-foreground">Nulls</dt>
            <dd>{metadata.nulls}</dd>
            {metadata.excluded && (
              <>
                <dt className="text-muted-foreground">Excluded</dt>
                <dd>{metadata.excluded}</dd>
              </>
            )}
            <dt className="text-muted-foreground">Distinct</dt>
            <dd>{profile.uniqueCount.toLocaleString()}</dd>
          </dl>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
