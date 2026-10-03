import { useMemo, useRef, type KeyboardEvent, type PointerEvent } from "react";
import {
  isDivergingScale,
  makeNumericalColor,
  scaleMidpoint,
} from "@/lib/colorScaleMath";
import type { NumericalColorScale } from "@/types/ColorScaleTypes";
import { useSimulate } from "./vision";

type Handle = "min" | "midpoint" | "max";

const BIN_COUNT = 48;

/** Binned counts of a field's finite values. */
export function useValueBins(values: readonly number[]) {
  return useMemo(() => {
    if (values.length === 0) {
      return undefined;
    }
    let low = Infinity;
    let high = -Infinity;
    for (const value of values) {
      if (value < low) {
        low = value;
      }
      if (value > high) {
        high = value;
      }
    }
    const width = (high - low) / BIN_COUNT || 1;
    const counts = new Array<number>(BIN_COUNT).fill(0);
    for (const value of values) {
      const index = Math.min(BIN_COUNT - 1, Math.floor((value - low) / width));
      counts[index] = (counts[index] ?? 0) + 1;
    }
    return { low, high, counts, peak: Math.max(...counts) };
  }, [values]);
}

/**
 * The field's distribution drawn in the scale's own colors, with handles that
 * set where the ramp starts, centers, and ends.
 */
export function DomainEditor({
  scale,
  previewScale,
  values,
  formatValue,
  onChange,
}: {
  scale: NumericalColorScale;
  /** The scale as drawn, which may preview a palette under the pointer. */
  previewScale: NumericalColorScale;
  values: readonly number[];
  formatValue: (value: number) => string;
  onChange: (updates: Partial<NumericalColorScale>) => void;
}) {
  const simulate = useSimulate();
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const bins = useValueBins(values);
  const color = useMemo(() => makeNumericalColor(previewScale), [previewScale]);
  const diverging = isDivergingScale(previewScale);
  const midpoint = scaleMidpoint(scale);

  // The axis spans the data and the scale's bounds, whichever reach further.
  const low = Math.min(bins?.low ?? scale.min, scale.min);
  const high = Math.max(bins?.high ?? scale.max, scale.max);
  const span = high - low || 1;
  const position = (value: number) => ((value - low) / span) * 100;
  const valueAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) {
      return low;
    }
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return low + ratio * span;
  };

  const constrain = (handle: Handle, raw: number) => {
    const gap = span / 1000;
    const value = Number(raw.toPrecision(6));
    if (handle === "min") {
      return Math.min(value, (diverging ? midpoint : scale.max) - gap);
    }
    if (handle === "max") {
      return Math.max(value, (diverging ? midpoint : scale.min) + gap);
    }
    return Math.min(Math.max(value, scale.min + gap), scale.max - gap);
  };

  const set = (handle: Handle, value: number) =>
    onChange({ [handle]: constrain(handle, value) });

  const startDrag = (handle: Handle) => (event: PointerEvent<HTMLElement>) => {
    event.preventDefault();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    target.focus();
    const move = (moveEvent: globalThis.PointerEvent) => {
      cancelAnimationFrame(frame.current);
      const value = valueAt(moveEvent.clientX);
      frame.current = requestAnimationFrame(() => set(handle, value));
    };
    const end = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", end);
      target.removeEventListener("pointercancel", end);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", end);
    target.addEventListener("pointercancel", end);
  };

  const nudge =
    (handle: Handle, current: number) =>
    (event: KeyboardEvent<HTMLElement>) => {
      const step = (span / 100) * (event.shiftKey ? 10 : 1);
      const moves: Record<string, number> = {
        ArrowRight: step,
        ArrowUp: step,
        ArrowLeft: -step,
        ArrowDown: -step,
      };
      if (event.key in moves) {
        event.preventDefault();
        set(handle, current + moves[event.key]!);
      } else if (event.key === "Home") {
        event.preventDefault();
        set(handle, bins?.low ?? low);
      } else if (event.key === "End") {
        event.preventDefault();
        set(handle, bins?.high ?? high);
      }
    };

  const handles: { id: Handle; value: number; label: string }[] = [
    { id: "min", value: scale.min, label: "Ramp start" },
    ...(diverging
      ? [{ id: "midpoint" as const, value: midpoint, label: "Ramp midpoint" }]
      : []),
    { id: "max", value: scale.max, label: "Ramp end" },
  ];

  const trackStops = Array.from({ length: 24 }, (_, index) =>
    simulate(color(low + (span * index) / 23))
  );

  return (
    <div className="eda-domain-editor">
      <div className="eda-domain-plot" aria-hidden="true">
        {bins ? (
          <svg viewBox={`0 0 ${BIN_COUNT} 100`} preserveAspectRatio="none">
            {bins.counts.map((count, index) => {
              const binLow =
                bins.low + ((bins.high - bins.low) * index) / BIN_COUNT;
              const binHigh =
                bins.low + ((bins.high - bins.low) * (index + 1)) / BIN_COUNT;
              const x = (position(binLow) / 100) * BIN_COUNT;
              const width = Math.max(
                0.2,
                ((position(binHigh) - position(binLow)) / 100) * BIN_COUNT -
                  0.18
              );
              const height = count ? Math.max(2, (count / bins.peak) * 96) : 0;
              return (
                <rect
                  key={index}
                  x={x}
                  y={100 - height}
                  width={width}
                  height={height}
                  fill={simulate(color((binLow + binHigh) / 2))}
                />
              );
            })}
          </svg>
        ) : (
          <div className="eda-domain-empty">No numeric values to show</div>
        )}
        <span
          className="eda-domain-shade"
          style={{ left: 0, width: `${position(scale.min)}%` }}
        />
        <span
          className="eda-domain-shade"
          style={{ left: `${position(scale.max)}%`, right: 0 }}
        />
      </div>
      <div
        ref={trackRef}
        className="eda-domain-track"
        style={{
          background: `linear-gradient(to right, ${trackStops.join(", ")})`,
        }}
      >
        {handles.map((handle) => (
          <span
            key={handle.id}
            role="slider"
            tabIndex={0}
            aria-label={handle.label}
            aria-valuemin={low}
            aria-valuemax={high}
            aria-valuenow={handle.value}
            aria-valuetext={formatValue(handle.value)}
            data-handle={handle.id}
            className="eda-domain-handle"
            style={{ left: `${position(handle.value)}%` }}
            onPointerDown={startDrag(handle.id)}
            onKeyDown={nudge(handle.id, handle.value)}
          />
        ))}
      </div>
      <div className="eda-domain-axis" aria-hidden="true">
        <span>{formatValue(low)}</span>
        <span>{formatValue(high)}</span>
      </div>
    </div>
  );
}
