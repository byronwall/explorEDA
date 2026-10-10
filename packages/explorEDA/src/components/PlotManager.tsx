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
import {
  WorkspaceSidePanel,
  type ExplorEdaSidePanel,
} from "./WorkspaceSidePanel";

import { Card, CardContent } from "@/components/ui/card";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { resolveThemeId } from "@/lib/themes";
import { RowsPeek } from "./RowsPeek";
import { SchemaDrawer } from "./schema/SchemaDrawer";
import type { SchemaGraph } from "@/lib/schema/schemaGraph";
import type { SchemaProjectEditing } from "./schema/schemaEditing";
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
  Braces,
  Copy,
  Grid,
  Keyboard,
  ListTree,
  MoreHorizontal,
  Palette,
  Type,
  Network,
  Rows3,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { ChartGridLayout } from "./ChartGridLayout";
import { FieldList } from "./FieldList/FieldList";
import { focusChartInContainer, highlightChartInContainer } from "./chartFocus";

export { focusChartInContainer };
import { GridChartPanel } from "./GridChartPanel";
import { useChartDetailsStore } from "./chartDetailsStore";
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
import {
  flowTwoColumns,
  NARROW_GRID_WIDTH,
  narrowColumnCount,
} from "./chartGridPlacement";

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

/** The schema diagram's source and, optionally, who controls its drawer. */
export interface ExplorEdaSchema {
  /** A project's schema. Without it, the diagram shows the workspace's table. */
  graph?: SchemaGraph;
  /**
   * Lets the diagram change the project's sources and relationships. Omit
   * it to show the project without edits.
   */
  editing?: SchemaProjectEditing;
  /** The project view this workspace shows; its calculations edit here. */
  viewId?: string;
  /** Control whether the drawer is open, such as from a host panel. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PlotManager({
  sidePanels = [],
  readOnly = false,
  toolbarStart,
  toolbarEnd,
  schema,
}: {
  sidePanels?: ExplorEdaSidePanel[];
  readOnly?: boolean;
  /** Host content that leads the toolbar line, such as view tabs. */
  toolbarStart?: ReactNode;
  /** Host actions that end the toolbar line. */
  toolbarEnd?: ReactNode;
  schema?: ExplorEdaSchema;
} = {}) {
  const charts = useDataLayer((state) => state.charts);
  const addChart = useDataLayer((state) => state.addChart);
  const removeChart = useDataLayer((state) => state.removeChart);
  const openDetails = useChartDetailsStore((state) => state.open);
  const removeAllCharts = useDataLayer((state) => state.removeAllCharts);
  const gridSettings = useDataLayer((state) => state.gridSettings);
  const themeId = resolveThemeId(useDataLayer((state) => state.theme));
  const setDarkMode = useDataLayer((state) => state.setDarkMode);
  // Charts color their palettes for the surface they sit on. Hosts mark dark
  // mode with a `dark` class on the page or an ancestor of the workspace.
  useEffect(() => {
    let dark: boolean | undefined;
    const update = () => {
      const next =
        Boolean(containerRef.current?.closest(".dark")) ||
        document.documentElement.classList.contains("dark");
      if (next !== dark) setDarkMode((dark = next));
    };
    update();
    if (typeof MutationObserver === "undefined") return;
    // Only the workspace's ancestors can switch it, so only they are watched.
    const observer = new MutationObserver(update);
    for (
      let element: Element | null =
        containerRef.current?.parentElement ?? document.documentElement;
      element;
      element = element.parentElement
    ) {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
    return () => observer.disconnect();
  }, [setDarkMode]);
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
  const schemaDrawerId = useId();
  const schemaToggleRef = useRef<HTMLButtonElement>(null);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [fieldsOverview, setFieldsOverview] = useState(false);
  const [rowsOpen, setRowsOpenState] = useState(false);
  const [rowsNarrow, setRowsNarrow] = useState(false);
  const [schemaOpenState, setSchemaOpenState] = useState(false);
  const schemaOpen = schema?.open ?? schemaOpenState;
  const schemaRef = useRef(schema);
  schemaRef.current = schema;
  // The host may control the drawer; both learn of every change.
  const changeSchemaOpen = useCallback((open: boolean) => {
    setSchemaOpenState(open);
    schemaRef.current?.onOpenChange?.(open);
  }, []);
  const settingsDrawerId = useId();
  const settingsToggles = useRef<
    Partial<Record<WorkspaceSettingsTab, HTMLButtonElement | null>>
  >({});
  const [settingsTab, setSettingsTab] = useState<WorkspaceSettingsTab>();
  const [settingsWide, setSettingsWide] = useState(false);

  // Rows, workspace settings, and host panels share the right edge, so one
  // replaces another. They cover the field list, which returns when they close.
  // React 18 has no inert prop, so set the attribute directly.
  const toolbarEditRef = useRef<HTMLFieldSetElement>(null);
  const toolbarConfigRef = useRef<HTMLFieldSetElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    toolbarEditRef.current?.toggleAttribute("inert", readOnly);
    toolbarConfigRef.current?.toggleAttribute("inert", readOnly);
    statusRef.current?.toggleAttribute("inert", readOnly);
    chartAreaRef.current?.toggleAttribute("inert", readOnly);
  }, [readOnly]);
  const sidePanelsRef = useRef(sidePanels);
  sidePanelsRef.current = sidePanels;
  const openPanel = sidePanels.find((panel) => panel.open);
  const panelToggles = useRef<Record<string, HTMLButtonElement | null>>({});
  const [focusPanelId, setFocusPanelId] = useState<string>();
  const closeHostPanels = useCallback((except?: string) => {
    for (const panel of sidePanelsRef.current) {
      if (panel.open && panel.id !== except) panel.onOpenChange(false);
    }
  }, []);
  useEffect(() => {
    if (!openPanel) return;
    setRowsOpenState(false);
    setSettingsTab(undefined);
    changeSchemaOpen(false);
  }, [openPanel?.id]);
  const closePanel = useCallback((panel: ExplorEdaSidePanel) => {
    const element = document.getElementById(panel.id);
    const hadFocus = element?.contains(document.activeElement) ?? false;
    panel.onOpenChange(false);
    setFocusPanelId(undefined);
    if (hadFocus) {
      panelToggles.current[panel.id]?.focus({ preventScroll: true });
    }
  }, []);
  const togglePanel = useCallback(
    (panel: ExplorEdaSidePanel) => {
      if (panel.open) {
        closePanel(panel);
        return;
      }
      closeHostPanels(panel.id);
      setFocusPanelId(panel.id);
      panel.onOpenChange(true);
    },
    [closeHostPanels, closePanel]
  );

  const setRowsOpen = useCallback(
    (open: boolean) => {
      if (open) {
        setSettingsTab(undefined);
        closeHostPanels();
        changeSchemaOpen(false);
      }
      setRowsOpenState(open);
    },
    [closeHostPanels, changeSchemaOpen]
  );
  const setSchemaOpen = useCallback(
    (open: boolean) => {
      if (open) {
        setSettingsTab(undefined);
        setRowsOpenState(false);
        closeHostPanels();
      }
      changeSchemaOpen(open);
    },
    [closeHostPanels, changeSchemaOpen]
  );
  const closeSchema = useCallback(() => {
    const drawer = document.getElementById(schemaDrawerId);
    const hadFocus = drawer?.contains(document.activeElement) ?? false;
    setSchemaOpen(false);
    if (hadFocus) schemaToggleRef.current?.focus({ preventScroll: true });
  }, [schemaDrawerId, setSchemaOpen]);
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
      setSettingsWide(
        (tab === "calculations" && calculationCount > 0) || tab === "spec"
      );
    }
    setRowsOpenState(false);
    changeSchemaOpen(false);
    closeHostPanels();
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

  // A host panel's letter toggles it, like F and R.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey || !acceptsShortcut(event)) return;
      const key = event.key.toLowerCase();
      const panel = sidePanelsRef.current.find(
        (candidate) => candidate.shortcut?.toLowerCase() === key
      );
      if (!panel || document.querySelector("[role='dialog']")) return;
      event.preventDefault();
      togglePanel(panel);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [acceptsShortcut, togglePanel]);

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
      if (
        readOnly ||
        event.key.toLowerCase() !== "f" ||
        !acceptsShortcut(event)
      ) {
        return;
      }
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
  }, [fieldsOpen, closeFields, acceptsShortcut, readOnly]);
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

  const isNarrowGrid = containerWidth > 0 && containerWidth < NARROW_GRID_WIDTH;
  const narrowColumns = narrowColumnCount(containerWidth);
  const chartGridSettings = {
    ...gridSettings,
    columnCount: isNarrowGrid ? narrowColumns : gridSettings.columnCount,
  };
  // Narrow grids show charts in a flow of the saved layout, sized to match.
  const flowedLayout =
    isNarrowGrid && narrowColumns === 2
      ? flowTwoColumns(
          charts.filter((chart) => chart.layout),
          gridSettings.columnCount
        )
      : undefined;

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
    // A blank composition is built in its editor, so it opens there.
    if (
      addedChart.type === "composition" &&
      !addedChart.composition?.elements?.length
    ) {
      openDetails(addedChart.id);
      return;
    }
    requestAnimationFrame(() => focusChartElement(addedChart.id));
  }, [charts, focusChartElement, openDetails, setRowsOpen]);

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

  // Panels on the right edge cover part of the toolbar and status bar, so
  // both keep their content beside the panel.
  const panelSpaceAttributes = {
    "data-fields-open": fieldsOpen || undefined,
    "data-settings-open":
      (settingsTab && !settingsWide) ||
      (openPanel && !openPanel.wide) ||
      undefined,
    "data-rows-narrow": (rowsOpen && rowsNarrow) || undefined,
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
    <div
      className="eda-workspace w-full min-w-0"
      ref={containerRef}
      data-eda-theme={themeId}
    >
      <div
        ref={controlsRef}
        className="eda-workspace-controls"
        {...panelSpaceAttributes}
      >
        <header
          className="eda-workspace-toolbar"
          data-has-start={toolbarStart ? "" : undefined}
        >
          {/* Host content, such as view tabs, leads the line. Tools and
              settings sit on the right. */}
          <div className="eda-toolbar-start eda-toolbar-host">
            {toolbarStart}
          </div>
          {/* A read-only workspace keeps its scope visible but takes no
              edits. Host panels stay usable beside it. */}
          <fieldset
            disabled={readOnly}
            className="eda-toolbar-editable"
            ref={toolbarEditRef}
          >
            <ChartCreationButtons />
            <span className="eda-toolbar-divider" aria-hidden="true" />
          </fieldset>
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
                    disabled={readOnly}
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
            <Button
              ref={schemaToggleRef}
              variant="ghost"
              size="icon"
              aria-label="Schema diagram"
              aria-pressed={schemaOpen}
              aria-expanded={schemaOpen}
              aria-controls={schemaOpen ? schemaDrawerId : undefined}
              tooltip={
                schemaOpen
                  ? "Close the schema diagram (Esc)"
                  : "Schema diagram: every table, field, and relationship"
              }
              onClick={() => (schemaOpen ? closeSchema() : setSchemaOpen(true))}
            >
              <Network aria-hidden="true" />
            </Button>
          </div>
          {sidePanels.length > 0 && (
            // History-like panels sit with the inspection tools and stay
            // usable while the rest of the toolbar is read-only.
            <div
              role="group"
              aria-label="More panels"
              className="eda-toolbar-group"
            >
              {sidePanels.map((panel) => (
                <Button
                  key={panel.id}
                  ref={(element) => {
                    panelToggles.current[panel.id] = element;
                  }}
                  variant="ghost"
                  size="icon"
                  aria-label={panel.label}
                  aria-pressed={panel.open}
                  aria-expanded={panel.open}
                  aria-controls={panel.open ? panel.id : undefined}
                  tooltip={panel.tooltip}
                  onClick={() => togglePanel(panel)}
                >
                  {panel.icon}
                </Button>
              ))}
            </div>
          )}
          <fieldset
            disabled={readOnly}
            className="eda-toolbar-editable"
            ref={toolbarConfigRef}
          >
            <span className="eda-toolbar-divider" aria-hidden="true" />
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
                  [
                    "theme",
                    "Theme",
                    "Theme: chart titles, type, and surfaces",
                    Type,
                  ],
                  ["colors", "Colors", "Colors: adjust color scales", Palette],
                  [
                    "grid",
                    "Grid",
                    "Grid: columns, row height, and spacing",
                    Grid,
                  ],
                  [
                    "spec",
                    "Chart spec",
                    "Chart spec: inspect what each chart saves",
                    Braces,
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
                    <kbd className="ml-auto text-xs text-muted-foreground">
                      ?
                    </kbd>
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
          </fieldset>
          {toolbarEnd && (
            <div className="eda-toolbar-end eda-toolbar-host">
              <span className="eda-toolbar-divider" aria-hidden="true" />
              {toolbarEnd}
            </div>
          )}
        </header>
        {openPanel && (
          <WorkspaceSidePanel
            key={openPanel.id}
            panel={openPanel}
            autoFocus={focusPanelId === openPanel.id}
            workspaceRef={containerRef}
            onClose={() => closePanel(openPanel)}
          />
        )}
        {rowsOpen && !openPanel && (
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
            readOnly={readOnly}
          />
        )}
        {schemaOpen && !openPanel && (
          <SchemaDrawer
            id={schemaDrawerId}
            graph={schema?.graph}
            projectEditing={schema?.editing}
            viewId={schema?.viewId}
            readOnly={readOnly}
            containerRef={controlsRef}
            onClose={closeSchema}
          />
        )}
        {settingsTab && !openPanel && (
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
        {fieldsOpen && !readOnly && (
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

      <main className="eda-chart-area" ref={chartAreaRef}>
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
                  {
                    ...chart.layout,
                    ...(isNarrowGrid
                      ? (flowedLayout?.get(chart.id) ?? { w: 1 })
                      : {}),
                  },
                  containerWidth,
                  chartGridSettings
                );
                return (
                  <div key={chart.id} data-chart-id={chart.id} tabIndex={-1}>
                    <GridChartPanel
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

      {/* The status bar keeps the row count and filter scope in view at the
          bottom of the workspace while the charts scroll. */}
      <div
        ref={statusRef}
        className="eda-workspace-status"
        {...panelSpaceAttributes}
      >
        {(rowsOpen && !rowsNarrow) || (schemaOpen && !openPanel) ? null : (
          // The expanded Rows drawer covers the workspace and shows the scope.
          <ActiveFilterStatus
            onShowChart={showChart}
            onHighlightChart={highlightChart}
          />
        )}
      </div>
    </div>
  );
}
