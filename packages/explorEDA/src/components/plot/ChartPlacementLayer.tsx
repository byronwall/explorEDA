import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getChartDefinition } from "@/charts/registry";
import type { ChartLayout, ChartSettings } from "@/types/ChartTypes";
import { Button } from "../ui/button";
import { findEmptyPlacement } from "../chartGridPlacement";
import { useChartDraft } from "./ChartDraftContext";
import {
  clampLayout,
  firstFreeSpot,
  overlapsAny,
  shiftForPlacement,
} from "./chartPlacement";

interface ChartPlacementLayerProps {
  charts: ChartSettings[];
  columnCount: number;
  columnWidth: number;
  rowHeight: number;
  padding: number;
  /** Reports the charts that would move, so the grid can preview them. */
  onProposal?: (moves: Record<string, ChartLayout>) => void;
}

const MOVES: Record<string, { x: number; y: number }> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

/**
 * Shows where a new chart will go. The pointer snaps it to free space or
 * offers the place of the chart under it, arrow keys move it, Enter or a
 * click places it, and Escape returns to the dialog. Charts in the way are
 * shown in the positions they would move to. Nothing changes until the user
 * accepts.
 */
export function ChartPlacementLayer({
  charts,
  columnCount,
  columnWidth,
  rowHeight,
  padding,
  onProposal,
}: ChartPlacementLayerProps) {
  const api = useChartDraft();
  const ghostRef = useRef<HTMLDivElement>(null);
  const placeRef = useRef<HTMLButtonElement>(null);
  const occupied = charts.map((chart) => chart.layout);
  const size = api?.draft?.settings.layout ?? { w: 6, h: 4 };
  const [spot, setSpot] = useState<ChartLayout>(() =>
    firstFreeSpot(size, occupied, columnCount)
  );
  const moves = useMemo(
    () => shiftForPlacement(spot, charts),
    // Only positions matter, and the chart list changes identity on rerender.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spot.x, spot.y, spot.w, spot.h, JSON.stringify(occupied)]
  );
  const movedCount = Object.keys(moves).length;
  const name = api?.draft
    ? (getChartDefinition(api.draft.settings.type)?.name ?? "chart")
    : "chart";

  useEffect(() => {
    placeRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    ghostRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [spot.x, spot.y]);

  useEffect(() => {
    onProposal?.(moves);
  }, [moves, onProposal]);
  useEffect(() => () => onProposal?.({}), [onProposal]);

  const accept = () => api?.place(spot, moves);

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
        accept();
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
    const free = findEmptyPlacement(cell, occupied, columnCount);
    if (free) return free;
    // Over a chart, offer its place. It and the charts below move down.
    const under = occupied.find(
      (layout) =>
        cell.x >= layout.x &&
        cell.x < layout.x + layout.w &&
        cell.y >= layout.y &&
        cell.y < layout.y + layout.h
    );
    return under
      ? clampLayout({ ...size, x: under.x, y: under.y }, columnCount)
      : exact;
  };

  const bottom = Math.max(
    spot.y + spot.h,
    ...charts.map((chart) => {
      const layout = moves[chart.id] ?? chart.layout;
      return layout.y + layout.h;
    })
  );
  const moveStatus =
    movedCount === 0
      ? ""
      : movedCount === 1
        ? "1 chart moves down to make room."
        : `${movedCount} charts move down to make room.`;

  return (
    <>
      <div
        className="eda-placement-layer"
        style={{ height: bottom * rowHeight + padding * 2 + rowHeight }}
        aria-hidden="true"
        onPointerMove={(event) => setSpot(snap(event))}
        onClick={(event) => {
          const next = snap(event);
          api?.place(next, shiftForPlacement(next, charts));
        }}
      >
        {Object.entries(moves).map(([id, layout]) => (
          <div
            key={id}
            className="eda-placement-move"
            style={{
              left: padding + layout.x * columnWidth,
              top: padding + layout.y * rowHeight,
              width: layout.w * columnWidth,
              height: layout.h * rowHeight,
            }}
          >
            <span>Moves here</span>
          </div>
        ))}
        <div
          ref={ghostRef}
          className="eda-placement-ghost"
          style={{
            left: padding + spot.x * columnWidth,
            top: padding + spot.y * rowHeight,
            width: spot.w * columnWidth,
            height: spot.h * rowHeight,
          }}
        >
          <span>New {name}</span>
        </div>
      </div>
      {createPortal(
        <div
          className="eda-placement-bar"
          role="dialog"
          aria-label={`Place the new ${name}`}
        >
          <p aria-live="polite">
            {moveStatus ||
              "Click a spot or move with the arrow keys. Charts in the way move down."}{" "}
            <span className="sr-only">
              Column {spot.x + 1}, row {spot.y + 1}.
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
