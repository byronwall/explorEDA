import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  WorkspaceSettingsDrawer,
  type WorkspaceSettingsTab,
} from "./WorkspaceSettingsDrawer";
import { ChartCreationButtons } from "./plot/ChartCreationButtons";

import { Card, CardContent } from "@/components/ui/card";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { RowsPeek } from "./RowsPeek";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { ActiveFilterStatus } from "./ActiveFilterStatus";
import type { ChartLayout } from "@/types/ChartTypes";
import {
  parseSavedAnalysis,
  parseSavedData,
  saveAnalysisToClipboard,
  saveRawDataToClipboard,
  saveToClipboard,
} from "@/utils/saveDataUtils";
import {
  Calculator,
  Copy,
  Grid,
  Keyboard,
  ListTree,
  MoreHorizontal,
  Palette,
  Rows3,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { ChartGridLayout } from "./ChartGridLayout";
import { FieldList } from "./FieldList/FieldList";
import { focusChartInContainer, highlightChartInContainer } from "./chartFocus";

export { focusChartInContainer };
import { PlotChartPanel } from "./PlotChartPanel";
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
  const calculationCount = useDataLayer((state) => state.calculations.length);
  const showAlert = useAlertStore((state) => state.showAlert);

  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const knownChartIds = useRef(new Set<string>());
  const [announcement, setAnnouncement] = useState("");
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonMode, setJsonMode] = useState<"settings" | "analysis">("settings");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Add ref and state for container dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const fieldsToggleRef = useRef<HTMLButtonElement>(null);
  const rowsToggleRef = useRef<HTMLButtonElement>(null);
  const fieldListId = useId();
  const rowsPeekId = useId();
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [fieldsOverview, setFieldsOverview] = useState(false);
  const [rowsOpen, setRowsOpenState] = useState(false);
  const [rowsNarrow, setRowsNarrow] = useState(false);
  const settingsDrawerId = useId();
  const settingsToggles = useRef<
    Partial<Record<WorkspaceSettingsTab, HTMLButtonElement | null>>
  >({});
  const [settingsTab, setSettingsTab] = useState<WorkspaceSettingsTab>();
  const [settingsWide, setSettingsWide] = useState(false);

  // Rows and workspace settings share the right edge, so one replaces the
  // other. Both cover the field list, which returns when they close.
  const setRowsOpen = useCallback((open: boolean) => {
    if (open) setSettingsTab(undefined);
    setRowsOpenState(open);
  }, []);
  const closeSettings = useCallback(() => {
    const drawer = document.getElementById(settingsDrawerId);
    const hadFocus = drawer?.contains(document.activeElement) ?? false;
    const toggle = settingsTab && settingsToggles.current[settingsTab];
    setSettingsTab(undefined);
    if (hadFocus) toggle?.focus({ preventScroll: true });
  }, [settingsDrawerId, settingsTab]);
  const toggleSettings = (tab: WorkspaceSettingsTab) => {
    if (settingsTab === tab) {
      closeSettings();
      return;
    }
    // The calculation list is a table, so it opens with room to read it.
    if (!settingsTab) {
      setSettingsWide(tab === "calculations" && calculationCount > 0);
    }
    setRowsOpenState(false);
    setSettingsTab(tab);
  };

  const [fieldsTipOpen, setFieldsTipOpen] = useState(false);
  const quietFieldsTip = useRef(false);

  const closeFields = useCallback(() => {
    const list = document.getElementById(fieldListId);
    const hadFocus = list?.contains(document.activeElement) ?? false;
    const toggle = fieldsToggleRef.current;
    setFieldsOpen(false);
    setFieldsOverview(false);
    setFieldsTipOpen(false);
    // Returning focus or a resting pointer must not pop the toggle's tooltip.
    quietFieldsTip.current = hadFocus || Boolean(toggle?.matches(":hover"));
    if (hadFocus) toggle?.focus({ preventScroll: true });
  }, [fieldListId]);

  const closeRows = useCallback(() => {
    const peek = document.getElementById(rowsPeekId);
    const hadFocus = peek?.contains(document.activeElement) ?? false;
    setRowsOpen(false);
    if (hadFocus) rowsToggleRef.current?.focus({ preventScroll: true });
  }, [rowsPeekId, setRowsOpen]);

  // Letter shortcuts respond unless the user is typing. With several
  // workspaces on a page, only the focused one responds.
  const acceptsShortcut = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.defaultPrevented
      ) {
        return false;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, [role='combobox']"))
      ) {
        return false;
      }
      const workspace = containerRef.current;
      const active = document.activeElement;
      if (
        active &&
        active !== document.body &&
        !workspace?.contains(active) &&
        !document.getElementById(fieldListId)?.contains(active)
      ) {
        const other = active.closest(".eda-workspace");
        if (other && other !== workspace) return false;
      }
      return true;
    },
    [fieldListId]
  );

  // R peeks at the live rows.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "r" ||
        event.shiftKey ||
        !acceptsShortcut(event) ||
        document.querySelector("[role='dialog']")
      ) {
        return;
      }
      event.preventDefault();
      if (rowsOpen) closeRows();
      else setRowsOpen(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [rowsOpen, closeRows, setRowsOpen, acceptsShortcut]);

  // ? opens the keyboard shortcuts.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "?" || !acceptsShortcut(event)) return;
      // The dialog itself sits outside the workspace; let it keep focus.
      if (document.querySelector("[role='dialog']")) return;
      event.preventDefault();
      setShortcutsOpen(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [acceptsShortcut]);

  // F toggles the field list and Shift+F its full view.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "f" || !acceptsShortcut(event)) return;
      event.preventDefault();
      if (event.shiftKey) {
        setFieldsOpen(true);
        setFieldsOverview((open) => !open);
      } else if (fieldsOpen) {
        closeFields();
      } else {
        setFieldsOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [fieldsOpen, closeFields, acceptsShortcut]);
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

  const highlightTimer = useRef<number>(undefined);
  const highlightChart = useCallback((id: string | undefined) => {
    // A chart just shown from the filter bar keeps its mark until it fades.
    if (highlightTimer.current !== undefined) return;
    highlightChartInContainer(containerRef.current, id);
  }, []);
  const showChart = useCallback(
    (id: string) => {
      setRowsOpen(false);
      requestAnimationFrame(() => {
        focusChartInContainer(containerRef.current, id);
        highlightChartInContainer(containerRef.current, id);
        window.clearTimeout(highlightTimer.current);
        highlightTimer.current = window.setTimeout(() => {
          highlightTimer.current = undefined;
          highlightChartInContainer(containerRef.current, undefined);
        }, 1200);
      });
    },
    [setRowsOpen]
  );
  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

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
    setRowsOpen(false);
    requestAnimationFrame(() => focusChartElement(addedChart.id));
  }, [charts, focusChartElement, setRowsOpen]);

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
      "Remove all charts?",
      "Every chart will be removed from the workspace.",
      { confirmLabel: "Remove all", destructive: true }
    );

    if (confirmed) {
      removeAllCharts();
      toast("All charts have been removed");
    }
  };

  return (
    <div className="eda-workspace w-full min-w-0 pb-8" ref={containerRef}>
      <div
        ref={controlsRef}
        className="eda-workspace-controls"
        data-fields-open={fieldsOpen || undefined}
        data-settings-open={(settingsTab && !settingsWide) || undefined}
        data-rows-narrow={(rowsOpen && rowsNarrow) || undefined}
      >
        <header className="eda-workspace-toolbar">
          <div
            role="group"
            aria-label="Inspect data"
            className="eda-toolbar-group"
          >
            <TooltipProvider>
              <Tooltip
                open={fieldsTipOpen}
                onOpenChange={(open) =>
                  setFieldsTipOpen(open && !quietFieldsTip.current)
                }
              >
                <TooltipTrigger asChild>
                  <Button
                    ref={fieldsToggleRef}
                    variant="ghost"
                    size="icon"
                    className="eda-fields-toggle"
                    aria-label="Fields"
                    aria-pressed={fieldsOpen}
                    aria-expanded={fieldsOpen}
                    aria-controls={fieldsOpen ? fieldListId : undefined}
                    onClick={() =>
                      fieldsOpen ? closeFields() : setFieldsOpen(true)
                    }
                    onPointerLeave={() => {
                      quietFieldsTip.current = false;
                    }}
                    onBlur={() => {
                      quietFieldsTip.current = false;
                    }}
                  >
                    <ListTree aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {fieldsOpen
                    ? "Hide the field list (F)"
                    : "Fields: every field with search, quick stats, and chart actions (F). Shift+F opens every distribution in a full view."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              ref={rowsToggleRef}
              variant="ghost"
              size="icon"
              aria-label="Rows"
              aria-pressed={rowsOpen}
              aria-expanded={rowsOpen}
              aria-controls={rowsOpen ? rowsPeekId : undefined}
              tooltip={
                rowsOpen
                  ? "Close the rows (R or Esc)"
                  : "Rows: peek at the rows that pass every chart filter (R)"
              }
              onClick={() => (rowsOpen ? closeRows() : setRowsOpen(true))}
            >
              <Rows3 aria-hidden="true" />
            </Button>
          </div>
          <span className="eda-toolbar-divider" aria-hidden="true" />
          <ChartCreationButtons />
          {rowsOpen && !rowsNarrow ? (
            // The expanded Rows drawer covers this line and shows the scope.
            <span className="eda-filter-status" aria-hidden="true" />
          ) : (
            <ActiveFilterStatus
              onShowChart={showChart}
              onHighlightChart={highlightChart}
            />
          )}
          <div
            role="group"
            aria-label="Configure workspace"
            className="eda-toolbar-group"
          >
            {(
              [
                [
                  "calculations",
                  "Calculations",
                  "Calculations: create and edit calculated fields",
                  Calculator,
                ],
                ["colors", "Colors", "Colors: adjust color scales", Palette],
                [
                  "grid",
                  "Grid",
                  "Grid: columns, row height, and spacing",
                  Grid,
                ],
              ] as const
            ).map(([tab, label, tooltip, Icon]) => (
              <Button
                key={tab}
                ref={(element) => {
                  settingsToggles.current[tab] = element;
                }}
                variant="ghost"
                size="icon"
                aria-label={label}
                aria-pressed={settingsTab === tab}
                aria-expanded={settingsTab === tab}
                aria-controls={settingsTab ? settingsDrawerId : undefined}
                tooltip={tooltip}
                onClick={() => toggleSettings(tab)}
              >
                <Icon aria-hidden="true" />
              </Button>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Workspace actions"
                  tooltip="Workspace actions: save, open, copy data, and shortcuts"
                >
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                  onClick={() => setShortcutsOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Keyboard className="h-4 w-4" />
                  Keyboard shortcuts
                  <kbd className="ml-auto text-xs text-muted-foreground">?</kbd>
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
          </div>
        </header>
        {rowsOpen && (
          <RowsPeek
            id={rowsPeekId}
            scope={
              <ActiveFilterStatus
                view="rows"
                onShowChart={showChart}
                onHighlightChart={highlightChart}
              />
            }
            containerRef={controlsRef}
            narrow={rowsNarrow}
            onNarrowChange={setRowsNarrow}
            onClose={closeRows}
          />
        )}
        {settingsTab && (
          <WorkspaceSettingsDrawer
            id={settingsDrawerId}
            tab={settingsTab}
            onTabChange={setSettingsTab}
            wide={settingsWide}
            onWideChange={setSettingsWide}
            onClose={closeSettings}
            workspaceRef={containerRef}
          />
        )}
        {fieldsOpen && (
          <FieldList
            id={fieldListId}
            onClose={closeFields}
            overview={fieldsOverview}
            onOverviewChange={setFieldsOverview}
            workspaceRef={containerRef}
          />
        )}
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

      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <main className="eda-chart-area">
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
          )
        )}
      </main>
    </div>
  );
}
