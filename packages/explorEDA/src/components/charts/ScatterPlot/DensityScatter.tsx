import { useAxisTypography } from "../chartTypography";
import { useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartReadout } from "../ChartReadout";
import { PlannedAxes, PlannedGrid } from "../Axis/AxisLayer";
import { findAxisGuide } from "../Axis/axisPlan";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceSource,
} from "../trace/ChartTraceScope";
import {
  guideTargets,
  resolveGuideTrace,
  type TraceSource,
} from "../trace/traceTypes";
import type { ScatterPlotSettings } from "./definition";
import { useScatterData } from "./useScatterData";
import { resolveScatterTrace } from "./scatterTrace";
import {
  DENSITY_FOOTER,
  densityBinFilters,
  densityColor,
  planDensity,
  type DensityBin,
} from "./densityPlan";

export function DensityScatter({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<ScatterPlotSettings>) {
  const { snapshot, data, rawData, profiles, manager, updateChart } =
    useScatterData(settings, facetIds);
  const owner = useId();
  const gradientId = `${owner.replace(/:/g, "")}-density`;
  const api = useChartTraceApi();
  const trace = useChartTrace();
  const [activeId, setActiveId] = useState<string>();
  const refs = useRef(new Map<string, SVGRectElement>());
  const typography = useAxisTypography();
  const plan = useMemo(
    () => planDensity(settings, snapshot, width, height, typography),
    [settings, snapshot, width, height, typography]
  );
  const base = plan.scatter;
  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: base.revision,
      resolve: (kind, id) => {
        if (kind === "density-row") {
          const row = resolveScatterTrace(
            { kind: "point", id: `${settings.id}:point:${id}` },
            base,
            snapshot,
            plan.scatterSettings,
            rawData,
            data,
            profiles,
            manager
          );
          const bin = plan.cells.find((cell) =>
            cell.sourceIds.includes(Number(id))
          );
          return row?.kind === "point" && bin
            ? {
                kind,
                id,
                revision: base.revision,
                plan,
                bin,
                row,
                rawRows: rawData,
              }
            : undefined;
        }
        if (kind === "density-bin") {
          const bin = plan.cells.find((cell) => cell.id === id);
          return (
            bin && {
              kind,
              id,
              revision: base.revision,
              plan,
              bin,
              rawRows: rawData,
            }
          );
        }
        if (kind === "density-omissions")
          return { kind, id, revision: base.revision, plan, rawRows: rawData };
        if (kind === "guide")
          return resolveGuideTrace(base.axes, id, base.revision);
        return resolveScatterTrace(
          { kind, id },
          base,
          snapshot,
          plan.scatterSettings,
          rawData,
          data,
          profiles,
          manager
        );
      },
      findRow: (id) => {
        const bin = plan.cells.find((cell) => cell.sourceIds.includes(id));
        return bin
          ? bin.rowIds.includes(id)
            ? { kind: "density-row", id: String(id) }
            : { kind: "density-bin", id: bin.id }
          : plan.omittedIds.includes(id)
            ? { kind: "excluded", id: String(id) }
            : undefined;
      },
      targets: () => [
        ...plan.cells.map((bin) => ({
          kind: "density-bin",
          id: bin.id,
          label: `Bin ${bin.xIndex + 1}, ${bin.yIndex + 1}: ${bin.rowIds.length} rows`,
        })),
        ...(plan.omittedIds.length
          ? [
              {
                kind: "density-omissions",
                id: "omissions",
                label: `${plan.omittedIds.length} omitted coordinates`,
              },
            ]
          : []),
        ...guideTargets(base.axes),
      ],
    }),
    [base, plan, snapshot, rawData, data, profiles, manager]
  );
  useTraceSource(owner, source);
  const inspect = (bin: DensityBin) =>
    api?.inspect(owner, "density-bin", bin.id);
  const select = (bin: DensityBin) =>
    updateChart(settings.id, { filters: densityBinFilters(settings, bin) });
  const tracedId =
    trace?.selection?.owner === owner
      ? trace.trace?.kind === "density-row"
        ? trace.trace.bin?.id
        : trace.selection.id
      : undefined;
  const active = plan.cells.find((bin) => bin.id === activeId);
  const selected = plan.cells.find((bin) => bin.selected);
  const tabStop = active?.id ?? selected?.id ?? plan.cells[0]?.id;
  const focusBin = (index: number, key: string) => {
    const next =
      key === "Home"
        ? 0
        : key === "End"
          ? plan.cells.length - 1
          : (index +
              (["ArrowLeft", "ArrowUp"].includes(key) ? -1 : 1) +
              plan.cells.length) %
            plan.cells.length;
    const bin = plan.cells[next];
    if (bin) {
      setActiveId(bin.id);
      refs.current.get(bin.id)?.focus();
    }
  };
  const count = plan.cells.reduce((sum, cell) => sum + cell.rowIds.length, 0);
  const intervalLabel = (bounds: [number, number]) =>
    bounds.map((value) => Number(value.toPrecision(5))).join(" to ");
  const label = (bin: DensityBin) =>
    `${base.xDisplay}: ${intervalLabel(bin.xBounds)}; ${base.yDisplay}: ${intervalLabel(bin.yBounds)}; ${bin.rowIds.length} rows`;
  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={Math.max(1, height - DENSITY_FOOTER)}
        className="block select-none"
        role="group"
        aria-label={`${base.title} density bins`}
        aria-description="Arrow keys move between occupied source bins. Enter selects a bin. Alt-Enter inspects it. Escape clears the selection."
        onClick={(event) => {
          if (!event.altKey) return;
          const id = (event.target as Element)
            .closest("[data-plan-id]")
            ?.getAttribute("data-plan-id");
          if (id && findAxisGuide(base.axes, id))
            api?.inspect(owner, "guide", id);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            updateChart(settings.id, { filters: [] });
          }
          if (event.altKey && event.key === "Enter") {
            const id = (event.target as Element)
              .closest("[data-plan-id]")
              ?.getAttribute("data-plan-id");
            if (id && findAxisGuide(base.axes, id)) {
              event.preventDefault();
              api?.inspect(owner, "guide", id);
            }
          }
        }}
      >
        <g transform={`translate(${base.margin.left},${base.margin.top})`}>
          <PlannedGrid plan={base.axes} />
          {plan.cells.map((bin, index) => (
            <rect
              key={bin.id}
              ref={(node) => {
                if (node) refs.current.set(bin.id, node);
                else refs.current.delete(bin.id);
              }}
              data-plan-id={bin.id}
              x={bin.x + Math.min(0.5, bin.width * 0.1)}
              y={bin.y + Math.min(0.5, bin.height * 0.1)}
              width={bin.width - Math.min(1, bin.width * 0.2)}
              height={bin.height - Math.min(1, bin.height * 0.2)}
              fill={bin.fill}
              opacity={bin.dimmed ? 0.25 : 1}
              stroke={
                bin.id === activeId || bin.id === tracedId || bin.selected
                  ? "var(--foreground)"
                  : bin.rowIds.length
                    ? "none"
                    : "var(--border)"
              }
              strokeWidth={
                bin.id === activeId || bin.id === tracedId || bin.selected
                  ? 2
                  : 1
              }
              strokeDasharray={bin.rowIds.length ? undefined : "2 2"}
              role="button"
              tabIndex={bin.id === tabStop ? 0 : -1}
              aria-label={label(bin)}
              aria-pressed={bin.selected}
              className="chart-mark cursor-pointer"
              onPointerEnter={() => setActiveId(bin.id)}
              onPointerLeave={() => setActiveId(undefined)}
              onFocus={() => setActiveId(bin.id)}
              onClick={(event) => {
                event.stopPropagation();
                if (event.altKey) inspect(bin);
                else select(bin);
              }}
              onKeyDown={(event) => {
                if (
                  event.key.startsWith("Arrow") ||
                  event.key === "Home" ||
                  event.key === "End"
                ) {
                  event.preventDefault();
                  event.stopPropagation();
                  focusBin(index, event.key);
                } else if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  if (event.altKey) inspect(bin);
                  else select(bin);
                }
              }}
            />
          ))}
          <PlannedAxes plan={base.axes} interactive activeId={tracedId} />
        </g>
      </svg>
      {(plan.notice || count === 0) && (
        <div
          className="pointer-events-none absolute flex items-center justify-center p-3 text-center text-sm text-muted-foreground"
          style={{
            left: base.margin.left,
            top: base.margin.top,
            width: Math.max(0, base.plotWidth),
            height: Math.max(0, base.plotHeight),
          }}
          role="status"
        >
          {plan.notice ??
            (base.populations.facet > 0
              ? "No valid coordinate pairs to count"
              : "No rows match the current filters")}
        </div>
      )}
      <div
        className="absolute inset-x-2 bottom-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
        style={{ minHeight: DENSITY_FOOTER - 8 }}
      >
        <div
          className="flex items-center gap-1.5"
          aria-label={`Bin count color scale: 0 to ${plan.max} rows`}
        >
          <span>Rows</span>
          <span
            className="size-2.5 border border-dashed border-border"
            aria-hidden="true"
          />
          <span>0</span>
          <span className="ml-1">1</span>
          <svg width={72} height={10} aria-hidden="true">
            <defs>
              <linearGradient id={gradientId}>
                {[0, 0.25, 0.5, 0.75, 1].map((value) => (
                  <stop
                    key={value}
                    offset={`${value * 100}%`}
                    stopColor={densityColor(
                      (1 + value * (plan.max - 1)) / plan.max
                    )}
                  />
                ))}
              </linearGradient>
            </defs>
            <rect width={72} height={10} fill={`url(#${gradientId})`} />
          </svg>
          <span>{plan.max}</span>
        </div>
        {plan.omittedIds.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-1 text-xs"
            onClick={() =>
              api?.inspect(owner, "density-omissions", "omissions")
            }
          >
            {plan.omittedIds.length} omitted rows
          </Button>
        )}
      </div>
      {active && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item" aria-label={label(active)}>
            <span>
              {width < 500
                ? "Bin"
                : `${intervalLabel(active.xBounds)} × ${intervalLabel(active.yBounds)}`}
            </span>
            <b>{active.rowIds.length} rows</b>
          </span>
        </ChartReadout>
      )}
    </div>
  );
}
