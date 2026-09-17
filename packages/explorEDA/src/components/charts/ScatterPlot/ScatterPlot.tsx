import { numericScale } from "../Axis/numericScale";
import { AxisReadout } from "../Axis/AxisReadout";
import { applyFilter } from "@/hooks/applyFilter";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useFacetAxis } from "@/providers/FacetAxisProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { ScaleLinear, scaleLinear } from "d3-scale";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BaseChart } from "../BaseChart";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData } from "../useGetLiveData";
import { ScatterPlotSettings } from "./definition";

// Configurable constant for axis buffer (10%)
const AXIS_BUFFER_PERCENTAGE = 0.1;

interface ScatterPlotProps extends BaseChartProps {
  settings: ScatterPlotSettings;
}

export function ScatterPlot({
  settings,
  width,
  height,
  facetIds,
}: ScatterPlotProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateChart = useDataLayer((s) => s.updateChart);
  const { getColorForValue } = useColorScales();
  const registerAxisLimits = useFacetAxis((s) => s.registerAxisLimits);
  const getGlobalAxisLimits = useFacetAxis((s) => s.getGlobalAxisLimits);

  // Get all data for axis limits calculation (not filtered by current selections)
  const allXData = useGetColumnDataForIds(settings.xField, facetIds);
  const allYData = useGetColumnDataForIds(settings.yField, facetIds);

  // Get filtered data for rendering
  const xData = useGetLiveData(settings, settings.xField, facetIds);
  const yData = useGetLiveData(settings, settings.yField, facetIds);
  const colorData = useGetLiveData(settings, settings.colorField, facetIds);

  // Convert object to array and map to numbers
  const xValues = xData.map((value) =>
    value == null || value === "" ? NaN : Number(value)
  );
  const yValues = yData.map((value) =>
    value == null || value === "" ? NaN : Number(value)
  );

  // Calculate data bounds from ALL data (not just filtered data)
  const xMin = Math.min(
    ...allXData
      .filter(
        (value) =>
          value != null && value !== "" && Number.isFinite(Number(value))
      )
      .map(Number)
  );
  const xMax = Math.max(
    ...allXData
      .filter(
        (value) =>
          value != null && value !== "" && Number.isFinite(Number(value))
      )
      .map(Number)
  );
  const yMin = Math.min(
    ...allYData
      .filter(
        (value) =>
          value != null && value !== "" && Number.isFinite(Number(value))
      )
      .map(Number)
  );
  const yMax = Math.max(
    ...allYData
      .filter(
        (value) =>
          value != null && value !== "" && Number.isFinite(Number(value))
      )
      .map(Number)
  );

  // Calculate buffered bounds for scales
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const xBuffer = xRange * AXIS_BUFFER_PERCENTAGE;
  const yBuffer = yRange * AXIS_BUFFER_PERCENTAGE;

  const bufferedXMin = xMin - xBuffer;
  const bufferedXMax = xMax + xBuffer;
  const bufferedYMin = yMin - yBuffer;
  const bufferedYMax = yMax + yBuffer;

  // Register axis limits with the facet context if in a facet using requestAnimationFrame
  useEffect(() => {
    if (facetIds && allXData.length > 0) {
      // Register x-axis limits
      registerAxisLimits(settings.id, "x", {
        type: "numerical",
        min: xMin,
        max: xMax,
      });

      // Register y-axis limits
      registerAxisLimits(settings.id, "y", {
        type: "numerical",
        min: yMin,
        max: yMax,
      });
    }
  }, [
    settings.id,
    facetIds,
    allXData,
    allYData,
    xMin,
    xMax,
    yMin,
    yMax,
    registerAxisLimits,
  ]);

  // Get global axis limits if in a facet
  const globalXLimits = facetIds ? getGlobalAxisLimits("x") : null;
  const globalYLimits = facetIds ? getGlobalAxisLimits("y") : null;
  const yDomain: [number, number] =
    globalYLimits && globalYLimits.type === "numerical" && facetIds
      ? (() => {
          const globalRange = globalYLimits.max - globalYLimits.min;
          const globalBuffer = globalRange * AXIS_BUFFER_PERCENTAGE;
          return [
            globalYLimits.min - globalBuffer,
            globalYLimits.max + globalBuffer,
          ];
        })()
      : [bufferedYMin, bufferedYMax];
  const requestedLabelMargin = Math.max(
    settings.margin.left,
    ...scaleLinear()
      .domain(yDomain)
      .ticks(5)
      .map((tick) => String(tick).length * 7 + (settings.yAxisLabel ? 38 : 18))
  );
  const minPlotWidth = Math.min(
    80,
    Math.max(0, width - settings.margin.left - settings.margin.right)
  );
  const maxLabelMargin = Math.max(
    0,
    width - settings.margin.right - minPlotWidth
  );
  const margin = {
    ...settings.margin,
    left: Math.min(requestedLabelMargin, maxLabelMargin),
    bottom: Math.max(settings.margin.bottom, settings.xAxisLabel ? 46 : 28),
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create scales for BaseChart with synchronized limits if in a facet
  const xScale = useMemo(() => {
    if (globalXLimits && globalXLimits.type === "numerical" && facetIds) {
      // Apply buffer to global limits
      const globalRange = globalXLimits.max - globalXLimits.min;
      const globalBuffer = globalRange * AXIS_BUFFER_PERCENTAGE;

      return numericScale(settings.xAxis)
        .domain([
          globalXLimits.min - globalBuffer,
          globalXLimits.max + globalBuffer,
        ])
        .range([0, innerWidth]);
    }

    return numericScale(settings.xAxis)
      .domain([
        settings.xAxis.scaleType === "symlog" ? xMin : bufferedXMin,
        bufferedXMax,
      ])
      .range([0, innerWidth]);
  }, [
    settings.xAxis,
    xMin,
    bufferedXMin,
    bufferedXMax,
    width,
    globalXLimits,
    facetIds,
    innerWidth,
  ]) as ScaleLinear<number, number>;

  const yScale = useMemo(() => {
    return numericScale(settings.yAxis)
      .domain(
        settings.yAxis.scaleType === "symlog" ? [yMin, yDomain[1]] : yDomain
      )
      .range([innerHeight, 0]);
  }, [innerHeight, yDomain, yMin, settings.yAxis]) as ScaleLinear<
    number,
    number
  >;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || xValues.length === 0) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Use provided width and height instead of getBoundingClientRect
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas using provided dimensions
    ctx.clearRect(0, 0, width, height);

    // Draw points using the same scales as BaseChart
    ctx.translate(margin.left, margin.top);
    ctx.beginPath();
    ctx.rect(0, 0, innerWidth, innerHeight);
    ctx.clip();

    const xFilter = getRangeFilterForField(settings.filters, settings.xField);
    const yFilter = getRangeFilterForField(settings.filters, settings.yField);

    for (let i = 0; i < xValues.length; i++) {
      const xValue = xValues[i];
      const yValue = yValues[i];
      if (
        xValue === undefined ||
        yValue === undefined ||
        !Number.isFinite(xValue) ||
        !Number.isFinite(yValue)
      ) {
        continue;
      }
      const x = xScale(xValue);
      const y = yScale(yValue);

      const isFiltered =
        (!xFilter || applyFilter(xValue, xFilter)) &&
        (!yFilter || applyFilter(yValue, yFilter));

      ctx.fillStyle =
        (xFilter || yFilter) && !isFiltered
          ? "rgb(156 163 175)" // gray-400 for filtered out points
          : getColorForValue(settings.colorScaleId, colorData[i], "#3479a8");

      ctx.beginPath();
      ctx.globalAlpha = isFiltered ? (settings.pointOpacity ?? 0.7) : 0.15;
      ctx.arc(x, y, settings.pointSize ?? 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [
    xValues,
    yValues,
    settings.pointSize,
    settings.pointOpacity,
    settings.xField,
    settings.yField,
    settings.filters,
    settings.colorScaleId,
    width,
    height,
    xScale,
    yScale,
    getColorForValue,
    colorData,
    innerHeight,
    innerWidth,
    margin.left,
    margin.top,
  ]);

  const handleBrushChange = useCallback(
    (extent: [[number, number], [number, number]] | null) => {
      if (!extent) {
        updateChart(settings.id, {
          filters: settings.filters.filter(
            (f) => f.field !== settings.xField && f.field !== settings.yField
          ),
        });
        return;
      }

      const [[x0, y0], [x1, y1]] = extent;

      // Convert pixel coordinates back to data values
      const xStart = xScale.invert(x0);
      const xEnd = xScale.invert(x1);
      const yStart = yScale.invert(y0);
      const yEnd = yScale.invert(y1);

      // Create new filters array with updated x and y filters
      const newFilters = settings.filters.filter(
        (f) => f.field !== settings.xField && f.field !== settings.yField
      );

      // Add x filter
      newFilters.push({
        type: "range",
        field: settings.xField,
        min: Math.min(xStart, xEnd),
        max: Math.max(xStart, xEnd),
      });

      // Add y filter
      newFilters.push({
        type: "range",
        field: settings.yField,
        min: Math.min(yStart, yEnd),
        max: Math.max(yStart, yEnd),
      });

      updateChart(settings.id, {
        filters: newFilters,
      });
    },
    [
      settings.id,
      settings.xField,
      settings.yField,
      settings.filters,
      updateChart,
      xScale,
      yScale,
    ]
  );

  return (
    <div
      style={{ width, height }}
      className="relative"
      onPointerLeave={() => setHovered(null)}
      onPointerDownCapture={() => setHovered(null)}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") setHovered(null);
      }}
      onPointerMove={(event) => {
        if (event.buttons) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const px = event.clientX - bounds.left - margin.left,
          py = event.clientY - bounds.top - margin.top;
        if (px < 0 || px > innerWidth || py < 0 || py > innerHeight) {
          setHovered(null);
          return;
        }
        let nearest: number | null = null,
          distance = 100;
        // ponytail: linear hit testing; use a spatial index if very large point clouds need hover.
        for (let i = 0; i < xValues.length; i++) {
          const dx = xScale(xValues[i]!) - px,
            dy = yScale(yValues[i]!) - py;
          const d = dx * dx + dy * dy;
          if (d < distance) {
            nearest = i;
            distance = d;
          }
        }
        setHovered(nearest);
      }}
    >
      {xValues.length > 0 ? (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width, height }}
          />
          <BaseChart
            width={width}
            height={height}
            xScale={xScale}
            yScale={yScale}
            brushingMode="2d"
            onBrushChange={handleBrushChange}
            className="absolute"
            settings={{ ...settings, margin }}
            overlay={
              hovered !== null && (
                <AxisReadout
                  x={xScale(xValues[hovered]!)}
                  y={yScale(yValues[hovered]!)}
                  xValue={xValues[hovered]!}
                  yValue={yValues[hovered]!}
                  width={innerWidth}
                  height={innerHeight}
                  color={getColorForValue(
                    settings.colorScaleId,
                    colorData[hovered],
                    "#3479a8"
                  )}
                  radius={(settings.pointSize ?? 3) + 2}
                  label={`${String(colorData[hovered] ?? "Observation")}; ${settings.xAxisLabel || settings.xField}: ${xValues[hovered]}; ${settings.yAxisLabel || settings.yField}: ${yValues[hovered]}`}
                />
              )
            }
          >
            {null}
          </BaseChart>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
