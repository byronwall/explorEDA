import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { DatumObject } from "./LandingPage";
import type { ExampleView } from "./demos/exampleViews";
import {
  getSavedViewsRows,
  HISTORY_LIMIT,
  STORAGE_KEY,
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
  exportDocument,
  stringifySavedAnalysis,
  type ExplorEdaHandle,
  type ExplorEdaSidePanel,
  type SavedDataStructure,
} from "exploreda";
import { Eye, FileCode, History, Redo2, Undo2 } from "lucide-react";
import { DashboardTextPanel } from "./DashboardTextPanel";
import { describeResult, type AppliedText } from "./dashboardText";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const HISTORY_PANEL_ID = "saved-views-history";
const TEXT_PANEL_ID = "dashboard-text";

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
  views: ExampleView[] = []
): SavedViewsSession {
  const tab = {
    id: newId(),
    name,
    settings: settings ? clone(settings) : undefined,
  };
  // An example can open with more saved views beside its main one.
  const tabs: SavedView[] = [
    tab,
    ...views.map((extra) => ({
      id: newId(),
      name: extra.name,
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
    tabs,
    activeTabId: tab.id,
    history: [{ at: new Date().toISOString(), label: "View", tabs: initial }],
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
  viewName,
}: {
  data: DatumObject[];
  initialSettings?: SavedDataStructure;
  initialSession?: SavedViewsSession;
  /** Saved views that open as tabs after the main one. */
  initialViews?: ExampleView[];
  viewName: string;
}) {
  const [session, setSession] = useState(() =>
    initialSession
      ? clone(initialSession)
      : makeSession(data, viewName, initialSettings, initialViews)
  );
  const [saveError, setSaveError] = useState(false);
  const [savedEncoding, setSavedEncoding] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewTabId, setPreviewTabId] = useState(session.activeTabId);
  const [workspaceKey, setWorkspaceKey] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyWide, setHistoryWide] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [textOpen, setTextOpen] = useState(false);
  const [textWide, setTextWide] = useState(false);
  const [dashboardText, setDashboardText] = useState("");
  const [appliedText, setAppliedText] = useState<AppliedText>();
  // The panel remounts with each preview, so the step to focus waits here.
  const focusCheckpoint = useRef<number | "current">(undefined);
  const workspaceRef = useRef<ExplorEdaHandle>(null);
  const showingPreview = previewIndex !== null;
  const shownTabs = showingPreview
    ? (session.history[previewIndex]?.tabs ?? session.tabs)
    : session.tabs;
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
  const encoded = useMemo(() => JSON.stringify(session), [session]);
  const sizeBytes = new Blob([encoded]).size;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, encoded);
      setSaveError(false);
      setSavedEncoding(encoded);
    } catch {
      setSaveError(true);
    }
  }, [encoded]);

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
    const tab: SavedView = { id: newId(), name, settings };
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
    if (settings) {
      downloadAnalysis(sourceRows, settings, currentView.name);
    }
  };

  const captureBaseline = useCallback((settings: SavedDataStructure) => {
    setSession((current) => {
      let changed = false;
      const tabs = current.tabs.map((tab) => {
        const isActive = tab.id === current.activeTabId;
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

  /** Replaces the current view with the text's dashboard, as one step. */
  const applyText = (result: AppliedText["result"]) => {
    if (showingPreview) {
      return;
    }
    const settings = result.settings;
    setSession((current) => {
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
        return tab.settings
          ? { ...tab, settings: withSharedSettings(tab.settings, settings) }
          : tab;
      });
      return pushCheckpoint(current, tabs, "View", {
        action: `Applied dashboard text: ${describeResult(result)}`,
      });
    });
    setAppliedText({ text: dashboardText, result });
    setAnnouncement(
      `Applied dashboard text: ${describeResult(result)}. Undo with ${MOD_KEY}Z.`
    );
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
      return { ...current, tabs, activeTabId, cursor };
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
        { restoredFrom: restored.at }
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
    : savedEncoding === encoded
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
      id: TEXT_PANEL_ID,
      label: "Dashboard text",
      tooltip: "Dashboard text: build this view from compact text (T)",
      icon: <FileCode aria-hidden="true" />,
      shortcut: "t",
      open: textOpen,
      onOpenChange: setTextOpen,
      wide: textWide,
      onWideChange: setTextWide,
      children: (
        <DashboardTextPanel
          text={dashboardText}
          onTextChange={setDashboardText}
          rows={sourceRows}
          applied={appliedText}
          onApply={applyText}
          onExport={() => {
            const settings =
              currentView.settings ?? workspaceRef.current?.getSettings();
            return settings && exportDocument(settings, { rows: sourceRows });
          }}
        />
      ),
    },
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
      <SavedViewTabs
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
        <WorkspaceInstance
          key={`${view.id}:${workspaceKey}`}
          data={sourceRows}
          settings={settingsForDisplay}
          onStateChange={capture}
          workspaceRef={workspaceRef}
          sidePanels={sidePanels}
          readOnly={showingPreview}
        />
      </div>
    </section>
  );
}
