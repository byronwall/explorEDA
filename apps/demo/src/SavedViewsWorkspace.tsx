import { Button } from "@/components/ui/button";
import type { DatumObject } from "./LandingPage";
import { getSavedViewsRows, type SavedViewsSession } from "./savedViewsSession";
import {
  ExplorEda,
  parseSavedAnalysis,
  stringifySavedAnalysis,
  type ExplorEdaHandle,
  type SavedDataStructure,
} from "exploreda";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "exploreda.saved-views.v1";
const HISTORY_LIMIT = 50;
const SHARED_KEYS = [
  "calculations",
  "colorScales",
  "fieldSettings",
  "aggregates",
  "geometryAssets",
] as const;

type SavedView = {
  id: string;
  name: string;
  settings?: SavedDataStructure;
};

type ChangeLabel = "View" | "Filter" | "Both" | "Shared";
type HistoryEntry = {
  at: string;
  label: ChangeLabel;
  tabs: SavedView[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function newId() {
  return `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function activeView(tabs: SavedView[], id: string) {
  return tabs.find((tab) => tab.id === id) ?? tabs[0]!;
}

function snapshot(tabs: SavedView[]) {
  return clone(tabs);
}

function signatures(tabs: SavedView[]) {
  const shared = JSON.stringify(
    tabs.map(
      ({ settings }) =>
        settings &&
        Object.fromEntries(SHARED_KEYS.map((key) => [key, settings[key]]))
    )
  );
  const filters = JSON.stringify(
    tabs.map(({ id, settings }) => ({
      id,
      charts: settings?.charts
        .filter((chart) => chart.filters.length > 0)
        .map(({ id: chartId, filters }) => ({ id: chartId, filters })),
      rows: settings?.rowsSettings && {
        filters: settings.rowsSettings.filters,
        globalSearch: settings.rowsSettings.globalSearch,
      },
    }))
  );
  const views = JSON.stringify(
    tabs.map(({ id, name, settings }) => {
      if (!settings) return { id, name };
      const { charts, metadata: _metadata, rowsSettings, ...rest } = settings;
      const rowsView = rowsSettings && {
        ...rowsSettings,
        filters: undefined,
        globalSearch: undefined,
      };
      return {
        id,
        name,
        rest,
        rowsView,
        charts: charts.map(({ filters: _filters, ...chart }) => chart),
      };
    })
  );
  return { shared, filters, views };
}

function classifyChange(
  before: SavedView[],
  after: SavedView[]
): ChangeLabel | undefined {
  const previous = signatures(before);
  const next = signatures(after);
  const sharedChanged = previous.shared !== next.shared;
  const filtersChanged = previous.filters !== next.filters;
  const viewsChanged = previous.views !== next.views;
  if (!sharedChanged && !filtersChanged && !viewsChanged) return undefined;
  if (sharedChanged) return "Shared";
  if (filtersChanged && viewsChanged) return "Both";
  if (filtersChanged) return "Filter";
  return "View";
}

function pushCheckpoint(
  session: SavedViewsSession,
  tabs: SavedView[],
  label = classifyChange(session.tabs, tabs)
): SavedViewsSession {
  if (!label) return { ...session, tabs };
  const history = [
    ...session.history,
    { at: new Date().toISOString(), label, tabs: snapshot(tabs) },
  ];
  const newIndex = history.length - 1;
  const path = [...session.path.slice(0, session.cursor + 1), newIndex];
  let keptHistory = history;
  let keptPath = path;
  if (history.length > HISTORY_LIMIT) {
    const drop = history.length - HISTORY_LIMIT;
    keptHistory = history.slice(drop);
    keptPath = path
      .filter((index) => index >= drop)
      .map((index) => index - drop);
  }
  return {
    ...session,
    tabs,
    history: keptHistory,
    path: keptPath,
    cursor: keptPath.length - 1,
  };
}

function makeSession(
  data: DatumObject[],
  name: string,
  settings?: SavedDataStructure
): SavedViewsSession {
  const tab = {
    id: newId(),
    name,
    settings: settings ? clone(settings) : undefined,
  };
  const initial = snapshot([tab]);
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
    tabs: [tab],
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

function checkpointLabel(entry: HistoryEntry) {
  const time = new Date(entry.at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${entry.label} · ${time}`;
}

function WorkspaceInstance({
  data,
  settings,
  onStateChange,
  workspaceRef,
}: {
  data: DatumObject[];
  settings?: SavedDataStructure;
  onStateChange: (settings: SavedDataStructure) => void;
  workspaceRef: React.RefObject<ExplorEdaHandle | null>;
}) {
  const [initialSettings] = useState(settings);
  return (
    <ExplorEda
      ref={workspaceRef}
      data={data}
      savedData={initialSettings}
      onStateChange={onStateChange}
    />
  );
}

export function SavedViewsWorkspace({
  data,
  initialSettings,
  initialSession,
  viewName,
}: {
  data: DatumObject[];
  initialSettings?: SavedDataStructure;
  initialSession?: SavedViewsSession;
  viewName: string;
}) {
  const [session, setSession] = useState(() =>
    initialSession
      ? clone(initialSession)
      : makeSession(data, viewName, initialSettings)
  );
  const [saveError, setSaveError] = useState(false);
  const [savedEncoding, setSavedEncoding] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewTabId, setPreviewTabId] = useState(session.activeTabId);
  const [workspaceKey, setWorkspaceKey] = useState(0);
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
  const sourceRows = useMemo(
    () => getSavedViewsRows(session),
    [session.sourceAnalysis]
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

  const changeActive = (id: string) => {
    setEditingName(false);
    if (id === (showingPreview ? previewTabId : currentView.id)) return;
    if (showingPreview) {
      setPreviewTabId(id);
      setWorkspaceKey((key) => key + 1);
      return;
    }
    setSession((current) => ({ ...current, activeTabId: id }));
    setWorkspaceKey((key) => key + 1);
  };

  const createView = (duplicate: boolean) => {
    const source = currentView;
    const settings = source.settings ? clone(source.settings) : undefined;
    if (settings && !duplicate) {
      settings.charts = [];
      if (settings.rowsSettings) {
        settings.rowsSettings = {
          ...settings.rowsSettings,
          filters: [],
          globalSearch: "",
        };
      }
      settings.metadata = { ...settings.metadata, name: "New view" };
    }
    const tab: SavedView = {
      id: newId(),
      name: duplicate ? `${source.name} copy` : "New view",
      settings,
    };
    setSession((current) => {
      const tabs = [...current.tabs, tab];
      const next = pushCheckpoint(current, tabs, "View");
      return { ...next, activeTabId: tab.id };
    });
    setEditingName(false);
    setWorkspaceKey((key) => key + 1);
  };

  const commitName = () => {
    const name = nameDraft.trim();
    if (!name) return;
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
    setEditingName(false);
  };

  const captureBaseline = useCallback((settings: SavedDataStructure) => {
    setSession((current) => {
      const selected = activeView(current.tabs, current.activeTabId);
      if (selected.settings) return current;
      const tabs = current.tabs.map((tab) => {
        if (tab.settings) return tab;
        const base = {
          ...settings,
          charts: [],
          rowsSettings: settings.rowsSettings && {
            ...settings.rowsSettings,
            filters: [],
            globalSearch: "",
          },
          metadata: { ...settings.metadata, name: tab.name },
        };
        return tab.id === current.activeTabId
          ? {
              ...tab,
              settings: {
                ...settings,
                metadata: { ...settings.metadata, name: tab.name },
              },
            }
          : { ...tab, settings: base };
      });
      const currentEntryIndex = current.path[current.cursor];
      const history = current.history.map((entry, index) =>
        index === currentEntryIndex ? { ...entry, tabs: snapshot(tabs) } : entry
      );
      return { ...current, tabs, history };
    });
  }, []);

  const capture = (settings: SavedDataStructure) => {
    if (showingPreview) return;
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
        if (tab.settings)
          return { ...tab, settings: withSharedSettings(tab.settings, shared) };
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

  const moveHistory = (direction: -1 | 1) => {
    setPreviewIndex(null);
    setSession((current) => {
      const cursor = current.cursor + direction;
      const entryIndex = current.path[cursor];
      if (entryIndex === undefined) return current;
      const entry = current.history[entryIndex];
      if (!entry) return current;
      const tabs = snapshot(entry.tabs);
      const restoredTabId = showingPreview ? previewTabId : current.activeTabId;
      const activeTabId = tabs.some((tab) => tab.id === restoredTabId)
        ? restoredTabId
        : tabs[0]!.id;
      return { ...current, tabs, activeTabId, cursor };
    });
    setWorkspaceKey((key) => key + 1);
  };

  const previewHistory = (index: number) => {
    setPreviewIndex(index);
    setWorkspaceKey((key) => key + 1);
    const tabs = session.history[index]?.tabs ?? [];
    const retained = tabs.some((tab) => tab.id === session.activeTabId);
    setPreviewTabId(
      retained ? session.activeTabId : (tabs[0]?.id ?? session.activeTabId)
    );
  };

  const restorePreview = () => {
    if (previewIndex === null) return;
    const restored = session.history[previewIndex];
    if (!restored) return;
    setSession((current) => {
      const displaced = pushCheckpoint(
        current,
        current.tabs,
        classifyChange(restored.tabs, current.tabs) ?? restored.label
      );
      const tabs = snapshot(restored.tabs);
      const restoredCheckpoint = pushCheckpoint(
        displaced,
        tabs,
        classifyChange(displaced.tabs, tabs) ?? restored.label
      );
      const restoredTabId = showingPreview ? previewTabId : current.activeTabId;
      const activeTabId = tabs.some((tab) => tab.id === restoredTabId)
        ? restoredTabId
        : tabs[0]!.id;
      return { ...restoredCheckpoint, activeTabId };
    });
    setPreviewIndex(null);
    setWorkspaceKey((key) => key + 1);
  };

  const returnToPresent = () => {
    setPreviewIndex(null);
    setWorkspaceKey((key) => key + 1);
  };

  useEffect(() => {
    if (showingPreview) return;
    const settings = workspaceRef.current?.getSettings();
    if (settings) captureBaseline(settings);
  }, [captureBaseline, showingPreview, view.id, workspaceKey]);

  const selectedHistoryIndex = session.path[session.cursor] ?? 0;
  const canUndo = session.cursor > 0;
  const canRedo = session.cursor < session.path.length - 1;

  return (
    <section
      className="mb-3 rounded-lg border border-border bg-card p-3"
      aria-label="Saved views and history"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Saved views"
          className="flex min-w-0 flex-1 flex-wrap gap-1"
        >
          {shownTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === view.id}
              tabIndex={tab.id === view.id ? 0 : -1}
              className={`rounded-md border px-3 py-1.5 text-sm ${tab.id === view.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent"}`}
              onClick={() => changeActive(tab.id)}
              onKeyDown={(event) => {
                let index: number | undefined;
                const currentIndex = shownTabs.findIndex(
                  (candidate) => candidate.id === tab.id
                );
                if (event.key === "ArrowRight")
                  index = (currentIndex + 1) % shownTabs.length;
                else if (event.key === "ArrowLeft")
                  index =
                    (currentIndex - 1 + shownTabs.length) % shownTabs.length;
                else if (event.key === "Home") index = 0;
                else if (event.key === "End") index = shownTabs.length - 1;
                if (index === undefined) return;
                event.preventDefault();
                const tabs =
                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                    '[role="tab"]'
                  );
                tabs?.[index]?.focus();
                changeActive(shownTabs[index]!.id);
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={showingPreview}
          onClick={() => createView(false)}
        >
          New view
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={showingPreview}
          onClick={() => createView(true)}
        >
          Duplicate view
        </Button>
        {editingName && !showingPreview ? (
          <form
            className="flex gap-1"
            onSubmit={(event) => {
              event.preventDefault();
              commitName();
            }}
          >
            <input
              autoFocus
              aria-label="View name"
              className="h-8 w-36 rounded-md border border-input bg-background px-2 text-sm"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setEditingName(false);
              }}
            />
            <Button size="sm" type="submit">
              Save name
            </Button>
          </form>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={showingPreview}
            onClick={() => {
              setNameDraft(view.name);
              setEditingName(true);
            }}
          >
            Rename view
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={showingPreview}
          onClick={() => {
            const settings =
              currentView.settings ?? workspaceRef.current?.getSettings();
            if (settings)
              downloadAnalysis(sourceRows, settings, currentView.name);
          }}
        >
          Export analysis
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Charts and Rows filters belong to this view.</span>
        {saveError ? (
          <span role="alert" className="text-destructive">
            Local save failed. Export this analysis to keep a copy.
          </span>
        ) : (
          <span role="status" aria-live="polite">
            {savedEncoding === encoded ? "Saved locally" : "Saving locally"} ·{" "}
            {(sizeBytes / 1024).toFixed(1)} KB
          </span>
        )}
      </div>
      <div className="mt-3 rounded-md border border-border p-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!canUndo || showingPreview}
            onClick={() => moveHistory(-1)}
          >
            Undo
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!canRedo || showingPreview}
            onClick={() => moveHistory(1)}
          >
            Redo
          </Button>
          <span className="text-xs text-muted-foreground">
            {session.history.length} of {HISTORY_LIMIT} checkpoints saved
          </span>
          {showingPreview ? (
            <>
              <span
                role="status"
                className="text-xs font-medium text-foreground"
              >
                Preview · {checkpointLabel(session.history[previewIndex]!)}
              </span>
              <Button size="sm" onClick={restorePreview}>
                Restore this view
              </Button>
              <Button size="sm" variant="ghost" onClick={returnToPresent}>
                Return to present
              </Button>
            </>
          ) : (
            <span
              data-testid="current-history-label"
              className="text-xs font-medium text-foreground"
            >
              {checkpointLabel(session.history[selectedHistoryIndex]!)}
            </span>
          )}
        </div>
        <input
          aria-label="Saved history"
          className="mt-2 block w-full accent-primary"
          type="range"
          min={0}
          max={Math.max(0, session.history.length - 1)}
          step={1}
          value={previewIndex ?? selectedHistoryIndex}
          onChange={(event) => previewHistory(Number(event.target.value))}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>
            {session.history.length
              ? checkpointLabel(session.history[0]!)
              : "No history"}
          </span>
          <span>Latest checkpoint</span>
        </div>
      </div>
      <div className="mt-3" inert={showingPreview}>
        <WorkspaceInstance
          key={`${view.id}:${workspaceKey}`}
          data={sourceRows}
          settings={settingsForDisplay}
          onStateChange={capture}
          workspaceRef={workspaceRef}
        />
      </div>
    </section>
  );
}
