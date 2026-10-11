import {
  useDisplayColorScale,
  useThemeColors,
} from "@/hooks/useDisplayColorScales";
import { formatFieldValue as formatWithSettings } from "@/lib/fieldSettings";
import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { isEmptyPlotTarget } from "../emptyPlotClick";
import { useChartEdit } from "../InPlace/useChartEdit";
import { useTraceRevision } from "../trace/ChartTraceScope";
import { useGetColumnData } from "../useGetColumnData";
import { useGetLiveIds } from "../useGetLiveData";
import type { HierarchySettings } from "./definition";
import {
  isZoomable,
  planHierarchy,
  resolveFocus,
  shareOf,
  toggleBranch,
  type HierarchyNode,
  type HierarchyPlan,
  type HierarchySnapshot,
} from "./hierarchyPlan";
import { layoutTreemap, type TreemapRect } from "./treemapLayout";

const LABEL_CHAR = 6.4;
const HEADER_HEIGHT = 18;
const CRUMB_HEIGHT = 24;
/** How long a first click waits to learn whether it starts a double-click. */
const DOUBLE_CLICK_MS = 400;

const percent = (part: number, whole: number) =>
  shareOf(part, whole).toLocaleString("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  });

/** White or dark text, whichever reads better on a hex fill. */
export function textOn(fill: string) {
  const match = /^#([0-9a-f]{6})$/i.exec(fill);
  if (!match) {
    return "#fff";
  }
  const [r, g, b] = [0, 2, 4].map((at) => {
    const channel = parseInt(match[1]!.slice(at, at + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  // Compare contrast with white (1.05) and near-black (0.05 + 0.012).
  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.062
    ? "#fff"
    : "#1b1f24";
}

const unitFor = (plan: HierarchyPlan, value: number) =>
  plan.unit === "rows" && value === 1 ? "row" : plan.unit;

const fit = (text: string, room: number) => {
  const chars = Math.floor(room / LABEL_CHAR);
  if (chars >= text.length) return text;
  return chars >= 4 ? `${text.slice(0, chars - 1)}…` : "";
};

/** The first option that fits whole; numbers are never cut short. */
const firstFit = (options: string[], room: number) =>
  options.find((text) => text.length * LABEL_CHAR <= room) ?? "";

function pathLabel(plan: HierarchyPlan, node: HierarchyNode) {
  const labels: string[] = [];
  const byId = new Map(plan.nodes.map((item) => [item.id, item]));
  let current: HierarchyNode | undefined = node;
  while (current && current.depth > 0) {
    labels.unshift(current.label);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return labels.join(" › ");
}

function Readout({
  plan,
  node,
  parent,
  focus,
  format,
}: {
  plan: HierarchyPlan;
  node: HierarchyNode;
  parent: HierarchyNode;
  /** The zoomed branch, when it is not the whole. */
  focus: HierarchyNode;
  format: (value: number) => string;
}) {
  const items: [string, string][] = [
    [plan.levelLabels.slice(0, node.depth).join(" › "), pathLabel(plan, node)],
    [plan.metricLabel, format(node.weight)],
  ];
  if (parent.depth > 0) {
    items.push([`Of ${parent.label}`, percent(node.weight, parent.weight)]);
  }
  if (focus.depth > 0 && focus.id !== parent.id) {
    items.push([`Of ${focus.label}`, percent(node.weight, focus.weight)]);
  }
  items.push(["Of all", percent(node.weight, plan.root.weight)]);
  if (plan.hasSelection) {
    items.push([
      "Selected",
      `${format(node.selectedWeight)} (${percent(node.selectedWeight, node.weight)})`,
    ]);
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

export function HierarchyChart({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<HierarchySettings>) {
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const nonce = useDataLayer((s) => s.nonce);
  const updateChart = useDataLayer((s) => s.updateChart);
  const firstLevel = settings.levels[0];
  const colorScaleId = useDataLayer(
    (s) =>
      s.colorScales.find(
        (scale) => firstLevel && scale.sourceField === firstLevel
      )?.id
  );
  const colorScale = useDisplayColorScale(colorScaleId);
  const themeColors = useThemeColors();
  const liveIds = useGetLiveIds(settings, facetIds);
  const measureData = useGetColumnData(
    settings.aggregation === "sum" ? settings.measureField : undefined
  );
  const revision = useTraceRevision(settings);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const refs = useRef(new Map<string, SVGRectElement>());
  // A first click on a parent selects at once but holds the host's undo
  // step briefly; a second click turns it into a zoom with the old filters.
  const edit = useChartEdit(settings.id);
  const lastClicked = useRef<string | null>(null);
  const pending = useRef<{
    id: string;
    filters: Filter[];
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  useEffect(
    () => () => {
      if (pending.current) clearTimeout(pending.current.timer);
    },
    []
  );

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const levels = useMemo(
    () => settings.levels.filter(Boolean),
    [settings.levels]
  );
  const levelKey = levels.join("\u0000");
  const snapshot = useMemo((): HierarchySnapshot => {
    const levelData: HierarchySnapshot["levelData"] = {};
    for (const field of levelKey.split("\u0000").filter(Boolean)) {
      levelData[field] = getColumnData(field);
    }
    return {
      revision,
      liveIds,
      levelData,
      measureData,
      colorScale,
      themeColors,
    };
    // The nonce carries data edits; column maps are replaced when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    levelKey,
    revision,
    liveIds,
    measureData,
    colorScale,
    themeColors,
    nonce,
    getColumnData,
  ]);

  const plan = useMemo(
    () =>
      planHierarchy({ settings, snapshot, getFieldLabel, formatFieldValue }),
    // Field settings carry label and format changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, snapshot, fieldSettings]
  );

  const resolution = useMemo(
    () => resolveFocus(plan.root, settings.focus),
    [plan, settings.focus]
  );
  const focusNode = resolution.node;
  // Zooming needs a level below the first; one level has no breadcrumbs.
  const crumbHeight = levels.length > 1 ? CRUMB_HEIGHT : 0;
  const margin = settings.margin;
  const plotTop = margin.top + crumbHeight;
  const plotWidth = Math.max(0, width - margin.left - margin.right);
  const plotHeight = Math.max(
    0,
    height - plotTop - margin.bottom - STATUS_LINE_HEIGHT
  );
  const rects = useMemo(
    () =>
      layoutTreemap(focusNode, {
        width: plotWidth,
        height: plotHeight,
        headerHeight: HEADER_HEIGHT,
      }),
    [focusNode, plotWidth, plotHeight]
  );

  if (!levels.length) {
    return (
      <ChartMessage width={width} height={height}>
        Choose one to three category fields for the levels in chart settings.
      </ChartMessage>
    );
  }
  if (plan.root.rowCount === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {plan.liveCount > 0
          ? "Every row is missing at least one level. Show missing values as a node in chart settings."
          : NO_MATCHING_ROWS}
      </ChartMessage>
    );
  }

  const nodeById = new Map<string, HierarchyNode>([
    [plan.root.id, plan.root],
    ...plan.nodes.map((node) => [node.id, node] as const),
  ]);
  const order = rects.map((rect) => rect.node.id);
  const measureField =
    settings.aggregation === "sum" ? settings.measureField : undefined;
  const format = (value: number) =>
    measureField
      ? formatFieldValue(measureField, value)
      : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  // Box labels are tight, so they use short numbers such as $46.5K.
  const formatShort = (value: number) =>
    measureField
      ? formatWithSettings(measureField, value, fieldSettings[measureField], {
          compact: true,
        })
      : value.toLocaleString("en-US", {
          notation: value >= 10_000 ? "compact" : "standard",
          maximumFractionDigits: 1,
        });
  const select = (node: HierarchyNode, add: boolean) => {
    const result = toggleBranch(settings.filters, node, levels, add);
    if (result.ok) {
      setNotice(null);
      updateChart(settings.id, { filters: result.filters });
    } else {
      setNotice(result.reason);
    }
  };
  const zoomTo = (path: datum[]) =>
    updateChart(settings.id, { focus: path.length ? path : undefined });
  const onMarkClick = (event: MouseEvent, node: HierarchyNode) => {
    event.stopPropagation();
    const first = pending.current;
    const repeat = lastClicked.current === node.id;
    lastClicked.current = node.id;
    if (event.detail >= 2 && repeat) {
      // The second press of a double-click: zoom, and undo the first
      // press's selection inside the same held step. On a leaf it does
      // nothing, so the first press's selection stands.
      if (first?.id === node.id && isZoomable(node)) {
        clearTimeout(first.timer);
        pending.current = null;
        edit.apply({ filters: first.filters, focus: node.path });
        edit.commit();
      }
      return;
    }
    if (first) {
      clearTimeout(first.timer);
      pending.current = null;
      edit.commit();
    }
    const add = event.shiftKey || event.metaKey || event.ctrlKey;
    if (!isZoomable(node)) {
      select(node, add);
      return;
    }
    const result = toggleBranch(settings.filters, node, levels, add);
    if (!result.ok) {
      setNotice(result.reason);
      return;
    }
    setNotice(null);
    const before = settings.filters;
    edit.apply({ filters: result.filters });
    pending.current = {
      id: node.id,
      filters: before,
      timer: setTimeout(() => {
        pending.current = null;
        edit.commit();
      }, DOUBLE_CLICK_MS),
    };
  };
  const moveFocus = (id: string, step: number) => {
    const index = order.indexOf(id);
    const next =
      order[
        step === Infinity
          ? order.length - 1
          : step === -Infinity
            ? 0
            : Math.max(0, Math.min(order.length - 1, index + step))
      ];
    if (!next) return;
    setFocused(next);
    setHovered(next);
    refs.current.get(next)?.focus();
  };
  const handleKey = (event: KeyboardEvent, node: HierarchyNode) => {
    const steps: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
      Home: -Infinity,
      End: Infinity,
    };
    if (event.key in steps) {
      event.preventDefault();
      moveFocus(node.id, steps[event.key]!);
    } else if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      if (isZoomable(node)) zoomTo(node.path);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(node, event.shiftKey);
    }
  };
  const tabStop =
    (focused && order.includes(focused) ? focused : undefined) ??
    plan.nodes.find((node) => node.selected)?.id ??
    order[0];

  const hoveredNode = hovered ? nodeById.get(hovered) : undefined;
  const hoveredParent = hoveredNode?.parentId
    ? nodeById.get(hoveredNode.parentId)
    : undefined;
  const statusParts = [
    plan.hasSelection
      ? `${format(plan.root.selectedWeight)} of ${format(plan.root.weight)} ${plan.unit} selected`
      : `${format(plan.root.weight)} ${plan.unit} in all`,
    plan.incompleteCount > 0 &&
      `${plan.incompleteCount.toLocaleString()} rows with a missing level not drawn`,
    ...plan.excluded.map(
      (item) =>
        `${item.count.toLocaleString()} rows left out: ${item.reason.toLowerCase()}`
    ),
  ];
  const statusHint =
    notice ??
    (!plan.hasSelection &&
      !facetIds &&
      width >= STATUS_HINT_MIN_WIDTH &&
      (levels.length > 1
        ? "Click a box to select its branch, double-click to zoom in"
        : "Click a box to select it"));

  const renderRect = (rect: TreemapRect) => {
    const { node } = rect;
    const w = rect.x1 - rect.x0;
    const h = rect.y1 - rect.y0;
    const isParent = node.children.length > 0 && rect.header > 0;
    const dimmed = plan.hasSelection && node.selectedWeight === 0;
    const parent = node.parentId ? nodeById.get(node.parentId) : undefined;
    const share = parent ? percent(node.weight, parent.weight) : "";
    const highlight =
      node.selected || focused === node.id || hovered === node.id;
    const ink = isParent ? "var(--foreground)" : textOn(node.color);
    const name = fit(node.label, w - 8);
    const value = formatShort(node.weight);
    const detail = firstFit([`${value} · ${share}`, share], w - 8);
    const headerText = isParent
      ? firstFit(
          [
            `${node.label}  ${value} · ${share}`,
            `${node.label}  ${share}`,
            node.label,
          ],
          w - 8
        ) || name
      : "";
    return (
      <g key={node.id} data-plan-id={node.id}>
        <rect
          ref={(element) => {
            if (element) refs.current.set(node.id, element);
            else refs.current.delete(node.id);
          }}
          x={rect.x0}
          y={rect.y0}
          width={Math.max(0, w)}
          height={Math.max(0, h)}
          fill={node.color}
          fillOpacity={isParent ? (dimmed ? 0.06 : 0.16) : dimmed ? 0.25 : 0.88}
          stroke={highlight ? "var(--foreground)" : "var(--background)"}
          strokeWidth={node.selected ? 2 : 1}
          strokeDasharray={
            focused === node.id && !node.selected ? "3 2" : undefined
          }
          className="cursor-pointer outline-none"
          role="button"
          tabIndex={node.id === tabStop ? 0 : -1}
          aria-label={`${pathLabel(plan, node)}: ${format(node.weight)} ${unitFor(plan, node.weight)}${parent ? `, ${share} of ${parent.depth ? parent.label : "all"}` : ""}`}
          aria-pressed={node.selected}
          onPointerEnter={() => setHovered(node.id)}
          onPointerLeave={() =>
            setHovered((id) => (id === node.id ? null : id))
          }
          onFocus={() => setFocused(node.id)}
          onBlur={() => setHovered((id) => (id === node.id ? null : id))}
          onClick={(event) => onMarkClick(event, node)}
          onKeyDown={(event) => handleKey(event, node)}
        />
        {isParent && headerText && (
          <text
            x={rect.x0 + 4}
            y={rect.y0 + rect.header / 2 + 0.5}
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
            fill={ink}
            opacity={dimmed ? 0.55 : 1}
            pointerEvents="none"
            aria-hidden="true"
          >
            {headerText}
          </text>
        )}
        {!isParent && node.children.length === 0 && h >= 16 && name && (
          <text
            x={rect.x0 + 4}
            y={rect.y0 + 4}
            fontSize={11}
            fill={dimmed ? "var(--foreground)" : ink}
            opacity={dimmed ? 0.6 : 1}
            pointerEvents="none"
            aria-hidden="true"
          >
            <tspan x={rect.x0 + 4} dy="0.9em" fontWeight={600}>
              {name}
            </tspan>
            {h >= 30 && detail && (
              <tspan x={rect.x0 + 4} dy="1.3em" opacity={0.85}>
                {detail}
              </tspan>
            )}
          </text>
        )}
      </g>
    );
  };

  return (
    <div
      className="relative select-none"
      style={{ width, height }}
      onPointerLeave={() => setHovered(null)}
    >
      <svg
        width={width}
        height={height - STATUS_LINE_HEIGHT}
        className="block"
        onClick={(event) => {
          // A click outside every box clears the selection.
          if (
            !event.altKey &&
            settings.filters.length > 0 &&
            isEmptyPlotTarget(event.target)
          )
            updateChart(settings.id, { filters: [] });
        }}
      >
        <rect
          width={width}
          height={Math.max(0, height - STATUS_LINE_HEIGHT)}
          fill="transparent"
        />
        <g
          transform={`translate(${margin.left},${plotTop})`}
          role="group"
          aria-label={`${plan.levelLabels.join(" › ")} as a treemap`}
        >
          {rects.map(renderRect)}
        </g>
      </svg>
      {crumbHeight > 0 && (
        <nav
          aria-label="Zoom path"
          className="absolute flex min-w-0 items-center gap-0.5 overflow-hidden whitespace-nowrap text-xs"
          style={{
            left: margin.left,
            right: margin.right,
            top: margin.top,
            height: crumbHeight,
          }}
        >
          {[plan.root, ...resolution.trail].map((node, index, all) => {
            const current = index === all.length - 1;
            return (
              <span key={node.id} className="flex min-w-0 items-center gap-0.5">
                {index > 0 && (
                  <span aria-hidden="true" className="text-muted-foreground">
                    ›
                  </span>
                )}
                {current ? (
                  <span
                    aria-current="location"
                    className="truncate px-1.5 font-semibold text-foreground"
                  >
                    {node.label}
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 min-w-0 truncate px-1.5 text-xs font-medium"
                    onClick={() => zoomTo(node.path)}
                  >
                    {node.label}
                  </Button>
                )}
              </span>
            );
          })}
          {resolution.missing.map((label, index) => (
            <span
              key={`missing-${index}`}
              className="flex items-center gap-0.5 text-muted-foreground"
            >
              <span aria-hidden="true">›</span>
              <span className="truncate px-1.5 italic">{label} · no rows</span>
            </span>
          ))}
          <span className="ml-1 shrink-0 tabular-nums text-muted-foreground">
            {format(focusNode.weight)}
            {focusNode.depth > 0 &&
              ` · ${percent(focusNode.weight, plan.root.weight)} of all`}
          </span>
        </nav>
      )}
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={margin.left}
        right={margin.right}
        bottom={2}
      />
      {hoveredNode && hoveredNode.depth > 0 && (
        <Readout
          plan={plan}
          node={hoveredNode}
          parent={hoveredParent ?? plan.root}
          focus={focusNode}
          format={format}
        />
      )}
    </div>
  );
}
