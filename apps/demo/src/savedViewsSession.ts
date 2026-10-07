import {
  parseSavedAnalysis,
  stringifySavedAnalysis,
  type AnalysisProject,
  type AnalysisView,
  type AnalysisSourceRow,
  type SavedDataStructure,
} from "exploreda";
import type { DatumObject } from "./LandingPage";

export const STORAGE_KEY = "exploreda.saved-views.v1";
export const PROJECT_STORAGE_KEY = "exploreda.project-views.v1";
const PROJECT_TABLES_KEY = `${PROJECT_STORAGE_KEY}.tables`;

/** Saves project source tables; returns their size, or -1 when storage fails. */
export function writeProjectTables(
  tables: Record<string, readonly AnalysisSourceRow[]>
) {
  try {
    const encoded = JSON.stringify(tables);
    localStorage.setItem(PROJECT_TABLES_KEY, encoded);
    return new Blob([encoded]).size;
  } catch {
    return -1;
  }
}
export const HISTORY_LIMIT = 50;

export type SavedView = {
  id: string;
  name: string;
  settings?: SavedDataStructure;
  queryId?: string;
  bindings?: AnalysisView["bindings"];
  inspection?: AnalysisView["inspection"];
  selectedRowKeys?: string[];
};

export type ChangeLabel = "View" | "Filter" | "Both" | "Shared";
export type HistoryEntry = {
  at: string;
  label: ChangeLabel;
  tabs: SavedView[];
  project?: AnalysisProject;
  /** The checkpoint this one changed. Missing on the first checkpoint. */
  parent?: number;
  /** Names a deliberate action, such as a duplicated view. */
  action?: string;
  /** When this checkpoint restored an earlier one, that one's time. */
  restoredFrom?: string;
  /** Who made the change, once sessions are shared. */
  author?: { name: string };
};

export type SavedViewsSession = {
  version: 1;
  sourceAnalysis: string;
  project?: AnalysisProject;
  tables?: Record<string, readonly AnalysisSourceRow[]>;
  tabs: SavedView[];
  activeTabId: string;
  history: HistoryEntry[];
  path: number[];
  cursor: number;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getSavedViewsRows(
  session: Pick<SavedViewsSession, "sourceAnalysis">
): DatumObject[] {
  return parseSavedAnalysis(session.sourceAnalysis).data as DatumObject[];
}

export type SavedViewsReadResult = {
  session: SavedViewsSession | undefined;
  failed: boolean;
};

export function readSavedViewsSessionResult(
  key = STORAGE_KEY
): SavedViewsReadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return { session: undefined, failed: true };
  }
  if (raw === null) {
    return { session: undefined, failed: false };
  }

  try {
    const value = JSON.parse(raw) as SavedViewsSession;
    if (value.project) {
      const tables = localStorage.getItem(PROJECT_TABLES_KEY);
      if (tables === null) {
        return { session: undefined, failed: true };
      }
      value.tables = JSON.parse(tables);
    }
    if (
      value.version !== 1 ||
      typeof value.sourceAnalysis !== "string" ||
      !Array.isArray(value.tabs) ||
      value.tabs.length === 0 ||
      !value.tabs.every(
        (tab) => typeof tab.id === "string" && typeof tab.name === "string"
      ) ||
      !value.tabs.some((tab) => tab.id === value.activeTabId)
    ) {
      return { session: undefined, failed: true };
    }
    parseSavedAnalysis(value.sourceAnalysis);
    if (!Array.isArray(value.history) || !Array.isArray(value.path)) {
      const initial = clone(value.tabs);
      value.history = [
        { at: new Date().toISOString(), label: "View", tabs: initial },
      ];
      value.path = [0];
      value.cursor = 0;
    }
    if (
      value.history.length === 0 ||
      value.history.length > HISTORY_LIMIT ||
      value.cursor < 0 ||
      value.cursor >= value.path.length ||
      !value.path.every(
        (index) =>
          Number.isInteger(index) && index >= 0 && index < value.history.length
      )
    ) {
      return { session: undefined, failed: true };
    }
    return { session: value, failed: false };
  } catch {
    return { session: undefined, failed: true };
  }
}

export function readSavedViewsSession(): SavedViewsSession | undefined {
  return readSavedViewsSessionResult().session;
}

/** A fresh session for an imported project file, with one history step. */
export function projectSession(file: {
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  views: AnalysisView[];
  activeViewId: string;
}): SavedViewsSession {
  const tabs: SavedView[] = file.views.map((view) => ({ ...view }));
  const now = new Date().toISOString();
  return {
    version: 1,
    // Project sessions read their rows from `tables`; this keeps the shape
    // that single-table sessions use.
    sourceAnalysis: stringifySavedAnalysis({
      format: "exploreda-analysis",
      version: 1,
      data: [],
      settings: {
        charts: [],
        calculations: [],
        colorScales: [],
        gridSettings: {
          columnCount: 12,
          rowHeight: 100,
          containerPadding: 10,
          showBackgroundMarkers: true,
        },
        metadata: {
          name: "Project",
          version: 1,
          createdAt: now,
          modifiedAt: now,
        },
      },
    }),
    project: file.project,
    tables: file.tables,
    tabs,
    activeTabId: file.activeViewId,
    history: [
      { at: now, label: "View", tabs: clone(tabs), project: file.project },
    ],
    path: [0],
    cursor: 0,
  };
}
