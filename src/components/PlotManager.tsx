import { Button } from "@/components/ui/button";
import { ColorScaleManager } from "./ColorScaleManager";
import { MainLayout } from "./layout/MainLayout";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartLayout } from "@/types/ChartTypes";
import { Calculator, Copy, FilterX, X, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import { toast } from "sonner";
import { ChartGridLayout } from "./ChartGridLayout";
import { PlotChartPanel } from "./PlotChartPanel";
import { CalculationManager } from "./calculations/CalculationManager";
import { GridSettingsPanel } from "./settings/GridSettingsPanel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Grid } from "lucide-react";
import { saveToClipboard } from "@/utils/saveDataUtils";

// Add this conversion function
const gridToPixels = (
  layout: ChartLayout,
  containerWidth: number,
  gridSettings: {
    columnCount: number;
    containerPadding: number;
    rowHeight: number;
  }
) => {
  const columnWidth =
    (containerWidth - gridSettings.containerPadding * 2) /
    gridSettings.columnCount;

  // Ensure width doesn't exceed available space
  const maxColumns = Math.min(layout.w, gridSettings.columnCount);
  const width = maxColumns * columnWidth;

  return {
    width,
    height: layout.h * gridSettings.rowHeight,
  };
};

export function PlotManager() {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const charts = useDataLayer((state) => state.charts);
  const updateChart = useDataLayer((state) => state.updateChart);
  const addChart = useDataLayer((state) => state.addChart);
  const removeChart = useDataLayer((state) => state.removeChart);
  const removeAllCharts = useDataLayer((state) => state.removeAllCharts);
  const clearAllFilters = useDataLayer((state) => state.clearAllFilters);
  const gridSettings = useDataLayer((state) => state.gridSettings);
  const saveToStructure = useDataLayer((state) => state.saveToStructure);

  const [activeTab, setActiveTab] = useState("charts");
  const [isCopying, setIsCopying] = useState(false);

  // Get column names
  const columns = getColumnNames();

  // Add ref and state for container dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Add useEffect to measure container
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    charts.forEach((chart) => {
      const updatedLayout = newLayout.find((l) => l.i === chart.id);
      if (updatedLayout) {
        updateChart(chart.id, {
          layout: {
            x: updatedLayout.x,
            y: updatedLayout.y,
            w: updatedLayout.w,
            h: updatedLayout.h,
          },
        });
      }
    });
  };

  const copyChartsToClipboard = async () => {
    if (charts.length === 0) {
      toast("No charts to copy");
      return;
    }

    try {
      const savedData = saveToStructure();
      await saveToClipboard(savedData);

      // Set copying state to true to trigger animation
      setIsCopying(true);

      // Reset after animation duration
      setTimeout(() => {
        setIsCopying(false);
      }, 1500);

      toast("Configuration saved to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy configuration to clipboard");
    }
  };

  const mainContent = (
    <div className="w-full pb-40" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                Charts
              </TabsTrigger>
              <TabsTrigger
                value="calculations"
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Calculations
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          {charts.length > 0 && activeTab === "charts" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={copyChartsToClipboard}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  isCopying
                    ? "bg-green-100 text-green-700 border-green-300"
                    : ""
                }`}
                disabled={isCopying}
              >
                {isCopying ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Charts
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <FilterX className="h-4 w-4" />
                Clear All Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeAllCharts}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Remove All Charts
              </Button>
            </>
          )}
          <ColorScaleManager />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Grid className="h-4 w-4 mr-2" />
                Grid Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Grid Settings</DialogTitle>
                <DialogDescription>
                  Configure the grid layout settings for all charts
                </DialogDescription>
              </DialogHeader>
              <GridSettingsPanel />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="charts" className="mt-0">
          <ChartGridLayout
            charts={charts}
            onLayoutChange={handleLayoutChange}
            containerWidth={containerWidth}
          >
            {charts.map((chart) => {
              if (!chart.layout) {
                return null;
              }
              const size = gridToPixels(
                chart.layout,
                containerWidth,
                gridSettings
              );
              return (
                <div key={chart.id}>
                  <PlotChartPanel
                    settings={chart}
                    onDelete={() => removeChart(chart)}
                    availableFields={columns}
                    onDuplicate={() => {
                      const { id, ...chartWithoutId } = chart;
                      addChart(chartWithoutId);
                    }}
                    width={size.width}
                    height={size.height}
                  />
                </div>
              );
            })}
          </ChartGridLayout>
        </TabsContent>
        <TabsContent value="calculations" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <CalculationManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return <MainLayout>{mainContent}</MainLayout>;
}
