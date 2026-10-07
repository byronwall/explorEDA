import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartStatusLine, STATUS_HINT_MIN_WIDTH } from "../ChartStatusLine";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { isEmptyPlotTarget } from "../emptyPlotClick";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { ChartReadout } from "../ChartReadout";
import { useGetColumnData } from "../useGetColumnData";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import type { SankeySettings } from "./definition";
import {
  bandPath,
  planSankey,
  toggleLinkFilters,
  toggleNodeFilters,
  type SankeyLink,
  type SankeyNode,
  type SankeyPlan,
  type SankeySnapshot,
} from "./sankeyPlan";
import {
  findSankeyTraceRow,
  resolveSankeyTrace,
  sankeyTraceTargets,
} from "./sankeyTrace";

const LABEL_CHAR = 6.2;

const unitFor = (plan: SankeyPlan, value: number) =>
  plan.unit === "rows" && value === 1 ? "row" : plan.unit;

const percent = (part: number, whole: number) =>
  whole > 0
    ? `${(part / whole).toLocaleString("en-US", { style: "percent", maximumFractionDigits: 1 })}`
    : "0%";

function Readout({
  plan,
  item,
  format,
}: {
  plan: SankeyPlan;
  item: { node?: SankeyNode; link?: SankeyLink };
  format: (value: number) => string;
}) {
  const { node, link } = item;
  const items: [string, string][] = [];
  if (node) {
    items.push(
      [plan.stages[node.stage]!.label, node.label],
      [plan.metricLabel, format(node.weight)],
      ["Share of flow", percent(node.weight, plan.totalWeight)]
    );
    if (plan.hasSelection) {
      items.push([
        "Selected",
        `${format(node.selectedWeight)} (${percent(node.selectedWeight, node.weight)})`,
      ]);
    }
    if (node.kind === "other") {
      items.push(["Groups", `${node.members.length} values`]);
    }
  }
  if (link) {
    items.push(
      [plan.stages[link.source.stage]!.label, link.source.label],
      [plan.stages[link.target.stage]!.label, link.target.label],
      [plan.metricLabel, format(link.weight)],
      [`Of ${link.source.label}`, percent(link.weight, link.source.outWeight)],
      [`Of ${link.target.label}`, percent(link.weight, link.target.inWeight)]
    );
    if (plan.hasSelection) {
      items.push([
        "Selected",
        `${format(link.selectedWeight)} (${percent(link.selectedWeight, link.weight)})`,
      ]);
    }
  }
  return (
    <ChartReadout fallbackClassName="eda-chart-readout-inline">
      {items.map(([name, value]) => (
        <span key={name} className="eda-readout-item">
          <span>{name}</span>
          <b>{value}</b>
        </span>
      ))}
    </ChartReadout>
  );
}

export function SankeyChart({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<SankeySettings>) {
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const nonce = useDataLayer((s) => s.nonce);
  const updateChart = useDataLayer((s) => s.updateChart);
  const firstStage = settings.stages[0];
  const colorScale = useDataLayer((s) =>
    s.colorScales.find(
      (scale) => firstStage && scale.sourceField === firstStage
    )
  );
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds(settings);
  const measureData = useGetColumnData(
    settings.aggregation === "sum" ? settings.measureField : undefined
  );
  const revision = useTraceRevision(settings);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const refs = useRef(new Map<string, SVGPathElement | SVGRectElement>());

  const stageKey = settings.stages.join("\u0000");
  const snapshot = useMemo((): SankeySnapshot => {
    const stageData: SankeySnapshot["stageData"] = {};
    for (const field of stageKey.split("\u0000").filter(Boolean)) {
      stageData[field] = getColumnData(field);
    }
    return { revision, allIds, liveIds, stageData, measureData, colorScale };
    // The nonce carries data edits; column maps are replaced when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stageKey,
    revision,
    allIds,
    liveIds,
    measureData,
    colorScale,
    nonce,
    getColumnData,
  ]);

  const plan = useMemo(
    () =>
      planSankey({
        settings,
        width,
        height,
        snapshot,
        getFieldLabel,
        formatFieldValue,
      }),
    // Field settings carry label and format changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, width, height, snapshot, fieldSettings]
  );

  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: plan.revision,
      resolve: (kind, id) => resolveSankeyTrace(plan, kind, id),
      findRow: (id) => findSankeyTraceRow(plan, id),
      targets: () => sankeyTraceTargets(plan),
    }),
    [plan]
  );
  useTraceSource(owner, source);
  const inspect = useCallback(
    (kind: string, id: string) => traceApi?.inspect(owner, kind, id),
    [owner, traceApi]
  );
  const traced =
    trace?.selection?.owner === owner ? trace.selection.id : undefined;

  // Keyboard order: nodes of a stage, then the links leaving it, and so on.
  const columns = useMemo(() => {
    const list: string[][] = [];
    plan.stages.forEach((stage, index) => {
      list.push(stage.nodes.map((node) => node.id));
      if (index < plan.stages.length - 1) {
        list.push(
          plan.links
            .filter((link) => link.stage === index)
            .sort((a, b) => a.sy - b.sy || a.ty - b.ty)
            .map((link) => link.id)
        );
      }
    });
    return list.filter((column) => column.length > 0);
  }, [plan]);

  if (settings.stages.filter(Boolean).length < 2) {
    return (
      <ChartMessage width={width} height={height}>
        Choose at least two category fields for the stages in chart settings.
      </ChartMessage>
    );
  }
  if (plan.drawnRows === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {plan.liveCount > 0
          ? "Every row is missing at least one stage. Show missing values as a node in chart settings."
          : NO_MATCHING_ROWS}
      </ChartMessage>
    );
  }

  const nodeById = new Map(plan.nodes.map((node) => [node.id, node]));
  const linkById = new Map(plan.links.map((link) => [link.id, link]));
  const measureField =
    settings.aggregation === "sum" ? settings.measureField : undefined;
  const format = (value: number) =>
    measureField
      ? formatFieldValue(measureField, value)
      : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const selectNode = (node: SankeyNode, add: boolean) =>
    updateChart(settings.id, {
      filters: toggleNodeFilters(settings.filters, node, add),
    });
  const selectLink = (link: SankeyLink) =>
    updateChart(settings.id, {
      filters: toggleLinkFilters(settings.filters, link),
    });

  const allIdsInOrder = columns.flat();
  const tabStop =
    (focused && allIdsInOrder.includes(focused) ? focused : undefined) ??
    plan.nodes.find((node) => node.selected)?.id ??
    allIdsInOrder[0];
  const centerOf = (id: string) => {
    const node = nodeById.get(id);
    if (node) {
      return node.y + node.height / 2;
    }
    const link = linkById.get(id)!;
    return (link.sy + link.ty + link.thickness) / 2;
  };
  const moveFocus = (id: string, key: string) => {
    const column = columns.findIndex((items) => items.includes(id));
    const row = columns[column]!.indexOf(id);
    let next = id;
    if (key === "ArrowUp" || key === "ArrowDown") {
      const items = columns[column]!;
      next =
        items[
          Math.max(
            0,
            Math.min(items.length - 1, row + (key === "ArrowUp" ? -1 : 1))
          )
        ]!;
    } else {
      const target = columns[column + (key === "ArrowLeft" ? -1 : 1)];
      if (target) {
        const y = centerOf(id);
        next = target.reduce((best, item) =>
          Math.abs(centerOf(item) - y) < Math.abs(centerOf(best) - y)
            ? item
            : best
        );
      }
    }
    setFocused(next);
    setHovered(next);
    refs.current.get(next)?.focus();
  };
  const handleKey = (
    event: KeyboardEvent,
    id: string,
    activate: (add: boolean) => void
  ) => {
    if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      moveFocus(id, event.key);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (event.altKey && event.key === "Enter") {
        inspect(nodeById.has(id) ? "sankey-node" : "sankey-link", id);
      } else {
        activate(event.shiftKey);
      }
    }
  };
  const register =
    (id: string) => (element: SVGPathElement | SVGRectElement | null) => {
      if (element) {
        refs.current.set(id, element);
      } else {
        refs.current.delete(id);
      }
    };

  const hoveredNode = hovered ? nodeById.get(hovered) : undefined;
  const hoveredLink = hovered ? linkById.get(hovered) : undefined;
  const linkEmphasis = (link: SankeyLink) =>
    hoveredLink
      ? link.id === hoveredLink.id
      : hoveredNode
        ? link.source.id === hoveredNode.id || link.target.id === hoveredNode.id
        : undefined;
  const lastStage = plan.stages.length - 1;
  const statusParts = [
    plan.hasSelection
      ? `${format(plan.selectedWeight)} of ${format(plan.totalWeight)} ${plan.unit} selected`
      : `${format(plan.totalWeight)} ${plan.unit}`,
    plan.incompleteIds.length > 0 &&
      `${plan.incompleteIds.length.toLocaleString()} rows with a missing stage not drawn`,
    ...plan.excluded.map(
      (item) =>
        `${item.count.toLocaleString()} rows left out: ${item.reason.toLowerCase()}`
    ),
  ];
  const statusHint =
    !plan.hasSelection &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click a value or flow to select";

  return (
    <div
      className="relative select-none"
      style={{ width, height }}
      onPointerLeave={() => setHovered(null)}
    >
      <svg
        width={width}
        height={height}
        className="block overflow-visible"
        onClick={(event) => {
          // A click on empty space between nodes and flows clears the selection.
          if (
            !event.altKey &&
            settings.filters.length > 0 &&
            isEmptyPlotTarget(event.target)
          )
            updateChart(settings.id, { filters: [] });
        }}
      >
        <g
          className="fill-foreground"
          fontSize={12}
          fontWeight={600}
          aria-hidden="true"
        >
          {plan.stages.map((stage) => {
            const anchor =
              stage.index === 0
                ? "start"
                : stage.index === lastStage
                  ? "end"
                  : "middle";
            const x =
              plan.margin.left +
              stage.x +
              (anchor === "start"
                ? 0
                : anchor === "end"
                  ? plan.nodeWidth
                  : plan.nodeWidth / 2);
            return (
              <text
                key={stage.field}
                x={x}
                y={plan.margin.top - 8}
                textAnchor={anchor}
              >
                {stage.label}
              </text>
            );
          })}
        </g>
        <g transform={`translate(${plan.margin.left},${plan.margin.top})`}>
          <g role="group" aria-label="Flows between stages">
            {plan.links.map((link) => {
              const x0 = link.source.x + plan.nodeWidth;
              const x1 = link.target.x;
              const emphasis = linkEmphasis(link);
              const isTraced = traced === link.id;
              const baseOpacity = plan.hasSelection
                ? "var(--eda-flow-context)"
                : emphasis === true
                  ? "var(--eda-flow-strong)"
                  : emphasis === false
                    ? "var(--eda-flow-faint)"
                    : "var(--eda-flow)";
              return (
                <g key={link.id} data-plan-id={link.id}>
                  {link.segments.map((segment) => (
                    <path
                      key={segment.key}
                      d={bandPath(
                        x0,
                        link.sy + segment.offset,
                        x1,
                        link.ty + segment.offset,
                        segment.thickness
                      )}
                      fill={segment.color}
                      style={{ fillOpacity: baseOpacity }}
                      pointerEvents="none"
                    />
                  ))}
                  {plan.hasSelection &&
                    link.segments.map((segment) =>
                      segment.selectedWeight > 0 ? (
                        <path
                          key={`${segment.key}-selected`}
                          d={bandPath(
                            x0,
                            link.sy + segment.offset,
                            x1,
                            link.ty + segment.offset,
                            segment.selectedWeight * plan.scale
                          )}
                          fill={segment.color}
                          style={{
                            fillOpacity:
                              emphasis === false
                                ? "var(--eda-flow)"
                                : "var(--eda-flow-strong)",
                          }}
                          pointerEvents="none"
                        />
                      ) : null
                    )}
                  <path
                    ref={register(link.id)}
                    d={bandPath(
                      x0,
                      link.sy,
                      x1,
                      link.ty,
                      Math.max(2, link.thickness)
                    )}
                    fill="transparent"
                    stroke={
                      isTraced || link.selected || focused === link.id
                        ? "var(--foreground)"
                        : "none"
                    }
                    strokeWidth={isTraced || link.selected ? 1.5 : 1}
                    strokeDasharray={
                      focused === link.id && !link.selected && !isTraced
                        ? "3 2"
                        : undefined
                    }
                    className="cursor-pointer outline-none"
                    role="button"
                    tabIndex={link.id === tabStop ? 0 : -1}
                    aria-label={`${link.source.label} to ${link.target.label}: ${format(link.weight)} ${unitFor(plan, link.weight)}`}
                    aria-pressed={link.selected}
                    onPointerEnter={() => setHovered(link.id)}
                    onPointerLeave={() =>
                      setHovered((id) => (id === link.id ? null : id))
                    }
                    onFocus={() => setFocused(link.id)}
                    onBlur={() =>
                      setHovered((id) => (id === link.id ? null : id))
                    }
                    onClick={(event) => {
                      if (event.altKey) {
                        event.preventDefault();
                        inspect("sankey-link", link.id);
                      } else {
                        selectLink(link);
                      }
                    }}
                    onKeyDown={(event) =>
                      handleKey(event, link.id, () => selectLink(link))
                    }
                  />
                </g>
              );
            })}
          </g>
          <g role="group" aria-label="Stage values">
            {plan.nodes.map((node) => {
              const isTraced = traced === node.id;
              const colored =
                node.stage === 0 || settings.flowColor !== "first";
              const fill = colored ? node.color : "var(--muted-foreground)";
              const labelLeft =
                node.stage === lastStage && plan.stages.length > 1;
              const valueText = format(node.weight);
              const room =
                plan.stages.length > 1
                  ? (plan.plotWidth / (plan.stages.length - 1)) * 0.45
                  : 200;
              const maxChars = Math.max(
                3,
                Math.floor(room / LABEL_CHAR) - valueText.length - 1
              );
              const text =
                node.label.length > maxChars
                  ? `${node.label.slice(0, maxChars - 1)}…`
                  : node.label;
              const labelWidth =
                (text.length + valueText.length + 1) * LABEL_CHAR;
              return (
                <g key={node.id} data-plan-id={node.id}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={2}
                    fill={fill}
                    fillOpacity={plan.hasSelection ? 0.3 : 0.92}
                    pointerEvents="none"
                  />
                  {plan.hasSelection && node.selectedWeight > 0 && (
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={Math.max(1, node.selectedWeight * plan.scale)}
                      rx={2}
                      fill={fill}
                      pointerEvents="none"
                    />
                  )}
                  <rect
                    ref={register(node.id)}
                    x={node.x - 3}
                    y={node.y - 1}
                    width={node.width + 6}
                    height={Math.max(6, node.height + 2)}
                    rx={3}
                    fill="transparent"
                    stroke={
                      isTraced ||
                      node.selected ||
                      focused === node.id ||
                      hovered === node.id
                        ? "var(--foreground)"
                        : "none"
                    }
                    strokeWidth={isTraced || node.selected ? 2 : 1}
                    strokeDasharray={
                      focused === node.id && !node.selected && !isTraced
                        ? "3 2"
                        : undefined
                    }
                    className="cursor-pointer outline-none"
                    role="button"
                    tabIndex={node.id === tabStop ? 0 : -1}
                    aria-label={`${plan.stages[node.stage]!.label}: ${node.label}, ${valueText} ${unitFor(plan, node.weight)}`}
                    aria-pressed={node.selected === true}
                    onPointerEnter={() => setHovered(node.id)}
                    onPointerLeave={() =>
                      setHovered((id) => (id === node.id ? null : id))
                    }
                    onFocus={() => setFocused(node.id)}
                    onBlur={() =>
                      setHovered((id) => (id === node.id ? null : id))
                    }
                    onClick={(event) => {
                      if (event.altKey) {
                        event.preventDefault();
                        inspect("sankey-node", node.id);
                      } else {
                        selectNode(
                          node,
                          event.shiftKey || event.metaKey || event.ctrlKey
                        );
                      }
                    }}
                    onKeyDown={(event) =>
                      handleKey(event, node.id, (add) => selectNode(node, add))
                    }
                  />
                  {node.height >= 9 && (
                    <g
                      className="eda-sankey-label"
                      aria-hidden="true"
                      onPointerEnter={() => setHovered(node.id)}
                      onPointerLeave={() =>
                        setHovered((id) => (id === node.id ? null : id))
                      }
                      onClick={(event) => {
                        if (event.altKey) {
                          inspect("sankey-node", node.id);
                        } else {
                          selectNode(
                            node,
                            event.shiftKey || event.metaKey || event.ctrlKey
                          );
                        }
                      }}
                    >
                      {/* Covers the gaps between letters, so a click on the
                          label never lands on the flow beneath it. */}
                      <rect
                        x={
                          labelLeft
                            ? node.x - 6 - labelWidth
                            : node.x + node.width + 6
                        }
                        y={node.y + node.height / 2 - 8}
                        width={labelWidth}
                        height={16}
                        fill="transparent"
                      />
                      <text
                        x={labelLeft ? node.x - 6 : node.x + node.width + 6}
                        y={node.y + node.height / 2}
                        textAnchor={labelLeft ? "end" : "start"}
                        dominantBaseline="central"
                        fontSize={11}
                        className="fill-foreground"
                        paintOrder="stroke"
                        stroke="var(--background)"
                        strokeWidth={3}
                        strokeLinejoin="round"
                        opacity={
                          plan.hasSelection && !node.selectedWeight ? 0.55 : 1
                        }
                      >
                        <tspan fontWeight={node.selected ? 700 : 500}>
                          {text}
                        </tspan>
                        <tspan dx={5} className="fill-muted-foreground">
                          {valueText}
                        </tspan>
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={settings.margin.left}
        right={settings.margin.right}
        bottom={settings.margin.bottom}
      />
      {(hoveredNode || hoveredLink) && (
        <Readout
          plan={plan}
          item={{ node: hoveredNode, link: hoveredLink }}
          format={format}
        />
      )}
    </div>
  );
}
