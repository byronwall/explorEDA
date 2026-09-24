import { ReactNode, useId, useRef, useState } from "react";
import { ScaleBand, ScaleLinear, scaleLinear } from "d3-scale";
import { formatTick, XAxis, YAxis } from "./Axis/Axis";
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

export type ChartGuide = {
  id: string;
  axis: "x" | "y";
  role: "grid" | "tick" | "tick-text" | "axis" | "label" | "zero" | "bar";
  value?: number | string;
  label?: string;
  start?: number;
  end?: number;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
};

interface BaseChartProps {
  width: number;
  height: number;
  xScale: ScaleLinear<number, number> | ScaleBand<string>;
  yScale: ScaleLinear<number, number> | ScaleBand<string>;
  brushingMode?: BrushMode;
  onBrushChange?: (extent: [[number, number], [number, number]] | null) => void;
  children: ReactNode;
  overlay?: ReactNode;
  className?: string;
  settings: ChartSettings;
  axisFields?: { x?: string; y?: string };
  xTickFormatter?: (value: string | number) => string;
  yTickFormatter?: (value: string | number) => string;
  onInspectGuide?: (guide: ChartGuide, anchor?: DOMRect) => void;
  onHoverGuide?: (guide: ChartGuide | null) => void;
  onInspectPlot?: (point: [number, number], anchor: DOMRect) => boolean;
}

function guideFromTarget(target: EventTarget | null): ChartGuide | undefined {
  if (!(target instanceof Element)) return undefined;
  const element = target.closest<SVGElement>("[data-guide-id]");
  if (!element) return undefined;
  const numberValue = element.getAttribute("data-guide-value");
  const numberAttribute = (name: string) => {
    const value = element.getAttribute(name);
    return value === null ? undefined : Number(value);
  };
  return {
    id: element.getAttribute("data-guide-id") ?? "guide",
    axis: (element.getAttribute("data-guide-axis") as "x" | "y") ?? "x",
    role:
      (element.getAttribute("data-guide-role") as ChartGuide["role"]) ?? "axis",
    value:
      numberValue === null
        ? undefined
        : Number.isNaN(Number(numberValue))
          ? numberValue
          : Number(numberValue),
    label: element.getAttribute("data-guide-label") ?? undefined,
    start: numberAttribute("data-guide-start"),
    end: numberAttribute("data-guide-end"),
    x: numberAttribute("data-guide-x") ?? numberAttribute("x"),
    y: numberAttribute("data-guide-y") ?? numberAttribute("y"),
    x1: numberAttribute("x1"),
    y1: numberAttribute("y1"),
    x2: numberAttribute("x2"),
    y2: numberAttribute("y2"),
  };
}

export function BaseChart({
  width,
  height,
  xScale,
  yScale,
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
  onHoverGuide,
  onInspectPlot,
}: BaseChartProps) {
  const margin = settings.margin;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svgRef = useRef<SVGSVGElement>(null);
  const [altPointer, setAltPointer] = useState(false);
  const [altHover, setAltHover] = useState(false);
  const chartId = useId();
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  void fieldSettings;
  const axisFields = axisFieldsOverride ?? getChartAxisFields(settings);
  const formatAxisValue = (
    field: string | undefined,
    override?: (value: string | number) => string
  ) =>
    override ??
    (field && formatFieldValue
      ? (value: string | number) => formatFieldValue(field, value)
      : formatTick);
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

  const inspectTarget = (event: {
    altKey: boolean;
    target: EventTarget | null;
  }) => {
    if (!event.altKey || !onInspectGuide) return false;
    const guide = guideFromTarget(event.target);
    if (!guide) return false;
    if (guide.role === "bar") return false;
    const element = (event.target as Element).closest<SVGElement>(
      "[data-guide-id]"
    );
    onInspectGuide(guide, element?.getBoundingClientRect());
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
        const guide = guideFromTarget(event.target);
        onHoverGuide?.(null);
        setAltHover(false);
        if (guide && guide.role !== "bar" && onInspectGuide) {
          // Guide clicks inspect or select the guide. They never start a brush.
          if (!event.altKey) event.preventDefault();
          else setAltPointer(true);
          return;
        }
        // Alt-click is inspection. Do not start a brush gesture that can clear or replace filters.
        if (onInspectGuide && event.altKey) {
          setAltPointer(true);
          return;
        }
        brush.handlePointerDown(event);
      }}
      onPointerMoveCapture={(event) => {
        brush.handlePointerMove(event);
        const guide = guideFromTarget(event.target);
        onHoverGuide?.(guide ?? null);
        setAltHover(Boolean(event.altKey && guide));
      }}
      onPointerUpCapture={brush.handlePointerUp}
      onPointerCancel={() => {
        setAltPointer(false);
        setAltHover(false);
        onHoverGuide?.(null);
        brush.cancel();
      }}
      onLostPointerCapture={() => {
        setAltPointer(false);
        setAltHover(false);
        onHoverGuide?.(null);
        brush.cancel();
      }}
      onPointerLeave={() => {
        setAltHover(false);
        onHoverGuide?.(null);
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
        <g className="stroke-border" opacity={0.55} pointerEvents="none">
          {settings.xAxis?.grid &&
            "ticks" in xScale &&
            xScale
              .ticks(
                Math.min(
                  settings.xGridLines || 5,
                  Math.max(2, Math.floor(innerWidth / 70))
                )
              )
              .map((tick) => (
                <g key={`x-group${tick}`}>
                  <line
                    key={`x${tick}`}
                    x1={xScale(tick)}
                    x2={xScale(tick)}
                    y2={innerHeight}
                  />
                  {onInspectGuide && (
                    <line
                      key={`x-hit${tick}`}
                      data-guide-id={`x-grid:${tick}`}
                      data-guide-axis="x"
                      data-guide-role="grid"
                      data-guide-value={tick}
                      data-guide-x={xScale(tick)}
                      data-guide-y={0}
                      className="chart-guide-hit"
                      x1={xScale(tick)}
                      x2={xScale(tick)}
                      y2={innerHeight}
                      stroke="transparent"
                      strokeWidth={10}
                      pointerEvents="stroke"
                      tabIndex={0}
                      role="button"
                      aria-label={`Horizontal grid line ${tick}`}
                      aria-description="Alt+Enter to inspect"
                    />
                  )}
                </g>
              ))}
          {settings.yAxis?.grid &&
            "ticks" in yScale &&
            yScale.ticks(settings.yGridLines || 5).map((tick) => (
              <g key={`y-group${tick}`}>
                <line
                  key={`y${tick}`}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  x2={innerWidth}
                />
                {onInspectGuide && (
                  <line
                    key={`y-hit${tick}`}
                    data-guide-id={`y-grid:${tick}`}
                    data-guide-axis="y"
                    data-guide-role="grid"
                    data-guide-value={tick}
                    data-guide-x={0}
                    data-guide-y={yScale(tick)}
                    className="chart-guide-hit"
                    y1={yScale(tick)}
                    y2={yScale(tick)}
                    x2={innerWidth}
                    stroke="transparent"
                    strokeWidth={10}
                    pointerEvents="stroke"
                    tabIndex={0}
                    role="button"
                    aria-label={`Vertical grid line ${tick}`}
                    aria-description="Alt+Enter to inspect"
                  />
                )}
              </g>
            ))}
        </g>
        {/* Main content */}
        <g clipPath={`url(#${chartId}-plot)`}>{children}</g>

        {/* Brush overlay */}
        <g
          clipPath={`url(#${chartId}-plot)`}
          style={{ pointerEvents: altPointer ? "none" : undefined }}
        >
          {brush.renderBrush}
        </g>

        {/* Axes */}
        <XAxis
          scale={xScale}
          transform={`translate(0,${innerHeight})`}
          axisLabel={[
            getChartAxisLabel(axisFields.x, settings.xAxisLabel, getFieldLabel),
            settings.xAxis.scaleType === "symlog" && "symlog",
          ]
            .filter(Boolean)
            .join(" · ")}
          tickCount={settings.xGridLines}
          labelOffset={Math.max(32, margin.bottom - 8)}
          tickFormatter={formatAxisValue(axisFields.x, xTickFormatter)}
          onInspectGuide={onInspectGuide}
        />
        <YAxis
          scale={yScale}
          transform="translate(0,0)"
          axisLabel={[
            getChartAxisLabel(axisFields.y, settings.yAxisLabel, getFieldLabel),
            settings.yAxis.scaleType === "symlog" && "symlog",
          ]
            .filter(Boolean)
            .join(" · ")}
          tickCount={settings.yGridLines}
          labelOffset={margin.left - 12}
          tickFormatter={formatAxisValue(axisFields.y, yTickFormatter)}
          onInspectGuide={onInspectGuide}
        />
        {overlay}
      </g>
    </svg>
  );
}
