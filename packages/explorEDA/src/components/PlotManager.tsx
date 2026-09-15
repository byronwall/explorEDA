import { Button } from "@/components/ui/button";
import { ColorScaleManager } from "./ColorScaleManager";
import { ChartCreationButtons } from "./plot/ChartCreationButtons";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartLayout } from "@/types/ChartTypes";
import { saveRawDataToClipboard, saveToClipboard } from "@/utils/saveDataUtils";
import {
  Calculator,
  Copy,
  FilterX,
  Grid,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChartGridLayout } from "./ChartGridLayout";
import { PlotChartPanel } from "./PlotChartPanel";
import { CalculationManager } from "./calculations/CalculationManager";
import { GridSettingsPanel } from "./settings/GridSettingsPanel";
import { useAlertStore } from "@/stores/alertStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
  const charts = useDataLayer((state) => state.charts);
  const addChart = useDataLayer((state) => state.addChart);
  const removeChart = useDataLayer((state) => state.removeChart);
  const removeAllCharts = useDataLayer((state) => state.removeAllCharts);
  const clearAllFilters = useDataLayer((state) => state.clearAllFilters);
  const gridSettings = useDataLayer((state) => state.gridSettings);
  const saveToStructure = useDataLayer((state) => state.saveToStructure);
  const data = useDataLayer((state) => state.data);
  const showAlert = useAlertStore((state) => state.showAlert);

  const [activeTab, setActiveTab] = useState("charts");

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

  const chartGridSettings = {
    ...gridSettings,
    columnCount:
      containerWidth > 0 && containerWidth < 640 ? 1 : gridSettings.columnCount,
  };

  const copyChartsToClipboard = async () => {
    if (charts.length === 0) {
      toast("No charts to copy");
      return;
    }

    try {
      const savedData = saveToStructure();
      await saveToClipboard(savedData);

      toast("Configuration saved to clipboard");
    } catch {
      toast.error("Failed to copy configuration to clipboard");
    }
  };

  const copyDataToClipboard = async () => {
    if (!data || data.length === 0) {
      toast("No data to copy");
      return;
    }

    try {
      await saveRawDataToClipboard(data);

      toast("Data saved to clipboard");
    } catch {
      toast.error("Failed to copy data to clipboard");
    }
  };

  const handleRemoveAllCharts = async () => {
    const confirmed = await showAlert(
      "Remove All Charts",
      "Are you sure you want to remove all charts? This action cannot be undone."
    );

    if (confirmed) {
      removeAllCharts();
      toast("All charts have been removed");
    }
  };

  return (
    <div className="w-full min-w-0 overflow-x-clip pb-40" ref={containerRef}>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
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
          <ChartCreationButtons />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {charts.length > 0 && activeTab === "charts" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                title="Clear All Filters"
                aria-label="Clear all filters"
              >
                <FilterX className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    title="More chart actions"
                    aria-label="More chart actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={copyChartsToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Charts
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={copyDataToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Data
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleRemoveAllCharts}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <X className="h-4 w-4" />
                    Remove All Charts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          {containerWidth > 0 && (
            <ChartGridLayout charts={charts} containerWidth={containerWidth}>
              {charts.map((chart) => {
                if (!chart.layout) {
                  return null;
                }
                const size = gridToPixels(
                  chart.layout,
                  containerWidth,
                  chartGridSettings
                );
                return (
                  <div key={chart.id}>
                    <PlotChartPanel
                      settings={chart}
                      onDelete={() => removeChart(chart)}
                      onDuplicate={() => {
                        const chartWithoutId = Object.fromEntries(
                          Object.entries(chart).filter(([key]) => key !== "id")
                        ) as Omit<typeof chart, "id">;
                        addChart(chartWithoutId);
                      }}
                      width={size.width}
                      height={size.height}
                    />
                  </div>
                );
              })}
            </ChartGridLayout>
          )}
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
}
