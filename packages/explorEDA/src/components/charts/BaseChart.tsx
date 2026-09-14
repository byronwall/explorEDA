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
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn("select-none", className)}
      style={{ cursor: brush.getCursor() }}
      onMouseDownCapture={brush.handleMouseDown}
      onMouseMoveCapture={brush.handleMouseMove}
      onMouseUpCapture={brush.handleMouseUp}
      onMouseLeave={brush.handleMouseUp}
    >
      <title id={titleId}>{chartTitle}</title>
      <desc id={descriptionId}>{chartDescription}</desc>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Main content */}
        {children}

        {/* Brush overlay */}
        {brush.renderBrush}

        {/* Axes */}
        <XAxis
          scale={xScale}
          transform={`translate(0,${innerHeight})`}
          axisLabel={settings.xAxisLabel}
        />
        <YAxis
          scale={yScale}
          transform="translate(0,0)"
          axisLabel={settings.yAxisLabel}
        />
      </g>
    </svg>
  );
}
