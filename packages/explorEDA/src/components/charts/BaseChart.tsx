import { ReactNode, useId, useRef } from "react";
import { ScaleBand, ScaleLinear, scaleLinear } from "d3-scale";
import { XAxis, YAxis } from "./Axis/Axis";
import { useBrush } from "@/hooks/useBrush";
import { cn } from "@/lib/utils";
import { ChartSettings } from "@/types/ChartTypes";
import { useFilterExtent } from "@/hooks/useFilterExtent";

type BrushMode = "horizontal" | "2d" | "none";

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
}: BaseChartProps) {
  const margin = settings.margin;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svgRef = useRef<SVGSVGElement>(null);
  const chartId = useId();
  const titleId = `${chartId}-title`;
  const descriptionId = `${chartId}-description`;
  const chartTitle = settings.title || "Chart";
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

  const brush = useBrush({
    svgRef,
    marginLeft: margin.left,
    marginTop: margin.top,
    innerWidth,
    innerHeight,
    mode: brushingMode as "horizontal" | "2d" | "none",
    onBrushChange,
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
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn("select-none", className)}
      style={{
        cursor: brush.getCursor(),
        touchAction: brushingMode === "none" ? "auto" : "none",
      }}
      tabIndex={brushingMode === "none" ? undefined : 0}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          brush.clear();
        }
      }}
      onPointerDownCapture={brush.handlePointerDown}
      onPointerMoveCapture={brush.handlePointerMove}
      onPointerUpCapture={brush.handlePointerUp}
      onPointerCancel={brush.cancel}
      onLostPointerCapture={brush.cancel}
    >
      <title id={titleId}>{chartTitle}</title>
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
                <line
                  key={`x${tick}`}
                  x1={xScale(tick)}
                  x2={xScale(tick)}
                  y2={innerHeight}
                />
              ))}
          {settings.yAxis?.grid &&
            "ticks" in yScale &&
            yScale
              .ticks(settings.yGridLines || 5)
              .map((tick) => (
                <line
                  key={`y${tick}`}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  x2={innerWidth}
                />
              ))}
        </g>
        {/* Main content */}
        <g clipPath={`url(#${chartId}-plot)`}>{children}</g>

        {/* Brush overlay */}
        <g clipPath={`url(#${chartId}-plot)`}>{brush.renderBrush}</g>

        {/* Axes */}
        <XAxis
          scale={xScale}
          transform={`translate(0,${innerHeight})`}
          axisLabel={[
            settings.xAxisLabel,
            settings.xAxis.scaleType === "symlog" && "symlog",
          ]
            .filter(Boolean)
            .join(" · ")}
          tickCount={settings.xGridLines}
          labelOffset={Math.max(32, margin.bottom - 8)}
        />
        <YAxis
          scale={yScale}
          transform="translate(0,0)"
          axisLabel={[
            settings.yAxisLabel,
            settings.yAxis.scaleType === "symlog" && "symlog",
          ]
            .filter(Boolean)
            .join(" · ")}
          tickCount={settings.yGridLines}
          labelOffset={margin.left - 12}
        />
        {overlay}
      </g>
    </svg>
  );
}
