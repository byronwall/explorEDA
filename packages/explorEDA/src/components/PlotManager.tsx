import { Button } from "@/components/ui/button";
import { ActionTooltip } from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ColorScaleManager } from "./ColorScaleManager";
import { ChartCreationButtons } from "./plot/ChartCreationButtons";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { RowsView } from "./RowsView";
import { ActiveFilterStatus } from "./ActiveFilterStatus";
import type { ChartLayout } from "@/types/ChartTypes";
import {
  parseSavedAnalysis,
  parseSavedData,
  saveAnalysisToClipboard,
  saveRawDataToClipboard,
  saveToClipboard,
} from "@/utils/saveDataUtils";
import { Calculator, Copy, Grid, MoreHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function focusChartInContainer(
  container: HTMLElement | null,
  id: string
) {
  const element = Array.from(
    container?.querySelectorAll<HTMLElement>("[data-chart-id]") ?? []
  ).find((candidate) => candidate.dataset.chartId === id);
  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "auto", block: "start" });
  element.focus({ preventScroll: true });
}

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
  const gridSettings = useDataLayer((state) => state.gridSettings);
  const saveToStructure = useDataLayer((state) => state.saveToStructure);
  const saveAnalysisToStructure = useDataLayer(
    (state) => state.saveAnalysisToStructure
  );
  const restoreFromStructure = useDataLayer(
    (state) => state.restoreFromStructure
  );
  const restoreAnalysisFromStructure = useDataLayer(
    (state) => state.restoreAnalysisFromStructure
  );
  const data = useDataLayer((state) => state.data);
  const showAlert = useAlertStore((state) => state.showAlert);

  const [activeTab, setActiveTab] = useState("charts");
  const [rowsToolbarTarget, setRowsToolbarTarget] =
    useState<HTMLDivElement | null>(null);
  const knownChartIds = useRef(new Set<string>());
  const [announcement, setAnnouncement] = useState("");
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonMode, setJsonMode] = useState<"settings" | "analysis">("settings");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

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
      containerWidth > 0 && containerWidth < 960 ? 1 : gridSettings.columnCount,
  };

  const focusChartElement = useCallback((id: string) => {
    requestAnimationFrame(() =>
      focusChartInContainer(containerRef.current, id)
    );
  }, []);

  useEffect(() => {
    if (knownChartIds.current.size === 0) {
      charts.forEach((chart) => knownChartIds.current.add(chart.id));
      return;
    }

    const addedChart = charts.find(
      (chart) => !knownChartIds.current.has(chart.id)
    );
    charts.forEach((chart) => knownChartIds.current.add(chart.id));
    if (!addedChart) {
      return;
    }

    const title = addedChart.title || "New chart";
    setAnnouncement(`${title} added`);
    setActiveTab("charts");
    requestAnimationFrame(() => focusChartElement(addedChart.id));
  }, [charts, focusChartElement]);

  const copyChartsToClipboard = async () => {
    try {
      const savedData = saveToStructure();
      await saveToClipboard(savedData);

      toast("Settings JSON copied to clipboard");
    } catch {
      toast.error("Failed to copy configuration to clipboard");
    }
  };

  const copyAnalysisToClipboard = async () => {
    try {
      await saveAnalysisToClipboard(saveAnalysisToStructure());
      toast("Full analysis JSON copied to clipboard");
    } catch {
      toast.error("Failed to copy analysis JSON to clipboard");
    }
  };

  const openJson = () => {
    try {
      if (jsonMode === "settings") {
        restoreFromStructure(parseSavedData(jsonText));
      } else {
        restoreAnalysisFromStructure(parseSavedAnalysis(jsonText));
      }
      setJsonDialogOpen(false);
      setJsonText("");
      setJsonError(null);
      toast("JSON opened");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      setJsonError(message);
      toast.error(message);
    }
  };

  const openJsonDialog = (mode: "settings" | "analysis") => {
    setJsonMode(mode);
    setJsonText("");
    setJsonError(null);
    setJsonDialogOpen(true);
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
    <div className="eda-workspace w-full min-w-0 pb-8" ref={containerRef}>
      <div className="eda-workspace-controls">
        <header className="eda-workspace-toolbar">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="shrink-0"
            >
              <TabsList>
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  Charts
                </TabsTrigger>
                <TabsTrigger value="rows" className="flex items-center gap-2">
                  Rows
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
            {activeTab === "charts" && <ChartCreationButtons />}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {activeTab === "rows" && <div ref={setRowsToolbarTarget} />}
            {(activeTab === "charts" || activeTab === "rows") && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Workspace actions"
                      tooltip="Workspace actions"
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
                      Copy settings JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        openJsonDialog("settings");
                      }}
                      className="flex items-center gap-2"
                    >
                      Open settings JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={copyAnalysisToClipboard}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy full analysis JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        openJsonDialog("analysis");
                      }}
                      className="flex items-center gap-2"
                    >
                      Open full analysis JSON
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
            {activeTab === "charts" && (
              <>
                <ColorScaleManager />
                <Popover>
                  <ActionTooltip content="Grid settings">
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Grid settings"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                  </ActionTooltip>
                  <PopoverContent
                    align="end"
                    aria-label="Grid settings"
                    className="w-72 space-y-4"
                  >
                    <h3 className="text-sm font-semibold">Grid settings</h3>
                    <GridSettingsPanel />
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>
        </header>
        <ActiveFilterStatus view={activeTab} />
      </div>

      <Dialog
        open={jsonDialogOpen}
        onOpenChange={(open) => {
          setJsonDialogOpen(open);
          if (open) setJsonError(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Open {jsonMode === "settings" ? "settings" : "full analysis"} JSON
            </DialogTitle>
            <DialogDescription>
              {jsonMode === "settings"
                ? "Paste settings JSON from this workspace. It restores against the current data."
                : "Paste a full analysis JSON export. It includes the source rows and restores them with the settings."}
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={jsonText}
            onChange={(event) => {
              setJsonText(event.target.value);
              setJsonError(null);
            }}
            aria-label="JSON to open"
            aria-describedby={jsonError ? "json-open-error" : undefined}
            className="min-h-64 w-full rounded-md border bg-background p-3 font-mono text-xs"
            placeholder="Paste JSON here"
          />
          {jsonError && (
            <p
              id="json-open-error"
              role="alert"
              aria-live="assertive"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive"
            >
              {jsonError}
            </p>
          )}
          <DialogFooter>
            <Button onClick={openJson} disabled={!jsonText.trim()}>
              Open JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="charts" className="mt-0">
          <h2 className="sr-only">Charts</h2>
          {charts.length === 0 ? (
            <Card>
              <CardContent className="space-y-2 pt-6">
                <h3 className="font-medium">No charts yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add a chart to begin exploring this data.
                </p>
              </CardContent>
            </Card>
          ) : (
            containerWidth > 0 && (
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
                    <div key={chart.id} data-chart-id={chart.id} tabIndex={-1}>
                      <PlotChartPanel
                        settings={chart}
                        onDelete={() => removeChart(chart)}
                        onDuplicate={() => {
                          const chartWithoutId = Object.fromEntries(
                            Object.entries(chart).filter(
                              ([key]) => key !== "id"
                            )
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
            )
          )}
        </TabsContent>
        <TabsContent
          forceMount
          value="rows"
          className="mt-0 data-[state=inactive]:hidden"
        >
          <h2 className="sr-only">Rows</h2>
          <RowsView
            width={containerWidth}
            active={activeTab === "rows"}
            toolbarTarget={rowsToolbarTarget}
          />
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
