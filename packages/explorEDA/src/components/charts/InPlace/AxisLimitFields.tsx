import { useEffect, useId, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AxisLimits } from "@/types/ChartTypes";

type Side = "min" | "max";

const text = (value?: number) => (value === undefined ? "" : String(value));

/** A typed bound: blank follows the data, a number sets it, anything else waits. */
function parse(draft: string): { ok: boolean; value?: number } {
  const trimmed = draft.trim();
  if (!trimmed) return { ok: true };
  const value = Number(trimmed);
  return Number.isFinite(value) ? { ok: true, value } : { ok: false };
}

interface AxisLimitFieldsProps {
  /** Names the axis in labels, such as "X" or "Revenue". */
  axisName: string;
  limits?: AxisLimits;
  /** Shown in empty fields: the values the axis draws without a limit. */
  placeholders?: [string, string];
  /** Receives only limits that can apply: numbers, with the minimum below the maximum. */
  onChange: (limits: AxisLimits | undefined) => void;
  /** Focus the minimum when the fields mount, as an anchored editor does. */
  autoFocus?: boolean;
  /** Called on Enter, so an anchored editor can close. */
  onSubmit?: () => void;
}

/**
 * Exact minimum and maximum inputs for one axis. Valid values apply as the
 * user types. A draft that is not a number, or a minimum at or above the
 * maximum, is marked and held until it is fixed; the chart keeps its last
 * valid range meanwhile.
 */
export function AxisLimitFields({
  axisName,
  limits,
  placeholders = ["Auto", "Auto"],
  onChange,
  autoFocus,
  onSubmit,
}: AxisLimitFieldsProps) {
  const [drafts, setDrafts] = useState({
    min: text(limits?.min),
    max: text(limits?.max),
  });
  const editing = useRef<Side | null>(null);
  const errorId = useId();

  // Undo, a drag, or another editor can change the limits. Follow them,
  // except in the field the user is typing in.
  useEffect(() => {
    setDrafts((current) => ({
      min: editing.current === "min" ? current.min : text(limits?.min),
      max: editing.current === "max" ? current.max : text(limits?.max),
    }));
  }, [limits?.min, limits?.max]);

  const parsed = { min: parse(drafts.min), max: parse(drafts.max) };
  const inverted =
    parsed.min.value !== undefined &&
    parsed.max.value !== undefined &&
    parsed.min.value >= parsed.max.value;
  const error = !parsed.min.ok
    ? "The minimum must be a number."
    : !parsed.max.ok
      ? "The maximum must be a number."
      : inverted
        ? "The minimum must be below the maximum."
        : undefined;

  const update = (side: Side, draft: string) => {
    const next = { ...drafts, [side]: draft };
    setDrafts(next);
    const min = parse(next.min);
    const max = parse(next.max);
    if (!min.ok || !max.ok) return;
    if (
      min.value !== undefined &&
      max.value !== undefined &&
      min.value >= max.value
    )
      return;
    onChange(
      min.value === undefined && max.value === undefined
        ? undefined
        : {
            ...(min.value !== undefined && { min: min.value }),
            ...(max.value !== undefined && { max: max.value }),
          }
    );
  };

  const field = (side: Side, index: number) => (
    <Input
      aria-label={`${axisName} ${side === "min" ? "minimum" : "maximum"}`}
      aria-invalid={
        !parsed[side].ok || (inverted && Boolean(drafts[side])) || undefined
      }
      aria-describedby={error ? errorId : undefined}
      className="h-7 min-w-0 flex-1 px-2 text-xs tabular-nums"
      inputMode="decimal"
      autoComplete="off"
      autoFocus={autoFocus && side === "min"}
      value={drafts[side]}
      placeholder={placeholders[index]}
      onFocus={(event) => {
        editing.current = side;
        event.currentTarget.select();
      }}
      onBlur={() => {
        editing.current = null;
        // A held draft returns to the range the chart shows.
        if (error)
          setDrafts({ min: text(limits?.min), max: text(limits?.max) });
      }}
      onChange={(event) => update(side, event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !error) {
          event.preventDefault();
          onSubmit?.();
        }
      }}
    />
  );

  const set = limits?.min !== undefined || limits?.max !== undefined;
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-1.5">
        {field("min", 0)}
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          to
        </span>
        {field("max", 1)}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          aria-label={`Reset the ${axisName} range`}
          tooltip="Follow the data again: clear both limits"
          disabled={!set && !drafts.min && !drafts.max}
          onClick={() => {
            setDrafts({ min: "", max: "" });
            onChange(undefined);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
