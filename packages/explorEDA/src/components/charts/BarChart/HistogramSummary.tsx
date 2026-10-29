import type { SpecRegion } from "@/types/FilterTypes";
import type { HistogramPlan } from "./histogramPlan";

const LABELS: Record<SpecRegion, string> = {
  below: "Below",
  within: "Within",
  above: "Above",
  outside: "Outside",
};

/**
 * Exact counts by specification status, each a button that selects its
 * rows. Alt-click or Alt-Enter traces them instead. A one-sided limit shows
 * only the statuses it can produce.
 */
export function HistogramSummary({
  plan,
  selected,
  left,
  right,
  bottom,
  compact = false,
  onSelect,
  onInspect,
}: {
  /** Narrow charts drop the shares; each button's name still has them. */
  compact?: boolean;
  plan: HistogramPlan;
  selected?: SpecRegion;
  left: number;
  right: number;
  bottom: number;
  onSelect: (region: SpecRegion) => void;
  onInspect: (region: SpecRegion) => void;
}) {
  const spec = plan.spec;
  if (!spec) return null;
  const { lower, upper } = spec.limits;
  const regions: SpecRegion[] = [
    ...(lower !== undefined ? (["below"] as const) : []),
    "within",
    ...(upper !== undefined ? (["above"] as const) : []),
    ...(lower !== undefined && upper !== undefined
      ? (["outside"] as const)
      : []),
  ];
  const count = (region: SpecRegion) =>
    region === "outside"
      ? spec.below.length + spec.above.length
      : spec[region].length;
  const share = (value: number) =>
    plan.n ? `${Math.round((value / plan.n) * 1000) / 10}%` : "no share";
  return (
    <div
      className="eda-spec-summary absolute flex items-center gap-1 overflow-hidden whitespace-nowrap text-xs"
      style={{ left, right, bottom }}
      role="group"
      aria-label="Specification status"
    >
      {regions.map((region) => {
        const value = count(region);
        const pressed = selected === region;
        return (
          <button
            key={region}
            type="button"
            aria-pressed={pressed}
            aria-label={`${LABELS[region]} spec: ${value} of ${plan.n}, ${share(value)}`}
            className={`h-5 shrink-0 rounded border px-1.5 tabular-nums ${
              pressed
                ? "border-foreground bg-muted text-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            onClick={(event) =>
              event.altKey ? onInspect(region) : onSelect(region)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.altKey) {
                event.preventDefault();
                onInspect(region);
              }
            }}
          >
            {LABELS[region]} <b className="font-semibold">{value}</b>
            {!compact && (
              <span className="eda-spec-share"> {share(value)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
