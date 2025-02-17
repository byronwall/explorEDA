import { Button } from "@/components/ui/button";
import { useChartData } from "@/hooks/useChartData";
import { ChartSettings } from "@/types/ChartTypes";
import {
  BarChartHorizontal,
  BarChart as BarChartIcon,
  ScatterChart,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { PlotChartPanel } from "./PlotChartPanel";
import { ChartGridLayout } from "./ChartGridLayout";
import type { ChartLayout } from "@/types/ChartTypes";

// Add these constants at the top of the file, after imports
const GRID_ROW_HEIGHT = 150; // pixels per grid row
const GRID_COLS = 12; // number of grid columns
const CONTAINER_PADDING = 16; // padding around the container

// Add this conversion function
const gridToPixels = (layout: ChartLayout, containerWidth: number) => {
  const columnWidth = (containerWidth - CONTAINER_PADDING * 2) / GRID_COLS;
  return {
    width: layout.w * columnWidth,
    height: layout.h * GRID_ROW_HEIGHT,
  };
};

export function PlotManager() {
  const { getColumns } = useChartData();
  const [charts, setCharts] = useState<ChartSettings[]>([]);

  // Get column names
  const columns = getColumns();

  // Add ref and state for container dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Add useEffect to measure container
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const addRowChart = (field: string) => {
    const newChart: ChartSettings = {
      id: crypto.randomUUID(),
      type: "row",
      title: `Row Chart - ${field}`,
      field,
      layout: {
        x: (charts.length * 2) % 12,
        y: Math.floor(charts.length / 6) * 4,
        w: 6,
        h: 4,
        i: crypto.randomUUID(),
      },
    };
    setCharts([...charts, newChart]);
  };

  const addBarChart = (field: string) => {
    const newChart: ChartSettings = {
      id: crypto.randomUUID(),
      type: "bar",
      title: `Bar Chart - ${field}`,
      field,
      layout: {
        x: (charts.length * 2) % 12,
        y: Math.floor(charts.length / 6) * 4,
        w: 6,
        h: 4,
        i: crypto.randomUUID(),
      },
    };
    setCharts([...charts, newChart]);
  };

  const addScatterPlot = (xField: string) => {
    const newChart: ChartSettings = {
      id: crypto.randomUUID(),
      type: "scatter",
      title: `Scatter Plot - ${xField} vs Y`,
      field: xField,
      xField,
      yField: columns[0],
      layout: {
        x: (charts.length * 2) % 12,
        y: Math.floor(charts.length / 6) * 4,
        w: 6,
        h: 4,
        i: crypto.randomUUID(),
      },
    };
    setCharts([...charts, newChart]);
  };

  const deleteChart = (id: string) => {
    setCharts(charts.filter((chart) => chart.id !== id));
  };

  const handleSettingsChange = (id: string, settings: ChartSettings) => {
    setCharts(charts.map((chart) => (chart.id === id ? settings : chart)));
  };

  const duplicateChart = (id: string) => {
    const chart = charts.find((chart) => chart.id === id);
    if (chart) {
      setCharts([...charts, { ...chart, id: crypto.randomUUID() }]);
    }
  };

  const handleLayoutChange = (newLayout: ChartLayout[]) => {
    setCharts(
      charts.map((chart) => ({
        ...chart,
        layout: newLayout.find((l) => l.i === chart.layout?.i),
      }))
    );
  };

  return (
    <div className="w-full" ref={containerRef}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Available Fields</h2>
        <div className="flex flex-wrap gap-2">
          {columns.map((column) => (
            <div key={column} className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addRowChart(column)}
              >
                <BarChartHorizontal className="w-4 h-4 mr-1" />
                {column}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addBarChart(column)}
              >
                <BarChartIcon className="w-4 h-4 mr-1" />
                {column}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addScatterPlot(column)}
              >
                <ScatterChart className="w-4 h-4 mr-1" />
                {column}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <ChartGridLayout
        layout={charts.map((chart) => chart.layout!)}
        onLayoutChange={handleLayoutChange}
      >
        {charts.map((chart) => {
          const dimensions = gridToPixels(chart.layout!, containerWidth);
          return (
            <div key={chart.layout?.i}>
              <PlotChartPanel
                settings={chart}
                onDelete={() => deleteChart(chart.id)}
                onSettingsChange={(settings) =>
                  handleSettingsChange(chart.id, settings)
                }
                availableFields={columns}
                onDuplicate={() => duplicateChart(chart.id)}
                width={dimensions.width}
                height={dimensions.height}
              />
            </div>
          );
        })}
      </ChartGridLayout>
    </div>
  );
}
