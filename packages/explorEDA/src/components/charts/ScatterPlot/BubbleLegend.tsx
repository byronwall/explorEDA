import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { ScatterPlan } from "./scatterPlan";

export function BubbleLegend({
  size,
  points,
  exclusions,
  onInspect,
  onInspectExcluded,
}: {
  size: NonNullable<ScatterPlan["size"]>;
  points: number;
  exclusions: ScatterPlan["exclusions"];
  onInspect: () => void;
  onInspectExcluded: (id: number) => void;
}) {
  return (
    <div
      className="absolute inset-x-2 bottom-0 flex items-end gap-3 overflow-x-auto text-xs"
      style={{ height: size.legendHeight }}
      aria-label="Bubble size legend"
    >
      <div className="max-w-28 shrink-0 pb-1">
        <ActionTooltip content={`Bubble area: ${size.label}`}>
          <div className="truncate font-medium">Area: {size.label}</div>
        </ActionTooltip>
        <div className="text-muted-foreground">Zero is hollow</div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-0 text-xs"
          disabled={!points}
          onClick={onInspect}
        >
          Inspect bubble
        </Button>
      </div>
      {size.samples.map((sample) => (
        <div key={sample.value} className="shrink-0 text-center tabular-nums">
          <svg
            width={Math.max(42, size.radius * 2 + 6)}
            height={size.radius * 2 + 4}
            aria-hidden="true"
            className="mx-auto"
          >
            <circle
              cx={Math.max(42, size.radius * 2 + 6) / 2}
              cy={size.radius * 2 + 2 - sample.radius}
              r={sample.radius}
              fill={sample.value === 0 ? "none" : "var(--muted-foreground)"}
              fillOpacity={0.25}
              stroke="var(--muted-foreground)"
            />
          </svg>
          <span>{sample.label}</span>
        </div>
      ))}
      {exclusions.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-1 h-7 shrink-0 text-xs"
          onClick={() => onInspectExcluded(exclusions[0]!.sourceId)}
          tooltip="Inspect a row with a missing, invalid, or negative size. Use the source row finder to inspect another row."
        >
          {exclusions.length} excluded sizes
        </Button>
      )}
    </div>
  );
}
