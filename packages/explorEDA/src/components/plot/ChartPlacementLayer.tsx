import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getChartDefinition } from "@/charts/registry";
import type { ChartLayout, ChartSettings } from "@/types/ChartTypes";
import { Button } from "../ui/button";
import { findEmptyPlacement } from "../chartGridPlacement";
import { useChartDraft } from "./ChartDraftContext";
import { clampLayout, firstFreeSpot, overlapsAny } from "./chartPlacement";

interface ChartPlacementLayerProps {
  charts: ChartSettings[];
  columnCount: number;
  columnWidth: number;
  rowHeight: number;
  padding: number;
}

const MOVES: Record<string, { x: number; y: number }> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

/**
 * Shows where a new chart will go. The pointer snaps it to free space, arrow
 * keys move it, Enter or a click places it, and Escape returns to the dialog.
 */
export function ChartPlacementLayer({
  charts,
  columnCount,
  columnWidth,
  rowHeight,
  padding,
}: ChartPlacementLayerProps) {
  const api = useChartDraft();
  const ghostRef = useRef<HTMLDivElement>(null);
  const placeRef = useRef<HTMLButtonElement>(null);
  const occupied = charts.map((chart) => chart.layout);
  const size = api?.draft?.settings.layout ?? { w: 6, h: 4 };
  const [spot, setSpot] = useState<ChartLayout>(() =>
    firstFreeSpot(size, occupied, columnCount)
  );
  const valid = !overlapsAny(spot, occupied);
  const name = api?.draft
    ? (getChartDefinition(api.draft.settings.type)?.name ?? "chart")
    : "chart";

  useEffect(() => {
    placeRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    ghostRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [spot.x, spot.y]);

  const accept = () => {
    if (valid) api?.place(spot);
  };

  // Keys work wherever focus sits so Enter places the chart right away.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        api?.backToEditing();
      } else if (event.key === "Enter" && target?.tagName !== "BUTTON") {
        event.preventDefault();
        if (!overlapsAny(spot, occupied)) api?.place(spot);
      } else if (MOVES[event.key]) {
        event.preventDefault();
        const move = MOVES[event.key]!;
        setSpot((current) =>
          clampLayout(
            { ...current, x: current.x + move.x, y: current.y + move.y },
            columnCount
          )
        );
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  const toCell = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.floor((event.clientX - bounds.left - padding) / columnWidth),
      y: Math.floor((event.clientY - bounds.top - padding) / rowHeight),
    };
  };
  const snap = (event: React.MouseEvent<HTMLDivElement>) => {
    const cell = toCell(event);
    // Keep the chosen size where it fits, then fall back to a smaller one.
    const exact = clampLayout({ ...size, ...cell }, columnCount);
    if (!overlapsAny(exact, occupied)) return exact;
    return findEmptyPlacement(cell, occupied, columnCount);
  };

  const bottom = Math.max(spot.y + spot.h, ...occupied.map((l) => l.y + l.h));

  return (
    <>
      <div
        className="eda-placement-layer"
        style={{ height: bottom * rowHeight + padding * 2 + rowHeight }}
        aria-hidden="true"
        onPointerMove={(event) => {
          const next = snap(event);
          if (next) setSpot(next);
        }}
        onClick={(event) => {
          const next = snap(event);
          if (next) api?.place(next);
        }}
      >
        <div
          ref={ghostRef}
          className="eda-placement-ghost"
          data-invalid={!valid || undefined}
          style={{
            left: padding + spot.x * columnWidth,
            top: padding + spot.y * rowHeight,
            width: spot.w * columnWidth,
            height: spot.h * rowHeight,
          }}
        >
          <span>{valid ? `New ${name}` : "This spot overlaps a chart"}</span>
        </div>
      </div>
      {createPortal(
        <div
          className="eda-placement-bar"
          role="dialog"
          aria-label={`Place the new ${name}`}
        >
          <p aria-live="polite">
            Click a free spot or move with the arrow keys.{" "}
            <span className="sr-only">
              {valid
                ? `Column ${spot.x + 1}, row ${spot.y + 1}.`
                : "This spot overlaps a chart."}
            </span>
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="ghost"
              size="sm"
              tooltip="Return to the chart editor (Esc)"
              onClick={api?.backToEditing}
            >
              Back
            </Button>
            <Button
              ref={placeRef}
              size="sm"
              disabled={!valid}
              tooltip="Place the chart at the highlighted spot (Enter)"
              onClick={accept}
            >
              Place chart
            </Button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
