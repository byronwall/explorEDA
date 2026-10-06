import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { DatumObject } from "./LandingPage";
import type { ExampleView } from "./demos/exampleViews";
import {
  getSavedViewsRows,
  HISTORY_LIMIT,
  STORAGE_KEY,
  PROJECT_STORAGE_KEY,
  type SavedView,
  type SavedViewsSession,
} from "./savedViewsSession";
import {
  classifyChange,
  clone,
  describeEntry,
  formatClock,
  LABEL_NAMES,
  MOD_KEY,
  pushCheckpoint,
  SHARED_KEYS,
  snapshot,
} from "./savedViewsHistory";
import { HistoryTimeline } from "./HistoryTimeline";
import { SavedViewTabs, type SaveState } from "./SavedViewTabs";
import {
  ExplorEda,
  ExplorEdaProject,
  type AnalysisProject,
  type AnalysisView,
  type AnalysisSourceRow,
  stringifySavedAnalysis,
  stringifyAnalysisProject,
  stringifyAnalysisStateWithCachedTables,
  selectAnalysisProjectView,
  type ExplorEdaHandle,
  type ExplorEdaSidePanel,
  type SavedDataStructure,
} from "exploreda";
import { Eye, History, Redo2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const HISTORY_PANEL_ID = "saved-views-history";

function newId() {
  return `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function activeView(tabs: SavedView[], id: string) {
  return tabs.find((tab) => tab.id === id) ?? tabs[0]!;
}

function makeSession(
  data: DatumObject[],
  name: string,
  settings?: SavedDataStructure,
  views: ExampleView[] = [],
  project?: AnalysisProject,
  tables?: Record<string, readonly AnalysisSourceRow[]>
): SavedViewsSession {
  const tab = {
    id: newId(),
    name,
    queryId: project?.queries[0]?.id,
    settings: settings ? clone(settings) : undefined,
  };
  // An example can open with more saved views beside its main one.
  const tabs: SavedView[] = [
    tab,
    ...views.map((extra) => ({
      id: newId(),
      name: extra.name,
      queryId: extra.queryId,
      bindings: extra.bindings,
      settings: clone(extra.savedData),
    })),
  ];
  const initial = snapshot(tabs);
  const sourceSettings: SavedDataStructure = {
    charts: [],
    calculations: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 100,
      containerPadding: 10,
      showBackgroundMarkers: true,
    },
    metadata: {
      name,
      version: 1,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    colorScales: [],
  };
  const sourceAnalysis = stringifySavedAnalysis({
    format: "exploreda-analysis",
    version: 1,
    data,
    settings: sourceSettings,
  });
  return {
    version: 1,
    sourceAnalysis,
    project,
    tables,
    tabs,
    activeTabId: tab.id,
    history: [
      {
        at: new Date().toISOString(),
        label: "View",
        tabs: initial,
        project: project && clone(project),
      },
    ],
    path: [0],
    cursor: 0,
  };
}

function withSharedSettings(
  settings: SavedDataStructure,
  source: SavedDataStructure
): SavedDataStructure {
  const merged = { ...settings };
  for (const key of SHARED_KEYS) {
    (merged as unknown as Record<string, unknown>)[key] = source[key];
  }
  return merged;
}

/** A new view keeps the shared definitions but starts without charts or filters. */
function blankSettings(
  settings: SavedDataStructure | undefined,
  name: string
): SavedDataStructure | undefined {
  if (!settings) {
    return undefined;
  }
  const blank = clone(settings);
  blank.charts = [];
  if (blank.rowsSettings) {
    blank.rowsSettings = {
      ...blank.rowsSettings,
      filters: [],
      globalSearch: "",
    };
  }
  blank.metadata = { ...blank.metadata, name };
  return blank;
}

function uniqueName(base: string, tabs: SavedView[]) {
  const names = new Set(tabs.map((tab) => tab.name));
  if (!names.has(base)) {
    return base;
  }
  let number = 2;
  while (names.has(`${base} ${number}`)) {
    number += 1;
  }
  return `${base} ${number}`;
}

function downloadAnalysis(
  data: DatumObject[],
  settings: SavedDataStructure,
  name: string
) {
  const contents = stringifySavedAnalysis({
    format: "exploreda-analysis",
    version: 1,
    data,
    settings,
  });
  const url = URL.createObjectURL(
    new Blob([contents], { type: "application/json" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "analysis"}.exploreda.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function projectFile(session: SavedViewsSession) {
  if (!session.project || !session.tables)
    throw new Error("No project is available");
  return {
    format: "exploreda-project" as const,
    version: 1 as const,
    project: session.project,
    tables: Object.fromEntries(
      Object.entries(session.tables).map(([id, rows]) => [id, [...rows]])
    ),
    views: session.tabs.map((tab) => ({ ...tab, queryId: tab.queryId ?? "" })),
    activeViewId: session.activeTabId,
  };
}
function downloadProject(
  file: Parameters<typeof stringifyAnalysisProject>[0],
  name: string
) {
  const url = URL.createObjectURL(
    new Blob([stringifyAnalysisProject(file)], { type: "application/json" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name.replace(/[^a-z0-9-_]+/gi, "-")}.exploreda-project.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      Boolean(target.closest("input, textarea, select, [role='combobox']")))
  );
}

function WorkspaceInstance({
  data,
  settings,
  onStateChange,
  workspaceRef,
  sidePanels,
  readOnly,
}: {
  data: DatumObject[];
  settings?: SavedDataStructure;
  onStateChange: (settings: SavedDataStructure) => void;
  workspaceRef: React.RefObject<ExplorEdaHandle | null>;
  sidePanels: ExplorEdaSidePanel[];
  readOnly: boolean;
}) {
  const [initialSettings] = useState(settings);
  return (
    <ExplorEda
      ref={workspaceRef}
      data={data}
      savedData={initialSettings}
      onStateChange={onStateChange}
      sidePanels={sidePanels}
      readOnly={readOnly}
    />
  );
}

export function SavedViewsWorkspace({
  data,
  initialSettings,
  initialSession,
  initialViews,
  initialProject,
  sourceTables,
  queryPresets,
  viewName,
}: {
  data: DatumObject[];
  initialSettings?: SavedDataStructure;
  initialSession?: SavedViewsSession;
  /** Saved views that open as tabs after the main one. */
  initialViews?: ExampleView[];
  initialProject?: AnalysisProject;
  sourceTables?: Record<string, readonly AnalysisSourceRow[]>;
  queryPresets?: Record<string, SavedDataStructure>;
  viewName: string;
}) {
  const [session, setSession] = useState(() =>
    initialSession
      ? clone(initialSession)
      : makeSession(
          data,
          viewName,
          initialSettings,
          initialViews,
          initialProject,
          sourceTables
        )
  );
  const [saveError, setSaveError] = useState(false);
  const [savedSession, setSavedSession] = useState<SavedViewsSession>();
  const [sizeBytes, setSizeBytes] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewTabId, setPreviewTabId] = useState(session.activeTabId);
  const [workspaceKey, setWorkspaceKey] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyWide, setHistoryWide] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  // The panel remounts with each preview, so the step to focus waits here.
  const focusCheckpoint = useRef<number | "current">(undefined);
  const workspaceRef = useRef<ExplorEdaHandle>(null);
  const showingPreview = previewIndex !== null;
  const shownTabs = showingPreview
    ? (session.history[previewIndex]?.tabs ?? session.tabs)
    : session.tabs;
  const shownProject = showingPreview
    ? session.history[previewIndex]?.project
    : session.project;
  const shownTabId = showingPreview ? previewTabId : session.activeTabId;
  const currentView = activeView(session.tabs, session.activeTabId);
  const view = activeView(shownTabs, shownTabId);
  const settingsForDisplay = showingPreview
    ? view.settings
    : currentView.settings;
  const { sourceAnalysis } = session;
  const sourceRows = useMemo(
    () => getSavedViewsRows({ sourceAnalysis }),
    [sourceAnalysis]
  );
  useEffect(() => {
    const save = () => {
      try {
        const encoded = stringifyAnalysisStateWithCachedTables(session);
        localStorage.setItem(
          session.project ? PROJECT_STORAGE_KEY : STORAGE_KEY,
          encoded
        );
        setSaveError(false);
        setSizeBytes(new Blob([encoded]).size);
        setSavedSession(session);
      } catch {
        setSaveError(true);
      }
    };
    const timer = window.setTimeout(save, 250);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", save);
    };
  }, [session]);

  const remount = () => setWorkspaceKey((key) => key + 1);

  const changeActive = (id: string) => {
    if (id === (showingPreview ? previewTabId : currentView.id)) {
      return;
    }
    if (showingPreview) {
      setPreviewTabId(id);
      remount();
      return;
    }
    setSession((current) => ({ ...current, activeTabId: id }));
    remount();
  };

  const createView = (duplicate: boolean) => {
    const source = currentView;
    const name = uniqueName(
      duplicate ? `${source.name} copy` : "New view",
      session.tabs
    );
    const settings = duplicate
      ? source.settings && {
          ...clone(source.settings),
          metadata: { ...source.settings.metadata, name },
        }
      : blankSettings(source.settings, name);
    const tab: SavedView = {
      ...source,
      id: newId(),
      name,
      settings,
      inspection: duplicate ? source.inspection : undefined,
      selectedRowKeys: duplicate ? source.selectedRowKeys : undefined,
    };
    setSession((current) => {
      const at = current.tabs.findIndex((item) => item.id === source.id);
      const tabs = [...current.tabs];
      tabs.splice(at + 1, 0, tab);
      const next = pushCheckpoint(
        current,
        tabs,
        "View",
        duplicate
          ? { action: `Duplicated “${source.name}” as “${name}”` }
          : undefined
      );
      return { ...next, activeTabId: tab.id };
    });
    remount();
  };

  const renameView = (name: string) => {
    setSession((current) => {
      const tabs = current.tabs.map((tab) =>
        tab.id === current.activeTabId
          ? {
              ...tab,
              name,
              settings: tab.settings && {
                ...tab.settings,
                metadata: { ...tab.settings.metadata, name },
              },
            }
          : tab
      );
      return pushCheckpoint(current, tabs, "View");
    });
  };

  const deleteView = () => {
    if (session.tabs.length <= 1) {
      return;
    }
    const removed = currentView;
    setSession((current) => {
      const at = current.tabs.findIndex((tab) => tab.id === removed.id);
      const tabs = current.tabs.filter((tab) => tab.id !== removed.id);
      const next = pushCheckpoint(current, tabs, "View");
      return { ...next, activeTabId: tabs[Math.max(0, at - 1)]!.id };
    });
    setAnnouncement(
      `Deleted “${removed.name}”. Undo with ${MOD_KEY}Z or from History.`
    );
    remount();
  };

  const moveView = (direction: -1 | 1) => {
    setSession((current) => {
      const at = current.tabs.findIndex(
        (tab) => tab.id === current.activeTabId
      );
      const to = at + direction;
      if (at < 0 || to < 0 || to >= current.tabs.length) {
        return current;
      }
      const tabs = [...current.tabs];
      const [moved] = tabs.splice(at, 1);
      tabs.splice(to, 0, moved!);
      return pushCheckpoint(current, tabs, "View", {
        action: `Moved “${moved!.name}” ${direction < 0 ? "left" : "right"}`,
      });
    });
  };

  const exportView = () => {
    const settings =
      currentView.settings ?? workspaceRef.current?.getSettings();
    if (session.project && session.tables) {
      const file = projectFile(session);
      downloadProject(
        selectAnalysisProjectView(file, currentView.id),
        currentView.name
      );
    } else if (settings) {
      downloadAnalysis(sourceRows, settings, currentView.name);
    }
  };

  const captureBaseline = useCallback((settings: SavedDataStructure) => {
    setSession((current) => {
      let changed = false;
      const tabs = current.tabs.map((tab) => {
        const isActive = tab.id === current.activeTabId;
        if (
          current.project &&
          tab.queryId !== activeView(current.tabs, current.activeTabId).queryId
        )
          return tab;
        let next = tab.settings;
        if (!next) {
          next = {
            ...settings,
            charts: isActive ? settings.charts : [],
            rowsSettings: isActive
              ? settings.rowsSettings
              : settings.rowsSettings && {
                  ...settings.rowsSettings,
                  filters: [],
                  globalSearch: "",
                },
            metadata: { ...settings.metadata, name: tab.name },
          };
          changed = true;
          return { ...tab, settings: next };
        }

        const normalized = { ...next };
        let tabChanged = false;
        for (const key of SHARED_KEYS) {
          if (normalized[key] !== undefined) {
            continue;
          }
          (normalized as unknown as Record<string, unknown>)[key] =
            settings[key] ?? (key === "fieldSettings" ? {} : []);
          tabChanged = true;
        }
        if (!normalized.rowsSettings && settings.rowsSettings) {
          normalized.rowsSettings = isActive
            ? settings.rowsSettings
            : {
                ...settings.rowsSettings,
                filters: [],
                globalSearch: "",
              };
          tabChanged = true;
        }
        if (tabChanged) {
          changed = true;
          return { ...tab, settings: normalized };
        }
        return tab;
      });
      if (!changed) {
        return current;
      }
      const currentEntryIndex = current.path[current.cursor];
      const history = current.history.map((entry, index) =>
        index === currentEntryIndex ? { ...entry, tabs: snapshot(tabs) } : entry
      );
      return { ...current, tabs, history };
    });
  }, []);

  const capture = (settings: SavedDataStructure) => {
    if (showingPreview) {
      return;
    }
    setSession((current) => {
      const shared = settings;
      const tabs = current.tabs.map((tab) => {
        if (tab.id === current.activeTabId) {
          return {
            ...tab,
            settings: {
              ...settings,
              metadata: { ...settings.metadata, name: tab.name },
            },
          };
        }
        if (
          current.project &&
          tab.queryId !== activeView(current.tabs, current.activeTabId).queryId
        )
          return tab;
        if (tab.settings) {
          return { ...tab, settings: withSharedSettings(tab.settings, shared) };
        }
        const rowsSettings = settings.rowsSettings && {
          ...settings.rowsSettings,
          filters: [],
          globalSearch: "",
        };
        return {
          ...tab,
          settings: {
            ...settings,
            charts: [],
            rowsSettings,
            metadata: { ...settings.metadata, name: tab.name },
          },
        };
      });
      return pushCheckpoint(current, tabs);
    });
  };

  const captureProject = (next: {
    project: AnalysisProject;
    view: AnalysisView;
  }) => {
    if (showingPreview) return;
    setSession((current) => {
      const tabs = current.tabs.map((tab) =>
        tab.id === current.activeTabId
          ? { ...tab, ...next.view, id: tab.id, name: tab.name }
          : tab
      );
      return pushCheckpoint(current, tabs, undefined, undefined, next.project);
    });
  };

  const openProjectView = (
    nextView: AnalysisView,
    name: string,
    project?: AnalysisProject
  ) => {
    if (showingPreview) return;
    const tab: SavedView = {
      ...nextView,
      id: newId(),
      name: uniqueName(name, session.tabs),
    };
    setSession((current) => ({
      ...pushCheckpoint(
        current,
        [...current.tabs, tab],
        "View",
        { action: `Opened ${tab.name}` },
        project ?? current.project
      ),
      activeTabId: tab.id,
    }));
    remount();
  };

  const selectedHistoryIndex = session.path[session.cursor] ?? 0;
  const canUndo = session.cursor > 0;
  const canRedo = session.cursor < session.path.length - 1;
  const undoText = canUndo
    ? describeEntry(session, selectedHistoryIndex).headline
    : undefined;
  const redoIndex = session.path[session.cursor + 1];
  const redoText =
    redoIndex === undefined
      ? undefined
      : describeEntry(session, redoIndex).headline;

  const moveHistory = (direction: -1 | 1) => {
    if (showingPreview) {
      return;
    }
    const cursor = session.cursor + direction;
    const entryIndex = session.path[cursor];
    const entry =
      entryIndex === undefined ? undefined : session.history[entryIndex];
    if (!entry) {
      return;
    }
    const step = describeEntry(
      session,
      direction < 0 ? selectedHistoryIndex : entryIndex!
    ).headline;
    setSession((current) => {
      const tabs = snapshot(entry.tabs);
      const activeTabId = tabs.some((tab) => tab.id === current.activeTabId)
        ? current.activeTabId
        : tabs[0]!.id;
      return { ...current, tabs, project: entry.project, activeTabId, cursor };
    });
    setAnnouncement(`${direction < 0 ? "Undid" : "Redid"}: ${step}`);
    // The remount replaces the panel; keep keyboard focus in the timeline.
    if (
      document
        .getElementById(HISTORY_PANEL_ID)
        ?.contains(document.activeElement)
    ) {
      focusCheckpoint.current = "current";
    }
    remount();
  };

  const previewHistory = (index: number) => {
    if (index === selectedHistoryIndex) {
      returnToPresent();
      return;
    }
    focusCheckpoint.current = index;
    setPreviewIndex(index);
    remount();
    const tabs = session.history[index]?.tabs ?? [];
    const keep = showingPreview ? previewTabId : session.activeTabId;
    setPreviewTabId(
      tabs.some((tab) => tab.id === keep)
        ? keep
        : (tabs[0]?.id ?? session.activeTabId)
    );
  };

  const restoreCheckpoint = (index: number) => {
    const restored = session.history[index];
    if (!restored) {
      return;
    }
    const keepTabId = showingPreview ? previewTabId : session.activeTabId;
    setSession((current) => {
      // Keep unsaved edits to the present recoverable before replacing it.
      const cursorEntry = current.history[current.path[current.cursor]!];
      const displaced =
        cursorEntry && classifyChange(cursorEntry.tabs, current.tabs)
          ? pushCheckpoint(current, current.tabs)
          : current;
      const tabs = snapshot(restored.tabs);
      const next = pushCheckpoint(
        displaced,
        tabs,
        classifyChange(displaced.tabs, tabs) ?? restored.label,
        { restoredFrom: restored.at },
        restored.project
      );
      const activeTabId = tabs.some((tab) => tab.id === keepTabId)
        ? keepTabId
        : tabs[0]!.id;
      return { ...next, activeTabId };
    });
    focusCheckpoint.current = "current";
    setPreviewIndex(null);
    setAnnouncement(`Restored the version from ${formatClock(restored.at)}`);
    remount();
  };

  function returnToPresent() {
    if (previewIndex === null) {
      return;
    }
    focusCheckpoint.current = "current";
    setPreviewIndex(null);
    remount();
  }

  // Undo and Redo follow the platform keys unless a field owns them.
  const shortcutRef = useRef({ moveHistory, canUndo, canRedo });
  shortcutRef.current = { moveHistory, canUndo, canRedo };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) {
        return;
      }
      const key = event.key.toLowerCase();
      const redo = (key === "z" && event.shiftKey) || key === "y";
      const undo = key === "z" && !event.shiftKey;
      if (!undo && !redo) {
        return;
      }
      if (
        event.defaultPrevented ||
        isEditableTarget(event.target) ||
        document.querySelector("[role='dialog'], [role='alertdialog']")
      ) {
        return;
      }
      const {
        moveHistory: move,
        canUndo: undoable,
        canRedo: redoable,
      } = shortcutRef.current;
      if (undo && !undoable) {
        return;
      }
      if (redo && !redoable) {
        return;
      }
      event.preventDefault();
      move(undo ? -1 : 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (showingPreview) {
      return;
    }
    const settings = workspaceRef.current?.getSettings();
    if (settings) {
      captureBaseline(settings);
    }
  }, [captureBaseline, showingPreview, view.id, workspaceKey]);

  const saveState: SaveState = saveError
    ? "error"
    : savedSession === session
      ? "saved"
      : "saving";
  const saveDetail = saveError
    ? "This browser refused to save the session. Export the analysis to keep a copy."
    : `Saved in this browser: ${session.tabs.length} view${session.tabs.length === 1 ? "" : "s"}, ${session.history.length} of ${HISTORY_LIMIT} history steps, ${(sizeBytes / 1024).toFixed(1)} KB. Select to open History.`;

  const previewed =
    previewIndex === null ? undefined : describeEntry(session, previewIndex);
  const previewBanner = previewed && (
    <div
      role="status"
      className="flex flex-wrap items-center gap-2 border-b border-border bg-accent/60 px-3 py-2 text-xs"
    >
      <Eye
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium">
          Previewing {formatClock(previewed.entry.at)}
        </span>
        <span className="text-muted-foreground">
          {" "}
          · {previewed.headline} · read-only
        </span>
      </span>
      <Button
        size="sm"
        className="h-7 text-xs"
        onClick={() => restoreCheckpoint(previewIndex!)}
      >
        Restore
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={returnToPresent}
      >
        Back to present
      </Button>
    </div>
  );

  const sidePanels: ExplorEdaSidePanel[] = [
    {
      id: HISTORY_PANEL_ID,
      label: "History",
      tooltip:
        "History: every saved change on a timeline. Preview or restore any step (H)",
      icon: <History aria-hidden="true" />,
      shortcut: "h",
      open: historyOpen,
      onOpenChange: setHistoryOpen,
      wide: historyWide,
      onWideChange: setHistoryWide,
      banner: previewBanner,
      actions: (
        <div className="flex items-center">
          <ActionTooltip
            content={
              undoText
                ? `Undo: ${undoText} (${MOD_KEY}Z)`
                : `Undo (${MOD_KEY}Z)`
            }
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-[30px] text-muted-foreground"
              aria-label="Undo last change"
              disabled={!canUndo || showingPreview}
              onClick={() => moveHistory(-1)}
            >
              <Undo2 aria-hidden="true" />
            </Button>
          </ActionTooltip>
          <ActionTooltip
            content={
              redoText
                ? `Redo: ${redoText} (${MOD_KEY}Shift+Z)`
                : `Redo (${MOD_KEY}Shift+Z)`
            }
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-[30px] text-muted-foreground"
              aria-label="Redo next change"
              disabled={!canRedo || showingPreview}
              onClick={() => moveHistory(1)}
            >
              <Redo2 aria-hidden="true" />
            </Button>
          </ActionTooltip>
        </div>
      ),
      children: (
        <HistoryTimeline
          session={session}
          previewIndex={previewIndex}
          wide={historyWide}
          focusIndex={focusCheckpoint.current}
          onFocused={() => {
            focusCheckpoint.current = undefined;
          }}
          onPreview={previewHistory}
          onReturn={returnToPresent}
          onRestore={restoreCheckpoint}
        />
      ),
    },
  ];

  const current = describeEntry(session, selectedHistoryIndex);

  return (
    <section className="mb-3" aria-label="Saved views and history">
      {session.project && (
        <div className="mb-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadProject(projectFile(session), "Shop project")
            }
            disabled={showingPreview}
          >
            Export project
          </Button>
        </div>
      )}
      <SavedViewTabs
        projectMode={Boolean(session.project)}
        tabs={shownTabs}
        activeId={view.id}
        readOnly={showingPreview}
        onSelect={changeActive}
        onCreate={() => createView(false)}
        onDuplicate={() => createView(true)}
        onRename={renameView}
        onDelete={deleteView}
        onMove={moveView}
        onExport={exportView}
        canUndo={canUndo}
        canRedo={canRedo}
        undoText={undoText}
        redoText={redoText}
        onUndo={() => moveHistory(-1)}
        onRedo={() => moveHistory(1)}
        saveState={saveState}
        saveDetail={saveDetail}
        onOpenHistory={() => setHistoryOpen(true)}
      />
      {saveError && (
        <p
          role="alert"
          className="mt-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          Local save failed. Export this analysis to keep a copy.
        </p>
      )}
      {previewed && !historyOpen && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-border bg-accent/50 px-3 py-2 text-sm">
          <Eye
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="min-w-0 flex-1">
            <span className="font-medium">
              Viewing the version from {formatClock(previewed.entry.at)}
            </span>
            <span className="text-muted-foreground">
              {" "}
              · {previewed.headline}. Charts are read-only until you restore it
              or return.
            </span>
          </p>
          <Button size="sm" onClick={() => restoreCheckpoint(previewIndex!)}>
            Restore this version
          </Button>
          <Button size="sm" variant="ghost" onClick={returnToPresent}>
            Return to present
          </Button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <span data-testid="current-history-label" className="sr-only">
        {LABEL_NAMES[current.entry.label]} · {current.headline}
      </span>
      <div className="mt-3">
        {shownProject && session.tables ? (
          <ExplorEdaProject
            key={`${view.id}:${workspaceKey}`}
            ref={workspaceRef}
            tables={session.tables}
            project={shownProject}
            view={{
              ...view,
              queryId: view.queryId ?? "",
              settings: settingsForDisplay,
            }}
            onProjectChange={captureProject}
            onStateChange={capture}
            onOpenView={openProjectView}
            queryPresets={queryPresets}
            sidePanels={sidePanels}
            readOnly={showingPreview}
          />
        ) : session.project ? (
          <p role="alert">
            This checkpoint has no project definitions. Restore a checkpoint
            that contains its queries.
          </p>
        ) : (
          <WorkspaceInstance
            key={`${view.id}:${workspaceKey}`}
            data={sourceRows}
            settings={settingsForDisplay}
            onStateChange={capture}
            workspaceRef={workspaceRef}
            sidePanels={sidePanels}
            readOnly={showingPreview}
          />
        )}
      </div>
    </section>
  );
}
