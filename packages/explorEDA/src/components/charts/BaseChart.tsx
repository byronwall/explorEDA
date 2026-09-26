import { ReactNode, useId, useMemo, useRef, useState } from "react";
import { ScaleBand, ScaleLinear, scaleLinear } from "d3-scale";
import { formatTick } from "./Axis/Axis";
import { findAxisGuide, planAxes, type ChartAxesPlan } from "./Axis/axisPlan";
import { PlannedAxes, PlannedGrid } from "./Axis/AxisLayer";
import { useBrush } from "@/hooks/useBrush";
import { cn } from "@/lib/utils";
import { ChartSettings } from "@/types/ChartTypes";
import { useFilterExtent } from "@/hooks/useFilterExtent";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  getChartAxisFields,
  getChartAxisLabel,
  getChartTitle,
} from "./chartAccessibility";

type BrushMode = "horizontal" | "2d" | "none";

interface BaseChartProps {
  width: number;
  height: number;
  xScale: ScaleLinear<number, number> | ScaleBand<string>;
  yScale: ScaleLinear<number, number> | ScaleBand<string>;
  /** A chart that traces its guides passes its own plan so drawing and tracing agree. */
  axes?: ChartAxesPlan;
  brushingMode?: BrushMode;
  onBrushChange?: (extent: [[number, number], [number, number]] | null) => void;
  children: ReactNode;
  overlay?: ReactNode;
  className?: string;
  settings: ChartSettings;
  axisFields?: { x?: string; y?: string };
  xTickFormatter?: (value: string | number) => string;
  yTickFormatter?: (value: string | number) => string;
  /** Receives the planned id of an Alt-clicked axis guide. */
  onInspectGuide?: (id: string) => void;
  /** Receives the planned id under the pointer, or null. */
  onHoverTarget?: (id: string | null) => void;
  onInspectPlot?: (point: [number, number], anchor: DOMRect) => boolean;
  activeGuideId?: string | null;
}

function planIdFromTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return undefined;
  return (
    target.closest<SVGElement>("[data-plan-id]")?.getAttribute("data-plan-id") ??
    undefined
  );
}

export function BaseChart({
  width,
  height,
  xScale,
  yScale,
  axes: plannedAxes,
  brushingMode = "none",
  onBrushChange,
  children,
  overlay,
  className,
  settings,
  axisFields: axisFieldsOverride,
  xTickFormatter,
  yTickFormatter,
  onInspectGuide,
  onHoverTarget,
  onInspectPlot,
  activeGuideId,
}: BaseChartProps) {
  const margin = plannedAxes?.margin ?? settings.margin;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svgRef = useRef<SVGSVGElement>(null);
  const [altPointer, setAltPointer] = useState(false);
  const [altHover, setAltHover] = useState(false);
  const chartId = useId();
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const axisFields = axisFieldsOverride ?? getChartAxisFields(settings);
  const formatAxisValue = (
    field: string | undefined,
    override?: (value: string | number) => string
  ) =>
    override ??
    (field && formatFieldValue
      ? (value: string | number) => formatFieldValue(field, value)
      : formatTick);
  const xLabel = [
    getChartAxisLabel(axisFields.x, settings.xAxisLabel, getFieldLabel),
    settings.xAxis.scaleType === "symlog" && "symlog",
  ]
    .filter(Boolean)
    .join(" · ");
  const yLabel = [
    getChartAxisLabel(axisFields.y, settings.yAxisLabel, getFieldLabel),
    settings.yAxis.scaleType === "symlog" && "symlog",
  ]
    .filter(Boolean)
    .join(" · ");
  // Charts without their own plan still draw from a plan, so axes follow one rule.
  const axes = useMemo(
    () =>
      plannedAxes ??
      planAxes({
        plotWidth: innerWidth,
        plotHeight: innerHeight,
        margin,
        x: {
          scale: xScale,
          scaleType: settings.xAxis.scaleType,
          field: axisFields.x,
          density: settings.xGridLines,
          grid: settings.xAxis?.grid,
          format: formatAxisValue(axisFields.x, xTickFormatter),
          label: xLabel,
          labelSource: settings.xAxisLabel ? "chart-setting" : "field-label",
        },
        y: {
          scale: yScale,
          scaleType: settings.yAxis.scaleType,
          field: axisFields.y,
          density: settings.yGridLines,
          grid: settings.yAxis?.grid,
          format: formatAxisValue(axisFields.y, yTickFormatter),
          label: yLabel,
          labelSource: settings.yAxisLabel ? "chart-setting" : "field-label",
        },
      }),
    // Formatters read field settings, so they rerun when those change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      plannedAxes,
      innerWidth,
      innerHeight,
      margin,
      xScale,
      yScale,
      settings.xAxis,
      settings.yAxis,
      settings.xGridLines,
      settings.yGridLines,
      settings.xAxisLabel,
      settings.yAxisLabel,
      axisFields.x,
      axisFields.y,
      xLabel,
      yLabel,
      xTickFormatter,
      yTickFormatter,
      fieldSettings,
    ]
  );
  const descriptionId = `${chartId}-description`;
  const inspectedByBrush = useRef(false);
  const chartTitle = getChartTitle(settings, getFieldLabel);
  const chartDescription = [
    `Interactive ${settings.type} chart.`,
    settings.xAxisLabel && `Horizontal axis: ${settings.xAxisLabel}.`,
    settings.yAxisLabel && `Vertical axis: ${settings.yAxisLabel}.`,
  ]
    .filter(Boolean)
    .join(" ");
  const xIsLinear = "invert" in xScale;
  const yIsLinear = "invert" in yScale;
  const extent = useFilterExtent({
    settings: xIsLinear && yIsLinear ? settings : { ...settings, filters: [] },
    xScale: xIsLinear
      ? xScale
      : scaleLinear().domain([0, 1]).range([0, innerWidth]),
    yScale: yIsLinear
      ? yScale
      : scaleLinear().domain([0, 1]).range([0, innerHeight]),
    innerHeight,
  });

  const guideAt = (target: EventTarget | null) => {
    const id = planIdFromTarget(target);
    return id && findAxisGuide(axes, id) ? id : undefined;
  };

  const inspectTarget = (event: {
    altKey: boolean;
    target: EventTarget | null;
  }) => {
    if (!event.altKey || !onInspectGuide) return false;
    const id = guideAt(event.target);
    if (!id) return false;
    onInspectGuide(id);
    return true;
  };

  const inspectPlot = (event: {
    altKey: boolean;
    clientX: number;
    clientY: number;
    currentTarget: SVGSVGElement;
  }) => {
    if (!event.altKey || !onInspectPlot) return false;
    const rect = event.currentTarget.getBoundingClientRect();
    const point: [number, number] = [
      event.clientX - rect.left - margin.left,
      event.clientY - rect.top - margin.top,
    ];
    if (
      point[0] < 0 ||
      point[0] > innerWidth ||
      point[1] < 0 ||
      point[1] > innerHeight
    ) {
      return false;
    }
    return onInspectPlot(
      point,
      new DOMRect(event.clientX, event.clientY, 0, 0)
    );
  };

  const brush = useBrush({
    svgRef,
    marginLeft: margin.left,
    marginTop: margin.top,
    innerWidth,
    innerHeight,
    mode: brushingMode as "horizontal" | "2d" | "none",
    onBrushChange,
    onPlotClick: (_, event) => {
      const handled = inspectTarget(event);
      inspectedByBrush.current = handled;
      return event.altKey || handled;
    },
    defaultExtent: extent,
  });

  if (width < 1 || height < 1) {
    return null;
  }

  const interactive = Boolean(onInspectGuide);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      role="group"
      aria-label={chartTitle}
      aria-describedby={descriptionId}
      className={cn("select-none", className)}
      style={{
        cursor: altHover ? "pointer" : brush.getCursor(),
        touchAction: brushingMode === "none" ? "auto" : "none",
      }}
      tabIndex={brushingMode === "none" ? undefined : 0}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          brush.clear();
        }
      }}
      onPointerDownCapture={(event) => {
        onHoverTarget?.(null);
        setAltHover(false);
        if (interactive && guideAt(event.target)) {
          // Guide clicks inspect or select the guide. They never start a brush.
          if (!event.altKey) event.preventDefault();
          else setAltPointer(true);
          return;
        }
        // Alt-click is inspection. Do not start a brush gesture that can clear or replace filters.
        if (interactive && event.altKey) {
          setAltPointer(true);
          return;
        }
        brush.handlePointerDown(event);
      }}
      onPointerMoveCapture={(event) => {
        brush.handlePointerMove(event);
        const id = planIdFromTarget(event.target);
        onHoverTarget?.(id ?? null);
        setAltHover(Boolean(event.altKey && interactive && id));
      }}
      onPointerUpCapture={brush.handlePointerUp}
      onPointerCancel={() => {
        setAltPointer(false);
        setAltHover(false);
        onHoverTarget?.(null);
        brush.cancel();
      }}
      onLostPointerCapture={() => {
        setAltPointer(false);
        setAltHover(false);
        onHoverTarget?.(null);
        brush.cancel();
      }}
      onPointerLeave={() => {
        setAltHover(false);
        onHoverTarget?.(null);
      }}
      onClick={(event) => {
        if (inspectedByBrush.current) inspectedByBrush.current = false;
        else if (!inspectTarget(event)) inspectPlot(event);
        setAltPointer(false);
      }}
      onKeyDownCapture={(event) => {
        if (event.altKey && event.key === "Enter" && inspectTarget(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      data-alt-hover={altHover ? "true" : undefined}
    >
      <desc id={descriptionId}>{chartDescription}</desc>
      <defs>
        <clipPath id={`${chartId}-plot`}>
          <rect
            x={0}
            y={0}
            width={Math.max(0, innerWidth)}
            height={Math.max(0, innerHeight)}
          />
        </clipPath>
      </defs>
      <g transform={`translate(${margin.left},${margin.top})`}>
        <PlannedGrid
          plan={axes}
          interactive={interactive}
          activeId={activeGuideId}
        />
        {/* Main content */}
        <g clipPath={`url(#${chartId}-plot)`}>{children}</g>

        {/* Brush overlay */}
        <g
          clipPath={`url(#${chartId}-plot)`}
          style={{ pointerEvents: altPointer ? "none" : undefined }}
        >
          {brush.renderBrush}
        </g>

        <PlannedAxes
          plan={axes}
          interactive={interactive}
          activeId={activeGuideId}
        />
        {overlay}
      </g>
    </svg>
  );
}
